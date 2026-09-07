/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Call lowering for JS compile. Pine builtins → `__h` / `__h.ta`.
 */
import type { Attribute, Call, Constant, expr, Name } from "../../ast/nodes.ts";
import { emitUserFuncCall } from "./emit_udf.ts";
import type { EmitCtx, VisitFn } from "./types.ts";

const HIGH = "high_arr[__bar_idx]";
const LOW = "low_arr[__bar_idx]";
const CLOSE = "close_arr[__bar_idx]";
const VOL = "vol_arr[__bar_idx]";
const OPEN = "open_arr[__bar_idx]";
// Interpret's bare `ta.vwap` sources hlc3 = (h+l+c)/3, falling back to close
// when any component is na — mirror that exactly on the compile side.
const HLC3 =
  "((high_arr[__bar_idx] != null && low_arr[__bar_idx] != null && close_arr[__bar_idx] != null)" +
  " ? (high_arr[__bar_idx] + low_arr[__bar_idx] + close_arr[__bar_idx]) / 3" +
  " : close_arr[__bar_idx])";

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
]);

/** TaEngine methods we emit. Unknown `ta.*` → `null`. */
const TA_METHODS = new Set([
  "sma",
  "ema",
  "rma",
  "rsi",
  "atr",
  "tr",
  "change",
  "mom",
  "roc",
  "stdev",
  "highest",
  "lowest",
  "sum",
  "cross",
  "crossover",
  "crossunder",
  "macd",
  "bb",
  "stoch",
  "wma",
  "vwma",
  "hma",
  "cci",
  "cmo",
  "mfi",
  "tsi",
  "dmi",
  "supertrend",
  "alma",
  "kama",
  "linreg",
  "rising",
  "falling",
  "barssince",
  "valuewhen",
  "pivothigh",
  "pivotlow",
  "swma",
  "kc",
  "willr",
  "wpr",
  "vwap",
  "sar",
  "adx",
  "correlation",
  "cog",
  "cum",
  "range",
  "accdist",
  "ad",
  "pvt",
  "vpt",
  "wad",
  "nvi",
  "pvi",
  "wvad",
  "cmf",
  "klinger",
  "iii",
  "obv",
  "ao",
  "aroon",
  "highestbars",
  "lowestbars",
  "dev",
  "variance",
  "median",
  "mode",
  "percentrank",
  "dema",
  "tema",
  "bbw",
  "max",
  "min",
]);

/**
 * Bare `ta.<attr>` auto-call whitelist. Mirrors interpret's evalTaAttr
 * (interpret.ts) exactly: only these attributes auto-invoke a zero-arg TA
 * kernel on a bare attribute load; anything else is na on both backends.
 * `aroon` is deliberately absent — interpret's evalTaAttr does not handle it.
 */
export const TA_BARE_ATTRS = new Set([
  "accdist",
  "ad",
  "obv",
  "tr",
  "vwap",
  "pvt",
  "vpt",
  "nvi",
  "pvi",
  "wad",
  "wvad",
  "cmf",
  "ao",
]);

const SRC_LEN = new Set([
  "sma",
  "ema",
  "rma",
  "rsi",
  "stdev",
  "wma",
  "hma",
  "cmo",
  "sum",
  "dema",
  "tema",
  "highestbars",
  "lowestbars",
  "dev",
  "variance",
  "median",
  "mode",
  "percentrank",
  "range",
  "cog",
]);

const SRC_LEN1 = new Set(["change", "mom", "roc", "rising", "falling"]);

const PLOT_FUNCS = new Set([
  "plot",
  "plotshape",
  "plotchar",
  "plotarrow",
  "hline",
  "bgcolor",
  "barcolor",
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
  asin: { fn: "Math.asin(Number(__x))", guard: "Number(__x) < -1 || Number(__x) > 1" },
  acos: { fn: "Math.acos(Number(__x))", guard: "Number(__x) < -1 || Number(__x) > 1" },
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
        return emitUserFuncCall(ctx, rawName, packUserFuncArgs(ctx, rawName, args));
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
  if (methodSrc != null && (name === "tostring" || name === "format")) name = `str_${name}`;

  if (PLOT_FUNCS.has(name)) return emitPlot(ctx, name, args);

  if (name === "indicator" || name === "study" || name === "library") return "null";
  if (name === "strategy") return emitStrategyDecl(ctx, args);

  if (name === "na") {
    if (args.pos.length === 0 && args.kw.x == null && args.kw.source == null) return "null";
    const x = pick(args, 0, ["x", "source"], "null");
    return `(__h.isNa(${x}) ? 1 : 0)`;
  }
  if (name === "nz") {
    const x = pick(args, 0, ["source", "x"], "null");
    if (hasArg(args, 1, ["replacement", "y"])) return `__h.nz(${x}, ${pick(args, 1, ["replacement", "y"], "0")})`;
    return `__h.nz(${x})`;
  }

  if (name === "input" || name.startsWith("input_")) return emitInput(ctx, args);

  if (STRATEGY_ACTIONS.has(name) || STRATEGY_QUERIES.has(name) || name.startsWith("strategy_")) {
    return emitStrategy(ctx, name, args);
  }

  if (ctx.userFuncs.has(name) || ctx.funcSeriesParams.has(name)) {
    return emitUserFuncCall(ctx, name, packUserFuncArgs(ctx, name, args));
  }

  if (name === "year" || name === "month" || name === "dayofmonth" || name === "hour" || name === "minute" || name === "second" || name === "dayofweek") {
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
  if (name === "ticker_heikinashi" || name === "heikinashi") {
    ctx.needsHeikinashi = true;
    return `"__HEIKINASHI__"`;
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

  if (name === "alertcondition") return "null";
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
    return extras.length > 0 ? `__h.strFormat(${fmt}, ${extras.join(", ")})` : `__h.strFormat(${fmt})`;
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
      const a1 = args.pos[1] ?? args.kw.substring ?? args.kw.str ?? args.kw.replacement ?? "undefined";
      if (meth === "length" || meth === "lower" || meth === "upper" || meth === "tonumber" || meth === "trim") {
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

  return "null";
}

function resolveCallee(func: expr): { name: string; methodSrc: expr | null } {
  func = unwrapSpecialize(func);
  if (func.kind === "Name") return { name: (func as Name).id, methodSrc: null };
  if (func.kind !== "Attribute") return { name: "unknown_func", methodSrc: null };

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
      return { name: `${(inner as Name).id}_${mid.attr}_${attr}`, methodSrc: null };
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

function pick(args: CallArgs, index: number, names: string[], fallback: string): string {
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

const DRAW_KINDS = new Set(["label", "line", "box", "table", "polyline", "linefill"]);

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
  submatrix: [["id"], ["from_row"], ["to_row"], ["from_column", "from_col"], ["to_column", "to_col"]],
};

function nsMethod(name: string, prefix: string): string | null {
  if (!name.startsWith(prefix)) return null;
  return name.slice(prefix.length);
}

function ctorMethod(method: string): string {
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

function emitHostCall(ns: string, method: string, args: CallArgs, params: string[][]): string {
  const parts = params.map((names, i) => pick(args, i, names, "null"));
  return `__h.${ns}.${method}(${parts.join(", ")})`;
}

function emitArray(name: string, args: CallArgs): string | null {
  const raw = nsMethod(name, "array_");
  if (raw == null) return null;
  const method = ctorMethod(raw);
  const params = ARRAY_SIGS[method];
  if (params == null) return null;
  return emitHostCall("array", ARRAY_HOST_ALIAS[method] ?? method, args, params);
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
  return emitHostCall("matrix", MATRIX_HOST_ALIAS[method] ?? method, args, params);
}

function drawKindAndMethod(name: string, methodSrc: expr | null): { kind: string; method: string } | null {
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
    set_color: [["id"], ["color"]],
    set_style: [["id"], ["style"]],
    set_size: [["id"], ["size"]],
    set_tooltip: [["id"], ["tooltip"]],
    set_textalign: [["id"], ["textalign"]],
    delete: [["id"]],
    get_text: [["id"]],
    get_x: [["id"]],
    get_y: [["id"]],
  },
  line: {
    set_xy: [["id"], ["x1"], ["y1"], ["x2"], ["y2"]],
    set_xy1: [["id"], ["x1"], ["y1"]],
    set_xy2: [["id"], ["x2"], ["y2"]],
    set_color: [["id"], ["color"]],
    set_width: [["id"], ["width"]],
    set_style: [["id"], ["style"]],
    set_extend: [["id"], ["extend"]],
    delete: [["id"]],
    get_price: [["id"], ["x"]],
    get_x1: [["id"]],
    get_y1: [["id"]],
    get_x2: [["id"]],
    get_y2: [["id"]],
  },
  box: {
    set_corners: [["id"], ["left", "x1"], ["top", "y1"], ["right", "x2"], ["bottom", "y2"]],
    set_lefttop: [["id"], ["left", "x1"], ["top", "y1"], ["right", "x2"], ["bottom", "y2"]],
    set_bgcolor: [["id"], ["bgcolor", "color"]],
    set_border_color: [["id"], ["color", "border_color"]],
    set_text: [["id"], ["text"]],
    set_extend: [["id"], ["extend"]],
    delete: [["id"]],
  },
  table: {
    cell: [["id"], ["column", "col"], ["row"], ["text"]],
    cell_set_text: [["id"], ["column", "col"], ["row"], ["text"]],
    set_position: [["id"], ["position"]],
    delete: [["id"]],
  },
  polyline: {
    delete: [["id"]],
  },
  linefill: {
    set_color: [["id"], ["color"]],
    delete: [["id"]],
  },
};

function emitDraw(ctx: EmitCtx, name: string, methodSrc: expr | null, args: CallArgs): string | null {
  if (name === "alert" && methodSrc == null) {
    ctx.usesDrawings = true;
    return `__h.draw.alert(__bar_idx, ${pick(args, 0, ["message"], "null")})`;
  }
  const parsed = drawKindAndMethod(name, methodSrc);
  if (parsed == null) return null;
  const { kind, method } = parsed;
  let code: string | null = null;
  if (method === "new") {
    if (kind === "label") {
      code = `__h.draw.label_new(__bar_idx, ${pick(args, 2, ["text"], "null")})`;
    } else if (kind === "linefill") {
      code = `__h.draw.linefill_new(__bar_idx, ${pick(args, 0, ["id1"], "null")}, ${pick(args, 1, ["id2"], "null")})`;
    } else if (DRAW_KINDS.has(kind)) {
      code = `__h.draw.${kind}_new(__bar_idx)`;
    }
  } else {
    const aliased = kind === "box" && method === "set_lefttop" ? "set_corners" : method;
    const params = DRAW_METHODS[kind]?.[method] ?? DRAW_METHODS[kind]?.[aliased];
    if (params != null) {
      code = emitHostCall("draw", `${kind}_${aliased}`, args, params);
    }
  }
  if (code != null) ctx.usesDrawings = true;
  return code;
}

function emitUdt(ctx: EmitCtx, name: string, methodSrc: expr | null, args: CallArgs): string | null {
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
  "request_security",
  "request_security_lower_tf",
  "request_seed",
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

const SIMPLE_CHART_ARR = /^(?:open|high|low|close|vol|volume|time|hl2|hlc3|ohlc4)_arr\[__bar_idx\]$/;

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
function emitRequest(ctx: EmitCtx, name: string, args: CallArgs): string | null {
  if (SECURITY_FUNCS.has(name)) {
    const symbol = pick(args, 0, ["symbol", "ticker"], "null");
    const expression = pick(args, 2, ["expression", "expr"], "close");
    if (isHeikinashiSecurity(symbol) && isSimpleSecurityExpr(expression)) {
      ctx.needsHeikinashi = true;
      return mapOhlcvExprToHeikinashi(expression);
    }
    if (isSimpleSecurityExpr(expression) && isChartSecuritySymbol(symbol)) return expression;
    return "null";
  }
  if (name === "request_currency_rate" || name === "currency_rate") {
    return `__h.currencyRate(${pick(args, 0, ["from", "from_currency"], "null")}, ${pick(args, 1, ["to", "to_currency"], "null")})`;
  }
  if (name.startsWith("request_")) return "null";
  return null;
}

function isSimpleSecurityExpr(expr: string): boolean {
  const e = expr.trim();
  if (!e) return false;
  if (SIMPLE_CHART_EXPR.has(e)) return true;
  return SIMPLE_CHART_ARR.test(e);
}

function unquoteJsString(s: string): string {
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
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
  if (s === "__HEIKINASHI__" || s === "'__HEIKINASHI__'" || s === '"__HEIKINASHI__"') return true;
  if (/^['"]__HEIKINASHI__['"]$/.test(s)) return true;
  if (s.includes("__HEIKINASHI__") && !s.toUpperCase().includes("HA(")) return true;
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
  if (!s || s === "null" || s === "na" || s === "undefined" || s === "None" || s === "np.nan") {
    return true;
  }
  if (isHeikinashiSecurity(s)) return true;
  const inner = unquoteJsString(s).trim();
  if (!inner || inner === "na" || inner === "null" || inner === "SYMBOL") return true;
  if (s === "SYMBOL" || s === "tickerid" || s === "ticker") return true;
  if (s === "syminfo_ticker" || s === "syminfo_tickerid") return true;
  const low = s.toLowerCase();
  if (low.includes("syminfo") && (s.includes("ticker") || s.includes("tickerid") || s.includes("root") || s.includes("prefix"))) {
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
    if (hasArg(args, -1, names)) fields.push(`${key}: ${pick(args, -1, names, "null")}`);
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
  return `__h.strategy.configure({${fields.join(", ")}})`;
}

function emitStrategyEntry(method: "entry" | "order", args: CallArgs): string {
  const id = pick(args, 0, ["id"], "null");
  const direction = pick(args, 1, ["direction"], "null");
  const qty = pick(args, 2, ["qty"], "null");
  const fields: string[] = [];
  if (hasArg(args, 3, ["limit"])) fields.push(`limit: ${pick(args, 3, ["limit"], "null")}`);
  if (hasArg(args, 4, ["stop"])) fields.push(`stop: ${pick(args, 4, ["stop"], "null")}`);
  if (hasArg(args, 5, ["comment"])) fields.push(`comment: ${pick(args, 5, ["comment"], "null")}`);
  return `__h.strategy.${method}(${id}, ${direction}, ${qty}, {${fields.join(", ")}})`;
}

function emitStrategy(ctx: EmitCtx, name: string, args: CallArgs): string {
  const method = name.startsWith("strategy_") ? name.slice("strategy_".length) : name;

  if (method === "long" || method === "short") return JSON.stringify(method);

  if (isStrategyAction(name, method) || STRATEGY_QUERIES.has(name)) ctx.usesStrategy = true;

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
        if (hasArg(args, index, names)) fields.push(`${key}: ${pick(args, index, names, "null")}`);
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
      ctx.usesStrategy = true;
      return `__h.strategy.${method}()`;
    case "risk_allow_entry_in":
      ctx.usesStrategy = true;
      return `__h.strategy.risk_allow_entry_in(${pick(args, 0, ["value"], "null")})`;
    case "risk_max_position_size":
      ctx.usesStrategy = true;
      return `__h.strategy.risk_max_position_size(${pick(args, 0, ["percent", "value"], "null")})`;
    case "risk_max_drawdown":
      ctx.usesStrategy = true;
      return `__h.strategy.risk_max_drawdown(${pick(args, 0, ["value"], "null")}, ${pick(args, 1, ["type"], "null")})`;
    default:
      if (isStrategyAction(name, method)) ctx.usesStrategy = true;
      return "null";
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

function seriesArg(ctx: EmitCtx, node: expr | undefined, visited: string): string {
  if (node != null && node.kind === "Name") return seriesNameRef(ctx, (node as Name).id);
  return visited || "null";
}

function packUserFuncArgs(ctx: EmitCtx, name: string, args: CallArgs): string[] {
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
  for (let i = formals.length; i < args.pos.length; i++) packed.push(args.pos[i]!);
  return packed;
}

function emitPlot(ctx: EmitCtx, _fname: string, args: CallArgs): string {
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
  if (title == null || title === "") title = `plot_${ctx.plots.length}`;
  const series = pick(args, 0, ["series", "source", "price"], "null");
  const i = ctx.plots.length;
  ctx.plots.push({ title });
  return `plot_${i}[__bar_idx] = __h.naNum(${series})`;
}

function emitColor(name: string, args: CallArgs): string | null {
  if (name === "color_r") return `__h.colorR(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_g") return `__h.colorG(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_b") return `__h.colorB(${pick(args, 0, ["color"], "null")})`;
  if (name === "color_t") return `__h.colorT(${pick(args, 0, ["color"], "null")})`;
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
    name === "fixnan";
  if (!isNs && !isBareMath) return null;

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
    const e = hasArg(args, 1, ["exponent", "exp", "y"]) ? pick(args, 1, ["exponent", "exp", "y"], "2") : "2";
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
    const x = pick(args, 0, ["number", "x", "angle", "radians", "degrees"], "null");
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

function emitTa(ctx: EmitCtx, method: string, args: CallArgs): string {
  if (!TA_METHODS.has(method)) return "null";
  if (method === "ad") method = "accdist";
  const site = allocSite(ctx);
  const src = () => pick(args, 0, ["source", "series", "src"], CLOSE);
  const len = (index: number, fb: string, names: string[] = ["length", "len", "period"]) =>
    pick(args, index, names, fb);

  if (SRC_LEN.has(method)) {
    return taCall(method, site, [src(), len(1, "14")]);
  }
  if (SRC_LEN1.has(method)) {
    return taCall(method, site, [src(), len(1, "1")]);
  }
  if (method === "highest" || method === "lowest" || method === "max" || method === "min") {
    const defSrc = method === "lowest" || method === "min" ? LOW : HIGH;
    if (args.pos.length >= 2 || Object.hasOwn(args.kw, "source") || Object.hasOwn(args.kw, "series")) {
      return taCall(method, site, [src(), len(1, "14")]);
    }
    if (args.pos.length === 1 || Object.hasOwn(args.kw, "length")) {
      return taCall(method, site, [defSrc, len(0, "14")]);
    }
    return taCall(method, site, [defSrc, "14"]);
  }
  if (method === "atr") {
    if (args.pos.length >= 4) {
      return taCall("atr", site, [args.pos[0]!, args.pos[1]!, args.pos[2]!, args.pos[3]!]);
    }
    return taCall("atr", site, [HIGH, LOW, CLOSE, len(0, "14")]);
  }
  if (method === "tr") {
    if (args.pos.length >= 3) {
      return taCall("tr", site, [args.pos[0]!, args.pos[1]!, args.pos[2]!]);
    }
    return taCall("tr", site, [HIGH, LOW, CLOSE]);
  }
  if (method === "cross" || method === "crossover" || method === "crossunder") {
    const a = pick(args, 0, ["source", "series", "a"], CLOSE);
    const b = pick(args, 1, ["source2", "b", "series2"], "0");
    return taCall(method, site, [a, b]);
  }
  if (method === "macd") {
    const call = taCall("macd", site, [
      src(),
      pick(args, 1, ["fastlen", "fastLength", "fast"], "12"),
      pick(args, 2, ["slowlen", "slowLength", "slow"], "26"),
      pick(args, 3, ["signal", "signalLength", "siglen"], "9"),
    ]);
    return `(() => { const __r = ${call}; return [__r.macd, __r.signal, __r.hist]; })()`;
  }
  if (method === "bb") {
    const call = taCall("bb", site, [
      src(),
      len(1, "20"),
      pick(args, 2, ["mult", "multiplier"], "2"),
    ]);
    return `(() => { const __r = ${call}; return [__r.mid, __r.up, __r.lo]; })()`;
  }
  if (method === "bbw") {
    return taCall("bbw", site, [src(), len(1, "20"), pick(args, 2, ["mult", "multiplier"], "2")]);
  }
  if (method === "kc") {
    const call = taCall("kc", site, [
      HIGH,
      LOW,
      src(),
      len(1, "20"),
      pick(args, 2, ["mult", "multiplier"], "1"),
    ]);
    return `(() => { const __r = ${call}; return [__r.mid, __r.up, __r.lo]; })()`;
  }
  if (method === "stoch") {
    if (args.pos.length <= 1 && args.kw.high == null) {
      return taCall("stoch", site, [CLOSE, HIGH, LOW, len(0, "14")]);
    }
    return taCall("stoch", site, [
      src(),
      pick(args, 1, ["high"], HIGH),
      pick(args, 2, ["low"], LOW),
      len(3, "14"),
    ]);
  }
  if (method === "vwma") {
    return taCall("vwma", site, [src(), pick(args, 2, ["volume"], VOL), len(1, "14")]);
  }
  if (method === "cci") {
    return taCall("cci", site, [src(), len(1, "14")]);
  }
  if (method === "mfi") {
    if (args.pos.length <= 1) {
      return taCall("mfi", site, [HIGH, LOW, CLOSE, VOL, len(0, "14")]);
    }
    if (args.pos.length === 2) {
      return taCall("mfi", site, [src(), src(), src(), VOL, len(1, "14")]);
    }
    return taCall("mfi", site, [
      pick(args, 0, ["high"], HIGH),
      pick(args, 1, ["low"], LOW),
      pick(args, 2, ["close"], CLOSE),
      pick(args, 3, ["volume"], VOL),
      len(4, "14"),
    ]);
  }
  if (method === "tsi") {
    if (args.pos.length === 2) {
      return taCall("tsi", site, [CLOSE, pick(args, 1, ["long", "long_length"], "25"), pick(args, 0, ["short", "short_length"], "13")]);
    }
    return taCall("tsi", site, [
      src(),
      pick(args, 2, ["long", "long_length"], "25"),
      pick(args, 1, ["short", "short_length"], "13"),
    ]);
  }
  if (method === "dmi") {
    const call = taCall("dmi", site, [
      HIGH,
      LOW,
      CLOSE,
      pick(args, 0, ["diLength", "length"], "14"),
      pick(args, 1, ["adxSmoothing", "adxlen"], "14"),
    ]);
    return `(() => { const __r = ${call}; return [__r.plus, __r.minus, __r.adx]; })()`;
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
  if (method === "alma") {
    return taCall("alma", site, [
      src(),
      len(1, "9"),
      pick(args, 2, ["offset"], "0.85"),
      pick(args, 3, ["sigma"], "6"),
    ]);
  }
  if (method === "kama") {
    return taCall("kama", site, [
      src(),
      len(1, "14"),
      pick(args, 2, ["fastLength", "fast", "fastlen"], "2"),
      pick(args, 3, ["slowLength", "slow", "slowlen"], "30"),
    ]);
  }
  if (method === "linreg") {
    return taCall("linreg", site, [src(), len(1, "14"), pick(args, 2, ["offset"], "0")]);
  }
  if (method === "barssince") {
    return taCall("barssince", site, [pick(args, 0, ["condition", "cond"], "null")]);
  }
  if (method === "valuewhen") {
    return taCall("valuewhen", site, [
      pick(args, 0, ["condition", "cond"], "null"),
      pick(args, 1, ["source", "series"], CLOSE),
      pick(args, 2, ["occurrence", "occ"], "0"),
    ]);
  }
  if (method === "pivothigh" || method === "pivotlow") {
    return taCall(method, site, [
      src(),
      pick(args, 1, ["leftbars", "left"], "5"),
      pick(args, 2, ["rightbars", "right"], "5"),
    ]);
  }
  if (method === "swma") {
    if (hasArg(args, 1, ["length", "period"])) {
      return taCall("swma", site, [src(), len(1, "4")]);
    }
    return taCall("swma", site, [src()]);
  }
  if (method === "willr" || method === "wpr") {
    if (args.pos.length >= 4) {
      return taCall("willr", site, [args.pos[0]!, args.pos[1]!, args.pos[2]!, args.pos[3]!]);
    }
    return taCall("willr", site, [HIGH, LOW, CLOSE, len(0, "14")]);
  }
  if (method === "vwap") {
    return taCall("vwap", site, [
      pick(args, 0, ["source", "series", "src"], HLC3),
      pick(args, 1, ["volume"], VOL),
    ]);
  }
  if (method === "sar") {
    return taCall("sar", site, [
      HIGH,
      LOW,
      pick(args, 0, ["start"], "0.02"),
      pick(args, 1, ["increment"], "0.02"),
      pick(args, 2, ["maximum", "max"], "0.2"),
    ]);
  }
  if (method === "adx") {
    return taCall("adx", site, [HIGH, LOW, CLOSE, len(0, "14")]);
  }
  if (method === "correlation") {
    return taCall("correlation", site, [
      pick(args, 0, ["source1", "source", "a"], CLOSE),
      pick(args, 1, ["source2", "b"], CLOSE),
      len(2, "14"),
    ]);
  }
  if (method === "cum") {
    return taCall("cum", site, [src()]);
  }
  if (method === "accdist") {
    return taCall("accdist", site, [
      pick(args, 0, ["high"], HIGH),
      pick(args, 1, ["low"], LOW),
      pick(args, 2, ["close"], CLOSE),
      pick(args, 3, ["volume"], VOL),
    ]);
  }
  // `vpt` is an alias of the pvt kernel on interpret (no ta.vpt engine fn).
  if (method === "pvt" || method === "vpt" || method === "obv" || method === "nvi" || method === "pvi") {
    return taCall(method === "vpt" ? "pvt" : method, site, [
      pick(args, 0, ["source", "close"], CLOSE),
      pick(args, 1, ["volume"], VOL),
    ]);
  }
  if (method === "wad") {
    return taCall("wad", site, [
      pick(args, 0, ["high"], HIGH),
      pick(args, 1, ["low"], LOW),
      pick(args, 2, ["close"], CLOSE),
      pick(args, 3, ["volume"], VOL),
    ]);
  }
  if (method === "iii") {
    return taCall("iii", site, [HIGH, LOW, CLOSE, VOL]);
  }
  if (method === "wvad") {
    if (args.pos.length >= 4 || Object.hasOwn(args.kw, "high")) {
      return taCall("wvad", site, [
        pick(args, 0, ["high"], HIGH),
        pick(args, 1, ["low"], LOW),
        pick(args, 2, ["close"], CLOSE),
        pick(args, 3, ["volume"], VOL),
        pick(args, 4, ["length", "period"], "20"),
      ]);
    }
    return taCall("wvad", site, [HIGH, LOW, CLOSE, VOL, pick(args, 0, ["length", "period"], "20")]);
  }
  if (method === "cmf") {
    if (args.pos.length >= 5) {
      return taCall("cmf", site, [
        pick(args, 1, ["high"], HIGH),
        pick(args, 2, ["low"], LOW),
        pick(args, 0, ["close", "source"], CLOSE),
        pick(args, 3, ["volume"], VOL),
        pick(args, 4, ["length", "period"], "20"),
      ]);
    }
    return taCall("cmf", site, [HIGH, LOW, CLOSE, VOL, pick(args, 0, ["length", "period"], "20")]);
  }
  if (method === "klinger") {
    return taCall("klinger", site, [
      pick(args, 2, ["close"], CLOSE),
      pick(args, 3, ["volume"], VOL),
      pick(args, 4, ["fast_period", "fast", "fastlen"], "0"),
      pick(args, 5, ["slow_period", "slow", "slowlen"], "0"),
    ]);
  }
  if (method === "ao") {
    // SMA(hl2, fast) − SMA(hl2, slow); high/low always come from the bar context.
    return taCall("ao", site, [
      HIGH,
      LOW,
      pick(args, 0, ["fast", "fastlen"], "5"),
      pick(args, 1, ["slow", "slowlen"], "34"),
    ]);
  }
  if (method === "aroon") {
    // Kernel returns {down, up}; interpret exposes the tuple [down, up].
    const call = taCall("aroon", site, [HIGH, LOW, pick(args, 0, ["length"], "14")]);
    return `(() => { const __r = ${call}; return [__r.down, __r.up]; })()`;
  }
  return "null";
}
