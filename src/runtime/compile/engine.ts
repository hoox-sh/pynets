/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile engine: eligibility, transpile, sha256 LRU (max 128), load, run.
 */
import { createHash } from "node:crypto";
import type {
  CompileCacheStats,
  CompileEligibility,
  CompiledScript,
  CompilePlotMeta,
} from "./types.ts";
import { CompileEmitError, CompileIneligibleError, CompileLoadError } from "./types.ts";
import { transpileSource } from "./emit.ts";
import { defaultTime, defaultVolume, naNum, toFloatArr } from "./helpers.ts";
import { createCompileHelpers } from "./runtime.ts";
import type { CompileHelperInputs } from "./runtime.ts";
import type { DrawingEvent } from "../drawings.ts";
import type { Fill, StrategyEvent, StrategySummary } from "../strategy.ts";

export type CompileRunExtras = {
  inputs?: CompileHelperInputs;
};

const CACHE_MAX = 128;
const cache = new Map<string, CompiledScript>();

export type OhlcvBar = {
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
  time?: number | null;
};

export type CompileHostResult = {
  series: Record<string, Array<number | null>>;
  plots: Array<number | null>;
  plot_meta: Array<{ title: string }>;
  count: number;
  script_name: null;
  script_type: "indicator" | "strategy";
  mode: "compile";
  events?: StrategyEvent[];
  fills?: Fill[];
  strategy?: StrategySummary;
  drawings?: DrawingEvent[];
};

/** Generated `execute_script_compiled` — helpers are injected per `run()`, not cached. */
type CompiledExecuteFn = (
  o: Array<number | null>,
  h: Array<number | null>,
  l: Array<number | null>,
  c: Array<number | null>,
  v: Array<number | null>,
  t: Array<number | null>,
  helpers: unknown,
) => Record<string, unknown>;

export function compileEligible(source: string): CompileEligibility {
  const src = source ?? "";
  // Python auto-mode also rejects `request.`; compile_script still emits
  // request.security (same-symbol passthrough / else na). Match compile_script.
  if (/^\s*import\s+\S+/m.test(src)) {
    return { ok: false, reason: "import statements not supported in compile path" };
  }
  return { ok: true };
}

export function transpile(source: string): string {
  return transpileSource(source).code;
}

export function clearCompileCache(): void {
  cache.clear();
}

export function compileCacheStats(): CompileCacheStats {
  return { source_entries: cache.size, source_max: CACHE_MAX };
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function loadExecute(code: string): CompiledExecuteFn {
  let factory: () => CompiledExecuteFn;
  try {
    factory = new Function(`${code}\nreturn execute_script_compiled;`) as typeof factory;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new CompileLoadError(msg);
  }
  const fn = factory();
  if (typeof fn !== "function") throw new CompileLoadError("execute_script_compiled missing");
  return fn;
}

function assertSameLength(n: number, ...lens: number[]): void {
  for (const len of lens) {
    if (len !== n) throw new Error("OHLCV arrays must have the same length");
  }
}

function extractOhlcv(bars: Array<OhlcvBar>): {
  open: Array<number | null>;
  high: Array<number | null>;
  low: Array<number | null>;
  close: Array<number | null>;
  volume: Array<number | null>;
  time: Array<number | null>;
} {
  const n = bars.length;
  const open: Array<number | null> = new Array(n);
  const high: Array<number | null> = new Array(n);
  const low: Array<number | null> = new Array(n);
  const close: Array<number | null> = new Array(n);
  const volume: Array<number | null> = new Array(n);
  const time: Array<number | null> = new Array(n);
  for (let i = 0; i < n; i++) {
    const b = bars[i] ?? {};
    open[i] = b.open ?? null;
    high[i] = b.high ?? null;
    low[i] = b.low ?? null;
    close[i] = b.close ?? null;
    volume[i] = b.volume ?? 1;
    time[i] = b.time ?? i * 60_000;
  }
  assertSameLength(n, open.length, high.length, low.length, close.length, volume.length, time.length);
  return { open, high, low, close, volume, time };
}

class JsCompiledScript implements CompiledScript {
  readonly backend = "js" as const;

  constructor(
    readonly source: string,
    readonly plots: CompilePlotMeta[],
    private readonly fn: CompiledExecuteFn,
  ) {}

  run(
    open: ArrayLike<number | null | undefined>,
    high: ArrayLike<number | null | undefined>,
    low: ArrayLike<number | null | undefined>,
    close: ArrayLike<number | null | undefined>,
    volume?: ArrayLike<number | null | undefined> | null,
    time?: ArrayLike<number | null | undefined> | null,
    extras?: CompileRunExtras,
  ): Record<string, Array<number | null>> {
    const n = close.length;
    assertSameLength(n, open.length, high.length, low.length);
    if (volume != null) assertSameLength(n, volume.length);
    if (time != null) assertSameLength(n, time.length);
    const o = toFloatArr(open, n, null);
    const h = toFloatArr(high, n, null);
    const l = toFloatArr(low, n, null);
    const c = toFloatArr(close, n, null);
    const v = volume != null ? toFloatArr(volume, n, 1) : defaultVolume(n);
    const t = time != null ? toFloatArr(time, n, null) : defaultTime(n);
    for (let i = 0; i < n; i++) {
      if (v[i] == null) v[i] = 1;
      if (t[i] == null) t[i] = i * 60_000;
    }
    return this.fn(o, h, l, c, v, t, createCompileHelpers({ inputs: extras?.inputs })) as Record<
      string,
      Array<number | null>
    >;
  }
}

export function compileScript(source: string): CompiledScript {
  const elig = compileEligible(source);
  if (!elig.ok) throw new CompileIneligibleError(elig.reason ?? "ineligible");
  const key = sha256(source);
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  let code: string;
  let ctx: { errors: string[]; plots: CompilePlotMeta[] };
  try {
    ({ code, ctx } = transpileSource(source));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new CompileEmitError(msg);
  }
  if (ctx.errors.length) throw new CompileEmitError(ctx.errors.join("; "));
  if (!code.includes("execute_script_compiled")) {
    throw new CompileEmitError("empty emit");
  }
  const exec = loadExecute(code);
  const compiled = new JsCompiledScript(code, ctx.plots, exec);
  cache.set(key, compiled);
  if (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first != null) cache.delete(first);
  }
  return compiled;
}

export function runScript(
  source: string,
  ohlcvBars: Array<OhlcvBar>,
): Record<string, Array<number | null>> {
  const cols = extractOhlcv(ohlcvBars);
  return compileScript(source).run(cols.open, cols.high, cols.low, cols.close, cols.volume, cols.time);
}

export function compileToResult(
  source: string,
  ohlcvBars: Array<OhlcvBar>,
  extras?: CompileRunExtras,
): CompileHostResult {
  const compiled = compileScript(source);
  const cols = extractOhlcv(ohlcvBars);
  const raw = compiled.run(cols.open, cols.high, cols.low, cols.close, cols.volume, cols.time, extras);
  const series: Record<string, Array<number | null>> = {};
  const blob: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith("__")) blob[key] = value;
    else if (Array.isArray(value)) series[key] = value;
  }
  const plot_meta = compiled.plots;
  const firstTitle = plot_meta.find((p) => !p.title.startsWith("__"))?.title;
  const result: CompileHostResult = {
    series,
    plots: firstTitle != null ? (series[firstTitle] ?? []) : [],
    plot_meta,
    count: ohlcvBars.length,
    script_name: null,
    script_type: "__events" in blob ? "strategy" : "indicator",
    mode: "compile",
  };
  if ("__events" in blob) result.events = blob.__events as StrategyEvent[];
  if ("__fills" in blob) result.fills = blob.__fills as Fill[];
  if ("__strategy" in blob) result.strategy = blob.__strategy as StrategySummary;
  if ("__drawings" in blob) result.drawings = blob.__drawings as DrawingEvent[];
  return result;
}

export { naNum };
