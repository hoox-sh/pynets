/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine AST → JS bar-loop source (Python object-mode analog, not Numba).
 */
import { parse } from "../../ast/helper.ts";
import type {
  Assign,
  Attribute,
  AugAssign,
  BinOp,
  BoolOp,
  Call,
  Case,
  Compare,
  Conditional,
  Constant,
  EnumDef,
  expr,
  ForIn,
  ForTo,
  FunctionDef,
  If,
  Import,
  Name,
  ReAssign,
  Script,
  stmt,
  Subscript,
  Switch,
  Tuple,
  TypeDef,
  UnaryOp,
  While,
} from "../../ast/nodes.ts";
import { emitCall, TA_BARE_ATTRS } from "./emit_call.ts";
import { emitFunctionDef } from "./emit_udf.ts";
import type { EmitCtx, VisitFn } from "./types.ts";

const FOR_TO_CAP = 1_000_000;
const WHILE_CAP = 10_000;

const CHART_LOCALS = new Set([
  "open",
  "high",
  "low",
  "close",
  "volume",
  "time",
  "bar_index",
  "last_bar_index",
  "na",
  "hl2",
  "hlc3",
  "ohlc4",
]);

const CHART_ARR = new Set([
  "open_arr",
  "high_arr",
  "low_arr",
  "close_arr",
  "vol_arr",
  "time_arr",
]);

/** User-series / loop-var names that would collide with bar locals or JS syntax. */
const RESERVED = new Set([
  ...CHART_LOCALS,
  "function",
  "return",
  "var",
  "let",
  "const",
  "default",
  "break",
  "case",
  "catch",
  "class",
  "continue",
  "debugger",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "super",
  "this",
  "throw",
  "try",
  "typeof",
  "void",
  "while",
  "with",
  "yield",
  "enum",
  "await",
  "implements",
  "interface",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "arguments",
  "eval",
  "null",
  "true",
  "false",
  "undefined",
  "NaN",
  "Infinity",
  "n_bars",
  "execute_script_compiled",
]);

interface State {
  ctx: EmitCtx;
  /** Pine id → JS ident for in-scope for/while counters. */
  loopVars: Map<string, string>;
  tmp: number;
}

export function newEmitCtx(): EmitCtx {
  return {
    arrays: new Set(),
    plots: [],
    varNames: new Set(),
    functions: [],
    userFuncs: new Set(),
    usesStrategy: false,
    nextSite: 0,
    errors: [],
    currentFunc: null,
    currentParamNames: new Set(),
    currentSeriesParams: new Set(),
    funcSeriesParams: new Map(),
    funcParamNames: new Map(),
    stArrays: new Set(),
    udtTypes: new Map(),
    usesDrawings: false,
    enumTypes: new Map(),
    udtMethodNames: new Set(),
    needsHeikinashi: false,
    importAliases: new Set(),
  };
}

export function emitScript(tree: Script, ctx?: EmitCtx): string {
  const c = ctx ?? newEmitCtx();
  const state: State = { ctx: c, loopVars: new Map(), tmp: 0 };
  prefetch(state, tree);
  const body: string[] = [];
  for (const s of tree.body ?? []) {
    const line = emitStmt(state, s);
    if (line) body.push(line);
  }
  collectMissedArrays(c, body);
  return assemble(c, body);
}

export function transpileSource(
  source: string,
  extras?: { getLibrary?: EmitCtx["getLibrary"] },
): { code: string; ctx: EmitCtx } {
  const tree = parse(source);
  const ctx = newEmitCtx();
  ctx.getLibrary = extras?.getLibrary;
  if (tree.kind !== "Script") {
    ctx.errors.push("not a Script");
    return { code: emitScript(tree as Script, ctx), ctx };
  }
  return { code: emitScript(tree as Script, ctx), ctx };
}

function collectMissedArrays(ctx: EmitCtx, body: string[]): void {
  const blob = `${body.join("\n")}\n${ctx.functions.join("\n")}`;
  for (const m of blob.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*_arr)\b/g)) {
    const name = m[1]!;
    if (CHART_ARR.has(name) || /^plot_\d+$/.test(name)) continue;
    ctx.arrays.add(name);
  }
}

function assemble(ctx: EmitCtx, body: string[]): string {
  if (ctx.needsHeikinashi) {
    for (const arr of ["ha_open_arr", "ha_high_arr", "ha_low_arr", "ha_close_arr"] as const) {
      ctx.arrays.add(arr);
    }
  }
  const lines: string[] = [
    "function execute_script_compiled(open_arr, high_arr, low_arr, close_arr, vol_arr, time_arr, __h) {",
    "  const n_bars = close_arr.length;",
  ];
  for (const arr of [...ctx.arrays].sort()) {
    if (CHART_ARR.has(arr) || /^plot_\d+$/.test(arr)) continue;
    lines.push(`  const ${arr} = new Array(n_bars).fill(null);`);
  }
  for (let i = 0; i < ctx.plots.length; i++) {
    lines.push(`  const plot_${i} = new Array(n_bars).fill(null);`);
  }
  for (const arr of [...ctx.stArrays].sort()) {
    lines.push(`  const ${arr} = new Array(n_bars).fill(null);`);
  }
  lines.push("  const __var_inited = Object.create(null);");
  for (const fn of ctx.functions) {
    if (fn) lines.push(indentBlock(fn, 2));
  }
  for (const [name, spec] of ctx.udtTypes) {
    lines.push(`  __h.udtRegister(${JSON.stringify(name)}, ${JSON.stringify(spec.fields)});`);
  }
  lines.push("  for (let __bar_idx = 0; __bar_idx < n_bars; __bar_idx++) {");
  lines.push("    const open = open_arr[__bar_idx];");
  lines.push("    const high = high_arr[__bar_idx];");
  lines.push("    const low = low_arr[__bar_idx];");
  lines.push("    const close = close_arr[__bar_idx];");
  lines.push("    const volume = vol_arr[__bar_idx];");
  lines.push("    const time = time_arr[__bar_idx];");
  lines.push("    const bar_index = __bar_idx;");
  lines.push("    const last_bar_index = n_bars - 1;");
  lines.push("    const na = null;");
  lines.push("    const hl2 = __h.div(__h.add(high, low), 2);");
  lines.push("    const hlc3 = __h.div(__h.add(__h.add(high, low), close), 3);");
  lines.push("    const ohlc4 = __h.div(__h.add(__h.add(__h.add(open, high), low), close), 4);");
  if (ctx.usesStrategy) {
    lines.push("    __h.strategy.beginBar(__bar_idx, open, high, low, close, time);");
  }
  if (ctx.needsHeikinashi) {
    lines.push("    const _ha_c = __h.div(__h.add(__h.add(__h.add(open, high), low), close), 4);");
    lines.push(
      "    const _ha_o = (__bar_idx === 0 || __h.isNa(ha_open_arr[__bar_idx - 1])) ? __h.div(__h.add(open, close), 2) : __h.div(__h.add(ha_open_arr[__bar_idx - 1], ha_close_arr[__bar_idx - 1]), 2);",
    );
    lines.push("    ha_open_arr[__bar_idx] = _ha_o;");
    lines.push("    ha_close_arr[__bar_idx] = _ha_c;");
    lines.push("    ha_high_arr[__bar_idx] = __h.max(high, __h.max(_ha_o, _ha_c));");
    lines.push("    ha_low_arr[__bar_idx] = __h.min(low, __h.min(_ha_o, _ha_c));");
  }
  for (const line of body) {
    lines.push(indentBlock(line, 4));
  }
  lines.push("  }");
  const plotObj = ctx.plots.length
    ? `{ ${ctx.plots.map((p, i) => `${JSON.stringify(p.title)}: plot_${i}`).join(", ")} }`
    : "{}";
  const extras: string[] = [];
  if (ctx.usesStrategy) extras.push("__h.strategy.extras()");
  extras.push("((__h.draw && __h.draw.extras()) || {})");
  extras.push("((__h.log && __h.log.extras && __h.log.extras()) || {})");
  lines.push(`  return Object.assign(${plotObj}, ${extras.join(", ")});`);
  lines.push("}");
  return lines.join("\n");
}

function visitOf(state: State): VisitFn {
  return (node) => emitNode(state, node);
}

function emitNode(state: State, node: expr | stmt | null | undefined): string {
  if (node == null) return "null";
  switch (node.kind) {
    case "Assign":
    case "ReAssign":
    case "AugAssign":
    case "FunctionDef":
    case "TypeDef":
    case "EnumDef":
    case "Import":
    case "Break":
    case "Continue":
    case "Expr":
      return emitStmt(state, node);
    default:
      return emitExpr(state, node);
  }
}

function emitStmt(state: State, node: stmt | expr): string {
  switch (node.kind) {
    case "Expr":
      return emitExprStmt(state, node.value);
    case "Assign":
      return emitAssign(state, node);
    case "ReAssign":
      return emitReAssign(state, node);
    case "AugAssign":
      return emitAugAssign(state, node);
    case "FunctionDef":
      emitFunctionDef(state.ctx, node as FunctionDef, (s) => emitStmt(state, s));
      if (state.ctx.currentFunc != null) state.ctx.currentFunc = null;
      return "";
    case "TypeDef":
      return emitTypeDef(state, node as TypeDef);
    case "EnumDef":
      return emitEnumDef(state, node as EnumDef);
    case "Import":
      return emitImport(state, node as Import);
    case "Break":
      return "break;";
    case "Continue":
      return "continue;";
    case "If":
      return emitIfStmt(state, node);
    case "ForTo":
      return emitForTo(state, node);
    case "ForIn":
      return emitForIn(state, node);
    case "While":
      return emitWhile(state, node);
    case "Switch":
      return emitSwitch(state, node, false);
    default:
      return emitExprStmt(state, node);
  }
}

function emitExprStmt(state: State, value: expr | null | undefined): string {
  if (value == null) return "";
  switch (value.kind) {
    case "If":
      return emitIfStmt(state, value);
    case "ForTo":
      return emitForTo(state, value);
    case "ForIn":
      return emitForIn(state, value);
    case "While":
      return emitWhile(state, value);
    case "Switch":
      return emitSwitch(state, value, false);
    default: {
      const e = emitExpr(state, value);
      if (!e || e === "null") return "";
      return e.endsWith(";") || e.endsWith("}") ? e : `${e};`;
    }
  }
}

function emitExpr(state: State, node: expr | null | undefined): string {
  if (node == null) return "null";
  switch (node.kind) {
    case "Name":
      return emitName(state, node);
    case "Constant":
      return emitConstant(node);
    case "BinOp":
      return emitBinOp(state, node);
    case "UnaryOp":
      return emitUnaryOp(state, node);
    case "Compare":
      return emitCompare(state, node);
    case "Conditional":
      return emitConditional(state, node);
    case "If":
      return emitIfExpr(state, node);
    case "BoolOp":
      return emitBoolOp(state, node);
    case "Tuple":
      return emitTuple(state, node);
    case "Subscript":
      return emitSubscript(state, node);
    case "Call":
      return emitCall(state.ctx, node as Call, visitOf(state));
    case "Attribute":
      return emitAttribute(state, node);
    case "Switch":
      return emitSwitch(state, node, true);
    case "ForTo":
      return iife(emitForTo(state, node), "null");
    case "ForIn":
      return iife(emitForIn(state, node), "null");
    case "While":
      return iife(emitWhile(state, node), "null");
    case "Qualify":
      return emitExpr(state, node.value);
    case "Specialize":
      return emitExpr(state, node.value);
    case "AugAssign":
      return emitAugAssign(state, node);
    default:
      return "null";
  }
}

function emitName(state: State, node: Name): string {
  const id = node.id;
  const loop = state.loopVars.get(id);
  if (loop != null) return loop;
  // Method receiver formal is `this_` (emit_udf reserved suffix).
  if (id === "this") return "this_";
  // barstate is a namespace (barstate.isfirst); never a bare name.
  if (id === "barstate") return "null";
  if (id === "true" || id === "True") return "true";
  if (id === "false" || id === "False") return "false";
  if (state.ctx.currentSeriesParams.has(id)) return `${safeIdent(id)}[__bar_idx]`;
  const st = stArrayFor(state.ctx, id);
  if (st != null) return `${st}[__bar_idx]`;
  const arr = seriesArrName(id);
  if (state.ctx.arrays.has(arr)) return `${arr}[__bar_idx]`;
  if (CHART_LOCALS.has(id)) return id;
  if (state.ctx.userFuncs.has(id)) return id;
  if (state.ctx.enumTypes.has(id)) return JSON.stringify(id);
  return safeIdent(id);
}

function emitConstant(node: Constant): string {
  const v = node.value;
  if (v == null) return "null";
  if (typeof v === "number" && !Number.isFinite(v)) return "null";
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "string") {
    return JSON.stringify(v);
  }
  return "null";
}

function emitBinOp(state: State, node: BinOp): string {
  const left = emitExpr(state, node.left);
  const right = emitExpr(state, node.right);
  switch (opKind(node.op)) {
    case "Add":
      return `__h.add(${left}, ${right})`;
    case "Sub":
      return `__h.sub(${left}, ${right})`;
    case "Mult":
      return `__h.mul(${left}, ${right})`;
    case "Div":
      return `__h.div(${left}, ${right})`;
    case "Mod":
      return `__h.mod(${left}, ${right})`;
    case "BitAnd":
      return emitBitOp(left, right, "&");
    case "BitOr":
      return emitBitOp(left, right, "|");
    case "BitXor":
      return emitBitOp(left, right, "^");
    case "LShift":
      return emitBitOp(left, right, "<<");
    case "RShift":
      return emitBitOp(left, right, ">>");
    default:
      return `__h.add(${left}, ${right})`;
  }
}

function emitBitOp(left: string, right: string, op: "&" | "|" | "^" | "<<" | ">>"): string {
  return `((__l, __r) => { if (__h.isNa(__l) || __h.isNa(__r)) return null; return (__h.nz(__l) | 0) ${op} (__h.nz(__r) | 0); })(${left}, ${right})`;
}

function emitUnaryOp(state: State, node: UnaryOp): string {
  const operand = emitExpr(state, node.operand);
  switch (opKind(node.op)) {
    case "USub":
      return `__h.neg(${operand})`;
    case "UAdd":
      return `__h.naNum(${operand})`;
    case "Not":
      return `!(${operand})`;
    case "Invert":
      return `~(__h.nz(${operand}))`;
    default:
      return operand;
  }
}

function emitCompare(state: State, node: Compare): string {
  const ops = node.ops ?? [];
  const comps = node.comparators ?? [];
  if (ops.length === 0 || comps.length === 0) return emitExpr(state, node.left);
  const parts: string[] = [];
  let lhs = emitExpr(state, node.left);
  for (let i = 0; i < ops.length && i < comps.length; i++) {
    const rhs = emitExpr(state, comps[i]);
    parts.push(compareCall(opKind(ops[i]!), lhs, rhs));
    lhs = rhs;
  }
  return parts.length === 1 ? parts[0]! : `(${parts.join(" && ")})`;
}

function compareCall(op: string, left: string, right: string): string {
  switch (op) {
    case "Eq":
      return `__h.eq(${left}, ${right})`;
    case "NotEq":
      return `__h.ne(${left}, ${right})`;
    case "Lt":
      return `__h.lt(${left}, ${right})`;
    case "LtE":
      return `__h.lte(${left}, ${right})`;
    case "Gt":
      return `__h.gt(${left}, ${right})`;
    case "GtE":
      return `__h.gte(${left}, ${right})`;
    default:
      return `__h.eq(${left}, ${right})`;
  }
}

function emitConditional(state: State, node: Conditional): string {
  return `(${emitExpr(state, node.test)} ? ${emitExpr(state, node.body)} : ${emitExpr(state, node.orelse)})`;
}

function emitBoolOp(state: State, node: BoolOp): string {
  const values = (node.values ?? []).map((v) => emitExpr(state, v));
  if (values.length === 0) return "null";
  if (values.length === 1) return values[0]!;
  const op = opKind(node.op) === "Or" ? " || " : " && ";
  return `(${values.join(op)})`;
}

function emitTuple(state: State, node: Tuple): string {
  return `[${(node.elts ?? []).map((e) => emitExpr(state, e)).join(", ")}]`;
}

const STRATEGY_QUERY_ATTRS = new Set([
  "position_size",
  "netprofit",
  "equity",
  "openprofit",
  "opentrades",
  "closedtrades",
  "leverage",
  "margin_liquidation_price",
  "position_avg_price",
  "initial_capital",
]);

/** Namespaces used as call receivers or dotted constants — not UDT field access. */
const ATTR_NAMESPACES = new Set([
  "ta",
  "math",
  "str",
  "array",
  "map",
  "matrix",
  "strategy",
  "input",
  "color",
  "request",
  "label",
  "line",
  "box",
  "table",
  "session",
  "chart",
  "log",
  "order",
  "format",
  "text",
  "size",
  "barmerge",
  "shape",
  "location",
  "xloc",
  "yloc",
  "extend",
  "display",
  "position",
  "hline",
  "dayofweek",
  "month",
]);

/** Dotted keys from Python `_MATH_CONSTANTS` (base.py). Unknown member → na. */
const ATTR_CONSTANTS: Record<string, string | number | boolean> = {
  "format.mintick": "mintick",
  "format.percent": "percent",
  "format.volume": "volume",
  "format.price": "price",
  "text.formatting.none": "",
  "text.formatting.bold": "bold",
  "text.formatting.italic": "italic",
  "text.formatting.bold_italic": "bold italic",
  "size.auto": "auto",
  "size.tiny": 8,
  "size.small": 10,
  "size.normal": 12,
  "size.large": 16,
  "size.huge": 20,
  "order.ascending": 1,
  "order.descending": -1,
  "barmerge.gaps_on": true,
  "barmerge.gaps_off": false,
  "barmerge.lookahead_on": true,
  "barmerge.lookahead_off": false,
  "shape.arrowup": "arrowup",
  "shape.arrowdown": "arrowdown",
  "shape.circle": "circle",
  "shape.cross": "cross",
  "shape.diamond": "diamond",
  "shape.flag": "flag",
  "shape.labelup": "labelup",
  "shape.labeldown": "labeldown",
  "shape.square": "square",
  "shape.triangledown": "triangledown",
  "shape.triangleup": "triangleup",
  "shape.xcross": "xcross",
  "location.abovebar": "abovebar",
  "location.belowbar": "belowbar",
  "location.top": "top",
  "location.bottom": "bottom",
  "location.absolute": "absolute",
  "xloc.bar_index": "bar_index",
  "xloc.bar_time": "bar_time",
  "yloc.price": "price",
  "yloc.abovebar": "abovebar",
  "yloc.belowbar": "belowbar",
  "extend.none": "none",
  "extend.left": "left",
  "extend.right": "right",
  "extend.both": "both",
  "display.none": "none",
  "display.all": "all",
  "display.data_window": "data_window",
  "display.price_scale": "price_scale",
  "display.status_line": "status_line",
  "position.top_left": "top_left",
  "position.top_center": "top_center",
  "position.top_right": "top_right",
  "position.middle_left": "middle_left",
  "position.middle_center": "middle_center",
  "position.middle_right": "middle_right",
  "position.bottom_left": "bottom_left",
  "position.bottom_center": "bottom_center",
  "position.bottom_right": "bottom_right",
  "hline.style_solid": "solid",
  "hline.style_dashed": "dashed",
  "hline.style_dotted": "dotted",
  "dayofweek.sunday": 1,
  "dayofweek.monday": 2,
  "dayofweek.tuesday": 3,
  "dayofweek.wednesday": 4,
  "dayofweek.thursday": 5,
  "dayofweek.friday": 6,
  "dayofweek.saturday": 7,
  "month.january": 1,
  "month.february": 2,
  "month.march": 3,
  "month.april": 4,
  "month.may": 5,
  "month.june": 6,
  "month.july": 7,
  "month.august": 8,
  "month.september": 9,
  "month.october": 10,
  "month.november": 11,
  "month.december": 12,
};

const ATTR_CONST_NS = new Set([
  "order",
  "format",
  "text",
  "size",
  "barmerge",
  "shape",
  "location",
  "xloc",
  "yloc",
  "extend",
  "display",
  "position",
  "hline",
  "dayofweek",
  "month",
]);

function attrQualifiedName(node: Attribute): string | null {
  const parts: string[] = [node.attr];
  let cur: expr = node.value;
  while (cur.kind === "Attribute") {
    parts.push(cur.attr);
    cur = cur.value;
  }
  if (cur.kind !== "Name") return null;
  parts.push(cur.id);
  parts.reverse();
  return parts.join(".");
}

function emitBarstate(attr: string): string {
  switch (attr) {
    case "isfirst":
      return "(__bar_idx === 0)";
    case "islast":
      return "(__bar_idx === last_bar_index)";
    case "ishistory":
      return "(__bar_idx < last_bar_index)";
    // Compile has no live/historical tick split — last bar is "realtime".
    case "isrealtime":
      return "(__bar_idx === last_bar_index)";
    case "isnew":
      return "true";
    case "isconfirmed":
      return "true";
    case "islastconfirmedhistory":
      return "(__bar_idx === last_bar_index)";
    default:
      return "false";
  }
}

function emitSession(attr: string): string {
  switch (attr) {
    case "regular":
      return `"regular"`;
    case "extended":
      return `"extended"`;
    case "ismarket":
      return "1";
    case "ispremarket":
    case "ispostmarket":
      return "0";
    case "isfirstbar":
    case "isfirstbar_regular":
      return "(__bar_idx === 0 ? 1 : 0)";
    case "islastbar":
    case "islastbar_regular":
      return "(__bar_idx === last_bar_index ? 1 : 0)";
    default:
      return "null";
  }
}

function emitChart(attr: string): string {
  switch (attr) {
    case "is_heikinashi":
    case "is_renko":
    case "is_kagi":
    case "is_linebreak":
    case "is_pointfigure":
      return "0";
    case "fg_color":
      return `"#ffffff"`;
    case "bg_color":
      return `"#131722"`;
    default:
      return "null";
  }
}

function emitTimeframe(attr: string): string {
  switch (attr) {
    case "period":
      return `(__h.timeframe || "1")`;
    case "multiplier":
      return "1";
    case "isintraday":
      return "true";
    case "isdaily":
    case "isweekly":
    case "ismonthly":
      return "false";
    default:
      return "null";
  }
}

function emitSyminfo(attr: string): string {
  switch (attr) {
    case "ticker":
    case "tickerid":
    case "root":
      return `"SYMBOL"`;
    default:
      return "null";
  }
}

function emitAttribute(state: State, node: Attribute): string {
  // Import alias.member is not a JS object — calls go through emit_call; loads are na.
  if (node.value.kind === "Name" && state.ctx.importAliases.has(node.value.id)) {
    return "null";
  }
  if (node.value.kind === "Name" && node.value.id === "barstate") {
    return emitBarstate(node.attr);
  }
  if (node.value.kind === "Name" && node.value.id === "session") {
    return emitSession(node.attr);
  }
  if (node.value.kind === "Name" && node.value.id === "chart") {
    return emitChart(node.attr);
  }
  if (node.value.kind === "Name" && node.value.id === "timeframe") {
    return emitTimeframe(node.attr);
  }
  if (node.value.kind === "Name" && node.value.id === "syminfo") {
    return emitSyminfo(node.attr);
  }
  if (node.value.kind === "Name" && node.value.id === "color") {
    return `__h.colorByName(${JSON.stringify(node.attr)})`;
  }
  if (node.value.kind === "Name" && node.value.id === "ta") {
    // Bare `ta.<attr>` auto-calls only for the whitelist interpret's
    // evalTaAttr supports; everything else is na on both backends.
    if (!TA_BARE_ATTRS.has(node.attr)) return "null";
    return emitCall(state.ctx, { kind: "Call", func: node, args: [] }, visitOf(state));
  }
  if (node.value.kind === "Name" && node.value.id === "strategy") {
    const attr = node.attr;
    if (attr === "long") return `"long"`;
    if (attr === "short") return `"short"`;
    if (attr === "avg_price_stock") return `"stock"`;
    if (attr === "avg_price_futures") return `"futures"`;
    if (attr === "avg_price_inverse") return `"inverse"`;
    if (attr === "cash") return `"cash"`;
    if (attr === "fixed") return `"fixed"`;
    if (attr === "percent_of_equity") return `"percent_of_equity"`;
    if (STRATEGY_QUERY_ATTRS.has(attr)) {
      state.ctx.usesStrategy = true;
      return `__h.strategy.${attr}()`;
    }
  }
  if (node.value.kind === "Name") {
    const members = state.ctx.enumTypes.get(node.value.id);
    if (members != null && members.includes(node.attr)) {
      return JSON.stringify(node.attr);
    }
  }
  const qn = attrQualifiedName(node);
  if (qn != null) {
    const dot = qn.indexOf(".");
    const root = dot < 0 ? qn : qn.slice(0, dot);
    if (ATTR_CONST_NS.has(root)) {
      const lit = ATTR_CONSTANTS[qn];
      return lit === undefined ? "null" : JSON.stringify(lit);
    }
  }
  const obj = emitExpr(state, node.value);
  if (node.value.kind === "Name" && state.ctx.udtTypes.has(node.value.id)) {
    return `__h.udtGet(${obj}, ${JSON.stringify(node.attr)})`;
  }
  if (node.value.kind !== "Name" || !ATTR_NAMESPACES.has(node.value.id)) {
    return `__h.udtGet(${obj}, ${JSON.stringify(node.attr)})`;
  }
  return `${obj}.${node.attr}`;
}

function emitSubscript(state: State, node: Subscript): string {
  const slice = node.slice != null ? emitExpr(state, node.slice) : "0";
  const arr = histArray(state, node.value);
  return `__h.hist(${arr}, __bar_idx, ${slice})`;
}

function histArray(state: State, value: expr): string {
  if (value.kind === "Name") {
    const id = value.id;
    if (state.ctx.currentSeriesParams.has(id)) return safeIdent(id);
    const st = stArrayFor(state.ctx, id);
    if (st != null) return st;
    const user = seriesArrName(id);
    if (state.ctx.arrays.has(user)) return user;
    switch (id) {
      case "open":
        return "open_arr";
      case "high":
        return "high_arr";
      case "low":
        return "low_arr";
      case "close":
        return "close_arr";
      case "volume":
        return "vol_arr";
      case "time":
        return "time_arr";
      default: {
        state.ctx.arrays.add(user);
        return user;
      }
    }
  }
  const v = emitExpr(state, value);
  if (v.endsWith("[__bar_idx]")) return v.slice(0, -"[__bar_idx]".length);
  return v;
}

function emitTypeDef(state: State, node: TypeDef): string {
  const fields: string[] = [];
  const defaults: Record<string, string> = {};
  for (const s of node.body ?? []) {
    if (s.kind === "FunctionDef") {
      state.ctx.udtMethodNames.add(s.name);
      emitFunctionDef(state.ctx, s, (st) => emitStmt(state, st));
      if (state.ctx.currentFunc != null) state.ctx.currentFunc = null;
      continue;
    }
    if (s.kind !== "Assign") continue;
    if (s.target.kind !== "Name") continue;
    const fname = s.target.id;
    fields.push(fname);
    defaults[fname] = s.value != null ? emitExpr(state, s.value) : "null";
  }
  state.ctx.udtTypes.set(node.name, { fields, defaults });
  return "";
}

function emitEnumDef(state: State, node: EnumDef): string {
  const members: string[] = [];
  for (const s of node.body ?? []) {
    if (s.kind === "Assign" && s.target.kind === "Name") {
      members.push(s.target.id);
    } else if (s.kind === "Expr" && s.value?.kind === "Name") {
      members.push(s.value.id);
    }
  }
  state.ctx.enumTypes.set(node.name, members);
  return "";
}

/** Record the alias; optionally inline library FunctionDef / TypeDef / EnumDef / Assign. No errors. */
function emitImport(state: State, node: Import): string {
  const alias = node.alias || node.name;
  state.ctx.importAliases.add(alias);
  const getLibrary = state.ctx.getLibrary;
  if (getLibrary) {
    const src = getLibrary(node.namespace, node.name, node.version);
    if (src) {
      let tree: ReturnType<typeof parse>;
      try {
        tree = parse(src);
      } catch {
        return "";
      }
      if (tree.kind === "Script") {
        for (const s of (tree as Script).body ?? []) {
          if (
            s.kind === "FunctionDef" ||
            s.kind === "TypeDef" ||
            s.kind === "EnumDef" ||
            s.kind === "Assign"
          ) {
            emitStmt(state, s);
          }
        }
      }
    }
  }
  return "";
}

function emitAssign(state: State, node: Assign): string {
  const rhs = node.value != null ? emitExpr(state, node.value) : "null";
  const isVar = isVarMode(node.mode);
  return emitStore(state, node.target, rhs, isVar);
}

function emitReAssign(state: State, node: ReAssign): string {
  return emitStore(state, node.target, emitExpr(state, node.value), false);
}

function emitAugAssign(state: State, node: AugAssign): string {
  // Attribute targets store the raw rhs — the old field is discarded
  // (quirk preserved from Python visit_AugAssign and interpret evalAugAssign).
  if (node.target.kind === "Attribute") {
    return emitStore(state, node.target, emitExpr(state, node.value), false);
  }
  const rhs = emitBinOp(state, {
    kind: "BinOp",
    left: node.target,
    op: node.op,
    right: node.value,
  });
  return emitStore(state, node.target, rhs, false);
}

function emitStore(state: State, target: expr, rhs: string, isVar: boolean): string {
  if (target.kind === "Name") {
    return storeName(state, target.id, rhs, isVar);
  }
  if (target.kind === "Tuple") {
    const tmp = `__t${state.tmp++}`;
    const lines = [`const ${tmp} = ${rhs};`];
    const elts = target.elts ?? [];
    for (let i = 0; i < elts.length; i++) {
      const el = elts[i]!;
      if (el.kind === "Name") {
        lines.push(storeName(state, el.id, `${tmp}[${i}]`, isVar));
      } else {
        lines.push(emitStore(state, el, `${tmp}[${i}]`, isVar));
      }
    }
    return lines.join("\n");
  }
  if (target.kind === "Attribute") {
    return `__h.udtSet(${emitExpr(state, target.value)}, ${JSON.stringify(target.attr)}, ${rhs});`;
  }
  return `${emitExpr(state, target)} = __h.naNum(${rhs});`;
}

function storeName(state: State, id: string, rhs: string, isVar: boolean): string {
  const arr = trackSeries(state, id);
  const wrapped = `__h.hold(${rhs})`;
  if (isVar) {
    const key = seriesBase(id);
    state.ctx.varNames.add(id);
    return [
      `if (!__var_inited.${key}) {`,
      `  ${arr}[__bar_idx] = ${wrapped};`,
      `  __var_inited.${key} = true;`,
      `} else {`,
      `  ${arr}[__bar_idx] = ${arr}[__bar_idx - 1];`,
      `}`,
    ].join("\n");
  }
  return `${arr}[__bar_idx] = ${wrapped};`;
}

function emitIfExpr(state: State, node: If): string {
  const thenE = singlePureExpr(state, node.body);
  const elseE =
    node.orelse && node.orelse.length ? singlePureExpr(state, node.orelse) : "null";
  if (thenE != null && elseE != null) {
    return `(__h.nz(${emitExpr(state, node.test)}) ? ${thenE} : ${elseE})`;
  }
  return iife(emitIfStmt(state, node, true), "null");
}

function emitIfStmt(state: State, node: If, asExpr = false): string {
  const test = `__h.nz(${emitExpr(state, node.test)})`;
  const thenBlock = emitBranch(state, node.body, asExpr);
  const orelse = node.orelse ?? [];
  if (orelse.length === 0) {
    return `if (${test}) {\n${indentBlock(thenBlock, 2)}\n}`;
  }
  if (orelse.length === 1) {
    const only = unwrapExpr(orelse[0]!);
    if (only && only.kind === "If") {
      const rest = emitIfStmt(state, only, asExpr);
      return `if (${test}) {\n${indentBlock(thenBlock, 2)}\n} else ${rest}`;
    }
  }
  const elseBlock = emitBranch(state, orelse, asExpr);
  return `if (${test}) {\n${indentBlock(thenBlock, 2)}\n} else {\n${indentBlock(elseBlock, 2)}\n}`;
}

function emitBranch(state: State, stmts: stmt[], asExpr: boolean): string {
  const list = stmts ?? [];
  if (list.length === 0) return asExpr ? "return null;" : "";
  const lines: string[] = [];
  for (let i = 0; i < list.length; i++) {
    const s = list[i]!;
    const tail = asExpr && i === list.length - 1;
    if (tail) {
      const inner = unwrapExpr(s);
      if (inner && isValueExpr(inner)) {
        lines.push(`return ${emitExpr(state, inner)};`);
        continue;
      }
      if (s.kind === "Assign" || s.kind === "ReAssign") {
        lines.push(emitStmt(state, s));
        if (s.target.kind === "Name") {
          lines.push(`return ${emitName(state, s.target)};`);
        } else {
          lines.push("return null;");
        }
        continue;
      }
      if (inner && inner.kind === "If") {
        lines.push(emitIfStmt(state, inner, true));
        continue;
      }
      const stmt = emitStmt(state, s);
      if (stmt) lines.push(stmt);
      lines.push("return null;");
      continue;
    }
    const stmt = emitStmt(state, s);
    if (stmt) lines.push(stmt);
  }
  return lines.join("\n");
}

function singlePureExpr(state: State, stmts: stmt[]): string | null {
  if (!stmts || stmts.length !== 1) return null;
  const inner = unwrapExpr(stmts[0]!);
  if (inner == null) return null;
  if (inner.kind === "If") {
    const thenE = singlePureExpr(state, inner.body);
    const elseE =
      inner.orelse && inner.orelse.length ? singlePureExpr(state, inner.orelse) : "null";
    if (thenE == null || elseE == null) return null;
    return `(__h.nz(${emitExpr(state, inner.test)}) ? ${thenE} : ${elseE})`;
  }
  if (!isValueExpr(inner)) return null;
  return emitExpr(state, inner);
}

function isValueExpr(node: expr): boolean {
  switch (node.kind) {
    case "ForTo":
    case "ForIn":
    case "While":
    case "Switch":
      return false;
    default:
      return true;
  }
}

function emitForTo(state: State, node: ForTo): string {
  const id = node.target.kind === "Name" ? node.target.id : `__i${state.tmp++}`;
  const js = node.target.kind === "Name" ? safeIdent(id) : id;
  const startN = `__s${state.tmp++}`;
  const endN = `__e${state.tmp++}`;
  const stepN = `__p${state.tmp++}`;
  const guardN = `__g${state.tmp++}`;
  const start = emitExpr(state, node.start);
  const end = emitExpr(state, node.end);
  const step =
    node.step != null
      ? `__h.naNum(${emitExpr(state, node.step)})`
      : `(__h.lte(${startN}, ${endN}) ? 1 : -1)`;
  const prev = state.loopVars.get(id);
  state.loopVars.set(id, js);
  let body: string;
  try {
    body = emitBlock(state, node.body);
  } finally {
    restoreLoop(state, id, prev);
  }
  return [
    `{`,
    `  const ${startN} = __h.naNum(${start});`,
    `  const ${endN} = __h.naNum(${end});`,
    `  const ${stepN} = ${step};`,
    `  if (${startN} != null && ${endN} != null && ${stepN} != null && ${stepN} !== 0) {`,
    `    let ${guardN} = 0;`,
    `    for (let ${js} = ${startN}; (${stepN} > 0 ? ${js} <= ${endN} : ${js} >= ${endN}) && ${guardN}++ < ${FOR_TO_CAP}; ${js} += ${stepN}) {`,
    indentBlock(body, 6),
    `    }`,
    `  }`,
    `}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function emitForIn(state: State, node: ForIn): string {
  const iterN = `__it${state.tmp++}`;
  const itemsN = `__xs${state.tmp++}`;
  const idxN = `__k${state.tmp++}`;
  const iter = emitExpr(state, node.iter);
  const added: Array<{ id: string; prev: string | undefined }> = [];
  let header: string;
  let bind: string;
  if (node.target.kind === "Tuple" && (node.target.elts?.length ?? 0) > 0) {
    const names = node.target.elts.map((el, i) => {
      const pid = el.kind === "Name" ? el.id : `__v${state.tmp++}_${i}`;
      const js = el.kind === "Name" ? safeIdent(pid) : pid;
      added.push({ id: pid, prev: state.loopVars.get(pid) });
      state.loopVars.set(pid, js);
      return js;
    });
    if (names.length === 2) {
      header = `const ${names[0]} = ${idxN};`;
      bind = `const ${names[1]} = ${itemsN}[${idxN}];`;
    } else {
      header = "";
      bind = names.map((n, i) => `const ${n} = ${itemsN}[${idxN}][${i}];`).join("\n");
    }
  } else {
    const pid = node.target.kind === "Name" ? node.target.id : `__v${state.tmp++}`;
    const js = node.target.kind === "Name" ? safeIdent(pid) : pid;
    added.push({ id: pid, prev: state.loopVars.get(pid) });
    state.loopVars.set(pid, js);
    header = "";
    bind = `const ${js} = ${itemsN}[${idxN}];`;
  }
  let body: string;
  try {
    body = emitBlock(state, node.body);
  } finally {
    for (const a of added) restoreLoop(state, a.id, a.prev);
  }
  const inner = [header, bind, body].filter(Boolean).join("\n");
  return [
    `{`,
    `  const ${iterN} = ${iter};`,
    `  const ${itemsN} = ${iterN} != null && typeof ${iterN}.length === "number" ? ${iterN} : [];`,
    `  for (let ${idxN} = 0; ${idxN} < ${itemsN}.length && ${idxN} < ${FOR_TO_CAP}; ${idxN}++) {`,
    indentBlock(inner, 4),
    `  }`,
    `}`,
  ].join("\n");
}

function emitWhile(state: State, node: While): string {
  const guardN = `__w${state.tmp++}`;
  const test = `__h.nz(${emitExpr(state, node.test)})`;
  const body = emitBlock(state, node.body);
  return [
    `{`,
    `  let ${guardN} = 0;`,
    `  while (${test} && ${guardN}++ < ${WHILE_CAP}) {`,
    indentBlock(body, 4),
    `  }`,
    `}`,
  ].join("\n");
}

function emitSwitch(state: State, node: Switch, asExpr: boolean): string {
  const cases = node.cases ?? [];
  const subjN = node.subject != null ? `__sw${state.tmp++}` : null;
  const parts: string[] = [];
  if (subjN != null) {
    parts.push(`const ${subjN} = ${emitExpr(state, node.subject)};`);
  }
  let first = true;
  let defaultCase: Case | null = null;
  for (const c of cases) {
    if (c.pattern == null) {
      defaultCase = c;
      continue;
    }
    const cond =
      subjN != null
        ? `__h.eq(${subjN}, ${emitExpr(state, c.pattern)})`
        : `__h.nz(${emitExpr(state, c.pattern)})`;
    const kw = first ? "if" : "else if";
    first = false;
    const body = emitBranch(state, c.body ?? [], asExpr);
    parts.push(`${kw} (${cond}) {\n${indentBlock(body, 2)}\n}`);
  }
  if (defaultCase != null) {
    const body = emitBranch(state, defaultCase.body ?? [], asExpr);
    if (first) {
      parts.push(body);
    } else {
      parts.push(`else {\n${indentBlock(body, 2)}\n}`);
    }
  } else if (asExpr && !first) {
    parts.push("else {\n  return null;\n}");
  }
  const block = parts.filter(Boolean).join("\n");
  if (asExpr) return iife(block, "null");
  return `{\n${indentBlock(block, 2)}\n}`;
}

function emitBlock(state: State, stmts: stmt[] | null | undefined): string {
  const lines: string[] = [];
  for (const s of stmts ?? []) {
    const line = emitStmt(state, s);
    if (line) lines.push(line);
  }
  return lines.join("\n");
}

function unwrapExpr(node: stmt | expr): expr | null {
  if (node.kind === "Expr") return node.value;
  switch (node.kind) {
    case "If":
    case "ForTo":
    case "ForIn":
    case "While":
    case "Switch":
    case "Call":
    case "Name":
    case "Constant":
    case "Attribute":
    case "Subscript":
    case "BinOp":
    case "UnaryOp":
    case "Compare":
    case "Tuple":
    case "Conditional":
    case "BoolOp":
      return node;
    default:
      return null;
  }
}

function isVarMode(mode: Assign["mode"]): boolean {
  if (mode == null) return false;
  const k = opKind(mode);
  return k === "Var" || k === "VarIp";
}

function prefetch(state: State, node: unknown): void {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) prefetch(state, item);
    return;
  }
  const n = node as { kind?: string; name?: string; target?: expr };
  if (n.kind === "TypeDef" || n.kind === "EnumDef" || n.kind === "Import") return;
  if (n.kind === "FunctionDef" && typeof n.name === "string") {
    state.ctx.userFuncs.add(n.name);
    return;
  }
  if ((n.kind === "Assign" || n.kind === "ReAssign") && n.target != null) {
    collectStoreNames(state, n.target);
  }
  for (const v of Object.values(n)) prefetch(state, v);
}

function collectStoreNames(state: State, target: expr): void {
  if (target.kind === "Name") {
    trackSeries(state, target.id);
    return;
  }
  if (target.kind === "Tuple") {
    for (const el of target.elts ?? []) collectStoreNames(state, el);
  }
}

function trackSeries(state: State, id: string): string {
  const arr = seriesArrName(id);
  state.ctx.arrays.add(arr);
  return arr;
}

function seriesArrName(id: string): string {
  return `${seriesBase(id)}_arr`;
}

function seriesBase(id: string): string {
  return RESERVED.has(id) ? `__u_${id}` : id;
}

function safeIdent(id: string): string {
  return RESERVED.has(id) ? `__u_${id}` : id;
}

/** Persistent UDF series local: `__st_${safeFunc}_${safeLocal}` (same as emit_udf). */
function stArrayFor(ctx: EmitCtx, id: string): string | null {
  if (ctx.currentFunc == null) return null;
  const name = `__st_${safeIdent(ctx.currentFunc)}_${safeIdent(id)}`;
  return ctx.stArrays.has(name) ? name : null;
}

function restoreLoop(state: State, id: string, prev: string | undefined): void {
  if (prev === undefined) state.loopVars.delete(id);
  else state.loopVars.set(id, prev);
}

function opKind(op: { kind?: string } | string | null | undefined): string {
  if (op == null) return "";
  if (typeof op === "string") return op;
  return op.kind ?? "";
}

function indentBlock(s: string, n: number): string {
  if (!s) return s;
  const pad = " ".repeat(n);
  return s
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

function iife(body: string, fallback: string): string {
  const inner = body.trim() ? `${body}\nreturn ${fallback};` : `return ${fallback};`;
  return `(() => {\n${indentBlock(inner, 2)}\n})()`;
}
