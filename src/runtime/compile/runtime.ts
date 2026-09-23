/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Helpers object injected as `__h` into generated execute_script_compiled.
 */
import {
  asColor,
  colorB,
  colorByName,
  colorFromGradient,
  colorG,
  colorNew,
  colorR,
  colorRgb,
  colorT,
} from "../color.ts";
import {
  mathAbs,
  mathAcos,
  mathAsin,
  mathAtan,
  mathAvg,
  mathCeil,
  mathCos,
  mathExp,
  mathFixnan,
  mathFloor,
  mathIff,
  mathLog10,
  mathMax,
  mathMin,
  mathPow,
  mathRound,
  mathRoundToMintick,
  mathSign,
  mathSin,
  mathSqrt,
  mathTan,
  mathToDegrees,
  mathToRadians,
} from "../math.ts";
import {
  strContains,
  strEndsWith,
  strFormat,
  strFormatTime,
  strLength,
  strLower,
  strReplace,
  strStartsWith,
  strSubstring,
  strToNumber,
  strTostring,
  strTrim,
  strUpper,
} from "../str.ts";
import { LogBook, formatLogParts } from "../log.ts";
import { resolveCurrencyRate } from "../request.ts";
import { TaEngine } from "../ta.ts";
import { utcPartsFromMs, timestamp, weekOfYear, timeTradingDay, type UtcParts } from "../time.ts";
import { TickerId } from "../ticker.ts";
import { timeframeInSeconds, timeframePeriodChanged } from "../timeframe.ts";
import { compileArray, compileMap, compileMatrix } from "./collections.ts";
import { createCompileDraw } from "./draw.ts";
import {
  histGet,
  histStore,
  hold,
  isNaCell,
  naNum,
  nz,
  pineEq,
  pineGt,
  pineGtE,
  pineLt,
  pineLtE,
  pineNe,
  safeAdd,
  safeDiv,
  safeMod,
  safeMul,
  safeNeg,
  safeSub,
} from "./helpers.ts";
import { createCompileStrategy } from "./strategy.ts";
import { udtGet, udtNew, udtRegister, udtSet } from "./udt_runtime.ts";

export type CompileHelperInputs = Record<string, number | string | boolean>;

export type CompileHelperOpts = {
  inputs?: CompileHelperInputs;
};

export function createCompileHelpers(opts?: CompileHelperOpts) {
  const ta = new TaEngine();
  const inputs = opts?.inputs;
  const book = new LogBook();
  // Python `timeframe_in_seconds` defaults None / "" to "D" (daily, 86400)
  // before parsing — builtins/timeframe.py:189-190. The shared helper in
  // timeframe.ts maps na / empty → null, so compile wraps it here to match.
  const timeframeInSecondsOrDaily = (p: string | null): number | null =>
    timeframeInSeconds(p == null || p === "" ? "D" : p);
  return {
    na: NA_FN,
    nz,
    naNum,
    isNa: isNaCell,
    eq: pineEq,
    ne: pineNe,
    lt: pineLt,
    lte: pineLtE,
    gt: pineGt,
    gte: pineGtE,
    add: safeAdd,
    sub: safeSub,
    mul: safeMul,
    div: safeDiv,
    mod: safeMod,
    neg: safeNeg,
    hist: histGet,
    store: histStore,
    ta,
    strategy: createCompileStrategy(),
    site: (id: string) => id,
    input: (key: unknown, def: unknown) => inputLookup(inputs, key, def),
    colorR,
    colorG,
    colorB,
    colorT,
    colorNew: compileColorNew,
    colorRgb,
    colorFromGradient,
    colorByName,
    abs: mathAbs,
    sign: mathSign,
    floor: mathFloor,
    ceil: mathCeil,
    round: mathRound,
    sqrt: mathSqrt,
    exp: mathExp,
    log: {
      info(bar: unknown, ...parts: unknown[]) {
        book.info(logBar(bar), formatLogParts(parts));
      },
      warning(bar: unknown, ...parts: unknown[]) {
        book.warning(logBar(bar), formatLogParts(parts));
      },
      error(bar: unknown, ...parts: unknown[]) {
        book.error(logBar(bar), formatLogParts(parts));
      },
      clear() {
        book.clear();
      },
      extras() {
        return { __logs: book.snapshot() };
      },
    },
    log10: mathLog10,
    pow: mathPow,
    min: mathMin,
    max: mathMax,
    avg: mathAvg,
    sin: mathSin,
    cos: mathCos,
    tan: mathTan,
    asin: mathAsin,
    acos: mathAcos,
    atan: mathAtan,
    todegrees: mathToDegrees,
    toradians: mathToRadians,
    iff,
    fixnan: mathFixnan,
    year: calendarYear,
    month: calendarMonth,
    dayofmonth: calendarDayofmonth,
    hour: calendarHour,
    minute: calendarMinute,
    second: calendarSecond,
    dayofweek: calendarDayofweek,
    timestamp,
    weekOfYear,
    timeTradingDay,
    timeframeInSeconds: timeframeInSecondsOrDaily,
    timeframeChange,
    timeClose,
    roundToMintick,
    syminfoPrefix,
    strLength,
    strContains,
    strStartsWith,
    strEndsWith,
    strLower,
    strUpper,
    strReplace,
    strSubstring,
    strToNumber,
    strTrim,
    strFormat,
    strFormatTime,
    tostring: strTostring,
    str: {
      length: strLength,
      contains: strContains,
      starts_with: strStartsWith,
      ends_with: strEndsWith,
      lower: strLower,
      upper: strUpper,
      replace: strReplace,
      substring: strSubstring,
      tonumber: strToNumber,
      trim: strTrim,
      tostring: strTostring,
      format: strFormat,
      format_time: strFormatTime,
    },
    hold,
    array: compileArray,
    map: compileMap,
    matrix: compileMatrix,
    draw: createCompileDraw(),
    udtNew,
    udtGet,
    udtSet,
    udtRegister,
    currencyRate: resolveCurrencyRate,
    runtimeError(msg: unknown): never {
      throw new Error(String(msg));
    },
  };
}

/** Pine `color.new(color, transp)` — first arg is a color, not r,g,b. */
function compileColorNew(color: unknown, transp?: unknown) {
  const parsed = asColor(color);
  if (!parsed) return null;
  const t = typeof transp === "number" && Number.isFinite(transp) ? transp : undefined;
  return colorNew(parsed.r, parsed.g, parsed.b, t);
}

/** Override `def` when `inputs` has `key` or `String(key)`. */
function inputLookup(
  inputs: CompileHelperInputs | undefined,
  key: unknown,
  def: unknown,
): unknown {
  if (inputs == null) return def;
  if (hasInput(inputs, key)) return inputs[key as string];
  const asStr = String(key);
  if (hasInput(inputs, asStr)) return inputs[asStr];
  return def;
}

function hasInput(inputs: CompileHelperInputs, key: unknown): boolean {
  return (
    (typeof key === "string" || typeof key === "number") &&
    Object.prototype.hasOwnProperty.call(inputs, key)
  );
}

/** Pine v4 `iff`: na cond → na; 0 / false → else; else then. */
function iff(cond: unknown, thenV: unknown, elseV: unknown): unknown {
  if (typeof cond === "boolean") return cond ? thenV : elseV;
  return mathIff(cond as number | null, thenV as number | null, elseV as number | null);
}

function NA_FN(v?: unknown): number | null {
  if (arguments.length === 0) return null;
  return isNaCell(v) ? 1 : 0;
}

/** Unix-ms → UTC calendar part. na / non-finite time → null. */
function utcPart(t: unknown, key: keyof UtcParts): number | null {
  if (typeof t !== "number" || !Number.isFinite(t)) return null;
  return utcPartsFromMs(t)[key];
}

function calendarYear(t: unknown): number | null {
  return utcPart(t, "year");
}

function calendarMonth(t: unknown): number | null {
  return utcPart(t, "month");
}

function calendarDayofmonth(t: unknown): number | null {
  return utcPart(t, "dayofmonth");
}

function calendarHour(t: unknown): number | null {
  return utcPart(t, "hour");
}

function calendarMinute(t: unknown): number | null {
  return utcPart(t, "minute");
}

function calendarSecond(t: unknown): number | null {
  return utcPart(t, "second");
}

function calendarDayofweek(t: unknown): number | null {
  return utcPart(t, "dayofweek");
}

function logBar(bar: unknown): number {
  return typeof bar === "number" && Number.isFinite(bar) ? bar : 0;
}

/** `timeframe.change`: bar 0 is a new period; empty / unknown tf → false. */
function timeframeChange(tf: unknown, curr: unknown, prev: unknown, barIndex: unknown): number {
  const s =
    typeof tf === "string"
      ? tf
      : typeof tf === "number" && Number.isFinite(tf)
        ? String(tf)
        : null;
  if (s == null || s.trim() === "") return 0;
  if (typeof curr !== "number" || !Number.isFinite(curr)) return 0;
  const idx = typeof barIndex === "number" && Number.isFinite(barIndex) ? barIndex : null;
  return timeframePeriodChanged(curr, prev, s, idx) ? 1 : 0;
}

/**
 * Next bar open, last bar `time + 86400000`. `0` next-open counts as missing
 * (interpret beginBar). Compile has no per-bar `time_close` column.
 */
function timeClose(barIdx: unknown, timeArr: unknown): number {
  const i = typeof barIdx === "number" && Number.isFinite(barIdx) ? Math.trunc(barIdx) : 0;
  const arr = Array.isArray(timeArr) ? (timeArr as Array<number | null | undefined>) : [];
  const t = arr[i];
  const tNum = typeof t === "number" && Number.isFinite(t) ? t : 0;
  if (i + 1 < arr.length) {
    const next = arr[i + 1] ?? 0;
    return next !== 0 ? next : tNum;
  }
  return Math.trunc(tNum) + 86_400_000;
}

function roundToMintick(x: unknown): number | null {
  return mathRoundToMintick(naNum(x), 0.01);
}

/** Python `split_symbol` / `extract_prefix`: text before the first `:`, else `""`. */
function extractPrefix(symbol: string): string {
  const s = symbol.trim();
  const i = s.indexOf(":");
  return i < 0 ? "" : s.slice(0, i);
}

function syminfoPrefix(tickerid?: unknown): string {
  if (arguments.length === 0 || tickerid === undefined) return extractPrefix("SYMBOL");
  if (tickerid instanceof TickerId) return extractPrefix(tickerid.symbol);
  if (typeof tickerid === "string") return extractPrefix(tickerid);
  if (typeof tickerid === "number" && Number.isFinite(tickerid)) return extractPrefix(String(tickerid));
  return "";
}
