/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * `request.*` stubs matching Python foreign-na policy:
 * same-symbol simple OHLCV passthrough, including HTF last-close;
 * foreign / missing fundamentals → na. HTF *value* passthrough;
 * no invented foreign data. Forward-fill of the last completed HTF bar
 * is the host's job.
 * Interpret should call this from `evalCall`; this module is host-agnostic.
 */

export type Cell = number | null;

export interface SecurityArgs {
  symbol?: string | null;
  timeframe?: string | null;
  expression?: unknown;
}

/** Chart identity passed into `resolveRequest`. */
export interface RequestHost {
  symbol: string;
  timeframe?: string | null;
}

/**
 * Named or positional args for `resolveRequest`.
 * Security uses `symbol` / `timeframe` / `sameSymbolValue`;
 * currency uses `from`/`to` (or `from_currency`/`to_currency`);
 * seed uses `seed`.
 */
export interface RequestNamedArgs {
  symbol?: string | null;
  timeframe?: string | null;
  expression?: unknown;
  sameSymbolValue?: Cell;
  from?: string | null;
  to?: string | null;
  from_currency?: string | null;
  to_currency?: string | null;
  seed?: unknown;
}

export type RequestArgs = readonly unknown[] | RequestNamedArgs;

const REQUEST_FNS = new Set([
  "request.security",
  "request.security_lower_tf",
  "request.dividends",
  "request.earnings",
  "request.splits",
  "request.financial",
  "request.economic",
  "request.quandl",
  "request.currency_rate",
  "request.seed",
  "request.footprint",
]);

/** Last `request.seed` value (Python stores it on evaluator context). */
let lastSeed: number | null = null;

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const MINUTES_PER_WEEK = 10080;
const MINUTES_PER_MONTH = 43200; // 30-day month

/** Bare / alias tokens used as chart periods. */
const NAMED_TF_MINUTES: Record<string, number> = {
  H: MINUTES_PER_HOUR,
  "1H": MINUTES_PER_HOUR,
  D: MINUTES_PER_DAY,
  "1D": MINUTES_PER_DAY,
  W: MINUTES_PER_WEEK,
  "1W": MINUTES_PER_WEEK,
  M: MINUTES_PER_MONTH,
  MO: MINUTES_PER_MONTH,
  "1M": MINUTES_PER_MONTH,
  "1MO": MINUTES_PER_MONTH,
};

export function isRequestBuiltin(fname: string | null | undefined): boolean {
  return fname != null && REQUEST_FNS.has(fname);
}

/**
 * Pine timeframe → minutes. `"1"` `"5"` `"15"` `"60"` `"1h"` `"240"`
 * `"1D"` `"1W"` (and aliases `D`/`W`/`H`) → minutes; unknown → `null`.
 */
export function timeframeMinutes(tf: string | null | undefined): number | null {
  if (tf == null) return null;
  const raw = tf.trim();
  if (raw === "") return null;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return n > 0 ? n : null;
  }
  const u = raw.toUpperCase();
  const named = NAMED_TF_MINUTES[u];
  if (named != null) return named;
  const m = /^(\d+)(MO|H|D|W|M)$/.exec(u);
  if (m == null) return null;
  const n = Number(m[1]);
  if (!(n > 0)) return null;
  switch (m[2]) {
    case "MO":
      return n * MINUTES_PER_MONTH;
    case "H":
      return n * MINUTES_PER_HOUR;
    case "D":
      return n * MINUTES_PER_DAY;
    case "W":
      return n * MINUTES_PER_WEEK;
    case "M":
      return n; // "15M" is minutes; "1M" is monthly via NAMED_TF_MINUTES
    default:
      return null;
  }
}

/** Chart cell: finite number stays; NaN / Inf / non-number → na. */
function finiteCell(value: Cell): Cell {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Same-symbol last-close → `sameSymbolValue` (same TF, empty TF, or HTF).
 * Foreign ticker → na. Does not invent foreign closes.
 *
 * Empty / missing request symbol is the chart. Null / empty request TF is
 * the host TF (passthrough). Non-finite host samples resolve to na.
 *
 * HTF *value* passthrough: when request TF minutes > host TF minutes the
 * current host sample is returned; forward-fill of last completed HTF bar
 * is the host's job. Different TF on the same symbol is allowed.
 */
export function resolveSecurity(
  hostSymbol: string,
  hostTimeframe: string | null,
  args: SecurityArgs,
  sameSymbolValue: Cell,
): Cell {
  const a = args ?? {};
  if (!sameSymbol(a.symbol, hostSymbol ?? "")) return null;
  const value = finiteCell(sameSymbolValue);
  const reqMin = timeframeMinutes(a.timeframe);
  const hostMin = timeframeMinutes(hostTimeframe);
  // HTF last-close (req minutes > host): passthrough; host forward-fills.
  if (reqMin != null && hostMin != null && reqMin > hostMin) {
    return value;
  }
  return value;
}

/**
 * Empty / missing request symbol is the chart. Compare case-insensitively after
 * stripping an exchange prefix (`NASDAQ:AAPL` ≡ `AAPL`).
 */
function sameSymbol(
  requestSymbol: string | null | undefined,
  hostSymbol: string,
): boolean {
  const req = (requestSymbol ?? "").trim();
  if (req === "") return true;
  return bareTicker(req) === bareTicker(hostSymbol);
}

function bareTicker(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  const colon = s.lastIndexOf(":");
  return colon >= 0 ? s.slice(colon + 1) : s;
}

/** Missing / foreign fundamentals, economic, quandl, footprint → na. */
export function resolveForeignNa(): Cell {
  return null;
}

/**
 * `request.currency_rate`. Identical codes (including `USDUSD`) → 1.0.
 * Cross rates have no feed here → na (do not invent Python mock FX).
 */
export function resolveCurrencyRate(
  from: string | null | undefined,
  to?: string | null,
): Cell {
  const [a, b] = currencyPair(from, to);
  if (a !== "" && a === b) return 1;
  return null;
}

/** `request.seed` — record the seed (Python returns None). */
export function resolveSeed(seed?: unknown): Cell {
  lastSeed = coerceSeed(seed ?? 0);
  return null;
}

export function lastRequestSeed(): number | null {
  return lastSeed;
}

/**
 * Dispatch a `request.*` name. Security keeps `resolveSecurity` semantics;
 * currency is 1.0 only for identical codes; everything else is na.
 */
export function resolveRequest(
  fname: string,
  host: RequestHost,
  args: RequestArgs = {},
): Cell | unknown {
  if (fname === "request.security" || fname === "request.security_lower_tf") {
    const { sec, value } = securityFromArgs(args);
    return resolveSecurity(host.symbol, host.timeframe ?? null, sec, value);
  }
  if (fname === "request.currency_rate") {
    const [from, to] = currencyFromArgs(args);
    return resolveCurrencyRate(from, to);
  }
  if (fname === "request.seed") {
    return resolveSeed(seedFromArgs(args));
  }
  return resolveForeignNa();
}

function isNamedArgs(args: RequestArgs): args is RequestNamedArgs {
  return !Array.isArray(args);
}

function securityFromArgs(args: RequestArgs): { sec: SecurityArgs; value: Cell } {
  if (!isNamedArgs(args)) {
    return {
      sec: {
        symbol: asOptString(args[0]),
        timeframe: asOptString(args[1]),
        expression: args[2],
      },
      value: asCell(args[2]),
    };
  }
  return {
    sec: {
      symbol: args.symbol,
      timeframe: args.timeframe,
      expression: args.expression,
    },
    value: args.sameSymbolValue ?? null,
  };
}

function currencyFromArgs(args: RequestArgs): [string | null, string | null] {
  if (!isNamedArgs(args)) {
    return [asOptString(args[0]), asOptString(args[1])];
  }
  const from = args.from ?? args.from_currency ?? null;
  const to = args.to ?? args.to_currency ?? null;
  return [from, to];
}

function seedFromArgs(args: RequestArgs): unknown {
  if (!isNamedArgs(args)) return args[0] ?? 0;
  return args.seed ?? 0;
}

function currencyPair(
  from: string | null | undefined,
  to: string | null | undefined,
): [string, string] {
  const a = (from ?? "").trim().toUpperCase();
  const b = (to ?? "").trim().toUpperCase();
  if (b !== "") return [a, b];
  const slash = a.indexOf("/");
  if (slash >= 0) return [a.slice(0, slash), a.slice(slash + 1)];
  if (/^[A-Z]{6}$/.test(a)) return [a.slice(0, 3), a.slice(3)];
  return [a, b];
}

function coerceSeed(seed: unknown): number {
  if (typeof seed === "number" && Number.isFinite(seed)) return Math.trunc(seed);
  if (typeof seed === "string") {
    const n = Number(seed);
    if (seed.trim() !== "" && Number.isFinite(n)) return Math.trunc(n);
    return stringHash(seed);
  }
  if (seed == null) return 0;
  return stringHash(String(seed));
}

/** Deterministic stand-in for Python `hash(str) & 0xFFFFFFFF`. */
function stringHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function asOptString(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === "string" ? value : String(value);
}

function asCell(value: unknown): Cell {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return null;
}
