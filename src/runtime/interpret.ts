/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny interpret host: indicator/plot, series lookback, var/:=, ta.*,
 * tuple unpack, ternary, for-to / for-in / while, switch, and/or,
 * arrays, color/str, strategy events, input*, math.*, request.security,
 * UDF FunctionDef, matrix.*, extra TA, drawings/alert.
 * Not a port of runtime/host.py — same public envelope, interpret only.
 */
import { parse } from "../ast/helper.ts";
import type {
  AST,
  Arg,
  Assign,
  Attribute,
  BoolOp,
  Call,
  Conditional,
  ForIn,
  ForTo,
  FunctionDef,
  Param,
  ReAssign,
  Script,
  Switch,
  Tuple,
  While,
  expr,
  stmt,
} from "../ast/nodes.ts";
import { PineArray } from "./array.ts";
import { colorNew, parseColor, type Color } from "./color.ts";
import { DrawingBook, type DrawingEvent } from "./drawings.ts";
import { isInputBuiltin, resolveInputDefault, inputAsCell, type InputValue } from "./input.ts";
import {
  mathAbs,
  mathLog,
  mathMax,
  mathMin,
  mathPow,
  mathSqrt,
} from "./math.ts";
import { isRequestBuiltin, resolveSecurity } from "./request.ts";
import { NA, PineSeries, type Cell } from "./series.ts";
import {
  strContains,
  strLength,
  strLower,
  strReplace,
  strTostring,
  strUpper,
} from "./str.ts";
import { StrategyBook, type BrokerSettings, type StrategyEvent } from "./strategy.ts";
import { PineMap } from "./map.ts";
import { PineMatrix } from "./matrix.ts";
import { TaEngine } from "./ta.ts";

export type { DrawingEvent };

export type { StrategyEvent };

const OHLCV_KEYS = ["open", "high", "low", "close", "volume", "time"] as const;

export interface OHLCVBar {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  time?: number;
}

export type InputOverrides = Record<string, number | string | boolean>;

export interface RuntimeOptions {
  inputs?: InputOverrides;
  broker?: BrokerSettings;
  timeframe?: string | null;
}

export interface RuntimeFill {
  type: "fill";
  bar: number;
  id: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
}

export interface RuntimeResult {
  series: Record<string, Array<number | null>>;
  plots: Array<number | null>;
  plot_meta: Array<{ title: string }>;
  count: number;
  script_name: string | null;
  script_type: string;
  mode: "interpret";
  events?: StrategyEvent[];
  fills?: RuntimeFill[];
  drawings?: DrawingEvent[];
  error?: string;
  error_kind?: string;
}

/** Eval-only: Cell, tagged tuple/array, color, or strategy.long/short strings. */
type TupleVal = { __tuple: true; elts: Value[] };
type ArrayVal = { __array: true; elts: Value[] };
type Value = Cell | TupleVal | ArrayVal | Color | string | PineArray | PineMap | PineMatrix;

const LOOP_BREAK = Object.freeze({ __loop: "break" as const });
const LOOP_CONTINUE = Object.freeze({ __loop: "continue" as const });
const WHILE_CAP = 10_000;

interface WhileNode {
  kind: "While";
  test: expr;
  body: stmt[] | stmt | null;
}

interface CaseNode {
  kind?: string;
  pattern?: expr | null;
  body: stmt[] | stmt | null;
}

interface SwitchNode {
  kind: "Switch";
  subject?: expr | null;
  cases?: CaseNode[] | CaseNode | null;
}

interface BoolOpNode {
  kind: "BoolOp";
  op?: { kind?: string } | string | null;
  values?: expr[] | null;
  left?: expr;
  right?: expr;
}

interface UdfDef {
  params: Param[];
  body: stmt[];
}

interface Env {
  ctx: Record<string, Value>;
  series: Map<string, PineSeries>;
  varInited: Set<string>;
  barIndex: number;
  ta: TaEngine;
  callSites: WeakMap<object, string>;
  nextSite: number;
  plots: Record<string, Array<number | null>>;
  plot_meta: Array<{ title: string }>;
  book: StrategyBook;
  drawings: DrawingBook;
  symbol: string;
  timeframe: string | null;
  inputs: InputOverrides;
  inputStore: Map<string, InputValue>;
  udfs: Map<string, UdfDef>;
  barCount: number;
}

export class Runtime {
  readonly inputs: InputOverrides;
  readonly broker: BrokerSettings;
  readonly timeframe: string | null;

  constructor(
    public readonly symbol = "AAPL",
    options?: RuntimeOptions,
  ) {
    this.inputs = options?.inputs ?? {};
    this.broker = options?.broker ?? {};
    this.timeframe = options?.timeframe ?? null;
  }

  run(
    source: string,
    ohlcv: OHLCVBar[],
    extra?: RuntimeOptions | InputOverrides,
  ): RuntimeResult {
    let tree: AST;
    try {
      tree = parse(source);
    } catch (err) {
      return {
        series: {},
        plots: [],
        plot_meta: [],
        count: 0,
        script_name: null,
        script_type: "indicator",
        mode: "interpret",
        error: err instanceof Error ? err.message : String(err),
        error_kind: "parse",
      };
    }
    const extraOpts = extra && !isPlainInputs(extra) ? extra : undefined;
    return interpretTree(tree, ohlcv, {
      symbol: this.symbol,
      inputs: mergeInputs(this.inputs, extra),
      broker: extraOpts?.broker ?? this.broker,
      timeframe: extraOpts?.timeframe ?? this.timeframe,
    });
  }
}

export function interpret(source: string, ohlcv: OHLCVBar[]): { plots: Array<number | null> } {
  const out = new Runtime().run(source, ohlcv);
  if (out.error) throw new Error(out.error);
  return { plots: out.plots };
}

export function interpretTree(
  tree: AST,
  ohlcv: OHLCVBar[],
  host?: { symbol?: string; inputs?: InputOverrides; broker?: BrokerSettings; timeframe?: string | null },
): RuntimeResult {
  const scriptNode = tree.kind === "Script" ? (tree as Script) : null;
  const body = scriptNode?.body ?? [];
  const plots: Record<string, Array<number | null>> = {};
  const plot_meta: Array<{ title: string }> = [];
  let script_name: string | null = null;
  let script_type = "indicator";

  const env: Env = {
    ctx: {},
    series: new Map(),
    varInited: new Set(),
    barIndex: 0,
    ta: new TaEngine(),
    callSites: new WeakMap(),
    nextSite: 0,
    plots,
    plot_meta,
    book: new StrategyBook(host?.broker),
    drawings: new DrawingBook(),
    symbol: host?.symbol ?? "AAPL",
    timeframe: host?.timeframe ?? null,
    inputs: host?.inputs ?? {},
    inputStore: new Map(),
    udfs: new Map(),
    barCount: ohlcv.length,
  };

  const n = ohlcv.length;
  for (let i = 0; i < n; i++) {
    beginBar(env, ohlcv[i]!, i);

    for (const stmt of body) {
      const decl = captureDecl(stmt);
      if (decl) {
        if (script_name == null) script_name = decl.name;
        if (decl.kind === "strategy") {
          script_type = "strategy";
          applyStrategyDecl(stmt, env);
        }
        continue;
      }
      execStmt(stmt, env);
    }
  }

  const firstTitle = plot_meta[0]?.title;
  return {
    series: plots,
    plots: firstTitle ? (plots[firstTitle] ?? []) : [],
    plot_meta,
    count: n,
    script_name,
    script_type,
    mode: "interpret",
    events: env.book.events,
    fills: packFills(env.book),
    drawings: packDrawings(env.drawings),
  };
}

function beginBar(env: Env, bar: OHLCVBar, i: number): void {
  env.barIndex = i;
  const values: Record<(typeof OHLCV_KEYS)[number], number> = {
    open: bar.open ?? 0,
    high: bar.high ?? 0,
    low: bar.low ?? 0,
    close: bar.close ?? 0,
    volume: bar.volume ?? 1,
    time: bar.time ?? i * 60_000,
  };
  for (const key of OHLCV_KEYS) {
    const v = values[key];
    env.ctx[key] = v;
    let s = env.series.get(key);
    if (!s) {
      s = new PineSeries();
      env.series.set(key, s);
    }
    s.push(v);
  }
  env.ctx.bar_index = i;

  for (const id of env.varInited) {
    const s = env.series.get(id);
    if (s == null) continue;
    if (s.length === i) s.push(s.current);
    env.ctx[id] = s.current;
  }
}

function callName(node: Call): string | null {
  if (node.func.kind === "Name") return node.func.id;
  if (node.func.kind === "Attribute") {
    const base = node.func.value.kind === "Name" ? node.func.value.id : null;
    return base ? `${base}.${node.func.attr}` : node.func.attr;
  }
  return null;
}

function asArgs(args: Arg | Arg[] | null | undefined): Arg[] {
  if (args == null) return [];
  return Array.isArray(args) ? args : [args];
}

function firstStringArg(args: Arg[] | Arg | null | undefined): string | null {
  for (const a of asArgs(args)) {
    if (a.value.kind === "Constant" && typeof a.value.value === "string") return a.value.value;
  }
  return null;
}

function namedStringArg(args: Arg[] | Arg | null | undefined, name: string): string | null {
  for (const a of asArgs(args)) {
    if (a.name === name && a.value.kind === "Constant" && typeof a.value.value === "string") {
      return a.value.value;
    }
  }
  return null;
}

function siteKey(node: Call, env: Env): string {
  const existing = env.callSites.get(node);
  if (existing != null) return existing;
  const loc =
    node.lineno != null && node.col_offset != null ? `${node.lineno}:${node.col_offset}` : "";
  const id = `${loc}#${env.nextSite++}`;
  env.callSites.set(node, id);
  return id;
}

function callArg(
  args: Arg[] | Arg | null | undefined,
  index: number,
  names: string[],
): expr | undefined {
  const list = asArgs(args);
  for (const a of list) {
    if (a.name != null && names.includes(a.name)) return a.value;
  }
  let i = 0;
  for (const a of list) {
    if (a.name != null) continue;
    if (i === index) return a.value;
    i++;
  }
  return undefined;
}

function isVarMode(stmt: Assign): boolean {
  return stmt.mode?.kind === "Var";
}

function isTuple(v: Value): v is TupleVal {
  return typeof v === "object" && v !== null && (v as TupleVal).__tuple === true;
}

function tupleOf(elts: Value[]): TupleVal {
  return { __tuple: true, elts };
}

function isCell(value: Value): value is Cell {
  return value === null || typeof value === "number";
}

function bindName(env: Env, id: string, value: Value): void {
  env.ctx[id] = value;
  if (!isCell(value)) return;
  let s = env.series.get(id);
  if (!s) {
    s = new PineSeries();
    env.series.set(id, s);
  }
  if (s.length === env.barIndex + 1) s.setCurrent(value);
  else {
    while (s.length < env.barIndex) s.push(NA);
    s.push(value);
  }
}

function unpackTuple(target: Tuple, value: Value, env: Env): void {
  if (!isTuple(value)) return;
  const n = Math.min(target.elts.length, value.elts.length);
  for (let i = 0; i < n; i++) {
    const elt = target.elts[i];
    if (elt?.kind === "Name") bindName(env, elt.id, unwrap(value.elts[i]!));
  }
}

function evalAssign(stmt: Assign, env: Env): void {
  if (stmt.value == null) return;
  if (stmt.target.kind === "Tuple") {
    if (isVarMode(stmt)) {
      const already =
        stmt.target.elts.some((e) => e.kind === "Name" && env.varInited.has(e.id)) ||
        (env.barIndex !== 0 &&
          stmt.target.elts.some((e) => e.kind === "Name" && env.ctx[e.id] !== undefined));
      if (already) {
        for (const e of stmt.target.elts) {
          if (e.kind === "Name") env.varInited.add(e.id);
        }
        return;
      }
    }
    unpackTuple(stmt.target, evalExpr(stmt.value, env), env);
    if (isVarMode(stmt)) {
      for (const e of stmt.target.elts) {
        if (e.kind === "Name") env.varInited.add(e.id);
      }
    }
    return;
  }
  if (stmt.target.kind !== "Name") return;
  const id = stmt.target.id;
  // var: init on first execution (bar_index==0, or first time the name is missing).
  if (isVarMode(stmt) && (env.varInited.has(id) || (env.barIndex !== 0 && env.ctx[id] !== undefined))) {
    env.varInited.add(id);
    return;
  }
  const value = evalExpr(stmt.value, env);
  bindName(env, id, isCell(value) ? value : value);
  if (isVarMode(stmt)) env.varInited.add(id);
}

function evalReAssign(stmt: ReAssign, env: Env): void {
  if (stmt.target.kind === "Tuple") {
    unpackTuple(stmt.target, evalExpr(stmt.value, env), env);
    return;
  }
  if (stmt.target.kind !== "Name") return;
  const value = evalExpr(stmt.value, env);
  bindName(env, stmt.target.id, value);
}

function applyStrategyDecl(stmt: { kind: string; value?: expr | null }, env: Env): void {
  if (stmt.kind !== "Expr" || stmt.value?.kind !== "Call") return;
  const settings: BrokerSettings = {};
  const comm = unwrap(evalExpr(callArg(stmt.value.args, -1, ["commission", "commission_value"]), env));
  const slip = unwrap(evalExpr(callArg(stmt.value.args, -1, ["slippage"]), env));
  const pyr = unwrap(evalExpr(callArg(stmt.value.args, -1, ["pyramiding"]), env));
  if (comm != null) settings.commission = comm;
  if (slip != null) settings.slippage = slip;
  if (pyr != null) settings.pyramiding = Math.trunc(pyr);
  if (Object.keys(settings).length) env.book.configure(settings);
}

function captureDecl(stmt: { kind: string; value?: expr | null }): { name: string | null; kind: string } | null {
  if (stmt.kind !== "Expr" || stmt.value?.kind !== "Call") return null;
  const fname = callName(stmt.value);
  if (fname !== "indicator" && fname !== "strategy" && fname !== "library") return null;
  return { name: firstStringArg(stmt.value.args), kind: fname };
}

function execStmt(
  stmt: { kind: string; value?: expr } | Assign | ReAssign | FunctionDef,
  env: Env,
): Value {
  if (stmt.kind === "FunctionDef") {
    registerUdf(stmt as FunctionDef, env);
    return NA;
  }
  if (stmt.kind === "Assign") {
    evalAssign(stmt as Assign, env);
    return NA;
  }
  if (stmt.kind === "ReAssign") {
    evalReAssign(stmt as ReAssign, env);
    return NA;
  }
  if (stmt.kind === "Break") throw LOOP_BREAK;
  if (stmt.kind === "Continue") throw LOOP_CONTINUE;
  if (stmt.kind === "Switch" || stmt.kind === "While" || stmt.kind === "If") {
    return evalExpr(stmt as unknown as expr, env);
  }
  if (stmt.kind !== "Expr" || !("value" in stmt) || stmt.value == null) return NA;
  const value = stmt.value;
  if (value.kind === "Call") {
    const fname = callName(value);
    if (fname === "indicator" || fname === "strategy" || fname === "library") return NA;
    if (fname === "plot" || fname === "plotshape" || fname === "hline" || fname === "plotchar") {
      const plotArgs = asArgs(value.args);
      const title = namedStringArg(plotArgs, "title") ?? firstStringArg(plotArgs.slice(1)) ?? "plot";
      const cell = unwrap(evalExpr(plotArgs[0]?.value, env));
      if (!env.plots[title]) {
        env.plots[title] = [];
        env.plot_meta.push({ title });
      }
      while (env.plots[title]!.length < env.barIndex) env.plots[title]!.push(null);
      env.plots[title]!.push(cell);
      return cell;
    }
  }
  return evalExpr(value, env);
}

function isTruthy(v: Cell): boolean {
  return v != null && v !== 0;
}

function evalExpr(node: expr | undefined, env: Env): Value {
  if (node == null) return NA;
  switch (node.kind) {
    case "Name": {
      const v = env.ctx[node.id];
      return v === undefined ? NA : v;
    }
    case "Constant": {
      const v = node.value;
      if (typeof v === "number") return v;
      if (typeof v === "string") return v;
      if (v === true) return 1;
      if (v === false) return 0;
      return NA;
    }
    case "BinOp": {
      const l = unwrap(evalExpr(node.left, env));
      const r = unwrap(evalExpr(node.right, env));
      if (l == null || r == null) return NA;
      switch (node.op.kind) {
        case "Add":
          return l + r;
        case "Sub":
          return l - r;
        case "Mult":
          return l * r;
        case "Div":
          return r === 0 ? NA : l / r;
        case "Mod":
          return r === 0 ? NA : l % r;
      }
      return NA;
    }
    case "UnaryOp": {
      const v = unwrap(evalExpr(node.operand, env));
      if (v == null) return NA;
      if (node.op.kind === "USub") return -v;
      if (node.op.kind === "UAdd") return v;
      return NA;
    }
    case "Subscript": {
      const raw = unwrap(evalExpr(node.slice ?? undefined, env));
      if (raw == null || !Number.isFinite(raw)) return NA;
      const offset = Math.trunc(raw);
      if (node.value.kind === "Name") {
        const s = env.series.get(node.value.id);
        if (s) return s.get(offset);
      }
      return NA;
    }
    case "Call":
      return evalCall(node, env);
    case "Compare": {
      let left = unwrap(evalExpr(node.left, env));
      for (let i = 0; i < node.ops.length; i++) {
        const right = unwrap(evalExpr(node.comparators[i], env));
        const ok = cmp(left, node.ops[i]!.kind, right);
        if (ok == null) return NA;
        if (!ok) return 0;
        left = right;
      }
      return 1;
    }
    case "If": {
      const t = unwrap(evalExpr(node.test, env));
      const branch = isTruthy(t) ? node.body : node.orelse;
      let last: Value = NA;
      for (const s of branch) last = execStmt(s, env);
      return last;
    }
    case "Attribute":
      return evalAttribute(node, env);
    case "Conditional":
      return evalConditional(node, env);
    case "ForTo":
      return evalForTo(node, env);
    case "Tuple":
      return tupleOf(node.elts.map((e) => evalExpr(e, env)));
    case "ForIn":
      return evalForIn(node, env);
    case "While":
      return evalWhile(node, env);
    case "Switch":
      return evalSwitch(node, env);
    case "BoolOp":
      return evalBoolOp(node, env);
  }
}

function evalConditional(node: Conditional, env: Env): Value {
  const t = unwrap(evalExpr(node.test, env));
  return isTruthy(t) ? evalExpr(node.body, env) : evalExpr(node.orelse, env);
}

function evalForTo(node: ForTo, env: Env): Value {
  const startV = unwrap(evalExpr(node.start, env));
  const endV = unwrap(evalExpr(node.end, env));
  if (startV == null || endV == null || !Number.isFinite(startV) || !Number.isFinite(endV)) {
    return NA;
  }
  let step = 1;
  if (node.step != null) {
    const stepV = unwrap(evalExpr(node.step, env));
    if (stepV == null || !Number.isFinite(stepV) || stepV === 0) return NA;
    step = Math.trunc(stepV);
    if (step === 0) return NA;
  }
  const start = Math.trunc(startV);
  const end = Math.trunc(endV);
  const target = node.target.kind === "Name" ? node.target.id : null;
  let last: Value = NA;
  const run = (i: number): "break" | "ok" => {
    if (target) bindName(env, target, i);
    try {
      for (const s of node.body) last = execStmt(s, env);
    } catch (err) {
      if (err === LOOP_BREAK) return "break";
      if (err === LOOP_CONTINUE) return "ok";
      throw err;
    }
    return "ok";
  };
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      if (run(i) === "break") break;
    }
  } else {
    for (let i = start; i >= end; i += step) {
      if (run(i) === "break") break;
    }
  }
  return last;
}

function evalWhile(node: While, env: Env): Value {
  let last: Value = NA;
  let n = 0;
  while (isTruthy(unwrap(evalExpr(node.test, env)))) {
    if (++n > WHILE_CAP) break;
    try {
      for (const s of asStmts(node.body)) last = execStmt(s, env);
    } catch (err) {
      if (err === LOOP_BREAK) break;
      if (err === LOOP_CONTINUE) continue;
      throw err;
    }
  }
  return last;
}

function evalSwitch(node: Switch, env: Env): Value {
  const cases = Array.isArray(node.cases) ? node.cases : [];
  const subjectPresent = node.subject != null;
  const subject = subjectPresent ? unwrap(evalExpr(node.subject!, env)) : null;
  for (const c of cases) {
    if (c.pattern == null) return execBlock(c.body, env);
    if (subjectPresent) {
      const pat = unwrap(evalExpr(c.pattern, env));
      if (pat === subject) return execBlock(c.body, env);
    } else if (isTruthy(unwrap(evalExpr(c.pattern, env)))) {
      return execBlock(c.body, env);
    }
  }
  return NA;
}

function execBlock(body: stmt[] | stmt | null | undefined, env: Env): Value {
  let last: Value = NA;
  for (const s of asStmts(body)) last = execStmt(s, env);
  return last;
}

function evalBoolOp(node: BoolOp, env: Env): Cell {
  const values = node.values ?? [];
  const kind = typeof node.op === "string" ? node.op : node.op?.kind;
  if (kind === "And") {
    for (const v of values) {
      const x = unwrap(evalExpr(v, env));
      if (x == null) return NA;
      if (!isTruthy(x)) return 0;
    }
    return 1;
  }
  if (kind === "Or") {
    let sawNa = false;
    for (const v of values) {
      const x = unwrap(evalExpr(v, env));
      if (x == null) {
        sawNa = true;
        continue;
      }
      if (isTruthy(x)) return 1;
    }
    return sawNa ? NA : 0;
  }
  return NA;
}

function evalForIn(node: ForIn, env: Env): Value {
  const iter = evalExpr(node.iter, env);
  let items: Value[] = [];
  if (isTuple(iter)) items = iter.elts;
  else if (iter instanceof PineArray) items = iter.toValues();
  const target = node.target.kind === "Name" ? node.target.id : null;
  let last: Value = NA;
  for (const item of items) {
    if (target) bindName(env, target, item);
    try {
      for (const s of node.body) last = execStmt(s, env);
    } catch (err) {
      if (err === LOOP_BREAK) break;
      if (err === LOOP_CONTINUE) continue;
      throw err;
    }
  }
  return last;
}

/** `strategy.long` / `strategy.short` → "long"/"short"; other attrs are na. */
function evalAttribute(node: Attribute, env: Env): Value {
  if (node.value.kind === "Name") {
    if (node.value.id === "strategy" && (node.attr === "long" || node.attr === "short")) {
      return node.attr;
    }
    if (node.value.id === "syminfo" && (node.attr === "ticker" || node.attr === "tickerid")) {
      return env.symbol;
    }
    if (node.value.id === "timeframe" && node.attr === "period") {
      return env.timeframe ?? "";
    }
    if (node.value.id === "barstate") {
      if (node.attr === "isfirst") return env.barIndex === 0 ? 1 : 0;
      if (node.attr === "islast") return env.barIndex === env.barCount - 1 ? 1 : 0;
      if (node.attr === "ishistory") return env.barIndex < env.barCount - 1 ? 1 : 0;
      if (node.attr === "isconfirmed") return 1;
    }
  }
  return NA;
}

function evalDirection(node: expr | undefined, env: Env): string {
  if (node == null) return "long";
  if (node.kind === "Constant" && typeof node.value === "string") return node.value;
  const v = evalExpr(node, env);
  if (typeof v === "string") return v;
  const n = unwrap(v);
  if (n === 1) return "long";
  if (n === -1) return "short";
  return "long";
}

function evalId(node: expr | undefined): string {
  if (node == null) return "entry";
  if (node.kind === "Constant" && typeof node.value === "string") return node.value;
  if (node.kind === "Name") return node.id;
  return "entry";
}

function cmp(left: Cell, op: string, right: Cell): boolean | null {
  if (left == null || right == null) return null;
  switch (op) {
    case "Eq":
      return left === right;
    case "NotEq":
      return left !== right;
    case "Lt":
      return left < right;
    case "LtE":
      return left <= right;
    case "Gt":
      return left > right;
    case "GtE":
      return left >= right;
    default:
      return null;
  }
}

function evalCall(node: Call, env: Env): Value {
  const fname = callName(node);
  const site = siteKey(node, env);
  if (fname === "ta.sma" || fname === "sma") {
    return env.ta.sma(site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.ema" || fname === "ema") {
    return env.ta.ema(site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.rsi" || fname === "rsi") {
    return env.ta.rsi(site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.rma" || fname === "rma") {
    return env.ta.rma(site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.atr" || fname === "atr") {
    const period = lenArg(node, env, 0);
    return env.ta.atr(site, num(env.ctx.high), num(env.ctx.low), num(env.ctx.close), period);
  }
  if (fname === "ta.kc" || fname === "kc") {
    return evalKc(node, env, site);
  }
  if (fname === "ta.supertrend" || fname === "supertrend") {
    return evalSupertrend(node, env, site);
  }
  if (fname === "ta.tr" || fname === "tr") {
    return evalTr(node, env, site);
  }
  const extraTa = evalExtraTa(fname, node, env, site);
  if (extraTa !== undefined) return extraTa;
  const mathVal = evalMathCall(fname, node, env);
  if (mathVal !== undefined) return mathVal;
  if (isInputBuiltin(fname)) return evalInput(node, env, fname!);
  if (isRequestBuiltin(fname) || fname === "request.security") {
    return evalRequestSecurity(node, env);
  }
  const arrVal = evalArrayCall(fname, node, env);
  if (arrVal !== undefined) return arrVal;
  const colorVal = evalColorCall(fname, node, env);
  if (colorVal !== undefined) return colorVal;
  const strVal = evalStrCall(fname, node, env);
  if (strVal !== undefined) return strVal;
  if (fname === "na") {
    const v = evalExpr(callArg(node.args, 0, ["x", "source"]), env);
    if (v == null) return 1;
    if (typeof v === "number" && !Number.isFinite(v)) return 1;
    return 0;
  }
  const mapVal = evalMapCall(fname, node, env);
  if (mapVal !== undefined) return mapVal;
  const matrixVal = evalMatrixCall(fname, node, env);
  if (matrixVal !== undefined) return matrixVal;
  const drawVal = evalDrawingCall(fname, node, env);
  if (drawVal !== undefined) return drawVal;
  if (fname === "nz") {
    const v = unwrap(evalExpr(callArg(node.args, 0, ["source", "x"]), env));
    const fallback = unwrap(evalExpr(callArg(node.args, 1, ["replacement"]), env));
    return v == null ? (fallback ?? 0) : v;
  }
  if (fname === "strategy.entry") {
    const id = evalId(callArg(node.args, 0, ["id"]));
    const dir = evalDirection(callArg(node.args, 1, ["direction"]), env);
    const qtyRaw = unwrap(evalExpr(callArg(node.args, 2, ["qty"]), env));
    const book = env.book as StrategyBook & {
      fillEntry?: (bar: number, id: string, dir: string, qty: number, price: number) => void;
    };
    if (typeof book.fillEntry === "function") {
      const qty = qtyRaw == null || !Number.isFinite(qtyRaw) ? 1 : qtyRaw;
      book.fillEntry(env.barIndex, id, dir, qty, num(env.ctx.close) ?? 0);
    } else {
      env.book.entry(env.barIndex, id, dir, qtyRaw);
    }
    return NA;
  }
  if (fname === "strategy.close") {
    env.book.close(env.barIndex, evalId(callArg(node.args, 0, ["id"])));
    return NA;
  }
  if (fname === "strategy.exit") {
    env.book.exit(env.barIndex, evalId(callArg(node.args, 0, ["id"])));
    return NA;
  }
  if (fname != null) {
    const udf = env.udfs.get(fname);
    if (udf) return evalUdf(udf, node, env);
  }
  return NA;
}

function evalKc(node: Call, env: Env, site: string): Value {
  const positional = asArgs(node.args).filter((a) => a.name == null);
  let high = num(env.ctx.high);
  let low = num(env.ctx.low);
  let close = srcArg(node, env);
  let length = lenArg(node, env, 1);
  let mult = numArg(node, env, 2, ["mult", "multiplier"], 1);
  if (positional.length >= 4) {
    high = unwrap(evalExpr(positional[0]!.value, env));
    low = unwrap(evalExpr(positional[1]!.value, env));
    close = unwrap(evalExpr(positional[2]!.value, env));
    length = lenArg(node, env, 3);
    mult = numArg(node, env, 4, ["mult", "multiplier"], 1);
  }
  const kc = taKc(env, site, high, low, close, length, mult);
  return tupleOf([kc.mid, kc.up, kc.lo]);
}

function evalSupertrend(node: Call, env: Env, site: string): Value {
  const factor = numArg(node, env, 0, ["factor"], 3);
  const period = namedOrLen(node, env, 1, ["atrPeriod", "length"], 10);
  const st = taSupertrend(
    env,
    site,
    num(env.ctx.high),
    num(env.ctx.low),
    num(env.ctx.close),
    factor,
    period,
  );
  return tupleOf([st.st, st.dir]);
}

function evalTr(node: Call, env: Env, site: string): Cell {
  const positional = asArgs(node.args).filter((a) => a.name == null);
  if (positional.length >= 3) {
    return taTr(
      env,
      site,
      unwrap(evalExpr(positional[0]!.value, env)),
      unwrap(evalExpr(positional[1]!.value, env)),
      unwrap(evalExpr(positional[2]!.value, env)),
    );
  }
  return taTr(env, site, num(env.ctx.high), num(env.ctx.low), num(env.ctx.close));
}

function taKc(
  env: Env,
  site: string,
  high: Cell,
  low: Cell,
  close: Cell,
  length: number,
  mult: number,
): { mid: Cell; up: Cell; lo: Cell } {
  const fn = (env.ta as TaEngine & { kc?: TaEngine["kc"] }).kc;
  if (typeof fn === "function") return fn.call(env.ta, site, high, low, close, length, mult);
  const mid = env.ta.ema(`${site}:ema`, close, length);
  const atrVal = env.ta.atr(`${site}:atr`, high, low, close, length);
  if (mid == null) return { mid: null, up: null, lo: null };
  const width = (atrVal ?? 0) * mult;
  return { mid, up: mid + width, lo: mid - width };
}

function taSupertrend(
  env: Env,
  site: string,
  high: Cell,
  low: Cell,
  close: Cell,
  factor: number,
  atrPeriod: number,
): { st: Cell; dir: Cell } {
  const fn = (env.ta as TaEngine & { supertrend?: TaEngine["supertrend"] }).supertrend;
  if (typeof fn === "function") {
    return fn.call(env.ta, site, high, low, close, factor, atrPeriod);
  }
  const atrVal = env.ta.atr(`${site}:atr`, high, low, close, atrPeriod);
  const atrF = atrVal == null || !Number.isFinite(atrVal) ? 0 : atrVal;
  const h = high ?? 0;
  const l = low ?? 0;
  const c = close ?? h;
  const mid = (h + l) / 2;
  const upper = mid + factor * atrF;
  const lower = mid - factor * atrF;
  const dir = c >= mid ? -1 : 1;
  return { st: dir < 0 ? lower : upper, dir };
}

function taTr(env: Env, site: string, high: Cell, low: Cell, close: Cell): Cell {
  const fn = (env.ta as TaEngine & { tr?: TaEngine["tr"] }).tr;
  if (typeof fn === "function") return fn.call(env.ta, site, high, low, close);
  return env.ta.atr(site, high, low, close, 1) == null && env.barIndex === 0 ? NA : NA;
}

function num(v: Value | undefined): Cell {
  if (v === undefined) return NA;
  return unwrap(v);
}

function srcArg(node: Call, env: Env): Cell {
  return unwrap(evalExpr(callArg(node.args, 0, ["source", "series"]), env));
}

function lenArg(node: Call, env: Env, index: number): number {
  const raw = unwrap(evalExpr(callArg(node.args, index, ["length"]), env));
  return raw == null || !Number.isFinite(raw) ? 0 : raw;
}

function namedOrLen(node: Call, env: Env, index: number, names: string[], fallback: number): number {
  const raw = unwrap(evalExpr(callArg(node.args, index, names), env));
  return raw == null || !Number.isFinite(raw) ? fallback : raw;
}

function numArg(node: Call, env: Env, index: number, names: string[], fallback: number): number {
  const raw = unwrap(evalExpr(callArg(node.args, index, names), env));
  return raw == null || !Number.isFinite(raw) ? fallback : raw;
}

function unwrap(value: Value): Cell {
  if (typeof value === "number" || value === null) return value;
  return NA;
}

function isPlainInputs(extra: RuntimeOptions | InputOverrides): extra is InputOverrides {
  return !("inputs" in extra) && !("broker" in extra) && !("timeframe" in extra);
}

function mergeInputs(
  base: InputOverrides,
  extra?: RuntimeOptions | InputOverrides,
): InputOverrides {
  const more = pickInputs(extra);
  if (more == null) return base;
  return { ...base, ...more };
}

function pickInputs(extra?: RuntimeOptions | InputOverrides): InputOverrides | undefined {
  if (extra == null || typeof extra !== "object") return undefined;
  if ("inputs" in extra) {
    const nested = extra.inputs;
    if (nested != null && typeof nested === "object" && !Array.isArray(nested)) return nested;
    return undefined;
  }
  return extra as InputOverrides;
}

function packFills(book: StrategyBook): RuntimeFill[] | undefined {
  const fills = (book as StrategyBook & {
    fills?: Array<{ bar: number; id: string; side: "buy" | "sell"; qty: number; price: number }>;
  }).fills;
  if (fills == null || fills.length === 0) return undefined;
  return fills.map((f) => ({ type: "fill" as const, ...f }));
}

function packDrawings(book: DrawingBook): DrawingEvent[] | undefined {
  return book.items.length === 0 ? undefined : book.items;
}

function inputTitle(node: Call): string | null {
  const named = namedStringArg(node.args, "title");
  if (named != null) return named;
  const list = asArgs(node.args);
  let i = 0;
  for (const a of list) {
    if (a.name != null) continue;
    if (i === 1 && a.value.kind === "Constant" && typeof a.value.value === "string") {
      return a.value.value;
    }
    i++;
  }
  return null;
}

function rawArgValue(node: expr, env: Env): unknown {
  if (node.kind === "Constant") return node.value;
  const v = evalExpr(node, env);
  if (typeof v === "string") return v;
  return unwrap(v);
}

function evalInput(node: Call, env: Env, fname: string): Value {
  const title = inputTitle(node);
  const key = title ?? siteKey(node, env);
  const stored = env.inputStore.get(key);
  if (stored !== undefined) return inputAsCell(stored);

  const positional: unknown[] = [];
  const named: Record<string, unknown> = {};
  for (const a of asArgs(node.args)) {
    const raw = rawArgValue(a.value, env);
    if (a.name != null) named[a.name] = raw;
    else positional.push(raw);
  }

  let value = resolveInputDefault(fname, positional, named);
  if (title != null && env.inputs[title] !== undefined) {
    value = env.inputs[title] as InputValue;
  }
  env.inputStore.set(key, value);
  return inputAsCell(value);
}

function evalAsString(node: expr | undefined, env: Env): string | null {
  if (node == null) return null;
  if (node.kind === "Constant" && typeof node.value === "string") return node.value;
  const v = evalExpr(node, env);
  return typeof v === "string" ? v : null;
}

function evalRequestSecurity(node: Call, env: Env): Cell {
  const symbol = evalAsString(callArg(node.args, 0, ["symbol"]), env);
  const timeframe = evalAsString(callArg(node.args, 1, ["timeframe"]), env);
  const exprNode = callArg(node.args, 2, ["expression"]);
  const sameSymbolValue = unwrap(evalExpr(exprNode, env));
  return resolveSecurity(
    env.symbol,
    env.timeframe,
    { symbol, timeframe, expression: exprNode },
    sameSymbolValue,
  );
}

function evalMathCall(fname: string | null, node: Call, env: Env): Cell | undefined {
  if (fname === "math.abs" || fname === "abs") {
    return mathAbs(cellArg(node, env, 0, ["number", "x"]));
  }
  if (fname === "math.max") return mathMax(...allCellArgs(node, env));
  if (fname === "math.min") return mathMin(...allCellArgs(node, env));
  if (fname === "math.sqrt") return mathSqrt(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.log") return mathLog(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.pow") {
    return mathPow(
      cellArg(node, env, 0, ["base", "number", "x"]),
      cellArg(node, env, 1, ["exponent", "exp", "y"]),
    );
  }
  return undefined;
}

function cellArg(node: Call, env: Env, index: number, names: string[]): Cell {
  return unwrap(evalExpr(callArg(node.args, index, names), env));
}

function allCellArgs(node: Call, env: Env): Cell[] {
  return asArgs(node.args).map((a) => unwrap(evalExpr(a.value, env)));
}

function lenOrDefault(
  node: Call,
  env: Env,
  index: number,
  names: string[],
  fallback: number,
): number {
  const arg = callArg(node.args, index, names);
  if (arg == null) return fallback;
  const raw = unwrap(evalExpr(arg, env));
  return raw == null || !Number.isFinite(raw) ? fallback : raw;
}

type TaAny = TaEngine & Record<string, unknown>;

function evalExtraTa(fname: string | null, node: Call, env: Env, site: string): Value | undefined {
  const ta = env.ta as TaAny;
  if (fname === "ta.highest" || fname === "highest") {
    if (typeof ta.highest !== "function") return NA;
    return (ta.highest as TaEngine["highest"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.lowest" || fname === "lowest") {
    if (typeof ta.lowest !== "function") return NA;
    return (ta.lowest as TaEngine["lowest"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.stdev" || fname === "stdev") {
    if (typeof ta.stdev !== "function") return NA;
    return (ta.stdev as TaEngine["stdev"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.change" || fname === "change") {
    if (typeof ta.change !== "function") return NA;
    return (ta.change as TaEngine["change"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["length"], 1),
    );
  }
  if (fname === "ta.wma" || fname === "wma") {
    if (typeof ta.wma !== "function") return NA;
    return (ta.wma as TaEngine["wma"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.crossover" || fname === "crossover") {
    if (typeof ta.crossover !== "function") return NA;
    return (ta.crossover as TaEngine["crossover"]).call(
      env.ta,
      site,
      srcArg(node, env),
      unwrap(evalExpr(callArg(node.args, 1, ["source2", "b", "series2"]), env)),
    );
  }
  if (fname === "ta.crossunder" || fname === "crossunder") {
    if (typeof ta.crossunder !== "function") return NA;
    return (ta.crossunder as TaEngine["crossunder"]).call(
      env.ta,
      site,
      srcArg(node, env),
      unwrap(evalExpr(callArg(node.args, 1, ["source2", "b", "series2"]), env)),
    );
  }
  if (fname === "ta.macd" || fname === "macd") {
    if (typeof ta.macd !== "function") return NA;
    const r = (ta.macd as TaEngine["macd"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["fastlen", "fastLength", "fast"], 12),
      lenOrDefault(node, env, 2, ["slowlen", "slowLength", "slow"], 26),
      lenOrDefault(node, env, 3, ["signal", "signalLength", "siglen"], 9),
    );
    return tupleOf([r.macd, r.signal, r.hist]);
  }
  if (fname === "ta.bb" || fname === "bb") {
    if (typeof ta.bb !== "function") return NA;
    const r = (ta.bb as TaEngine["bb"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["mult", "multiplier"], 2),
    );
    return tupleOf([r.mid, r.up, r.lo]);
  }
  if (fname === "ta.sum" || fname === "sum") {
    if (typeof ta.sum !== "function") return NA;
    return (ta.sum as TaEngine["sum"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.roc" || fname === "roc") {
    if (typeof ta.roc !== "function") return NA;
    return (ta.roc as TaEngine["roc"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["length"], 1),
    );
  }
  if (fname === "ta.mom" || fname === "mom") {
    if (typeof ta.mom !== "function") return NA;
    return (ta.mom as TaEngine["mom"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["length"], 1),
    );
  }
  if (fname === "ta.vwma" || fname === "vwma") {
    if (typeof ta.vwma !== "function") return NA;
    return (ta.vwma as TaEngine["vwma"]).call(
      env.ta,
      site,
      srcArg(node, env),
      num(env.ctx.volume),
      lenArg(node, env, 1),
    );
  }
  if (fname === "ta.cci" || fname === "cci") {
    if (typeof ta.cci !== "function") return NA;
    const h = num(env.ctx.high);
    const l = num(env.ctx.low);
    const c = srcArg(node, env);
    const tp = h != null && l != null && c != null ? (h + l + c) / 3 : c;
    return (ta.cci as TaEngine["cci"]).call(env.ta, site, tp, lenArg(node, env, 1));
  }
  if (fname === "ta.willr" || fname === "willr") {
    if (typeof ta.willr !== "function") return NA;
    return (ta.willr as TaEngine["willr"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      lenArg(node, env, 0),
    );
  }
  if (fname === "ta.stoch" || fname === "stoch") {
    if (typeof ta.stoch !== "function") return NA;
    const positional = asArgs(node.args).filter((a) => a.name == null);
    const highArg = callArg(node.args, 1, ["high"]);
    if (highArg == null && positional.length <= 1) {
      return (ta.stoch as TaEngine["stoch"]).call(
        env.ta,
        site,
        num(env.ctx.close),
        num(env.ctx.high),
        num(env.ctx.low),
        lenArg(node, env, 0),
      );
    }
    return (ta.stoch as TaEngine["stoch"]).call(
      env.ta,
      site,
      srcArg(node, env),
      unwrap(evalExpr(highArg, env)),
      unwrap(evalExpr(callArg(node.args, 2, ["low"]), env)),
      lenArg(node, env, 3),
    );
  }
  if (fname === "ta.linreg" || fname === "linreg") {
    if (typeof ta.linreg !== "function") return NA;
    return (ta.linreg as TaEngine["linreg"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["offset"], 0),
    );
  }
  if (fname === "ta.vwap" || fname === "vwap") {
    if (typeof ta.vwap !== "function") return NA;
    const src = callArg(node.args, 0, ["source", "series"]);
    const source = src != null ? unwrap(evalExpr(src, env)) : hlc3(env);
    return (ta.vwap as TaEngine["vwap"]).call(env.ta, site, source, num(env.ctx.volume));
  }
  if (fname === "ta.rising" || fname === "rising") {
    if (typeof ta.rising !== "function") return NA;
    return (ta.rising as TaEngine["rising"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["length"], 1),
    );
  }
  if (fname === "ta.falling" || fname === "falling") {
    if (typeof ta.falling !== "function") return NA;
    return (ta.falling as TaEngine["falling"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["length"], 1),
    );
  }
  return undefined;
}

function hlc3(env: Env): Cell {
  const h = num(env.ctx.high);
  const l = num(env.ctx.low);
  const c = num(env.ctx.close);
  if (h == null || l == null || c == null) return c ?? h ?? l;
  return (h + l + c) / 3;
}

function asArray(value: Value): PineArray | null {
  if (value instanceof PineArray) return value;
  if (value && typeof value === "object" && "__array" in value) {
    const elts = (value as ArrayVal).elts;
    const arr = new PineArray();
    for (const e of elts) arr.push(unwrap(e));
    return arr;
  }
  return null;
}

function evalArrayCall(fname: string | null, node: Call, env: Env): Value | undefined {
  if (
    fname === "array.new_float" ||
    fname === "array.new" ||
    fname === "array.new_int"
  ) {
    const size = unwrap(evalExpr(callArg(node.args, 0, ["size"]), env)) ?? 0;
    const initial = unwrap(evalExpr(callArg(node.args, 1, ["initial_value"]), env));
    return new PineArray(size, initial);
  }
  if (fname === "array.push") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const v = unwrap(evalExpr(callArg(node.args, 1, ["value"]), env));
    arr?.push(v);
    return NA;
  }
  if (fname === "array.get") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["index"]), env));
    return arr ? arr.get(i ?? 0) : NA;
  }
  if (fname === "array.set") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["index"]), env));
    const v = unwrap(evalExpr(callArg(node.args, 2, ["value"]), env));
    if (arr && i != null) arr.set(i, v);
    return NA;
  }
  if (fname === "array.size") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.size() : NA;
  }
  if (fname === "array.pop") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.pop() : NA;
  }
  if (fname === "array.clear") {
    asArray(evalExpr(callArg(node.args, 0, ["id"]), env))?.clear();
    return NA;
  }
  return undefined;
}

function asMap(value: Value): PineMap | null {
  return value instanceof PineMap ? value : null;
}

function evalMapCall(fname: string | null, node: Call, env: Env): Value | undefined {
  if (fname === "map.new" || fname === "map.new<float,float>" || fname === "map.new_string_float") {
    return new PineMap();
  }
  if (fname === "map.put") {
    const m = asMap(evalExpr(callArg(node.args, 0, ["id"]), env));
    const key = evalExpr(callArg(node.args, 1, ["key"]), env);
    const val = unwrap(evalExpr(callArg(node.args, 2, ["value"]), env));
    m?.put(typeof key === "string" || typeof key === "number" ? key : unwrap(key), val);
    return NA;
  }
  if (fname === "map.get") {
    const m = asMap(evalExpr(callArg(node.args, 0, ["id"]), env));
    const key = evalExpr(callArg(node.args, 1, ["key"]), env);
    return m ? m.get(typeof key === "string" || typeof key === "number" ? key : unwrap(key)) : NA;
  }
  if (fname === "map.contains") {
    const m = asMap(evalExpr(callArg(node.args, 0, ["id"]), env));
    const key = evalExpr(callArg(node.args, 1, ["key"]), env);
    const ok = m?.contains(typeof key === "string" || typeof key === "number" ? key : unwrap(key));
    return ok ? 1 : 0;
  }
  if (fname === "map.size") {
    const m = asMap(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.size() : NA;
  }
  if (fname === "map.remove") {
    const m = asMap(evalExpr(callArg(node.args, 0, ["id"]), env));
    const key = evalExpr(callArg(node.args, 1, ["key"]), env);
    return m ? m.remove(typeof key === "string" || typeof key === "number" ? key : unwrap(key)) : NA;
  }
  if (fname === "map.clear") {
    asMap(evalExpr(callArg(node.args, 0, ["id"]), env))?.clear();
    return NA;
  }
  return undefined;
}

function matrixBuiltin(fname: string | null): string | null {
  if (fname == null || !fname.startsWith("matrix.")) return null;
  const lt = fname.indexOf("<");
  return lt >= 0 ? fname.slice(0, lt) : fname;
}

function asMatrix(value: Value): PineMatrix | null {
  return value instanceof PineMatrix ? value : null;
}

function isMatrixNew(name: string): boolean {
  return name === "matrix.new" || name.startsWith("matrix.new_");
}

function evalMatrixCall(fname: string | null, node: Call, env: Env): Value | undefined {
  const name = matrixBuiltin(fname);
  if (name == null) return undefined;
  if (isMatrixNew(name)) {
    const rows = unwrap(evalExpr(callArg(node.args, 0, ["rows"]), env)) ?? 0;
    const cols = unwrap(evalExpr(callArg(node.args, 1, ["columns", "cols"]), env)) ?? 0;
    const initialArg = callArg(node.args, 2, ["initial_value", "initial"]);
    const initial = initialArg == null ? undefined : unwrap(evalExpr(initialArg, env));
    return new PineMatrix(rows, cols, initial);
  }
  if (name === "matrix.get") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const row = unwrap(evalExpr(callArg(node.args, 1, ["row"]), env));
    const col = unwrap(evalExpr(callArg(node.args, 2, ["column", "col"]), env));
    return m ? m.get(row ?? 0, col ?? 0) : NA;
  }
  if (name === "matrix.set") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const row = unwrap(evalExpr(callArg(node.args, 1, ["row"]), env));
    const col = unwrap(evalExpr(callArg(node.args, 2, ["column", "col"]), env));
    const v = unwrap(evalExpr(callArg(node.args, 3, ["value"]), env));
    if (m && row != null && col != null) m.set(row, col, v);
    return NA;
  }
  if (name === "matrix.rows") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.rows() : NA;
  }
  if (name === "matrix.columns") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.columns() : NA;
  }
  if (name === "matrix.fill") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const v = unwrap(evalExpr(callArg(node.args, 1, ["value"]), env));
    m?.fill(v);
    return NA;
  }
  return undefined;
}

function evalDrawingCall(fname: string | null, node: Call, env: Env): Value | undefined {
  if (fname === "line.new") {
    return env.drawings.lineNew(env.barIndex);
  }
  if (fname === "label.new") {
    const text = evalAsString(callArg(node.args, 2, ["text"]), env);
    return env.drawings.labelNew(env.barIndex, text ?? undefined);
  }
  if (fname === "box.new") {
    return env.drawings.boxNew(env.barIndex);
  }
  if (fname === "alert") {
    const msg = evalAlertMessage(callArg(node.args, 0, ["message"]), env);
    env.drawings.alert(env.barIndex, msg);
    return NA;
  }
  return undefined;
}

function evalAlertMessage(node: expr | undefined, env: Env): string {
  if (node == null) return "";
  const v = evalExpr(node, env);
  if (typeof v === "string") return v;
  const cell = unwrap(v);
  return cell == null ? "" : String(cell);
}

function evalColorCall(fname: string | null, node: Call, env: Env): Value | undefined {
  if (fname === "color.new") {
    const raw = evalExpr(callArg(node.args, 0, ["color"]), env);
    if (typeof raw === "string") {
      const parsed = parseColor(raw);
      if (!parsed) return NA;
      const t = unwrap(evalExpr(callArg(node.args, 1, ["transp"]), env));
      return colorNew(parsed.r, parsed.g, parsed.b, t ?? undefined);
    }
    return NA;
  }
  return undefined;
}

function evalStrCall(fname: string | null, node: Call, env: Env): Value | undefined {
  if (fname === "str.tostring" || fname === "str.tostring") {
    const v = evalExpr(callArg(node.args, 0, ["value", "source"]), env);
    if (typeof v === "string") return v;
    const cell = unwrap(v);
    return strTostring(cell);
  }
  if (fname === "str.length") {
    const v = evalExpr(callArg(node.args, 0, ["string", "source"]), env);
    return strLength(typeof v === "string" ? v : null);
  }
  if (fname === "str.contains") {
    const s = evalExpr(callArg(node.args, 0, ["source"]), env);
    const sub = evalExpr(callArg(node.args, 1, ["str"]), env);
    const ok = strContains(typeof s === "string" ? s : null, typeof sub === "string" ? sub : null);
    return ok == null ? NA : ok ? 1 : 0;
  }
  if (fname === "str.upper") {
    const s = evalExpr(callArg(node.args, 0, ["source"]), env);
    return strUpper(typeof s === "string" ? s : null);
  }
  if (fname === "str.lower") {
    const s = evalExpr(callArg(node.args, 0, ["source"]), env);
    return strLower(typeof s === "string" ? s : null);
  }
  if (fname === "str.replace") {
    const s = evalExpr(callArg(node.args, 0, ["source"]), env);
    const target = evalExpr(callArg(node.args, 1, ["target"]), env);
    const repl = evalExpr(callArg(node.args, 2, ["replacement"]), env);
    const occ = unwrap(evalExpr(callArg(node.args, 3, ["occurrence"]), env));
    return strReplace(
      typeof s === "string" ? s : null,
      typeof target === "string" ? target : null,
      typeof repl === "string" ? repl : null,
      occ ?? 0,
    );
  }
  return undefined;
}

function asParams(args: Param | Param[] | null | undefined): Param[] {
  if (args == null) return [];
  return Array.isArray(args) ? args : [args];
}

function asStmts(body: stmt | stmt[] | null | undefined): stmt[] {
  if (body == null) return [];
  return Array.isArray(body) ? body : [body];
}

function registerUdf(node: FunctionDef, env: Env): void {
  if (env.barIndex !== 0) return;
  env.udfs.set(node.name, { params: asParams(node.args), body: asStmts(node.body) });
}

function evalUdf(def: UdfDef, node: Call, env: Env): Value {
  const args = asArgs(node.args);
  const bound = new Set<string>();
  const saved: Array<{ name: string; prev: Value | undefined }> = [];

  const bind = (id: string, value: Value): void => {
    if (!saved.some((s) => s.name === id)) saved.push({ name: id, prev: env.ctx[id] });
    env.ctx[id] = value;
    bound.add(id);
  };

  let pos = 0;
  for (const a of args) {
    if (a.name != null) continue;
    const p = def.params[pos++];
    if (p) bind(p.name, evalExpr(a.value, env));
  }
  for (const a of args) {
    if (a.name == null) continue;
    if (def.params.some((p) => p.name === a.name)) bind(a.name, evalExpr(a.value, env));
  }
  for (const p of def.params) {
    if (!bound.has(p.name) && p.default != null) bind(p.name, evalExpr(p.default, env));
  }

  let last: Value = NA;
  try {
    for (const s of def.body) {
      const v = execStmt(s, env);
      if (s.kind === "Expr") last = v;
    }
  } finally {
    for (let i = saved.length - 1; i >= 0; i--) {
      const { name, prev } = saved[i]!;
      if (prev === undefined) delete env.ctx[name];
      else env.ctx[name] = prev;
    }
  }
  return last;
}
