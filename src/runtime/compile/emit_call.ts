/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Call lowering for JS compile. Pine builtins → `__h` / `__h.ta`.
 */
import type { Attribute, Call, Constant, expr, Name } from "../../ast/nodes.ts";
import { TA_BARE_ATTRS, TA_METHODS } from "../ta_names.ts";
import {
  TA_CONDITION_CALL_BY_NAME,
  TA_CONTEXT_CALL_BY_NAME,
  TA_LEN_EXTRA_BY_NAME,
  TA_MERGED_KWARG_BY_NAME,
  TA_OHLCV_BY_NAME,
  TA_OVERLOAD_BY_NAME,
  TA_RUNTIME_PAIR_GATE_BY_NAME,
  TA_RUNTIME_PERIOD_FIRST_BY_NAME,
  TA_SRC_LEN_BY_NAME,
  type TaCallArgSpec,
} from "../ta_specs.ts";
import { emitUserFuncCall } from "./emit_udf.ts";
import type { EmitCtx, VisitFn } from "./types.ts";

export { TA_BARE_ATTRS };

const HIGH = "high_arr[__bar_idx]";
const LOW = "low_arr[__bar_idx]";
const CLOSE = "close_arr[__bar_idx]";
const VOL = "vol_arr[__bar_idx]";
const OPEN = "open_arr[__bar_idx]";
const CTX_EXPR = { high: HIGH, low: LOW, close: CLOSE, volume: VOL } as const;
// Interpret's bare `ta.vwap` sources hlc3 = (h+l+c)/3, falling back to close
// when any component is na — mirror that exactly on the compile side.
const HLC3 =
  "((high_arr[__bar_idx] != null && low_arr[__bar_idx] != null && close_arr[__bar_idx] != null)" +
  " ? (high_arr[__bar_idx] + low_arr[__bar_idx] + close_arr[__bar_idx]) / 3" +
  " : close_arr[__bar_idx])";
// Interpret `hlc3(env)` for the ta.cci period-only form: falls back through
// close → high → low when any component is na (interpret.ts hlc3).
const TP =
  "((high_arr[__bar_idx] != null && low_arr[__bar_idx] != null && close_arr[__bar_idx] != null)" +
  " ? (high_arr[__bar_idx] + low_arr[__bar_idx] + close_arr[__bar_idx]) / 3" +
  " : (close_arr[__bar_idx] ?? high_arr[__bar_idx] ?? low_arr[__bar_idx]))";

const NS = new Set([
  "ta",
  "math",
  "str",
  "array",
  "matrix",
  "map",
  "color",
  "strategy",
  "input",
  "request",
  "ticker",
  "timeframe",
  "runtime",
  "log",
  "barstate",
  "session",
  "syminfo",
  "timenow",
  "chart",
  "footprint",
  "volume_row",
]);

const PLOT_FUNCS = new Set([
  "plot",
  "plotshape",
  "plotchar",
  "plotarrow",
  "hline",
  "bgcolor",
  "barcolor",
  "plotcandle",
  "plotbar",
]);

const STRATEGY_ACTIONS = new Set([
  "strategy_entry",
  "strategy_close",
  "strategy_close_all",
  "strategy_exit",
  "strategy_order",
  "strategy_cancel",
  "strategy_cancel_all",
]);

const STRATEGY_QUERIES = new Set([
  "strategy_position_size",
  "strategy_netprofit",
  "strategy_equity",
  "strategy_openprofit",
  "strategy_opentrades",
  "strategy_closedtrades",
  "strategy_leverage",
  "strategy_margin_liquidation_price",
  "strategy_position_avg_price",
  "strategy_initial_capital",
]);

const CHART_SERIES_ARR: Record<string, string> = {
  close: "close_arr",
  open: "open_arr",
  high: "high_arr",
  low: "low_arr",
  volume: "vol_arr",
  time: "time_arr",
};

const MATH_UNARY: Record<string, { fn: string; guard?: string }> = {
  abs: { fn: "Math.abs(Number(__x))" },
  sqrt: { fn: "Math.sqrt(Number(__x))", guard: "Number(__x) < 0" },
  log: { fn: "Math.log(Number(__x))", guard: "Number(__x) <= 0" },
  log10: { fn: "Math.log10(Number(__x))", guard: "Number(__x) <= 0" },
  exp: { fn: "Math.exp(Number(__x))" },
  sign: { fn: "(Number(__x) > 0 ? 1 : Number(__x) < 0 ? -1 : 0)" },
  floor: { fn: "Math.floor(Number(__x))" },
  ceil: { fn: "Math.ceil(Number(__x))" },
  sin: { fn: "Math.sin(Number(__x))" },
  cos: { fn: "Math.cos(Number(__x))" },
  tan: { fn: "Math.tan(Number(__x))" },
  asin: {
    fn: "Math.asin(Number(__x))",
    guard: "Number(__x) < -1 || Number(__x) > 1",
  },
  acos: {
    fn: "Math.acos(Number(__x))",
    guard: "Number(__x) < -1 || Number(__x) > 1",
  },
  atan: { fn: "Math.atan(Number(__x))" },
  todegrees: { fn: "Number(__x) * 180 / Math.PI" },
  toradians: { fn: "Number(__x) * Math.PI / 180" },
};

interface CallArgs {
  pos: string[];
  kw: Record<string, string>;
  posNodes: expr[];
  kwNodes: Record<string, expr>;
}

export function emitCall(ctx: EmitCtx, node: Call, visit: VisitFn): string {
  const { name: rawName, methodSrc } = resolveCallee(node.func);
  const args = collectArgs(node, visit);

  // `import lib as alias` → alias.foo. Inlined export is a user func; else stub null.
  // Must run before methodSrc unshift / UDT-method (do not pass alias as receiver).
  if (methodSrc != null && methodSrc.kind === "Name") {
    const alias = (methodSrc as Name).id;
    if (ctx.importAliases.has(alias)) {
      if (ctx.userFuncs.has(rawName)) {
        return emitUserFuncCall(
          ctx,
          rawName,
          packUserFuncArgs(ctx, rawName, args),
        );
      }
      return "null";
    }
  }

  const drawn = emitDraw(ctx, rawName, methodSrc, args);
  if (drawn != null) return drawn;
  const udt = emitUdt(ctx, rawName, methodSrc, args);
  if (udt != null) return udt;
  const udtMethod = emitUdtMethod(ctx, rawName, methodSrc, args, visit);
  if (udtMethod != null) return udtMethod;

  if (methodSrc != null) {
    args.pos.unshift(visit(methodSrc));
    args.posNodes.unshift(methodSrc);
  }

  let name = rawName;
  if (methodSrc != null && TA_METHODS.has(name)) name = `ta_${name}`;
  if (methodSrc != null && (name === "tostring" || name === "format"))
    name = `str_${name}`;

  if (PLOT_FUNCS.has(name)) return emitPlot(ctx, name, args);

  if (name === "indicator" || name === "study" || name === "library")
    return "null";
  if (name === "strategy") return emitStrategyDecl(ctx, args);

  if (name === "na") {
    if (args.pos.length === 0 && args.kw.x == null && args.kw.source == null)
      return "null";
    const x = pick(args, 0, ["x", "source"], "null");
    return `(__h.isNa(${x}) ? 1 : 0)`;
  }
  if (name === "nz") {
    const x = pick(args, 0, ["source", "x"], "null");
    if (hasArg(args, 1, ["replacement", "y"]))
      return `__h.nz(${x}, ${pick(args, 1, ["replacement", "y"], "0")})`;
    return `__h.nz(${x})`;
  }

  if (name === "input" || name.startsWith("input_"))
    return emitInput(ctx, args);

  if (
    STRATEGY_ACTIONS.has(name) ||
    STRATEGY_QUERIES.has(name) ||
    name.startsWith("strategy_")
  ) {
    return emitStrategy(ctx, name, args);
  }

  if (ctx.userFuncs.has(name) || ctx.funcSeriesParams.has(name)) {
    return emitUserFuncCall(ctx, name, packUserFuncArgs(ctx, name, args));
  }

  if (
    name === "year" ||
    name === "month" ||
    name === "dayofmonth" ||
    name === "hour" ||
    name === "minute" ||
    name === "second" ||
    name === "dayofweek"
  ) {
    const t = pick(args, 0, ["time"], "time");
    return `__h.${name}(${t})`;
  }
  if (name === "timestamp") {
    const parts = args.pos.length > 0 ? args.pos : Object.values(args.kw);
    return `__h.timestamp(${parts.join(", ")})`;
  }
  if (name === "weekofyear") {
    return `__h.weekOfYear(${pick(args, 0, ["time", "timestamp"], "time")})`;
  }
  if (name === "time_tradingday") {
    return `__h.timeTradingDay(${pick(args, 0, ["time", "timestamp"], "time")})`;
  }
  if (name === "timeframe_in_seconds") {
    if (hasArg(args, 0, ["timeframe", "period"])) {
      return `__h.timeframeInSeconds(${pick(args, 0, ["timeframe", "period"], "null")})`;
    }
    return "86400";
  }
  if (name === "timeframe_change") {
    // Prev bar time is `time_arr[__bar_idx-1]`; bar 0 has no prev (interpret series.get(1)).
    return `__h.timeframeChange(${pick(args, 0, ["timeframe", "tf"], "null")}, time, (__bar_idx > 0 ? time_arr[__bar_idx - 1] : null), __bar_idx)`;
  }
  if (name === "time_close") {
    return `__h.timeClose(__bar_idx, time_arr)`;
  }
  if (name === "syminfo_prefix") {
    if (hasArg(args, 0, ["tickerid", "symbol"])) {
      return `__h.syminfoPrefix(${pick(args, 0, ["tickerid", "symbol"], "null")})`;
    }
    return `__h.syminfoPrefix()`;
  }
  if (name === "ticker_heikinashi" || name === "heikinashi") {
    ctx.needsHeikinashi = true;
    return `"__HEIKINASHI__"`;
  }
  if (name === "ticker_inherit") {
    const fallback = pick(
      args,
      0,
      ["ticker", "tickerid", "from", "source"],
      `"SYMBOL"`,
    );
    return pick(args, 1, ["symbol", "ticker"], fallback);
  }
  if (
    name === "renko" ||
    name === "kagi" ||
    name === "linebreak" ||
    name === "pointfigure"
  ) {
    return pick(args, 0, ["ticker", "tickerid", "symbol"], `"SYMBOL"`);
  }
  // ticker.new / standard / modify / renko / kagi / linebreak / pointfigure → first arg or "SYMBOL"
  if (name.startsWith("ticker_")) {
    return pick(args, 0, ["symbol", "ticker", "tickerid"], `"SYMBOL"`);
  }

  if (name === "log_info" || name === "log_warning" || name === "log_error") {
    const level = name.slice("log_".length);
    const parts = args.pos.length > 0 ? args.pos : Object.values(args.kw);
    return parts.length > 0
      ? `__h.log.${level}(__bar_idx, ${parts.join(", ")})`
      : `__h.log.${level}(__bar_idx)`;
  }
  if (name === "log_clear") return "__h.log.clear()";

  if (name === "runtime_error") {
    const msg = pick(args, 0, ["message", "msg"], `"runtime.error"`);
    return `(() => { throw new Error(String(${msg})); })()`;
  }

  if (name === "max_bars_back") return "null";
  if (name === "timenow") return "__h.timenow(time_arr)";
  if (name === "alertcondition") {
    ctx.usesDrawings = true;
    const cond = pick(args, 0, ["condition"], "null");
    const title = hasArg(args, 1, ["title"])
      ? pick(args, 1, ["title"], `"Alert"`)
      : `"Alert"`;
    const message = hasArg(args, 2, ["message"])
      ? pick(args, 2, ["message"], `"Alert"`)
      : `"Alert"`;
    return `__h.draw.alertcondition(__bar_idx, ${cond}, ${title}, ${message})`;
  }
  if (name === "str_tostring" || name === "tostring") {
    const x = pick(args, 0, ["value", "source", "x"], "null");
    return `String(${x} ?? "")`;
  }
  if (name === "str_format" || name === "format") {
    const fmt = pick(args, 0, ["formatString", "format", "fmt"], "null");
    const fmtFromKw =
      Object.hasOwn(args.kw, "formatString") ||
      Object.hasOwn(args.kw, "format") ||
      Object.hasOwn(args.kw, "fmt");
    const extras = fmtFromKw ? args.pos.slice() : args.pos.slice(1);
    return extras.length > 0
      ? `__h.strFormat(${fmt}, ${extras.join(", ")})`
      : `__h.strFormat(${fmt})`;
  }
  if (name === "str_format_time" || name === "format_time") {
    return `__h.strFormatTime(${pick(args, 0, ["time", "timestamp"], "null")}, ${pick(args, 1, ["format"], "undefined")}, ${pick(args, 2, ["timezone"], "undefined")})`;
  }
  if (name.startsWith("str_")) {
    const meth = name.slice(4);
    const alias: Record<string, string> = {
      length: "length",
      contains: "contains",
      startswith: "starts_with",
      ends_with: "ends_with",
      endswith: "ends_with",
      lower: "lower",
      upper: "upper",
      replace: "replace",
      substring: "substring",
      tonumber: "tonumber",
      trim: "trim",
    };
    const key = alias[meth];
    if (key) {
      const a0 = pick(args, 0, ["source", "string", "value"], "null");
      const a1 =
        args.pos[1] ??
        args.kw.substring ??
        args.kw.str ??
        args.kw.replacement ??
        "undefined";
      if (
        meth === "length" ||
        meth === "lower" ||
        meth === "upper" ||
        meth === "tonumber" ||
        meth === "trim"
      ) {
        return `__h.str.${key}(${a0})`;
      }
      return `__h.str.${key}(${a0}, ${a1})`;
    }
  }

  const color = emitColor(name, args);
  if (color != null) return color;

  const math = emitMath(name, args);
  if (math != null) return math;

  if (TA_METHODS.has(name) && !ctx.userFuncs.has(name)) name = `ta_${name}`;
  if (name.startsWith("ta_")) return emitTa(ctx, name.slice(3), args);

  const arr = emitArray(name, args);
  if (arr != null) return arr;
  const mp = emitMap(name, args);
  if (mp != null) return mp;
  const mx = emitMatrix(name, args);
  if (mx != null) return mx;

  const req = emitRequest(ctx, name, args);
  if (req != null) return req;
  const fp = emitFootprint(name, args);
  if (fp != null) return fp;

  return "null";
}

function resolveCallee(func: expr): { name: string; methodSrc: expr | null } {
  func = unwrapSpecialize(func);
  if (func.kind === "Name") return { name: (func as Name).id, methodSrc: null };
  if (func.kind !== "Attribute")
    return { name: "unknown_func", methodSrc: null };

  const attrNode = func as Attribute;
  const attr = attrNode.attr;
  const recv = unwrapSpecialize(attrNode.value);

  if (recv.kind === "Name") {
    const id = (recv as Name).id;
    if (NS.has(id)) return { name: `${id}_${attr}`, methodSrc: null };
    return { name: attr, methodSrc: recv };
  }

  if (recv.kind === "Attribute") {
    const mid = recv as Attribute;
    const inner = unwrapSpecialize(mid.value);
    if (inner.kind === "Name" && NS.has((inner as Name).id)) {
      return {
        name: `${(inner as Name).id}_${mid.attr}_${attr}`,
        methodSrc: null,
      };
    }
    return { name: attr, methodSrc: attrNode.value };
  }

  return { name: attr, methodSrc: attrNode.value };
}

function unwrapSpecialize(node: expr): expr {
  const n = node as unknown as { kind?: string; value?: expr };
  if (n.kind === "Specialize" && n.value != null) return n.value;
  return node;
}

/**
 * Calls whose result binds a PineArray value, so a later `name[i]` subscript
 * lowers to `__h.array.sub` (Python `visit_Subscript` list path) instead of
 * series history. Python `mode="compile"` does not support list subscripts
 * (returns na); PyneTS keeps compile aligned with interpret instead.
 */
export function isArrayReturningCall(func: expr): boolean {
  const { name } = resolveCallee(func);
  // `ta.gamma_levels` returns a PineArray that Python supports subscripting
  // with `[]` (newest-first). `array.from`, `array.copy`, `array.concat`,
  // `array.slice`, and `array.new*` are NOT subscriptable via `[]` in Python
  // (only `array.get()` works), so they must NOT be in `arrayNames`.
  if (name === "ta_gamma_levels" || name === "gamma_levels") return true;
  return false;
}

function collectArgs(node: Call, visit: VisitFn): CallArgs {
  const pos: string[] = [];
  const kw: Record<string, string> = {};
  const posNodes: expr[] = [];
  const kwNodes: Record<string, expr> = {};
  const list = node.args ?? [];
  for (const arg of list) {
    const value = arg.value;
    const emitted = visit(value);
    const key = arg.name != null && arg.name !== "" ? arg.name : null;
    if (key != null) {
      kw[key] = emitted;
      kwNodes[key] = value;
    } else {
      pos.push(emitted);
      posNodes.push(value);
    }
  }
  return { pos, kw, posNodes, kwNodes };
}

function pick(
  args: CallArgs,
  index: number,
  names: string[],
  fallback: string,
): string {
  for (const n of names) {
    if (Object.hasOwn(args.kw, n)) return args.kw[n]!;
  }
  if (index >= 0 && index < args.pos.length) return args.pos[index]!;
  return fallback;
}

function hasArg(args: CallArgs, index: number, names: string[]): boolean {
  for (const n of names) {
    if (Object.hasOwn(args.kw, n)) return true;
  }
  return index >= 0 && index < args.pos.length;
}

/** Bare series names: Python sees a `PineSeries`, so list-only handlers return `na`. */
const BARE_SERIES_NAMES = new Set([
  "open",
  "high",
  "low",
  "close",
  "volume",
  "hl2",
  "hlc3",
  "ohlc4",
  "hlcc4",
  "time",
  "time_close",
]);

function hasSeriesArg(args: CallArgs): boolean {
  const isSeries = (n: expr): boolean =>
    n.kind === "Name" && BARE_SERIES_NAMES.has(n.id);
  return (
    args.posNodes.some(isSeries) || Object.values(args.kwNodes).some(isSeries)
  );
}

function isSeriesNode(n: expr | undefined): boolean {
  return n != null && n.kind === "Name" && BARE_SERIES_NAMES.has(n.id);
}

/** True when a keyword argument named one of *names* is present (interpret hasKwarg). */
function hasAnyKw(args: CallArgs, names: string[]): boolean {
  return names.some((n) => Object.hasOwn(args.kw, n));
}

/**
 * Runtime-safe `_is_period_like` gate (interpret `periodLikeCell`): only whole
 * numbers pass and are returned as-is; everything else (na, fractional,
 * series samples) collapses to *fb* — mirroring `periodLikeArg(...) ?? fb`.
 * Constant args could be decided at emit time, but the runtime form is
 * equally exact and keeps one code path for constants and series alike.
 */
function periodGate(expr: string, fb: string): string {
  return `((__p) => (Number.isInteger(__p) ? __p : ${fb}))(${expr})`;
}

/**
 * Interpret `lenArg` / `lenOrDefault` analog: a null (na) or non-finite slot
 * collapses to *fb* instead of reaching the kernel raw.
 */
function finiteOr(expr: string, fb: string): string {
  return `((__v) => (__v != null && Number.isFinite(__v) ? __v : ${fb}))(${expr})`;
}

function emitSpecArg(arg: TaCallArgSpec, args: CallArgs): string {
  switch (arg.kind) {
    case "context":
      return CTX_EXPR[arg.context];
    case "condition":
      // Compile comparisons produce JS booleans; TA kernels expect a numeric
      // cell (0/1), matching interpret's comparison result.
      return `((${pick(args, arg.callIndex, [...arg.names], "null")}) ? 1 : 0)`;
    case "source":
      return pick(
        args,
        arg.callIndex,
        [...arg.names],
        arg.default === "close"
          ? CLOSE
          : arg.default === "hlc3"
            ? HLC3
            : "null",
      );
    case "required":
      return cellOf(pick(args, arg.callIndex, [...arg.names], "null"));
    case "value":
      return pick(args, arg.callIndex, [...arg.names], "null");
    case "typicalExplicit": {
      const h = pick(args, arg.highIndex, ["high"], "null");
      const l = pick(args, arg.lowIndex, ["low"], "null");
      const c = pick(args, arg.closeIndex, ["close"], "null");
      return `((__h, __l, __c) => ((__h != null && __l != null && __c != null) ? (__h + __l + __c) / 3 : __c))(${h}, ${l}, ${c})`;
    }
    case "typicalContext":
      return TP;
    case "periodPair": {
      const first = pick(args, arg.firstIndex, [arg.firstName], "null");
      const second = pick(args, arg.secondIndex, [arg.secondName], "null");
      const winner = arg.pick === "first" ? "__a" : "__b";
      return `(((__a, __b) => ((Number.isInteger(__a) && Number.isInteger(__b)) ? ${winner} : ${arg.fallback}))(${first}, ${second}))`;
    }
    case "volumeSwap":
      return `((__v) => (Number.isInteger(__v) ? ${VOL} : __v))(${pick(args, arg.callIndex, [...arg.names], "null")})`;
    case "number": {
      const expr = pick(args, arg.callIndex, [...arg.names], "null");
      return arg.periodLike
        ? periodGate(expr, String(arg.default))
        : finiteOr(expr, String(arg.default));
    }
  }
}

/** Interpret `unwrap`: bool → 1/0, non-finite → null. */
function cellOf(expr: string): string {
  return `((__c) => (__c == null ? null : typeof __c === "boolean" ? (__c ? 1 : 0) : (typeof __c === "number" && Number.isFinite(__c) ? __c : null)))(${expr})`;
}

/** Cell or array/object (history-based TA args keep arrays intact). */
function arrOrCell(expr: string): string {
  return `((__v) => (__v != null && typeof __v === "object" ? __v : (__v == null ? null : typeof __v === "boolean" ? (__v ? 1 : 0) : (typeof __v === "number" && Number.isFinite(__v) ? __v : null))))(${expr})`;
}

/**
 * Interpret `wave10bList`: a Pine array becomes its cells; a scalar is a
 * one-element list. Bar-mode series stay one element.
 */
function cellList(expr: string): string {
  return `(() => { const __v = ${expr}; const __cell = (e) => (e == null ? null : typeof e === "boolean" ? (e ? 1 : 0) : (typeof e === "number" && Number.isFinite(e) ? e : null)); if (__v != null && typeof __v.size === "function" && typeof __v.get === "function") { const __n = __v.size(); const __o = []; for (let __i = 0; __i < __n; __i++) __o.push(__cell(__v.get(__i))); return __o; } return [__cell(__v)]; })()`;
}

/** Interpret `seriesLastCell`: array → last cell; scalar → the value itself. */
function cellLast(expr: string): string {
  return `(() => { const __v = ${expr}; const __cell = (e) => (e == null ? null : typeof e === "boolean" ? (e ? 1 : 0) : (typeof e === "number" && Number.isFinite(e) ? e : null)); if (__v != null && typeof __v.size === "function" && typeof __v.get === "function") { const __n = __v.size(); return __n === 0 ? null : __cell(__v.get(__n - 1)); } return __cell(__v); })()`;
}

const DRAW_KINDS = new Set([
  "label",
  "line",
  "box",
  "table",
  "polyline",
  "linefill",
]);

const ARRAY_SIGS: Record<string, string[][]> = {
  new: [["size"], ["initial_value", "initial"]],
  get: [["id"], ["index"]],
  set: [["id"], ["index"], ["value"]],
  push: [["id"], ["value"]],
  pop: [["id"]],
  unshift: [["id"], ["value"]],
  shift: [["id"]],
  size: [["id"]],
  includes: [["id"], ["value"]],
  first: [["id"]],
  last: [["id"]],
  insert: [["id"], ["index"], ["value"]],
  remove: [["id"], ["index"]],
  clear: [["id"]],
  fill: [["id"], ["value"]],
  copy: [["id"]],
  reverse: [["id"]],
  sort: [["id"], ["order"], ["sort_field"]],
  concat: [["id"], ["other", "id2"]],
  slice: [["id"], ["index_from", "from"], ["index_to", "to"]],
  indexof: [["id"], ["value"]],
  lastindexof: [["id"], ["value"]],
  avg: [["id"]],
  min: [["id"]],
  max: [["id"]],
  sum: [["id"]],
  stdev: [["id"], ["biased"]],
  variance: [["id"], ["biased"]],
  join: [["id"], ["separator", "sep"]],
  every: [["id"]],
  some: [["id"]],
  abs: [["id"]],
  range: [["id"]],
  median: [["id"]],
  mode: [["id"]],
  standardize: [["id"]],
  percentrank: [["id"], ["value"]],
  percentile_linear: [["id"], ["percentage", "percent"]],
  percentile_linear_interpolation: [["id"], ["percentage", "percent"]],
  percentile_nearest: [["id"], ["percentage", "percent"]],
  percentile_nearest_rank: [["id"], ["percentage", "percent"]],
  binary_search: [["id"], ["value"], ["sort_field"]],
  binary_search_leftmost: [["id"], ["value"], ["sort_field"]],
  binary_search_rightmost: [["id"], ["value"], ["sort_field"]],
  sort_indices: [["id"], ["order"], ["sort_field"]],
  covariance: [["id"], ["id2", "other"], ["biased"]],
};

const MAP_SIGS: Record<string, string[][]> = {
  new: [],
  put: [["id"], ["key"], ["value"]],
  get: [["id"], ["key"]],
  contains: [["id"], ["key"]],
  remove: [["id"], ["key"]],
  clear: [["id"]],
  size: [["id"]],
  keys: [["id"]],
  values: [["id"]],
  copy: [["id"]],
  put_all: [["id"], ["id2", "other"]],
};

const MATRIX_SIGS: Record<string, string[][]> = {
  new: [["rows"], ["columns", "cols"], ["initial_value", "initial"]],
  get: [["id"], ["row"], ["column", "col"]],
  set: [["id"], ["row"], ["column", "col"], ["value"]],
  rows: [["id"]],
  columns: [["id"]],
  fill: [["id"], ["value"]],
  transpose: [["id"]],
  copy: [["id"]],
  inv: [["id"]],
  pinv: [["id"]],
  rank: [["id"]],
  det: [["id"]],
  trace: [["id"]],
  elements_count: [["id"]],
  is_square: [["id"]],
  is_zero: [["id"]],
  is_identity: [["id"]],
  is_diagonal: [["id"]],
  is_symmetric: [["id"]],
  is_antisymmetric: [["id"]],
  is_triangular: [["id"]],
  is_binary: [["id"]],
  is_stochastic: [["id"]],
  is_antidiagonal: [["id"]],
  mult: [["id"], ["other", "matrix_2"]],
  row: [["id"], ["row", "index"]],
  col: [["id"], ["column", "col", "index"]],
  column: [["id"], ["column", "col", "index"]],
  sum: [["id"]],
  sum_all: [["id"]],
  avg: [["id"]],
  avg_all: [["id"]],
  min: [["id"]],
  min_all: [["id"]],
  max: [["id"]],
  max_all: [["id"]],
  median: [["id"]],
  mode: [["id"]],
  kron: [["id"], ["other"]],
  diff: [["id"], ["other"]],
  concat: [["id"], ["other"]],
  reshape: [["id"], ["rows"], ["columns", "cols"]],
  reverse: [["id"]],
  sort: [["id"], ["column", "col"], ["order"], ["sort_field"]],
  sort_indices: [["id"], ["column", "col"], ["order"], ["sort_field"]],
  eigenvalues: [["id"]],
  eigenvectors: [["id"]],
  pow: [["id"], ["power", "n"]],
  swap_rows: [["id"], ["row1", "i"], ["row2", "j"]],
  swap_columns: [["id"], ["column1", "i"], ["column2", "j"]],
  add_row: [["id"], ["row", "index"], ["array"]],
  add_col: [["id"], ["column", "index"], ["array"]],
  add_column: [["id"], ["column", "index"], ["array"]],
  remove_row: [["id"], ["row", "index"]],
  remove_col: [["id"], ["column", "index"]],
  remove_column: [["id"], ["column", "index"]],
  submatrix: [
    ["id"],
    ["from_row"],
    ["to_row"],
    ["from_column", "from_col"],
    ["to_column", "to_col"],
  ],
  sum_row: [["id"], ["row", "index"]],
  avg_row: [["id"], ["row", "index"]],
  min_row: [["id"], ["row", "index"]],
  max_row: [["id"], ["row", "index"]],
  mode_row: [["id"], ["row", "index"]],
  sum_col: [["id"], ["column", "col", "index"]],
  avg_col: [["id"], ["column", "col", "index"]],
  min_col: [["id"], ["column", "col", "index"]],
  max_col: [["id"], ["column", "col", "index"]],
  mode_col: [["id"], ["column", "col", "index"]],
  copy_row: [["id"], ["row", "index"]],
  copy_col: [["id"], ["column", "col", "index"]],
  fill_row: [["id"], ["row", "index"], ["value"]],
  fill_col: [["id"], ["column", "col", "index"], ["value"]],
  fill_diagonal: [["id"], ["value"]],
  reverse_rows: [["id"]],
  reverse_cols: [["id"]],
  stdev: [["id"]],
  variance: [["id"]],
  mode_all: [["id"]],
};

function nsMethod(name: string, prefix: string): string | null {
  if (!name.startsWith(prefix)) return null;
  return name.slice(prefix.length);
}

function ctorMethod(method: string): string {
  // Every Python `array.new*` spelling (newint, new_float, new_chart.point, …)
  // lowers to the same PineArray constructor as `array.new`.
  return method === "from" || method.startsWith("new") ? "new" : method;
}

const ARRAY_HOST_ALIAS: Record<string, string> = {
  percentile_linear_interpolation: "percentile_linear",
  percentile_nearest_rank: "percentile_nearest",
};

const MATRIX_HOST_ALIAS: Record<string, string> = {
  column: "col",
  add_column: "add_col",
  remove_column: "remove_col",
  sum_all: "sum",
  avg_all: "avg",
  min_all: "min",
  max_all: "max",
};

function emitHostCall(
  ns: string,
  method: string,
  args: CallArgs,
  params: string[][],
): string {
  const parts = params.map((names, i) => pick(args, i, names, "null"));
  return `__h.${ns}.${method}(${parts.join(", ")})`;
}

function emitArray(name: string, args: CallArgs): string | null {
  const raw = nsMethod(name, "array_");
  if (raw == null) return null;
  if (raw === "from") {
    const parts = args.pos.length > 0 ? args.pos : Object.values(args.kw);
    return `__h.array.from([${parts.join(", ")}])`;
  }
  const method = ctorMethod(raw);
  const params = ARRAY_SIGS[method];
  if (params == null) return null;
  return emitHostCall(
    "array",
    ARRAY_HOST_ALIAS[method] ?? method,
    args,
    params,
  );
}

function emitMap(name: string, args: CallArgs): string | null {
  const raw = nsMethod(name, "map_");
  if (raw == null) return null;
  const method = ctorMethod(raw);
  const params = MAP_SIGS[method];
  if (params == null) return null;
  return emitHostCall("map", method, args, params);
}

function emitMatrix(name: string, args: CallArgs): string | null {
  const raw = nsMethod(name, "matrix_");
  if (raw == null) return null;
  const method = ctorMethod(raw);
  const params = MATRIX_SIGS[method];
  if (params == null) return null;
  return emitHostCall(
    "matrix",
    MATRIX_HOST_ALIAS[method] ?? method,
    args,
    params,
  );
}

function drawKindAndMethod(
  name: string,
  methodSrc: expr | null,
): { kind: string; method: string } | null {
  if (methodSrc != null && methodSrc.kind === "Name") {
    const id = (methodSrc as Name).id;
    if (DRAW_KINDS.has(id)) return { kind: id, method: name };
  }
  const us = name.indexOf("_");
  if (us > 0) {
    const kind = name.slice(0, us);
    if (DRAW_KINDS.has(kind)) return { kind, method: name.slice(us + 1) };
  }
  return null;
}

const DRAW_METHODS: Record<string, Record<string, string[][]>> = {
  label: {
    set_text: [["id"], ["text"]],
    set_xy: [["id"], ["x"], ["y"]],
    set_x: [["id"], ["x"]],
    set_y: [["id"], ["y"]],
    set_color: [["id"], ["color"]],
    set_style: [["id"], ["style"]],
    set_size: [["id"], ["size"]],
    set_tooltip: [["id"], ["tooltip"]],
    set_textalign: [["id"], ["textalign"]],
    set_textcolor: [["id"], ["color", "textcolor"]],
    set_text_font_family: [["id"], ["font_family", "text_font_family"]],
    set_text_halign: [["id"], ["halign", "text_halign"]],
    set_text_valign: [["id"], ["valign", "text_valign"]],
    set_text_size: [["id"], ["size", "text_size"]],
    set_text_formatting: [["id"], ["formatting", "text_formatting"]],
    set_border_color: [["id"], ["color"]],
    set_border_width: [["id"], ["width"]],
    set_border_style: [["id"], ["style"]],
    set_xloc: [["id"], ["xloc"]],
    set_yloc: [["id"], ["yloc"]],
    delete: [["id"]],
    get_text: [["id"]],
    get_x: [["id"]],
    get_y: [["id"]],
  },
  line: {
    set_xy: [["id"], ["x1"], ["y1"], ["x2"], ["y2"]],
    set_xy1: [["id"], ["x1", "x"], ["y1", "y"]],
    set_xy2: [["id"], ["x2", "x"], ["y2", "y"]],
    set_x1: [["id"], ["x1", "x"]],
    set_y1: [["id"], ["y1", "y"]],
    set_x2: [["id"], ["x2", "x"]],
    set_y2: [["id"], ["y2", "y"]],
    set_color: [["id"], ["color"]],
    set_width: [["id"], ["width"]],
    set_style: [["id"], ["style"]],
    set_extend: [["id"], ["extend"]],
    set_xloc: [["id"], ["xloc"]],
    delete: [["id"]],
    get_price: [["id"], ["x"]],
    get_x1: [["id"]],
    get_y1: [["id"]],
    get_x2: [["id"]],
    get_y2: [["id"]],
  },
  box: {
    set_corners: [
      ["id"],
      ["left", "x1"],
      ["top", "y1"],
      ["right", "x2"],
      ["bottom", "y2"],
    ],
    set_lefttop: [
      ["id"],
      ["left", "x1"],
      ["top", "y1"],
      ["right", "x2"],
      ["bottom", "y2"],
    ],
    set_left: [["id"], ["left"]],
    set_right: [["id"], ["right"]],
    set_top: [["id"], ["top"]],
    set_bottom: [["id"], ["bottom"]],
    set_bgcolor: [["id"], ["bgcolor", "color"]],
    set_border_color: [["id"], ["color", "border_color"]],
    set_border_width: [["id"], ["width"]],
    set_border_style: [["id"], ["style"]],
    set_text: [["id"], ["text"]],
    set_text_color: [["id"], ["color", "text_color"]],
    set_text_font_family: [["id"], ["font_family"]],
    set_text_halign: [["id"], ["halign"]],
    set_text_valign: [["id"], ["valign"]],
    set_text_size: [["id"], ["size"]],
    set_text_formatting: [["id"], ["formatting"]],
    set_text_wrap: [["id"], ["wrap"]],
    set_extend: [["id"], ["extend"]],
    set_closed: [["id"], ["closed"]],
    set_rightbottom: [["id"], ["right"], ["bottom"]],
    get_left: [["id"]],
    get_right: [["id"]],
    get_top: [["id"]],
    get_bottom: [["id"]],
    delete: [["id"]],
  },
  table: {
    cell: [["id"], ["column", "col"], ["row"], ["text"]],
    // Interpret positional order is (id, row, column, text), not column-first.
    cell_set_text: [["id"], ["row"], ["column", "col"], ["text"]],
    cell_get_text: [["id"], ["row"], ["column", "col"]],
    cell_set_text_color: [
      ["id"],
      ["row"],
      ["column", "col"],
      ["color", "text"],
    ],
    cell_set_bgcolor: [["id"], ["row"], ["column", "col"], ["color"]],
    cell_set_border_color: [["id"], ["row"], ["column", "col"], ["color"]],
    cell_set_border_width: [["id"], ["row"], ["column", "col"], ["width"]],
    cell_set_tooltip: [["id"], ["row"], ["column", "col"], ["tooltip", "text"]],
    cell_set_width: [["id"], ["column", "col"], ["row"], ["width"]],
    cell_set_height: [["id"], ["column", "col"], ["row"], ["height"]],
    cell_set_text_halign: [["id"], ["column", "col"], ["row"], ["halign"]],
    cell_set_text_valign: [["id"], ["column", "col"], ["row"], ["valign"]],
    cell_set_text_size: [["id"], ["column", "col"], ["row"], ["size"]],
    cell_set_text_font_family: [
      ["id"],
      ["column", "col"],
      ["row"],
      ["font_family"],
    ],
    cell_set_text_formatting: [
      ["id"],
      ["column", "col"],
      ["row"],
      ["formatting"],
    ],
    set_position: [["id"], ["position"]],
    set_bgcolor: [["id"], ["color", "bgcolor"]],
    set_border_color: [["id"], ["color"]],
    set_border_width: [["id"], ["width"]],
    set_frame_color: [["id"], ["color"]],
    set_frame_width: [["id"], ["width"]],
    merge_cells: [
      ["id"],
      ["start_row"],
      ["start_column", "start_col"],
      ["end_row"],
      ["end_column", "end_col"],
    ],
    delete: [["id"]],
  },
  polyline: {
    delete: [["id"]],
    get_points: [["id"]],
    set_points: [["id"], ["points"]],
    set_line_color: [["id"], ["color"]],
    set_line_width: [["id"], ["width"]],
    set_line_style: [["id"], ["style"]],
    set_fill_color: [["id"], ["fill_color", "color"]],
    set_curved: [["id"], ["curved"]],
    set_force_overlay: [["id"], ["force_overlay"]],
    set_closed: [["id"], ["closed"]],
    set_xloc: [["id"], ["xloc"]],
  },
  linefill: {
    set_color: [["id"], ["color"]],
    delete: [["id"]],
    get_line1: [["id"]],
    get_line2: [["id"]],
  },
};

function emitChartPoint(name: string, args: CallArgs): string | null {
  const meth = name.slice("chart_point_".length);
  if (meth === "new" || meth === "from_time") {
    return `__h.draw.point_new(${pick(args, 0, ["time"], "null")}, ${pick(args, 1, ["price"], "0")})`;
  }
  if (meth === "from_index") {
    return `__h.draw.point_from_index(${pick(args, 0, ["index"], "null")}, ${pick(args, 1, ["price"], "0")})`;
  }
  if (meth === "now") {
    return `__h.draw.point_now(__bar_idx, time, ${pick(args, 0, ["price"], "0")})`;
  }
  if (meth === "copy") {
    return `__h.draw.point_copy(${pick(args, 0, ["point"], "null")})`;
  }
  return null;
}

function emitDraw(
  ctx: EmitCtx,
  name: string,
  methodSrc: expr | null,
  args: CallArgs,
): string | null {
  if (name === "alert" && methodSrc == null) {
    ctx.usesDrawings = true;
    return `__h.draw.alert(__bar_idx, ${pick(args, 0, ["message"], "null")})`;
  }
  if (name.startsWith("chart_point_")) {
    const point = emitChartPoint(name, args);
    if (point != null) ctx.usesDrawings = true;
    return point;
  }
  const parsed = drawKindAndMethod(name, methodSrc);
  if (parsed == null) return null;
  const { kind, method } = parsed;
  let code: string | null = null;
  if (method === "all") {
    code = `__h.draw.all(${JSON.stringify(kind)})`;
  } else if (
    method === "copy" &&
    (kind === "line" ||
      kind === "label" ||
      kind === "box" ||
      kind === "polyline")
  ) {
    code = `__h.draw.copy(${pick(args, 0, ["id"], "null")})`;
  } else if (method === "new") {
    if (kind === "label") {
      code = `__h.draw.label_new(__bar_idx, ${pick(args, 2, ["text"], "null")}, ${pick(args, 0, ["x"], "0")}, ${pick(args, 1, ["y"], "0")})`;
    } else if (kind === "line") {
      code = `__h.draw.line_new(__bar_idx, ${pick(args, 0, ["x1"], "0")}, ${pick(args, 1, ["y1"], "0")}, ${pick(args, 2, ["x2"], "0")}, ${pick(args, 3, ["y2"], "0")})`;
    } else if (kind === "box") {
      code = `__h.draw.box_new(__bar_idx, ${pick(args, 0, ["left"], "0")}, ${pick(args, 1, ["top"], "0")}, ${pick(args, 2, ["right"], "0")}, ${pick(args, 3, ["bottom"], "0")})`;
    } else if (kind === "polyline") {
      code = `__h.draw.polyline_new(__bar_idx, ${pick(args, 0, ["points"], "null")})`;
    } else if (kind === "table") {
      // Pine positional order: (position, columns, rows, bgcolor, frame_color,
      // frame_width, border_color, border_width, force_overlay).
      code = `__h.draw.table_new(__bar_idx, ${pick(args, 0, ["position"], "null")}, ${pick(args, 1, ["columns"], "null")}, ${pick(args, 2, ["rows"], "null")}, ${pick(args, 3, ["bgcolor"], "null")}, ${pick(args, 4, ["frame_color"], "null")}, ${pick(args, 5, ["frame_width"], "null")}, ${pick(args, 6, ["border_color"], "null")}, ${pick(args, 7, ["border_width"], "null")}, ${pick(args, 8, ["force_overlay"], "null")})`;
    } else if (kind === "linefill") {
      const color = hasArg(args, 2, ["color"])
        ? pick(args, 2, ["color"], "null")
        : "null";
      code = `__h.draw.linefill_new(__bar_idx, ${pick(args, 0, ["id1", "line1"], "null")}, ${pick(args, 1, ["id2", "line2"], "null")}, ${color})`;
    } else if (DRAW_KINDS.has(kind)) {
      code = `__h.draw.${kind}_new(__bar_idx)`;
    }
  } else if (kind === "line" && method === "fill") {
    const color = hasArg(args, 2, ["color"])
      ? pick(args, 2, ["color"], "null")
      : "null";
    code = `__h.draw.linefill_new(__bar_idx, ${pick(args, 0, ["id1", "line1"], "null")}, ${pick(args, 1, ["id2", "line2"], "null")}, ${color})`;
  } else if (
    (kind === "line" &&
      (method === "set_first_point" || method === "set_second_point")) ||
    (kind === "label" && method === "set_point") ||
    (kind === "box" &&
      (method === "set_top_left_point" || method === "set_bottom_right_point"))
  ) {
    code = `__h.draw.${kind}_${method}(${pick(args, 0, ["id"], "null")}, ${pick(args, 1, ["point"], "null")})`;
  } else if (kind === "box" && method === "set_xloc") {
    code = `__h.draw.box_set_xloc(${pick(args, 0, ["id"], "null")}, ${pick(args, 1, ["left"], "null")}, ${pick(args, 2, ["right"], "null")}, ${pick(args, 3, ["xloc"], "null")})`;
  } else if (kind === "table" && method === "clear") {
    const id = pick(args, 0, ["id", "table_id"], "null");
    code = hasArg(args, 1, ["start_row"])
      ? `__h.draw.table_clear(${id}, ${pick(args, 1, ["start_row"], "null")}, ${pick(args, 2, ["start_column", "start_col"], "null")}, ${pick(args, 3, ["end_row"], "null")}, ${pick(args, 4, ["end_column", "end_col"], "null")})`
      : `__h.draw.table_clear(${id})`;
  } else {
    const aliased =
      kind === "box" && method === "set_lefttop" ? "set_corners" : method;
    const params =
      DRAW_METHODS[kind]?.[method] ?? DRAW_METHODS[kind]?.[aliased];
    if (params != null) {
      code = emitHostCall("draw", `${kind}_${aliased}`, args, params);
    }
  }
  if (code != null) ctx.usesDrawings = true;
  return code;
}

function emitUdt(
  ctx: EmitCtx,
  name: string,
  methodSrc: expr | null,
  args: CallArgs,
): string | null {
  if (methodSrc == null || methodSrc.kind !== "Name") return null;
  const id = (methodSrc as Name).id;
  const spec = ctx.udtTypes.get(id);
  if (spec == null) return null;
  if (name === "copy") {
    return `({...${pick(args, 0, ["id", "this", "source"], "null")}})`;
  }
  if (name !== "new") return null;
  const parts: string[] = [];
  const usedKw = new Set<string>();
  let posIdx = 0;
  for (const field of spec.fields) {
    let expr: string | undefined;
    if (Object.hasOwn(args.kw, field)) {
      expr = args.kw[field];
      usedKw.add(field);
    } else if (posIdx < args.pos.length) {
      expr = args.pos[posIdx++];
    } else if (Object.hasOwn(spec.defaults, field)) {
      expr = spec.defaults[field];
    }
    if (expr != null) parts.push(`${field}: ${expr}`);
  }
  for (const [k, v] of Object.entries(args.kw)) {
    if (usedKw.has(k)) continue;
    parts.push(`${k}: ${v}`);
  }
  return `__h.udtNew(${JSON.stringify(id)}, {${parts.join(", ")}})`;
}

const SECURITY_FUNCS = new Set([
  "security",
  "security_lower_tf",
  "request_security",
  "request_security_lower_tf",
]);

const SIMPLE_CHART_EXPR = new Set([
  "close",
  "open",
  "high",
  "low",
  "volume",
  "time",
  "hl2",
  "hlc3",
  "ohlc4",
]);

const SIMPLE_CHART_ARR =
  /^(?:open|high|low|close|vol|volume|time|hl2|hlc3|ohlc4)_arr\[__bar_idx\]$/;

/** `p.plus(1)` → method UDF with instance first. TA methods stay TA. */
function emitUdtMethod(
  ctx: EmitCtx,
  name: string,
  methodSrc: expr | null,
  args: CallArgs,
  visit: VisitFn,
): string | null {
  if (methodSrc == null || methodSrc.kind !== "Name") return null;
  if (!ctx.udtMethodNames.has(name) && !ctx.userFuncs.has(name)) return null;
  if (TA_METHODS.has(name)) return null;
  return emitUserFuncCall(ctx, name, [visit(methodSrc), ...args.pos]);
}

/** Same-symbol OHLCV passthrough only. HA marker remaps OHLC. Foreign / complex expr → `null`. */
function emitRequest(
  ctx: EmitCtx,
  name: string,
  args: CallArgs,
): string | null {
  if (SECURITY_FUNCS.has(name)) {
    const symbol = pick(args, 0, ["symbol", "ticker"], "null");
    const expression = pick(args, 2, ["expression", "expr"], "close");
    if (isHeikinashiSecurity(symbol) && isSimpleSecurityExpr(expression)) {
      ctx.needsHeikinashi = true;
      return mapOhlcvExprToHeikinashi(expression);
    }
    if (isSimpleSecurityExpr(expression) && isChartSecuritySymbol(symbol))
      return expression;
    return "null";
  }
  if (name === "request_currency_rate" || name === "currency_rate") {
    return `__h.currencyRate(${pick(args, 0, ["from", "from_currency"], "null")}, ${pick(args, 1, ["to", "to_currency"], "null")})`;
  }
  if (name === "request_seed") {
    return `__h.requestSeed(${pick(args, 0, ["seed"], "0")})`;
  }
  if (name === "request_footprint") {
    return `__h.requestFootprint(${pick(args, 0, ["num_ticks"], "100")}, ${pick(args, 1, ["va_percentage"], "70")})`;
  }
  if (name.startsWith("request_")) return "null";
  return null;
}

/** Python `request.footprint` mock + `footprint.*` / `volume_row.*` accessors. */
function emitFootprint(name: string, args: CallArgs): string | null {
  const fp = pick(args, 0, ["id", "footprint"], "null");
  const vr = pick(args, 0, ["id", "volume_row"], "null");
  switch (name) {
    case "footprint_buy_volume":
      return `__h.footprint.buy_volume(${fp})`;
    case "footprint_sell_volume":
      return `__h.footprint.sell_volume(${fp})`;
    case "footprint_delta":
      return `__h.footprint.delta(${fp})`;
    case "footprint_total_volume":
      return `__h.footprint.total_volume(${fp})`;
    case "footprint_vah":
      return `__h.footprint.vah(${fp})`;
    case "footprint_val":
      return `__h.footprint.val(${fp})`;
    case "footprint_poc":
      return `__h.footprint.poc(${fp})`;
    case "footprint_rows":
      return `__h.footprint.rows(${fp})`;
    case "footprint_get_row_by_price":
      return `__h.footprint.get_row_by_price(${fp}, ${pick(args, 1, ["price"], "null")})`;
    case "volume_row_up_price":
      return `__h.footprint.volume_row.up_price(${vr})`;
    case "volume_row_down_price":
      return `__h.footprint.volume_row.down_price(${vr})`;
    case "volume_row_buy_volume":
      return `__h.footprint.volume_row.buy_volume(${vr})`;
    case "volume_row_sell_volume":
      return `__h.footprint.volume_row.sell_volume(${vr})`;
    case "volume_row_delta":
      return `__h.footprint.volume_row.delta(${vr})`;
    case "volume_row_total_volume":
      return `__h.footprint.volume_row.total_volume(${vr})`;
    case "volume_row_has_buy_imbalance":
      return `__h.footprint.volume_row.has_buy_imbalance(${vr})`;
    case "volume_row_has_sell_imbalance":
      return `__h.footprint.volume_row.has_sell_imbalance(${vr})`;
    default:
      return null;
  }
}

function isSimpleSecurityExpr(expr: string): boolean {
  const e = expr.trim();
  if (!e) return false;
  if (SIMPLE_CHART_EXPR.has(e)) return true;
  return SIMPLE_CHART_ARR.test(e);
}

function unquoteJsString(s: string): string {
  if (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'")))
  ) {
    if (s.startsWith('"')) {
      try {
        return JSON.parse(s) as string;
      } catch {
        return s.slice(1, -1);
      }
    }
    return s.slice(1, -1);
  }
  return s;
}

function isHeikinashiSecurity(sym: string): boolean {
  const s = sym.trim();
  if (
    s === "__HEIKINASHI__" ||
    s === "'__HEIKINASHI__'" ||
    s === '"__HEIKINASHI__"'
  )
    return true;
  if (/^['"]__HEIKINASHI__['"]$/.test(s)) return true;
  if (s.includes("__HEIKINASHI__") && !s.toUpperCase().includes("HA("))
    return true;
  return false;
}

const HA_OHLC_MAP: Record<string, string> = {
  open: "ha_open_arr[__bar_idx]",
  high: "ha_high_arr[__bar_idx]",
  low: "ha_low_arr[__bar_idx]",
  close: "ha_close_arr[__bar_idx]",
  Open: "ha_open_arr[__bar_idx]",
  High: "ha_high_arr[__bar_idx]",
  Low: "ha_low_arr[__bar_idx]",
  Close: "ha_close_arr[__bar_idx]",
  open_arr: "ha_open_arr",
  high_arr: "ha_high_arr",
  low_arr: "ha_low_arr",
  close_arr: "ha_close_arr",
  Open_arr: "ha_open_arr",
  High_arr: "ha_high_arr",
  Low_arr: "ha_low_arr",
  Close_arr: "ha_close_arr",
  "open_arr[__bar_idx]": "ha_open_arr[__bar_idx]",
  "high_arr[__bar_idx]": "ha_high_arr[__bar_idx]",
  "low_arr[__bar_idx]": "ha_low_arr[__bar_idx]",
  "close_arr[__bar_idx]": "ha_close_arr[__bar_idx]",
  "Open_arr[__bar_idx]": "ha_open_arr[__bar_idx]",
  "High_arr[__bar_idx]": "ha_high_arr[__bar_idx]",
  "Low_arr[__bar_idx]": "ha_low_arr[__bar_idx]",
  "Close_arr[__bar_idx]": "ha_close_arr[__bar_idx]",
};

/** Chart OHLC → HA arrays. volume / time stay as chart. */
function mapOhlcvExprToHeikinashi(expr: string): string {
  return HA_OHLC_MAP[expr.trim()] ?? expr;
}

function isChartSecuritySymbol(sym: string): boolean {
  const s = sym.trim();
  if (
    !s ||
    s === "null" ||
    s === "na" ||
    s === "undefined" ||
    s === "None" ||
    s === "np.nan"
  ) {
    return true;
  }
  if (isHeikinashiSecurity(s)) return true;
  const inner = unquoteJsString(s).trim();
  if (!inner || inner === "na" || inner === "null" || inner === "SYMBOL")
    return true;
  if (s === "SYMBOL" || s === "tickerid" || s === "ticker") return true;
  if (s === "syminfo_ticker" || s === "syminfo_tickerid") return true;
  const low = s.toLowerCase();
  if (
    low.includes("syminfo") &&
    (s.includes("ticker") ||
      s.includes("tickerid") ||
      s.includes("root") ||
      s.includes("prefix"))
  ) {
    return true;
  }
  return false;
}

function constString(node: expr | undefined): string | null {
  if (node == null || node.kind !== "Constant") return null;
  const v = (node as Constant).value;
  return typeof v === "string" ? v : null;
}

function isStrategyAction(name: string, method: string): boolean {
  return (
    STRATEGY_ACTIONS.has(name) ||
    method === "entry" ||
    method === "close" ||
    method === "close_all" ||
    method === "exit" ||
    method === "order" ||
    method === "cancel" ||
    method === "cancel_all" ||
    method.startsWith("risk_") ||
    name.startsWith("strategy_entry") ||
    name.startsWith("strategy_risk")
  );
}

/** `strategy(...)` declaration — kwargs only, matching interpret `applyStrategyDecl`. */
function emitStrategyDecl(ctx: EmitCtx, args: CallArgs): string {
  ctx.usesStrategy = true;
  const fields: string[] = [];
  const add = (names: string[], key: string): void => {
    if (hasArg(args, -1, names))
      fields.push(`${key}: ${pick(args, -1, names, "null")}`);
  };
  add(["commission", "commission_value"], "commission");
  add(["slippage"], "slippage");
  add(["pyramiding"], "pyramiding");
  add(["avg_price_model"], "avg_price_model");
  add(["leverage"], "leverage");
  add(["margin_long"], "margin_long");
  add(["margin_short"], "margin_short");
  add(["default_qty_type"], "default_qty_type");
  add(["default_qty_value"], "default_qty_value");
  add(["initial_capital"], "initial_capital");
  add(["currency"], "currency");
  return `__h.strategy.configure({${fields.join(", ")}})`;
}

function emitStrategyEntry(method: "entry" | "order", args: CallArgs): string {
  const id = pick(args, 0, ["id"], "null");
  const direction = pick(args, 1, ["direction"], "null");
  const qty = pick(args, 2, ["qty"], "null");
  const fields: string[] = [];
  if (hasArg(args, 3, ["limit"]))
    fields.push(`limit: ${pick(args, 3, ["limit"], "null")}`);
  if (hasArg(args, 4, ["stop"]))
    fields.push(`stop: ${pick(args, 4, ["stop"], "null")}`);
  if (hasArg(args, 5, ["comment"]))
    fields.push(`comment: ${pick(args, 5, ["comment"], "null")}`);
  return `__h.strategy.${method}(${id}, ${direction}, ${qty}, {${fields.join(", ")}})`;
}

function emitStrategy(ctx: EmitCtx, name: string, args: CallArgs): string {
  const method = name.startsWith("strategy_")
    ? name.slice("strategy_".length)
    : name;

  if (method === "long" || method === "short") return JSON.stringify(method);

  if (isStrategyAction(name, method) || STRATEGY_QUERIES.has(name))
    ctx.usesStrategy = true;

  switch (method) {
    case "entry":
    case "order":
      ctx.usesStrategy = true;
      return emitStrategyEntry(method, args);
    case "close": {
      ctx.usesStrategy = true;
      const id = pick(args, 0, ["id"], "null");
      return hasArg(args, 1, ["qty"])
        ? `__h.strategy.close(${id}, ${pick(args, 1, ["qty"], "null")})`
        : `__h.strategy.close(${id})`;
    }
    case "close_all":
      ctx.usesStrategy = true;
      return "__h.strategy.close_all()";
    case "exit": {
      ctx.usesStrategy = true;
      const id = pick(args, 0, ["id"], "null");
      const fields: string[] = [];
      const add = (index: number, names: string[], key: string): void => {
        if (hasArg(args, index, names))
          fields.push(`${key}: ${pick(args, index, names, "null")}`);
      };
      add(1, ["from_entry"], "from_entry");
      add(2, ["qty"], "qty");
      add(3, ["qty_percent"], "qty_percent");
      add(4, ["profit"], "profit");
      add(5, ["limit"], "limit");
      add(6, ["loss"], "loss");
      add(7, ["stop"], "stop");
      add(8, ["trail_price"], "trail_price");
      add(9, ["trail_points"], "trail_points");
      add(10, ["trail_offset"], "trail_offset");
      return `__h.strategy.exit(${id}, {${fields.join(", ")}})`;
    }
    case "cancel":
      ctx.usesStrategy = true;
      return `__h.strategy.cancel(${pick(args, 0, ["id"], "null")})`;
    case "cancel_all":
      ctx.usesStrategy = true;
      return "__h.strategy.cancel_all()";
    case "position_size":
    case "netprofit":
    case "equity":
    case "openprofit":
    case "opentrades":
    case "closedtrades":
    case "leverage":
    case "margin_liquidation_price":
    case "position_avg_price":
    case "initial_capital":
    case "cash":
    case "position_entry_name":
    case "account_currency":
    case "max_contracts_held_all":
    case "max_contracts_held_long":
    case "max_contracts_held_short":
    case "wintrades":
    case "losstrades":
    case "eventrades":
    case "grossprofit":
    case "grossloss":
    case "avg_trade":
    case "avg_winning_trade":
    case "avg_losing_trade":
    case "netprofit_percent":
    case "openprofit_percent":
    case "grossprofit_percent":
    case "grossloss_percent":
    case "avg_trade_percent":
    case "avg_winning_trade_percent":
    case "avg_losing_trade_percent":
    case "max_drawdown":
    case "max_drawdown_percent":
    case "max_runup":
    case "max_runup_percent":
    case "percent_profitable":
    case "winrate":
    case "profitfactor":
    case "profit_factor":
    case "capital_held":
    case "closedtrades_first_index":
      ctx.usesStrategy = true;
      return `__h.strategy.${method}()`;
    case "commission":
      return "0";
    case "default_entry_qty":
      ctx.usesStrategy = true;
      return hasArg(args, 0, ["percent_equity"])
        ? `__h.strategy.default_entry_qty(${pick(args, 0, ["percent_equity"], "null")})`
        : `__h.strategy.default_entry_qty()`;
    case "convert_to_account":
    case "convert_to_symbol":
      ctx.usesStrategy = true;
      return hasArg(args, 0, ["value"])
        ? `__h.strategy.convert_to(${pick(args, 0, ["value"], "null")})`
        : "1";
    case "risk_allow_entry_in":
      ctx.usesStrategy = true;
      return `__h.strategy.risk_allow_entry_in(${pick(args, 0, ["value"], "null")})`;
    case "risk_max_position_size":
      ctx.usesStrategy = true;
      return `__h.strategy.risk_max_position_size(${pick(args, 0, ["percent", "value"], "null")})`;
    case "risk_max_drawdown":
      ctx.usesStrategy = true;
      return `__h.strategy.risk_max_drawdown(${pick(args, 0, ["value"], "null")}, ${pick(args, 1, ["type"], "null")})`;
    default: {
      if (method.startsWith("direction_")) {
        const tail = method.slice("direction_".length);
        if (tail === "long" || tail === "short" || tail === "all")
          return JSON.stringify(tail);
      }
      if (method.startsWith("oca_")) {
        const tail = method.slice("oca_".length);
        if (tail === "none" || tail === "cancel" || tail === "reduce")
          return JSON.stringify(tail);
      }
      if (method.startsWith("commission_")) {
        const tail = method.slice("commission_".length);
        if (
          tail === "percent" ||
          tail === "cash_per_order" ||
          tail === "cash_per_contract"
        ) {
          return JSON.stringify(tail);
        }
      }
      if (
        method.startsWith("closedtrades_") ||
        method.startsWith("opentrades_")
      ) {
        ctx.usesStrategy = true;
        if (method === "opentrades_capital_held")
          return "__h.strategy.capital_held()";
        if (method === "closedtrades_first_index")
          return "__h.strategy.closedtrades_first_index()";
        const idx = hasArg(args, 0, ["trade_num", "trade_index", "index"])
          ? pick(args, 0, ["trade_num", "trade_index", "index"], "0")
          : "0";
        return `__h.strategy.${method}(${idx})`;
      }
      if (isStrategyAction(name, method)) ctx.usesStrategy = true;
      return "null";
    }
  }
}

function seriesNameRef(ctx: EmitCtx, id: string): string {
  const chart = CHART_SERIES_ARR[id];
  if (chart != null) return chart;
  const raw = `${id}_arr`;
  const safe = `__u_${id}_arr`;
  if (ctx.arrays.has(raw)) return raw;
  if (ctx.arrays.has(safe)) return safe;
  return raw;
}

function seriesArg(
  ctx: EmitCtx,
  node: expr | undefined,
  visited: string,
): string {
  if (node != null && node.kind === "Name")
    return seriesNameRef(ctx, (node as Name).id);
  return visited || "null";
}

function packUserFuncArgs(
  ctx: EmitCtx,
  name: string,
  args: CallArgs,
): string[] {
  const formals = ctx.funcParamNames.get(name);
  const series = ctx.funcSeriesParams.get(name);
  if (formals == null || formals.length === 0) return args.pos.slice();

  const packed: string[] = [];
  for (let i = 0; i < formals.length; i++) {
    const formal = formals[i]!;
    const fromPos = i < args.pos.length;
    const node = fromPos ? args.posNodes[i] : args.kwNodes[formal];
    const visited = fromPos ? args.pos[i]! : (args.kw[formal] ?? "null");
    packed.push(series?.has(formal) ? seriesArg(ctx, node, visited) : visited);
  }
  for (let i = formals.length; i < args.pos.length; i++)
    packed.push(args.pos[i]!);
  return packed;
}

function emitPlot(ctx: EmitCtx, fname: string, args: CallArgs): string {
  let title: string | null = constString(args.kwNodes.title);
  if (title == null) {
    for (const n of args.posNodes) {
      const s = constString(n);
      if (s != null) {
        title = s;
        break;
      }
    }
  }
  if (title == null || title === "") {
    if (fname === "plotcandle") title = "candles";
    else if (fname === "plotbar") title = "bars";
    else title = `plot_${ctx.plots.length}`;
  }
  // Python primary column for plotcandle/plotbar is close (arg 3), not open.
  const ohlc = fname === "plotcandle" || fname === "plotbar";
  const series = ohlc
    ? pick(args, 3, ["close"], "null")
    : pick(args, 0, ["series", "source", "price"], "null");
  const i = ctx.plots.length;
  ctx.plots.push({ title });
  return `plot_${i}[__bar_idx] = __h.plotNum(${series})`;
}

function emitColor(name: string, args: CallArgs): string | null {
  if (name === "color_r")
    return `__h.colorR(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_g")
    return `__h.colorG(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_b")
    return `__h.colorB(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_t")
    return `__h.colorT(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_rgb") {
    const r = pick(args, 0, ["red", "r"], "null");
    const g = pick(args, 1, ["green", "g"], "null");
    const b = pick(args, 2, ["blue", "b"], "null");
    if (hasArg(args, 3, ["transp", "t", "transparency"])) {
      return `__h.colorRgb(${r}, ${g}, ${b}, ${pick(args, 3, ["transp", "t", "transparency"], "null")})`;
    }
    return `__h.colorRgb(${r}, ${g}, ${b})`;
  }
  if (name === "color_from_gradient") {
    return `__h.colorFromGradient(${pick(args, 0, ["value"], "null")}, ${pick(args, 1, ["bottom_value", "bottom"], "null")}, ${pick(args, 2, ["top_value", "top"], "null")}, ${pick(args, 3, ["color1"], "null")}, ${pick(args, 4, ["color2"], "null")})`;
  }
  if (name === "color_new" || name === "color") {
    const color = pick(args, 0, ["color"], "null");
    if (hasArg(args, 1, ["transp", "transparency"])) {
      return `__h.colorNew(${color}, ${pick(args, 1, ["transp", "transparency"], "null")})`;
    }
    return `__h.colorNew(${color})`;
  }
  return null;
}

function emitInput(ctx: EmitCtx, args: CallArgs): string {
  const def = pick(args, 0, ["defval"], "null");
  return `__h.input(${JSON.stringify(inputKey(ctx, args))}, ${def})`;
}

function inputKey(ctx: EmitCtx, args: CallArgs): string {
  const titleKw = constString(args.kwNodes.title);
  if (titleKw != null && titleKw !== "") return titleKw;
  const defvalKw = constString(args.kwNodes.defval);
  if (defvalKw != null && defvalKw !== "") return defvalKw;
  if (args.posNodes.length > 1) {
    const posTitle = constString(args.posNodes[1]);
    if (posTitle != null && posTitle !== "") return posTitle;
  }
  const bag = ctx as EmitCtx & { nextInput?: number };
  const i = bag.nextInput ?? 0;
  bag.nextInput = i + 1;
  return i === 0 ? "input" : `input${i}`;
}

function emitMath(name: string, args: CallArgs): string | null {
  const bare = name.startsWith("math_") ? name.slice(5) : name;
  const isNs = name.startsWith("math_");
  const isBareMath =
    name === "abs" ||
    name === "max" ||
    name === "min" ||
    name === "sqrt" ||
    name === "log" ||
    name === "log10" ||
    name === "pow" ||
    name === "sign" ||
    name === "floor" ||
    name === "ceil" ||
    name === "round" ||
    name === "exp" ||
    name === "sin" ||
    name === "cos" ||
    name === "tan" ||
    name === "asin" ||
    name === "acos" ||
    name === "atan" ||
    name === "avg" ||
    name === "random" ||
    name === "todegrees" ||
    name === "toradians" ||
    name === "iff" ||
    name === "fixnan" ||
    name === "round_to_mintick";
  if (!isNs && !isBareMath) return null;

  if (bare === "round_to_mintick") {
    return `__h.roundToMintick(${pick(args, 0, ["number", "x"], "null")})`;
  }
  if (bare === "iff") {
    const cond = pick(args, 0, ["condition", "cond"], "null");
    const a = pick(args, 1, ["then", "if_true"], "null");
    const b = pick(args, 2, ["else", "if_false"], "null");
    return `(__h.nz(${cond}) ? ${a} : ${b})`;
  }
  if (bare === "fixnan") {
    return `__h.nz(${pick(args, 0, ["source", "x"], "null")}, 0)`;
  }
  if (bare === "max" || bare === "min") {
    const xs = variadic(args);
    if (xs.length === 0) return "null";
    if (xs.length === 1) return naUnary(xs[0]!, "__x");
    const init = bare === "max" ? "-Infinity" : "Infinity";
    const cmp = bare === "max" ? "__x > __m" : "__x < __m";
    return `((...__xs) => { if (__xs.length === 0) return null; let __m = ${init}; for (const __x of __xs) { if (__h.isNa(__x)) return null; if (${cmp}) __m = Number(__x); } return Number.isFinite(__m) ? __m : null; })(${xs.join(", ")})`;
  }
  if (bare === "avg") {
    const xs = variadic(args);
    if (xs.length === 0) return "null";
    if (xs.length === 1) return naUnary(xs[0]!, "__x");
    return `((...__xs) => { let __s = 0; for (const __x of __xs) { if (__h.isNa(__x)) return null; __s += Number(__x); } const __r = __s / __xs.length; return Number.isFinite(__r) ? __r : null; })(${xs.join(", ")})`;
  }
  if (bare === "sum" && isNs) {
    const xs = variadic(args);
    if (xs.length === 0) return "null";
    return `((...__xs) => { let __s = 0; for (const __x of __xs) { if (__h.isNa(__x)) return null; __s += Number(__x); } return Number.isFinite(__s) ? __s : null; })(${xs.join(", ")})`;
  }
  if (bare === "pow") {
    const b = pick(args, 0, ["base", "number", "x"], "null");
    const e = hasArg(args, 1, ["exponent", "exp", "y"])
      ? pick(args, 1, ["exponent", "exp", "y"], "2")
      : "2";
    return `((__b, __e) => { if (__h.isNa(__b) || __h.isNa(__e)) return null; const __r = Math.pow(Number(__b), Number(__e)); return Number.isFinite(__r) ? __r : null; })(${b}, ${e})`;
  }
  if (bare === "round") {
    const x = pick(args, 0, ["number", "x"], "null");
    if (!hasArg(args, 1, ["precision"])) {
      return `((__x) => { if (__h.isNa(__x)) return null; const __n = Number(__x); const __r = __n >= 0 ? Math.round(__n) : -Math.round(-__n); return Number.isFinite(__r) ? __r : null; })(${x})`;
    }
    const p = pick(args, 1, ["precision"], "0");
    return `((__x, __p) => { if (__h.isNa(__x) || __h.isNa(__p)) return null; const __n = Number(__x); const __f = 10 ** Math.trunc(Number(__p)); if (!Number.isFinite(__f)) return null; const __y = __n * __f; const __r = (__y >= 0 ? Math.round(__y) : -Math.round(-__y)) / __f; return Number.isFinite(__r) ? __r : null; })(${x}, ${p})`;
  }
  if (bare === "random") {
    const a0 = hasArg(args, 0, ["min"]) ? pick(args, 0, ["min"], "null") : null;
    const a1 = hasArg(args, 1, ["max"]) ? pick(args, 1, ["max"], "null") : null;
    if (a0 == null) {
      return "((() => { const __r = Math.random(); return Number.isFinite(__r) ? __r : null; })())";
    }
    if (a1 == null) {
      return `((__hi) => { if (__h.isNa(__hi)) return null; const __r = Number(__hi) * Math.random(); return Number.isFinite(__r) ? __r : null; })(${a0})`;
    }
    return `((__lo, __hi) => { if (__h.isNa(__lo) || __h.isNa(__hi)) return null; const __r = Number(__lo) + (Number(__hi) - Number(__lo)) * Math.random(); return Number.isFinite(__r) ? __r : null; })(${a0}, ${a1})`;
  }
  if (bare === "log" && hasArg(args, 1, ["base"])) {
    const x = pick(args, 0, ["number", "x"], "null");
    const base = pick(args, 1, ["base"], "null");
    return `((__x, __b) => { if (__h.isNa(__x) || __h.isNa(__b) || Number(__x) <= 0 || Number(__b) <= 0 || Number(__b) === 1) return null; const __r = Math.log(Number(__x)) / Math.log(Number(__b)); return Number.isFinite(__r) ? __r : null; })(${x}, ${base})`;
  }
  const spec = MATH_UNARY[bare];
  if (spec != null) {
    const x = pick(
      args,
      0,
      ["number", "x", "angle", "radians", "degrees"],
      "null",
    );
    return naMath(x, spec.fn, spec.guard);
  }
  return isNs ? "null" : null;
}

function variadic(args: CallArgs): string[] {
  if (args.pos.length > 0) return args.pos;
  return Object.values(args.kw);
}

function naUnary(x: string, _bind: string): string {
  return `((__x) => (__h.isNa(__x) ? null : Number.isFinite(Number(__x)) ? Number(__x) : null))(${x})`;
}

function naMath(x: string, expr: string, guard?: string): string {
  const extra = guard != null ? ` || (${guard})` : "";
  return `((__x) => { if (__h.isNa(__x)${extra}) return null; const __r = ${expr}; return Number.isFinite(__r) ? __r : null; })(${x})`;
}

function allocSite(ctx: EmitCtx): string {
  return JSON.stringify("c" + ctx.nextSite++);
}

function taCall(method: string, site: string, parts: string[]): string {
  return `__h.ta.${method}(${site}, ${parts.join(", ")})`;
}

/** Call a stateless TaEngine method (no call-site argument). */
function taPure(method: string, parts: string[]): string {
  return `__h.ta.${method}(${parts.join(", ")})`;
}

function emitTa(ctx: EmitCtx, method: string, args: CallArgs): string {
  if (!TA_METHODS.has(method)) return "null";
  if (method === "ad") method = "accdist";
  const site = allocSite(ctx);
  const src = () => pick(args, 0, ["source", "series", "src"], CLOSE);
  const len = (
    index: number,
    fb: string,
    names: string[] = ["length", "len", "period"],
  ) => pick(args, index, names, fb);

  const srcLen = TA_SRC_LEN_BY_NAME.get(method);
  if (srcLen != null) {
    return taCall(srcLen.method, site, [
      src(),
      len(1, String(srcLen.compileDefaultLength)),
    ]);
  }
  const ohlcv = TA_OHLCV_BY_NAME.get(method);
  if (ohlcv != null) {
    return taCall(
      ohlcv.method,
      site,
      ohlcv.args.map((arg, i) =>
        pick(args, i, [...arg.names], CTX_EXPR[arg.context]),
      ),
    );
  }
  const lenExtra = TA_LEN_EXTRA_BY_NAME.get(method);
  if (lenExtra != null) {
    const parts: string[] = [];
    for (const ctx of lenExtra.contextArgs) parts.push(CTX_EXPR[ctx]);
    if (lenExtra.hasSourceArg) parts.push(src());
    parts.push(
      len(lenExtra.lengthIndex, String(lenExtra.compileDefaultLength)),
    );
    parts.push(
      pick(
        args,
        lenExtra.extraIndex,
        [...lenExtra.extraNames],
        String(lenExtra.compileDefaultExtra),
      ),
    );
    return taCall(lenExtra.method, site, parts);
  }
  const callSpec = TA_CONTEXT_CALL_BY_NAME.get(method);
  if (callSpec != null) {
    const parts = callSpec.args.map((arg) => emitSpecArg(arg, args));
    const call =
      callSpec.hasSite === false
        ? taPure(callSpec.method, parts)
        : taCall(callSpec.method, site, parts);
    if (callSpec.tupleFields != null) {
      const fields = callSpec.tupleFields.map((field) => `__r.${field}`);
      return `(() => { const __r = ${call}; return [${fields.join(", ")}]; })()`;
    }
    return call;
  }
  const conditionSpec = TA_CONDITION_CALL_BY_NAME.get(method);
  if (conditionSpec != null) {
    return taCall(
      conditionSpec.method,
      site,
      conditionSpec.args.map((arg) => emitSpecArg(arg, args)),
    );
  }
  const mergedKwarg = TA_MERGED_KWARG_BY_NAME.get(method);
  if (mergedKwarg != null) {
    // Legacy `_merge_kwargs_into_args`: positional values, then keyword values
    // in source order with their names ignored.
    const merged = [...args.pos, ...Object.values(args.kw)];
    const parts: string[] = mergedKwarg.contextArgs.map((ctx) => CTX_EXPR[ctx]);
    mergedKwarg.periodDefaults.forEach((def, i) => {
      parts.push(periodGate(merged[i] ?? "null", String(def)));
    });
    const call = taCall(mergedKwarg.method, site, parts);
    if (mergedKwarg.tupleFields != null) {
      const fields = mergedKwarg.tupleFields.map((field) => `__r.${field}`);
      return `(() => { const __r = ${call}; return [${fields.join(", ")}]; })()`;
    }
    return call;
  }
  const overload = TA_OVERLOAD_BY_NAME.get(method);
  if (overload != null) {
    const variant = overload.variants.find(
      (v) =>
        (v.minPositional == null || args.pos.length >= v.minPositional) &&
        (v.maxPositional == null || args.pos.length <= v.maxPositional) &&
        (v.positional == null || args.pos.length === v.positional) &&
        (v.requiresKwarg == null || hasAnyKw(args, [...v.requiresKwarg])) &&
        (v.forbidsKwarg == null || !hasAnyKw(args, [...v.forbidsKwarg])),
    );
    if (variant != null) {
      const call = taCall(
        overload.method,
        site,
        variant.args.map((arg) => emitSpecArg(arg, args)),
      );
      if (overload.tupleFields != null) {
        const fields = overload.tupleFields.map((field) => `__r.${field}`);
        return `(() => { const __r = ${call}; return [${fields.join(", ")}]; })()`;
      }
      return call;
    }
  }
  const runtimePeriodFirst = TA_RUNTIME_PERIOD_FIRST_BY_NAME.get(method);
  if (runtimePeriodFirst != null) {
    const wrapTuple = (call: string): string => {
      if (runtimePeriodFirst.tupleFields == null) return call;
      const fields = runtimePeriodFirst.tupleFields.map(
        (field) => `__r.${field}`,
      );
      return `(() => { const __r = ${call}; return [${fields.join(", ")}]; })()`;
    };
    const seriesParts = (sourceExpr?: string): string[] =>
      runtimePeriodFirst.series.map((arg, i) =>
        i === 0 && arg.kind === "source"
          ? (sourceExpr ?? pick(args, 0, ["source", "series"], "null"))
          : emitSpecArg(arg, args),
      );
    const eligible =
      args.pos.length === 2 && !hasAnyKw(args, ["source", "series"]);
    if (!eligible) {
      return wrapTuple(taCall(runtimePeriodFirst.method, site, seriesParts()));
    }
    const p0 = pick(
      args,
      0,
      [...runtimePeriodFirst.periodFirst.lengthNames],
      "null",
    );
    const s0 = pick(args, 0, ["source", "series"], "null");
    const mult = finiteOr(
      pick(args, 1, [...runtimePeriodFirst.periodFirst.multNames], "null"),
      String(runtimePeriodFirst.periodFirst.multDefault),
    );
    const pf = taCall(runtimePeriodFirst.method, site, [
      CTX_EXPR[runtimePeriodFirst.contextSource],
      "__p0",
      mult,
    ]);
    const sf = taCall(runtimePeriodFirst.method, site, seriesParts("__s0"));
    const call = `((__p0, __s0) => (Number.isInteger(__p0) ? ${pf} : ${sf}))(${p0}, ${s0})`;
    return wrapTuple(call);
  }
  const runtimePairGate = TA_RUNTIME_PAIR_GATE_BY_NAME.get(method);
  if (runtimePairGate != null) {
    const seriesParts = (sourceExpr?: string): string[] =>
      runtimePairGate.series.map((arg, i) =>
        i === 0 && arg.kind === "source"
          ? (sourceExpr ?? pick(args, 0, ["source", "series"], "null"))
          : emitSpecArg(arg, args),
      );
    const eligible =
      args.pos.length === 2 && !hasAnyKw(args, ["source", "series"]);
    if (!eligible) {
      return taCall(runtimePairGate.method, site, seriesParts());
    }
    const first = pick(
      args,
      runtimePairGate.gate.firstIndex,
      [...runtimePairGate.gate.firstNames],
      "null",
    );
    const second = pick(
      args,
      runtimePairGate.gate.secondIndex,
      [...runtimePairGate.gate.secondNames],
      "null",
    );
    const sourceExpr = pick(args, 0, ["source", "series"], "null");
    const pf = taCall(runtimePairGate.method, site, [
      CTX_EXPR[runtimePairGate.contextSource],
      "__l",
      "__r",
    ]);
    const sf = taCall(runtimePairGate.method, site, seriesParts("__s"));
    return `((__l, __r, __s) => (Number.isInteger(__l) && Number.isInteger(__r) ? ${pf} : ${sf}))(${first}, ${second}, ${sourceExpr})`;
  }

  if (method === "max" || method === "min") {
    const defSrc = method === "min" ? LOW : HIGH;
    if (
      args.pos.length >= 2 ||
      Object.hasOwn(args.kw, "source") ||
      Object.hasOwn(args.kw, "series")
    ) {
      return taCall(method, site, [src(), len(1, "14")]);
    }
    if (args.pos.length === 1 || Object.hasOwn(args.kw, "length")) {
      return taCall(method, site, [defSrc, len(0, "14")]);
    }
    return taCall(method, site, [defSrc, "14"]);
  }
  if (method === "tr") {
    if (args.pos.length >= 3) {
      return taCall("tr", site, [args.pos[0]!, args.pos[1]!, args.pos[2]!]);
    }
    return taCall("tr", site, [HIGH, LOW, CLOSE]);
  }

  if (method === "supertrend") {
    const call = taCall("supertrend", site, [
      HIGH,
      LOW,
      CLOSE,
      pick(args, 0, ["factor"], "3"),
      pick(args, 1, ["atrPeriod", "length"], "10"),
    ]);
    return `(() => { const __r = ${call}; return [__r.st, __r.dir]; })()`;
  }

  if (method === "swma") {
    if (hasArg(args, 1, ["length", "period"])) {
      return taCall("swma", site, [src(), len(1, "4")]);
    }
    return taCall("swma", site, [src()]);
  }

  if (method === "engulfing") {
    // Args are still evaluated (interpret reads all four); high/low are unused.
    return `(() => { const __o = ${cellOf(pick(args, 0, ["open"], "null"))}; ${cellOf(pick(args, 1, ["high"], "null"))}; ${cellOf(pick(args, 2, ["low"], "null"))}; const __c = ${cellOf(pick(args, 3, ["close"], "null"))}; return __h.ta.engulfing(${site}, __o, __c); })()`;
  }

  if (method === "voi") {
    return `__h.ta.voi(${cellOf(pick(args, 0, ["buy_volume", "buy"], "null"))}, ${cellOf(pick(args, 1, ["sell_volume", "sell"], "null"))})`;
  }
  if (method === "bid_ask_imbalance") {
    return `__h.ta.bidAskImbalance(${cellOf(pick(args, 0, ["bid_size", "bid"], "null"))}, ${cellOf(pick(args, 1, ["ask_size", "ask"], "null"))}, ${cellOf(pick(args, 2, ["bid_price"], "null"))}, ${cellOf(pick(args, 3, ["ask_price"], "null"))})`;
  }
  if (method === "rsi_oversold_overbought") {
    return `__h.ta.rsiOversoldOverbought(${cellOf(pick(args, 0, ["rsi_series", "rsi", "source"], "null"))}, ${cellOf(pick(args, 1, ["oversold_level", "oversold"], "null"))}, ${cellOf(pick(args, 2, ["overbought_level", "overbought"], "null"))})`;
  }
  if (method === "rsi_divergence") {
    // Missing period is 0 (interpret `period ?? 0`), not the engine's null → na.
    const period = `((__n) => (__n == null ? 0 : __n))(${cellOf(pick(args, 1, ["period", "length"], "null"))})`;
    return taCall("rsiDivergence", site, [
      cellLast(pick(args, 0, ["rsi_series", "series", "source"], "null")),
      period,
    ]);
  }
  if (method === "cumulative_delta") {
    return taCall("cumulativeDelta", site, [
      cellOf(pick(args, 0, ["close", "source"], "null")),
      cellOf(pick(args, 1, ["volume"], "null")),
      cellOf(pick(args, 2, ["period", "length"], "null")),
    ]);
  }
  if (method === "volume_momentum") {
    return taCall("volumeMomentum", site, [
      cellOf(pick(args, 0, ["volume", "source"], "null")),
      cellOf(pick(args, 1, ["period", "length"], "null")),
    ]);
  }
  if (method === "volume_profile_high") {
    return `__h.ta.volumeProfileHigh(${cellList(pick(args, 0, ["close", "price", "source", "series"], "null"))}, ${cellList(pick(args, 1, ["volume"], "null"))})`;
  }
  if (method === "volume_profile_low") {
    return taCall("volumeProfileLow", site, [
      cellOf(pick(args, 0, ["close", "source"], "null")),
      cellOf(pick(args, 1, ["volume"], "null")),
      cellOf(pick(args, 2, ["period", "length"], "null")),
      cellOf(pick(args, 3, ["levels"], "null")),
    ]);
  }
  if (method === "volume_thrust") {
    const sens = cellOf(pick(args, 3, ["sensitivity"], "null"));
    return taCall("volumeThrust", site, [
      cellOf(pick(args, 0, ["close", "source"], "null")),
      cellOf(pick(args, 1, ["volume"], "null")),
      cellOf(pick(args, 2, ["volume_sma", "vol_sma", "sma"], "null")),
      `((__n) => (__n == null ? 0.3 : __n))(${sens})`,
    ]);
  }
  if (method === "sma_weighted") {
    return taCall("smaWeighted", site, [
      cellOf(pick(args, 0, ["series", "source"], "null")),
      cellOf(pick(args, 1, ["period", "length"], "null")),
      pick(args, 2, ["weight_type", "weight"], '"linear"'),
    ]);
  }

  if (method === "parkinson") {
    if (hasSeriesArg(args)) return "null";
    return `__h.ta.parkinson(${cellOf(pick(args, 0, ["high"], "null"))}, ${cellOf(pick(args, 1, ["low"], "null"))})`;
  }
  if (method === "garman_klass") {
    if (hasSeriesArg(args)) return "null";
    return `__h.ta.garmanKlass(${cellOf(pick(args, 0, ["high"], "null"))}, ${cellOf(pick(args, 1, ["low"], "null"))}, ${cellOf(pick(args, 2, ["close"], "null"))}, ${cellOf(pick(args, 3, ["open"], "null"))})`;
  }

  if (method === "trend_confirmation_score") {
    return `__h.ta.trendConfirmationScore(${cellOf(pick(args, 0, ["momentum"], "null"))}, ${cellOf(pick(args, 1, ["trend_alignment"], "null"))}, ${cellOf(pick(args, 2, ["strength"], "null"))}, ${cellOf(pick(args, 3, ["rsi"], "null"))}, ${cellOf(pick(args, 4, ["rsi_alignment"], "null"))})`;
  }

  if (method === "market_structure_pivot") {
    return taCall("marketStructurePivot", site, [
      arrOrCell(pick(args, 0, ["high_list", "high"], "null")),
      arrOrCell(pick(args, 1, ["low_list", "low"], "null")),
      cellOf(pick(args, 3, ["period", "left", "left_bars"], "null")),
      cellOf(pick(args, 4, ["mode", "right", "right_bars"], "null")),
    ]);
  }

  if (method === "optimal_entry_zone") {
    return taCall("optimalEntryZone", site, [
      arrOrCell(pick(args, 2, ["close"], "null")),
    ]);
  }
  if (method === "mean_reversion_entry") {
    return taCall("meanReversionEntry", site, [
      arrOrCell(pick(args, 0, ["price", "source"], "null")),
      arrOrCell(pick(args, 1, ["sma"], "null")),
      arrOrCell(pick(args, 2, ["stdev", "std_dev"], "null")),
      cellOf(pick(args, 4, ["threshold"], "null")),
    ]);
  }

  if (method === "regime_adaptive_signal") {
    return taPure("regimeAdaptiveSignal", [
      cellOf(pick(args, 0, ["signal_strength", "strength"], "null")),
      pick(args, 1, ["volatility_regime", "vol_regime"], '""'),
      pick(args, 2, ["trend_regime"], '""'),
    ]);
  }

  if (method === "breakout_detection") {
    const arg = (i: number, names: string[]): string =>
      isSeriesNode(args.posNodes[i])
        ? "null"
        : cellOf(pick(args, i, names, "null"));
    return taPure("breakoutDetection", [
      arg(0, ["close", "source"]),
      arg(1, ["resistance"]),
      arg(2, ["support"]),
    ]);
  }

  if (method === "pivot_point_levels") {
    return taPure("pivotPointLevels", [
      cellOf(pick(args, 0, ["high"], "null")),
      cellOf(pick(args, 1, ["low"], "null")),
      cellOf(pick(args, 2, ["close"], "null")),
      pick(args, 3, ["traditional"], "true"),
    ]);
  }
  if (method === "volatility_regime_score") {
    return taCall("volatilityRegimeScore", site, [
      arrOrCell(pick(args, 0, ["atr_list", "atr"], "null")),
      arrOrCell(pick(args, 1, ["volatility_list", "volatility"], "null")),
      arrOrCell(pick(args, 2, ["vix_list", "vix"], "null")),
      cellOf(pick(args, 3, ["threshold"], "null")),
    ]);
  }
  if (method === "correlation_filter") {
    return taCall("correlationFilter", site, [
      arrOrCell(pick(args, 0, ["signal1_list", "signal1", "s1"], "null")),
      arrOrCell(pick(args, 1, ["signal2_list", "signal2", "s2"], "null")),
      arrOrCell(pick(args, 2, ["signal3_list", "signal3", "s3"], "null")),
      cellOf(pick(args, 4, ["threshold"], "null")),
    ]);
  }
  if (method === "advanced_breakout_detector") {
    return taCall("advancedBreakoutDetector", site, [
      arrOrCell(pick(args, 0, ["price_list", "price"], "null")),
      arrOrCell(pick(args, 1, ["volume_list", "volume"], "null")),
      cellOf(pick(args, 2, ["level"], "null")),
      cellOf(pick(args, 3, ["lookback"], "null")),
      cellOf(pick(args, 4, ["volume_multiplier", "vol_mult"], "null")),
    ]);
  }
  if (method === "pullback_bounce_level") {
    return taCall("pullbackBounceLevel", site, [
      arrOrCell(pick(args, 0, ["high_list", "high"], "null")),
      arrOrCell(pick(args, 1, ["low_list", "low"], "null")),
      cellOf(pick(args, 3, ["trend_direction", "trend_dir"], "null")),
      cellOf(pick(args, 4, ["lookback"], "null")),
    ]);
  }
  if (method === "divergence_detector") {
    return taCall("divergenceDetector", site, [
      arrOrCell(pick(args, 0, ["price_list", "price"], "null")),
      arrOrCell(pick(args, 1, ["indicator_list", "indicator"], "null")),
      cellOf(pick(args, 2, ["lookback"], "null")),
    ]);
  }
  if (method === "momentum_divergence") {
    return taCall("momentumDivergence", site, [
      arrOrCell(pick(args, 0, ["price"], "null")),
      arrOrCell(pick(args, 1, ["momentum_fast", "mom_fast"], "null")),
      arrOrCell(pick(args, 2, ["momentum_slow", "mom_slow"], "null")),
    ]);
  }
  if (method === "spread_analysis") {
    return taCall("spreadAnalysis", site, [
      arrOrCell(pick(args, 0, ["bid"], "null")),
      arrOrCell(pick(args, 1, ["ask"], "null")),
      cellOf(pick(args, 2, ["period", "length"], "null")),
    ]);
  }
  if (method === "employment_cycle_indicator") {
    return taCall("employmentCycleIndicator", site, [
      arrOrCell(pick(args, 0, ["cyclical_stocks", "cyclical"], "null")),
      arrOrCell(pick(args, 1, ["defensive_stocks", "defensive"], "null")),
      arrOrCell(pick(args, 2, ["unemployment_proxy", "unemployment"], "null")),
    ]);
  }
  if (method === "gdp_growth_proxy") {
    return taCall("gdpGrowthProxy", site, [
      arrOrCell(pick(args, 0, ["market_breadth", "breadth"], "null")),
      arrOrCell(pick(args, 1, ["market_volume", "volume"], "null")),
      arrOrCell(pick(args, 2, ["price_momentum", "momentum"], "null")),
    ]);
  }
  if (method === "inflation_proxy_indicator") {
    return taCall("inflationProxyIndicator", site, [
      arrOrCell(pick(args, 0, ["usd_index", "usd"], "null")),
      arrOrCell(pick(args, 1, ["commodity_prices", "commodities"], "null")),
      arrOrCell(pick(args, 2, ["bond_yields", "yields"], "null")),
    ]);
  }
  if (method === "expected_value") {
    return `__h.ta.expectedValue(${cellList(pick(args, 0, ["returns"], "null"))}, ${cellList(pick(args, 1, ["probabilities", "probs"], "null"))})`;
  }
  if (method === "gamma_levels") {
    const vol = isSeriesNode(args.posNodes[0])
      ? "null"
      : cellOf(pick(args, 0, ["volatility"], "null"));
    const price = isSeriesNode(args.posNodes[1])
      ? "null"
      : cellOf(pick(args, 1, ["current_price", "price"], "null"));
    return taPure("gammaLevels", [
      vol,
      price,
      cellOf(pick(args, 2, ["period", "length"], "null")),
    ]);
  }
  if (method === "intelligent_strategy_synthesizer") {
    return taCall("intelligentStrategySynthesizer", site, [
      arrOrCell(pick(args, 0, ["trend_indicators", "trend"], "null")),
      arrOrCell(pick(args, 1, ["momentum_indicators", "momentum"], "null")),
      arrOrCell(pick(args, 2, ["volatility_indicators", "volatility"], "null")),
      arrOrCell(pick(args, 3, ["volume_indicators", "volume"], "null")),
      pick(args, 4, ["market_condition", "market_regime"], '"ranging"'),
      pick(args, 5, ["risk_profile"], '"balanced"'),
    ]);
  }
  if (method === "signal_confluence") {
    return taPure("signalConfluence", [pick(args, 0, ["signals"], "null")]);
  }
  return "null";
}
