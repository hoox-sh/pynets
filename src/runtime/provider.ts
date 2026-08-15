/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Bar source adapters. Hosts feed OHLCV; this module does not invent
 * foreign market data. Fetch adapters implement `BarProvider`.
 */

export interface ProviderBar {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  time?: number;
}

export interface BarProvider {
  fetch(opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }): Promise<ProviderBar[]>;
}

/** HTTP / parse failure from `JsonBarProvider`. Hosts should catch this. */
export class ProviderError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}

/** In-memory bars — tests and custom feeds. */
export class MemoryProvider implements BarProvider {
  constructor(private readonly bars: ProviderBar[]) {}

  async fetch(opts: { limit?: number }): Promise<ProviderBar[]> {
    const n = opts.limit;
    if (n == null || n >= this.bars.length) return this.bars.slice();
    return this.bars.slice(-n);
  }
}

/**
 * In-process foreign-symbol map. Looks up `symbol` then `symbol:timeframe`.
 * Missing keys return `[]` — no network, no invented data.
 */
export class StaticMapProvider implements BarProvider {
  constructor(private readonly feeds: Record<string, ProviderBar[]>) {}

  async fetch(opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }): Promise<ProviderBar[]> {
    const tf = opts.timeframe;
    const keyed = tf != null && tf !== "" ? `${opts.symbol}:${tf}` : undefined;
    const bars =
      (keyed !== undefined ? this.feeds[keyed] : undefined) ??
      this.feeds[opts.symbol] ??
      [];
    return sliceTail(bars, opts.limit);
  }
}

export interface JsonBarProviderOptions {
  /** Build a URL from symbol/timeframe/limit. Required unless `fetchBars` is given. */
  url?: (opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }) => string;
  /** Injected fetch (defaults to globalThis.fetch). Tests pass a stub. */
  fetch?: typeof fetch;
  /** Map a JSON body to ProviderBar[]. Default: `mapJsonBars`. */
  map?: (json: unknown) => ProviderBar[];
  /** Optional extra headers */
  headers?: Record<string, string>;
  /** Return a JSON body without HTTP. Used instead of `url` when provided. */
  fetchBars?: (opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }) => Promise<unknown> | unknown;
}

/**
 * Generic JSON/OHLCV adapter. Non-OK HTTP and invalid JSON throw
 * `ProviderError` so hosts can catch. After a successful response,
 * empty or unrecognized JSON maps to `[]`.
 */
export class JsonBarProvider implements BarProvider {
  private readonly url?: JsonBarProviderOptions["url"];
  private readonly fetchImpl: typeof fetch;
  private readonly mapFn: (json: unknown) => ProviderBar[];
  private readonly headers?: Record<string, string>;
  private readonly fetchBars?: JsonBarProviderOptions["fetchBars"];

  constructor(opts: JsonBarProviderOptions) {
    this.url = opts.url;
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
    this.mapFn = opts.map ?? mapJsonBars;
    this.headers = opts.headers;
    this.fetchBars = opts.fetchBars;
  }

  async fetch(opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }): Promise<ProviderBar[]> {
    const json = this.fetchBars
      ? await this.fetchBars(opts)
      : await this.getJson(opts);
    return sliceTail(this.mapFn(json), opts.limit);
  }

  private async getJson(opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }): Promise<unknown> {
    if (this.url == null) {
      throw new ProviderError("JsonBarProvider requires `url` or `fetchBars`");
    }
    const href = this.url(opts);
    const res = await this.fetchImpl(href, {
      method: "GET",
      headers: this.headers,
    });
    if (!res.ok) {
      throw new ProviderError(
        `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`.trim(),
        res.status,
      );
    }
    try {
      return await res.json();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new ProviderError(`invalid JSON: ${detail}`, res.status);
    }
  }
}

const BAR_KEYS = ["open", "high", "low", "close", "volume", "time"] as const;

/**
 * Accept arrays of `{open,high,low,close,volume,time}` (or `t/o/h/l/c/v`),
 * tuples `[time, open, high, low, close, volume, ...]`, and `{ bars | data }`
 * wrappers. Extra trailing tuple fields are ignored. Finite `time`/`t` values
 * below `1e12` are treated as Unix seconds and stored as milliseconds.
 * Non-finite numbers omit that field. Unknown shape → `[]`.
 */
export function mapJsonBars(json: unknown): ProviderBar[] {
  const rows = unwrapRows(json);
  if (rows == null) return [];
  const out: ProviderBar[] = [];
  for (const item of rows) {
    const bar = mapOneBar(item);
    if (bar != null) out.push(bar);
  }
  return out;
}

function unwrapRows(json: unknown): unknown[] | null {
  if (Array.isArray(json)) return json;
  if (json != null && typeof json === "object") {
    const rec = json as Record<string, unknown>;
    if (Array.isArray(rec.bars)) return rec.bars;
    if (Array.isArray(rec.data)) return rec.data;
  }
  return null;
}

function mapOneBar(item: unknown): ProviderBar | null {
  if (item == null || typeof item !== "object") return null;
  if (Array.isArray(item)) return mapTupleBar(item);
  const rec = item as Record<string, unknown>;
  const bar: ProviderBar = {};
  assignFinite(bar, "time", rec.time ?? rec.t);
  assignFinite(bar, "open", rec.open ?? rec.o);
  assignFinite(bar, "high", rec.high ?? rec.h);
  assignFinite(bar, "low", rec.low ?? rec.l);
  assignFinite(bar, "close", rec.close ?? rec.c);
  assignFinite(bar, "volume", rec.volume ?? rec.v);
  return hasBarField(bar) ? bar : null;
}

function mapTupleBar(item: unknown[]): ProviderBar | null {
  if (item.length < 5) return null;
  const bar: ProviderBar = {};
  assignFinite(bar, "time", item[0]);
  assignFinite(bar, "open", item[1]);
  assignFinite(bar, "high", item[2]);
  assignFinite(bar, "low", item[3]);
  assignFinite(bar, "close", item[4]);
  if (item.length > 5) assignFinite(bar, "volume", item[5]);
  return hasBarField(bar) ? bar : null;
}

function assignFinite(
  bar: ProviderBar,
  key: (typeof BAR_KEYS)[number],
  value: unknown,
): void {
  const n = asFinite(value);
  if (n === undefined) return;
  bar[key] = key === "time" ? normalizeBarTime(n) : n;
}

/** Unix seconds (`< 1e12`) → milliseconds; already-ms values are unchanged. */
function normalizeBarTime(msOrSec: number): number {
  return msOrSec < 1e12 ? msOrSec * 1000 : msOrSec;
}

function asFinite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function hasBarField(bar: ProviderBar): boolean {
  return BAR_KEYS.some((key) => bar[key] !== undefined);
}

function sliceTail(bars: ProviderBar[], limit?: number): ProviderBar[] {
  if (limit == null || limit >= bars.length) return bars.slice();
  return bars.slice(-limit);
}
