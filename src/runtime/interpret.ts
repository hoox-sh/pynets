/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Interpret host: indicator/plot, series lookback, var/:=, ta.*,
 * tuple unpack, ternary, for-to / for-in / while, switch, and/or,
 * arrays, color/str, strategy events + position series, input*, math.*,
 * request.security, UDF FunctionDef, matrix.*, extra TA, drawings/alert,
 * derived prices, calendar, Pine na-compare.
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
import { LogBook, formatLogParts, type LogRecord } from "./log.ts";
import { MemoryProvider, type BarProvider } from "./provider.ts";
import {
  TickerId,
  tickerHeikinashi,
  tickerNew,
  tickerRenko,
  tickerStandard,
} from "./ticker.ts";
import { isInputBuiltin, resolveInputDefault, inputAsCell, type InputValue } from "./input.ts";
import {
  mathAbs,
  mathAcos,
  mathAsin,
  mathAtan,
  mathAvg,
  mathCeil,
  mathCos,
  mathExp,
  mathFloor,
  mathIsFinite,
  mathLog,
  mathLog10,
  mathMax,
  mathMin,
  mathPow,
  mathRound,
  mathRoundToMintick,
  mathSign,
  mathSin,
  mathSqrt,
  mathSum,
  mathTan,
  mathToDegrees,
  mathToRadians,
} from "./math.ts";
import { utcPartsFromMs } from "./time.ts";
import { isRequestBuiltin, resolveRequest, resolveSecurity } from "./request.ts";
import { NA, PineSeries, type Cell } from "./series.ts";
import {
  strContains,
  strEndsWith,
  strFormat,
  strJoin,
  strLength,
  strLower,
  strMatch,
  strPos,
  strRepeat,
  strReplace,
  strReplaceAll,
  strSplit,
  strStartsWith,
  strSubstring,
  strToNumber,
  strTostring,
  strTrim,
  strUpper,
} from "./str.ts";
import { StrategyBook, type BrokerSettings, type StrategyEvent } from "./strategy.ts";
import { PineMap } from "./map.ts";
import { PineMatrix } from "./matrix.ts";
import { TaEngine } from "./ta.ts";

export type { DrawingEvent };

export type { StrategyEvent };

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
  logs?: LogRecord[];
  /** Titled plot series as `{ data: [{ value, time? }] }` for host/stream consumers. */
  plot_data?: Record<string, { data: Array<{ value: number | null; time?: number }> }>;
  error?: string;
  error_kind?: string;
}

/** Eval-only: Cell, tagged tuple/array, color, or strategy.long/short strings. */
type TupleVal = { __tuple: true; elts: Value[] };
type ArrayVal = { __array: true; elts: Value[] };
type Value =
  | Cell
  | TupleVal
  | ArrayVal
  | Color
  | string
  | PineArray
  | PineMap
  | PineMatrix
  | TickerId;

const LOOP_BREAK = Object.freeze({ __loop: "break" as const });
const LOOP_CONTINUE = Object.freeze({ __loop: "continue" as const });
const WHILE_CAP = 10_000;
/** Python for-to / for-in safety cap (visit_ForTo / visit_ForIn). */
const FOR_CAP = 1_000_000;

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

interface UdfSiteState {
  ctx: Record<string, Value>;
  series: Map<string, PineSeries>;
  varInited: Set<string>;
}

interface Env {
  ctx: Record<string, Value>;
  series: Map<string, PineSeries>;
  varInited: Set<string>;
  barIndex: number;
  ta: TaEngine;
  callSites: WeakMap<object, string>;
  plotKeys: WeakMap<object, string>;
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
  udfSites: Map<string, UdfSiteState>;
  frames: UdfSiteState[];
  barCount: number;
  lastBarTime: number;
  logs: LogBook;
  barTimes: number[];
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
        error: formatRunError(err),
        error_kind: "parse",
      };
    }
    const extraOpts = extra && !isPlainInputs(extra) ? extra : undefined;
    try {
      return interpretTree(tree, ohlcv, {
        symbol: this.symbol,
        inputs: mergeInputs(this.inputs, extra),
        broker: extraOpts?.broker ?? this.broker,
        timeframe: extraOpts?.timeframe ?? this.timeframe,
      });
    } catch (err) {
      return {
        series: {},
        plots: [],
        plot_meta: [],
        count: 0,
        script_name: null,
        script_type: "indicator",
        mode: "interpret",
        error: formatRunError(err),
        error_kind: "runtime",
      };
    }
  }

  /** Push-driven re-eval: each `push` runs the script on all bars so far. */
  stream(source: string): RuntimeStream {
    return new RuntimeStream(this, source);
  }

  async runProvider(
    source: string,
    provider: BarProvider,
    extra?: RuntimeOptions & { limit?: number },
  ): Promise<RuntimeResult> {
    const bars = await provider.fetch({
      symbol: this.symbol,
      timeframe: extra?.timeframe ?? this.timeframe,
      limit: extra?.limit,
    });
    return this.run(source, bars, extra);
  }
}

export type StreamEvent = "bar" | "error" | "end";

export class RuntimeStream {
  private readonly bars: OHLCVBar[] = [];
  private readonly barHandlers: Array<(out: RuntimeResult) => void> = [];
  private readonly errorHandlers: Array<(err: Error) => void> = [];
  private readonly endHandlers: Array<(out: RuntimeResult) => void> = [];
  private closed = false;

  constructor(
    private readonly runtime: Runtime,
    private readonly source: string,
  ) {}

  on(event: "bar", handler: (out: RuntimeResult) => void): this;
  on(event: "error", handler: (err: Error) => void): this;
  on(event: "end", handler: (out: RuntimeResult) => void): this;
  on(
    event: StreamEvent,
    handler: ((out: RuntimeResult) => void) | ((err: Error) => void),
  ): this {
    if (event === "bar") this.barHandlers.push(handler as (out: RuntimeResult) => void);
    else if (event === "error") this.errorHandlers.push(handler as (err: Error) => void);
    else this.endHandlers.push(handler as (out: RuntimeResult) => void);
    return this;
  }

  push(bar: OHLCVBar): RuntimeResult | undefined {
    if (this.closed) return undefined;
    this.bars.push(bar);
    try {
      const out = this.runtime.run(this.source, this.bars);
      for (const h of this.barHandlers) h(out);
      return out;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      for (const h of this.errorHandlers) h(e);
      return undefined;
    }
  }

  close(): RuntimeResult {
    this.closed = true;
    const out = this.runtime.run(this.source, this.bars);
    for (const h of this.endHandlers) h(out);
    return out;
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
    plotKeys: new WeakMap(),
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
    udfSites: new Map(),
    frames: [],
    barCount: ohlcv.length,
    lastBarTime: ohlcv.length === 0 ? 0 : (ohlcv[ohlcv.length - 1]!.time ?? (ohlcv.length - 1) * 60_000),
    logs: new LogBook(),
    barTimes: ohlcv.map((b, i) => b.time ?? i * 60_000),
  };

  const n = ohlcv.length;
  let runError: { error: string; error_kind: string } | undefined;
  try {
    for (let i = 0; i < n; i++) {
      beginBar(env, ohlcv[i]!, i);
      env.book.processPending(i, {
        open: num(env.ctx.open) ?? undefined,
        high: num(env.ctx.high) ?? undefined,
        low: num(env.ctx.low) ?? undefined,
        close: num(env.ctx.close) ?? undefined,
      });

      try {
        for (const stmt of body) {
          const decl = captureDecl(stmt);
          if (decl) {
            if (script_name == null) script_name = decl.name;
            if (decl.kind === "strategy") {
              script_type = "strategy";
              applyStrategyDecl(stmt, env);
            } else {
              applyDrawingDecl(stmt, env);
            }
            continue;
          }
          execStmt(stmt, env);
        }
      } catch (err) {
        if (err === LOOP_BREAK || err === LOOP_CONTINUE) continue;
        runError = { error: formatRunError(err), error_kind: "runtime" };
        break;
      }
    }
  } catch (err) {
    if (err !== LOOP_BREAK && err !== LOOP_CONTINUE) {
      runError = { error: formatRunError(err), error_kind: "runtime" };
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
    logs: env.logs.records.length ? env.logs.records : undefined,
    plot_data: packPlotData(plots, env.barTimes),
    ...(runError ?? {}),
  };
}

function packPlotData(
  plots: Record<string, Array<number | null>>,
  times: number[],
): Record<string, { data: Array<{ value: number | null; time?: number }> }> {
  const out: Record<string, { data: Array<{ value: number | null; time?: number }> }> = {};
  for (const [title, series] of Object.entries(plots)) {
    out[title] = {
      data: series.map((value, i) => {
        const time = times[i];
        return time == null ? { value } : { value, time };
      }),
    };
  }
  return out;
}

function pushNamedSeries(env: Env, id: string, value: Cell): void {
  env.ctx[id] = value;
  let s = env.series.get(id);
  if (!s) {
    s = new PineSeries();
    env.series.set(id, s);
  }
  s.push(value);
}

function beginBar(env: Env, bar: OHLCVBar, i: number): void {
  env.barIndex = i;
  const o = bar.open ?? 0;
  const h = bar.high ?? 0;
  const l = bar.low ?? 0;
  const c = bar.close ?? 0;
  const vol = bar.volume ?? 1;
  const t = bar.time ?? i * 60_000;
  pushNamedSeries(env, "open", o);
  pushNamedSeries(env, "high", h);
  pushNamedSeries(env, "low", l);
  pushNamedSeries(env, "close", c);
  pushNamedSeries(env, "volume", vol);
  pushNamedSeries(env, "time", t);
  env.ctx.bar_index = i;
  env.ctx.last_bar_index = env.barCount - 1;
  env.ctx.last_bar_time = env.lastBarTime;

  bindDerived(env, "hl2", (h + l) / 2);
  bindDerived(env, "hlc3", (h + l + c) / 3);
  bindDerived(env, "ohlc4", (o + h + l + c) / 4);
  bindDerived(env, "hlcc4", (h + l + c + c) / 4);

  const parts = utcPartsFromMs(t);
  env.ctx.year = parts.year;
  env.ctx.month = parts.month;
  env.ctx.dayofmonth = parts.dayofmonth;
  env.ctx.dayofweek = parts.dayofweek;
  env.ctx.hour = parts.hour;
  env.ctx.minute = parts.minute;
  env.ctx.second = parts.second;

  for (const id of env.varInited) {
    const s = env.series.get(id);
    if (s == null) continue;
    if (s.length === i) s.push(s.current);
    env.ctx[id] = s.current;
  }
}

function bindDerived(env: Env, id: string, value: Cell): void {
  env.ctx[id] = value;
  let s = env.series.get(id);
  if (!s) {
    s = new PineSeries();
    env.series.set(id, s);
  }
  if (s.length === env.barIndex) s.push(value);
  else if (s.length === env.barIndex + 1) s.setCurrent(value);
  else {
    while (s.length < env.barIndex) s.push(NA);
    s.push(value);
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

/** ASDL `Arg.name`, plus assign-like / keyword aliases if the builder omitted `name`. */
function argKeyword(a: Arg): string | null {
  if (a.name != null && a.name !== "") return a.name;
  const extra = a as Arg & { arg?: unknown; keyword?: unknown };
  if (typeof extra.arg === "string" && extra.arg !== "") return extra.arg;
  if (typeof extra.keyword === "string" && extra.keyword !== "") return extra.keyword;
  const rec = recoverAssignLike(a);
  return rec?.name ?? null;
}

function recoverAssignLike(a: Arg): { name: string; value: expr } | null {
  if (a.name != null && a.name !== "") return null;
  const v = a.value as unknown as {
    kind?: string;
    target?: { kind?: string; id?: string };
    value?: expr | null;
  };
  if ((v.kind === "Assign" || v.kind === "ReAssign") && v.target?.kind === "Name" && v.value != null) {
    return { name: v.target.id!, value: v.value };
  }
  return null;
}

function argValue(a: Arg): expr {
  return recoverAssignLike(a)?.value ?? a.value;
}

function namedStringArg(args: Arg[] | Arg | null | undefined, name: string): string | null {
  for (const a of asArgs(args)) {
    if (argKeyword(a) !== name) continue;
    const v = argValue(a);
    if (v.kind === "Constant" && typeof v.value === "string") return v.value;
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
    const kw = argKeyword(a);
    if (kw != null && names.includes(kw)) return argValue(a);
  }
  let i = 0;
  for (const a of list) {
    if (argKeyword(a) != null) continue;
    if (i === index) return a.value;
    i++;
  }
  return undefined;
}

function defaultPlotTitle(fname: string): string {
  if (fname === "hline") return "hline";
  if (fname === "plotshape") return "shape";
  if (fname === "plotchar") return "char";
  if (fname === "plotarrow") return "arrow";
  if (fname === "bgcolor") return "bgcolor";
  if (fname === "barcolor") return "barcolor";
  return "plot";
}

function resolvePlotTitle(args: Arg[], fname: string): string {
  const named = namedStringArg(args, "title");
  if (named != null) {
    const t = named.trim();
    if (t) return t;
  }
  const positional: Arg[] = [];
  for (const a of args) {
    if (argKeyword(a) != null) continue;
    positional.push(a);
  }
  if (positional.length > 1) {
    const second = argValue(positional[1]!);
    if (second.kind === "Constant" && typeof second.value === "string") {
      const t = second.value.trim();
      if (t) return t;
    }
  }
  const after = firstStringArg(args.slice(1));
  if (after != null) {
    const t = after.trim();
    if (t) return t;
  }
  return defaultPlotTitle(fname);
}

function uniquifyPlotKey(env: Env, node: object, title: string): string {
  const existing = env.plotKeys.get(node);
  if (existing != null) return existing;
  const base = title.trim() || "plot";
  let key = base;
  let n = 2;
  while (Object.prototype.hasOwnProperty.call(env.plots, key)) {
    key = `${base}_${n++}`;
  }
  env.plotKeys.set(node, key);
  return key;
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
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function activeFrame(env: Env): UdfSiteState | null {
  return env.frames.length > 0 ? env.frames[env.frames.length - 1]! : null;
}

function varSet(env: Env): Set<string> {
  return activeFrame(env)?.varInited ?? env.varInited;
}

function ctxGet(env: Env, id: string): Value | undefined {
  for (let i = env.frames.length - 1; i >= 0; i--) {
    const ctx = env.frames[i]!.ctx;
    if (Object.prototype.hasOwnProperty.call(ctx, id)) return ctx[id];
  }
  if (Object.prototype.hasOwnProperty.call(env.ctx, id)) return env.ctx[id];
  return undefined;
}

function seriesGet(env: Env, id: string): PineSeries | undefined {
  for (let i = env.frames.length - 1; i >= 0; i--) {
    const s = env.frames[i]!.series.get(id);
    if (s) return s;
  }
  return env.series.get(id);
}

function bindName(env: Env, id: string, value: Value): void {
  const stored: Value = typeof value === "number" && !Number.isFinite(value) ? NA : value;
  const frame = activeFrame(env);
  const ctx = frame ? frame.ctx : env.ctx;
  const seriesMap = frame ? frame.series : env.series;
  ctx[id] = stored;
  if (!isCell(stored)) return;
  let s = seriesMap.get(id);
  if (!s) {
    s = new PineSeries();
    seriesMap.set(id, s);
  }
  if (s.length === env.barIndex + 1) s.setCurrent(stored);
  else {
    while (s.length < env.barIndex) s.push(NA);
    s.push(stored);
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

function evalAssign(stmt: Assign, env: Env): Value {
  if (stmt.value == null) return NA;
  const inited = varSet(env);
  if (stmt.target.kind === "Tuple") {
    if (isVarMode(stmt)) {
      const already =
        stmt.target.elts.some((e) => e.kind === "Name" && inited.has(e.id)) ||
        (env.barIndex !== 0 &&
          stmt.target.elts.some((e) => e.kind === "Name" && ctxGet(env, e.id) !== undefined));
      if (already) {
        for (const e of stmt.target.elts) {
          if (e.kind === "Name") inited.add(e.id);
        }
        return NA;
      }
    }
    const packed = evalExpr(stmt.value, env);
    unpackTuple(stmt.target, packed, env);
    if (isVarMode(stmt)) {
      for (const e of stmt.target.elts) {
        if (e.kind === "Name") inited.add(e.id);
      }
    }
    return packed;
  }
  if (stmt.target.kind !== "Name") return NA;
  const id = stmt.target.id;
  // var: init on first execution (bar_index==0, or first time the name is missing).
  if (isVarMode(stmt) && (inited.has(id) || (env.barIndex !== 0 && ctxGet(env, id) !== undefined))) {
    inited.add(id);
    const cur = ctxGet(env, id);
    return cur === undefined ? NA : cur;
  }
  const value = evalExpr(stmt.value, env);
  bindName(env, id, value);
  if (isVarMode(stmt)) inited.add(id);
  return value;
}

function evalReAssign(stmt: ReAssign, env: Env): Value {
  if (stmt.target.kind === "Tuple") {
    const packed = evalExpr(stmt.value, env);
    unpackTuple(stmt.target, packed, env);
    return packed;
  }
  if (stmt.target.kind !== "Name") return NA;
  const value = evalExpr(stmt.value, env);
  bindName(env, stmt.target.id, value);
  return value;
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
  const capital = unwrap(evalExpr(callArg(stmt.value.args, -1, ["initial_capital"]), env));
  if (capital != null && Number.isFinite(capital)) env.book.initialCapital = capital;
  applyDrawingDecl(stmt, env);
}

function applyDrawingDecl(stmt: { kind: string; value?: expr | null }, env: Env): void {
  if (stmt.kind !== "Expr" || stmt.value?.kind !== "Call") return;
  const lines = unwrap(evalExpr(callArg(stmt.value.args, -1, ["max_lines_count"]), env));
  const labels = unwrap(evalExpr(callArg(stmt.value.args, -1, ["max_labels_count"]), env));
  const boxes = unwrap(evalExpr(callArg(stmt.value.args, -1, ["max_boxes_count"]), env));
  const polylines = unwrap(evalExpr(callArg(stmt.value.args, -1, ["max_polylines_count"]), env));
  if (lines == null && labels == null && boxes == null && polylines == null) return;
  env.drawings.configure({
    max_lines_count: lines ?? undefined,
    max_labels_count: labels ?? undefined,
    max_boxes_count: boxes ?? undefined,
    max_polylines_count: polylines ?? undefined,
  });
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
    return evalAssign(stmt as Assign, env);
  }
  if (stmt.kind === "ReAssign") {
    return evalReAssign(stmt as ReAssign, env);
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
    if (
      fname === "plot" ||
      fname === "plotshape" ||
      fname === "hline" ||
      fname === "plotchar" ||
      fname === "plotarrow" ||
      fname === "bgcolor" ||
      fname === "barcolor"
    ) {
      const plotArgs = asArgs(value.args);
      const title = resolvePlotTitle(plotArgs, fname);
      const key = uniquifyPlotKey(env, value, title);
      const seriesExpr = callArg(value.args, 0, ["series", "source"]) ?? plotArgs[0]?.value;
      const cell = unwrap(evalExpr(seriesExpr, env));
      if (!env.plots[key]) {
        env.plots[key] = [];
        env.plot_meta.push({ title: key });
      }
      const dest = env.plots[key]!;
      while (dest.length < env.barIndex) dest.push(null);
      dest.push(cell);
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
      const v = ctxGet(env, node.id);
      return v === undefined ? NA : v;
    }
    case "Constant": {
      const v = node.value;
      if (typeof v === "number") return Number.isFinite(v) ? v : NA;
      if (typeof v === "string") return v;
      if (v === true) return 1;
      if (v === false) return 0;
      return NA;
    }
    case "BinOp": {
      const leftV = evalExpr(node.left, env);
      const rightV = evalExpr(node.right, env);
      if (node.op.kind === "Add" && (typeof leftV === "string" || typeof rightV === "string")) {
        return stringifyVal(leftV) + stringifyVal(rightV);
      }
      const l = unwrap(leftV);
      const r = unwrap(rightV);
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
      if (node.op.kind === "Not") return isTruthy(v) ? 0 : 1;
      if (v == null) return NA;
      if (node.op.kind === "USub") return -v;
      if (node.op.kind === "UAdd") return v;
      if (node.op.kind === "Invert") return ~Math.trunc(v);
      return NA;
    }
    case "Subscript": {
      const raw = unwrap(evalExpr(node.slice ?? undefined, env));
      if (raw == null || !Number.isFinite(raw)) return NA;
      const offset = Math.trunc(raw);
      if (offset < 0) return NA;
      if (node.value.kind === "Name") {
        const s = seriesGet(env, node.value.id);
        if (s) return s.get(offset);
      }
      return NA;
    }
    case "Call":
      return evalCall(node, env);
    case "Compare": {
      let left = evalExpr(node.left, env);
      for (let i = 0; i < node.ops.length; i++) {
        const right = evalExpr(node.comparators[i], env);
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
  let step: number;
  if (node.step != null) {
    const stepV = unwrap(evalExpr(node.step, env));
    if (stepV == null || !Number.isFinite(stepV) || stepV === 0) return NA;
    step = Math.trunc(stepV);
    if (step === 0) return NA;
  } else {
    // Pine / Python: omitted `by` is +1 when from <= to, else -1.
    step = startV <= endV ? 1 : -1;
  }
  const start = Math.trunc(startV);
  const end = Math.trunc(endV);
  const target = node.target.kind === "Name" ? node.target.id : null;
  let last: Value = NA;
  let n = 0;
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
      if (++n > FOR_CAP) break;
      if (run(i) === "break") break;
    }
  } else {
    for (let i = start; i >= end; i += step) {
      if (++n > FOR_CAP) break;
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
  const subject = subjectPresent ? evalExpr(node.subject!, env) : null;
  for (const c of cases) {
    if (c.pattern == null) return execBlock(c.body, env);
    if (subjectPresent) {
      const pat = evalExpr(c.pattern, env);
      if (valuesEq(pat, subject)) return execBlock(c.body, env);
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
  const limit = Math.min(items.length, FOR_CAP);
  for (let i = 0; i < limit; i++) {
    const item = items[i]!;
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
    if (node.value.id === "strategy") {
      if (node.attr === "long" || node.attr === "short") return node.attr;
      if (node.attr === "position_size") return env.book.position.qty;
      if (node.attr === "position_avg_price") return env.book.position.avgPrice;
      if (node.attr === "netprofit") return env.book.realizedPnl;
      if (node.attr === "openprofit") {
        const q = env.book.position.qty;
        const avg = env.book.position.avgPrice;
        const mark = num(env.ctx.close);
        if (q === 0 || avg == null || mark == null) return 0;
        return q * (mark - avg);
      }
      if (node.attr === "equity") return env.book.equity(num(env.ctx.close) ?? 0);
      if (node.attr === "opentrades") return env.book.position.qty === 0 ? 0 : 1;
      if (node.attr === "closedtrades") return env.book.closedCount;
      if (node.attr === "initial_capital") return env.book.initialCapital;
      if (node.attr === "commission") return 0;
    }
    if (node.value.id === "syminfo") {
      if (node.attr === "ticker" || node.attr === "tickerid") return env.symbol;
      if (node.attr === "timezone") return "Etc/UTC";
      if (node.attr === "currency") return "USD";
      if (node.attr === "mintick") return 0.01;
      if (node.attr === "type") return "stock";
    }
    if (node.value.id === "timeframe") {
      if (node.attr === "period") return env.timeframe ?? "";
      if (node.attr === "multiplier") return timeframeMultiplier(env.timeframe);
      if (node.attr === "isintraday") {
        const p = env.timeframe ?? "";
        return p === "" || /[SHm]/.test(p) || /^\d+$/.test(p) ? 1 : 0;
      }
    }
    if (node.value.id === "barstate") {
      const last = env.barIndex === env.barCount - 1;
      if (node.attr === "isfirst") return env.barIndex === 0 ? 1 : 0;
      if (node.attr === "islast") return last ? 1 : 0;
      if (node.attr === "ishistory") return last ? 0 : 1;
      if (node.attr === "isconfirmed") return 1;
      if (node.attr === "isnew") return 1;
      if (node.attr === "isrealtime") return 0;
      if (node.attr === "islastconfirmedhistory") return last ? 1 : 0;
    }
    if (node.value.id === "session") {
      if (node.attr === "regular") return "regular";
      if (node.attr === "extended") return "extended";
      if (node.attr === "ismarket") return 1;
      if (node.attr === "ispremarket" || node.attr === "ispostmarket") return 0;
      if (node.attr === "isfirstbar" || node.attr === "isfirstbar_regular") {
        return env.barIndex === 0 ? 1 : 0;
      }
      if (node.attr === "islastbar" || node.attr === "islastbar_regular") {
        return env.barIndex === env.barCount - 1 ? 1 : 0;
      }
    }
    if (node.value.id === "chart") {
      if (node.attr === "is_heikinashi" || node.attr === "is_renko" || node.attr === "is_kagi") {
        return 0;
      }
      if (node.attr === "fg_color") return "#ffffff";
      if (node.attr === "bg_color") return "#131722";
    }
    if (node.value.id === "ta") {
      const taAttr = evalTaAttr(node.attr, env);
      if (taAttr !== undefined) return taAttr;
    }
  }
  return NA;
}

function evalTaAttr(attr: string, env: Env): Value | undefined {
  const ta = env.ta;
  const site = `attr:ta.${attr}`;
  if (attr === "accdist" || attr === "ad") {
    return ta.accdist(
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      num(env.ctx.volume),
    );
  }
  if (attr === "obv" && typeof ta.obv === "function") {
    return (ta.obv as TaEngine["obv"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  if (attr === "tr" && typeof ta.tr === "function") {
    return (ta.tr as TaEngine["tr"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
    );
  }
  if (attr === "vwap" && typeof ta.vwap === "function") {
    const h = num(env.ctx.high);
    const l = num(env.ctx.low);
    const c = num(env.ctx.close);
    const src = h != null && l != null && c != null ? (h + l + c) / 3 : c;
    return (ta.vwap as TaEngine["vwap"]).call(env.ta, site, src, num(env.ctx.volume));
  }
  if (attr === "pvt" && typeof ta.pvt === "function") {
    return (ta.pvt as TaEngine["pvt"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  if (attr === "nvi" && typeof ta.nvi === "function") {
    return (ta.nvi as TaEngine["nvi"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  if (attr === "pvi" && typeof ta.pvi === "function") {
    return (ta.pvi as TaEngine["pvi"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  return undefined;
}

function timeframeMultiplier(period: string | null): number {
  if (period == null || period === "") return 1;
  const m = period.match(/^(\d+)/);
  return m ? Number(m[1]) : 1;
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

function stringifyVal(value: Value): string {
  if (typeof value === "string") return value;
  if (value instanceof TickerId) return value.toString();
  const cell = unwrap(value);
  return cell == null ? "na" : String(cell);
}

function isNaVal(value: Value): boolean {
  if (value == null) return true;
  if (typeof value === "number") return !Number.isFinite(value);
  return false;
}

function valuesEq(left: Value, right: Value): boolean {
  if (isNaVal(left) && isNaVal(right)) return true;
  if (isNaVal(left) || isNaVal(right)) return false;
  if (typeof left === "string" || typeof right === "string") return left === right;
  if (typeof left === "number" && typeof right === "number") return left === right;
  return left === right;
}

function cmp(left: Value, op: string, right: Value): boolean | null {
  const lNa = isNaVal(left);
  const rNa = isNaVal(right);
  switch (op) {
    case "Eq":
      return valuesEq(left, right);
    case "NotEq":
      // Python compile `numba_pine_ne`: any comparison involving na is False.
      if (lNa || rNa) return false;
      return !valuesEq(left, right);
    case "Lt":
    case "LtE":
    case "Gt":
    case "GtE": {
      const l = unwrap(left);
      const r = unwrap(right);
      if (l == null || r == null) return false;
      if (op === "Lt") return l < r;
      if (op === "LtE") return l <= r;
      if (op === "Gt") return l > r;
      return l >= r;
    }
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
    return evalRequestCall(fname!, node, env);
  }
  const arrVal = evalArrayCall(fname, node, env);
  if (arrVal !== undefined) return arrVal;
  const colorVal = evalColorCall(fname, node, env);
  if (colorVal !== undefined) return colorVal;
  const strVal = evalStrCall(fname, node, env);
  if (strVal !== undefined) return strVal;
  if (fname === "na") {
    const arg = callArg(node.args, 0, ["x", "source"]);
    if (arg == null) return NA;
    return isNaVal(evalExpr(arg, env)) ? 1 : 0;
  }
  if (fname === "iff") {
    const t = unwrap(evalExpr(callArg(node.args, 0, ["condition", "cond"]), env));
    if (t == null) return NA;
    return isTruthy(t)
      ? evalExpr(callArg(node.args, 1, ["then", "if_true"]), env)
      : evalExpr(callArg(node.args, 2, ["else", "if_false"]), env);
  }
  if (fname === "fixnan") {
    const v = unwrap(evalExpr(callArg(node.args, 0, ["source", "x"]), env));
    return v == null ? 0 : v;
  }
  if (fname === "int") {
    const v = unwrap(evalExpr(callArg(node.args, 0, ["x", "source"]), env));
    return v == null ? NA : Math.trunc(v);
  }
  if (fname === "float") {
    return unwrap(evalExpr(callArg(node.args, 0, ["x", "source"]), env));
  }
  if (fname === "bool") {
    const v = unwrap(evalExpr(callArg(node.args, 0, ["x", "source"]), env));
    return isTruthy(v) ? 1 : 0;
  }
  if (fname === "string" || fname === "str") {
    return stringifyVal(evalExpr(callArg(node.args, 0, ["x", "source"]), env));
  }
  if (fname === "log.info" || fname === "log.warning" || fname === "log.error") {
    const parts = asArgs(node.args).map((a) => {
      const v = evalExpr(a.value, env);
      if (v instanceof TickerId) return v.toString();
      return typeof v === "string" ? v : unwrap(v);
    });
    const msg = formatLogParts(parts);
    if (fname === "log.info") env.logs.info(env.barIndex, msg);
    else if (fname === "log.warning") env.logs.warning(env.barIndex, msg);
    else env.logs.error(env.barIndex, msg);
    return NA;
  }
  if (fname === "runtime.error") {
    const parts = asArgs(node.args).map((a) => {
      const v = evalExpr(a.value, env);
      return typeof v === "string" ? v : unwrap(v);
    });
    throw new Error(formatLogParts(parts) || "runtime.error");
  }
  if (fname === "ticker.new") {
    const sym = evalAsString(callArg(node.args, 0, ["symbol"]), env) ?? env.symbol;
    const session = evalAsString(callArg(node.args, 1, ["session"]), env) ?? undefined;
    return tickerNew(sym, session);
  }
  if (fname === "ticker.heikinashi") {
    const raw = evalExpr(callArg(node.args, 0, ["symbol"]), env);
    const sym = raw instanceof TickerId ? raw.symbol : (typeof raw === "string" ? raw : env.symbol);
    return tickerHeikinashi(sym);
  }
  if (fname === "ticker.standard") {
    const raw = evalExpr(callArg(node.args, 0, ["symbol"]), env);
    const sym = raw instanceof TickerId ? raw.symbol : (typeof raw === "string" ? raw : env.symbol);
    return tickerStandard(sym);
  }
  if (fname === "ticker.renko") {
    const raw = evalExpr(callArg(node.args, 0, ["symbol"]), env);
    const sym = raw instanceof TickerId ? raw.symbol : (typeof raw === "string" ? raw : env.symbol);
    return tickerRenko(sym);
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
    const qtyArg = callArg(node.args, 2, ["qty"]);
    const qtyRaw = qtyArg == null ? 1 : unwrap(evalExpr(qtyArg, env));
    const qty = qtyRaw == null || !Number.isFinite(qtyRaw) ? Number.NaN : qtyRaw;
    const limit = unwrap(evalExpr(callArg(node.args, -1, ["limit"]), env));
    const stop = unwrap(evalExpr(callArg(node.args, -1, ["stop"]), env));
    const mark = num(env.ctx.close);
    env.book.placeEntry(env.barIndex, id, dir, qty, {
      limit,
      stop,
      price: mark == null || !Number.isFinite(mark) ? undefined : mark,
    });
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
  if (fname === "strategy.close_all") {
    env.book.closeAll(env.barIndex, num(env.ctx.close) ?? undefined);
    return NA;
  }
  if (fname === "strategy.cancel") {
    env.book.cancel(env.barIndex, evalId(callArg(node.args, 0, ["id"])));
    return NA;
  }
  if (fname === "strategy.cancel_all") {
    env.book.cancelAll(env.barIndex);
    return NA;
  }
  if (fname != null) {
    const udf = env.udfs.get(fname);
    if (udf) return evalUdf(udf, node, env);
  }
  return NA;
}

function evalKc(node: Call, env: Env, site: string): Value {
  const positional = asArgs(node.args).filter((a) => argKeyword(a) == null);
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
  const positional = asArgs(node.args).filter((a) => argKeyword(a) == null);
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
  if (value == null) return NA;
  if (typeof value === "number") return Number.isFinite(value) ? value : NA;
  // Objects (PineArray / Matrix / Color / tuples) are not cells — not na.
  return NA;
}

function formatRunError(err: unknown): string {
  if (err instanceof Error) {
    const msg = (err.message || err.name || "runtime error").split("\n")[0]!.trim();
    return msg || "runtime error";
  }
  if (typeof err === "string") {
    const msg = err.split("\n")[0]!.trim();
    return msg || "runtime error";
  }
  return "runtime error";
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
    if (argKeyword(a) != null) continue;
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
    const raw = rawArgValue(argValue(a), env);
    const kw = argKeyword(a);
    if (kw != null) named[kw] = raw;
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

function evalRequestCall(fname: string, node: Call, env: Env): Cell {
  if (fname === "request.security" || fname === "request.security_lower_tf") {
    return evalRequestSecurity(node, env);
  }
  const host = { symbol: env.symbol, timeframe: env.timeframe };
  if (fname === "request.currency_rate") {
    const from = evalAsString(callArg(node.args, 0, ["from", "from_currency"]), env);
    const to = evalAsString(callArg(node.args, 1, ["to", "to_currency"]), env);
    const v = resolveRequest(fname, host, { from, to });
    return typeof v === "number" || v === null ? v : NA;
  }
  if (fname === "request.seed") {
    const seed = unwrap(evalExpr(callArg(node.args, 0, ["seed"]), env));
    const v = resolveRequest(fname, host, { seed });
    return typeof v === "number" || v === null ? v : NA;
  }
  const v = resolveRequest(fname, host, {});
  return typeof v === "number" || v === null ? v : NA;
}

function evalMathCall(fname: string | null, node: Call, env: Env): Cell | undefined {
  if (fname === "math.abs" || fname === "abs") {
    return mathAbs(cellArg(node, env, 0, ["number", "x"]));
  }
  if (fname === "math.max" || fname === "max") return mathMax(...allCellArgs(node, env));
  if (fname === "math.min" || fname === "min") return mathMin(...allCellArgs(node, env));
  if (fname === "math.sqrt" || fname === "sqrt") return mathSqrt(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.log" || fname === "log") return mathLog(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.log10" || fname === "log10") return mathLog10(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.exp" || fname === "exp") return mathExp(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.pow" || fname === "pow") {
    return mathPow(
      cellArg(node, env, 0, ["base", "number", "x"]),
      cellArg(node, env, 1, ["exponent", "exp", "y"]),
    );
  }
  if (fname === "math.round" || fname === "round") {
    const prec = callArg(node.args, 1, ["precision"]);
    return mathRound(cellArg(node, env, 0, ["number", "x"]), prec == null ? undefined : unwrap(evalExpr(prec, env)));
  }
  if (fname === "math.floor" || fname === "floor") return mathFloor(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.ceil" || fname === "ceil") return mathCeil(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.sign" || fname === "sign") return mathSign(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.avg" || fname === "avg") return mathAvg(...allCellArgs(node, env));
  if (fname === "math.sum") {
    const first = evalExpr(callArg(node.args, 0, ["source", "id", "array"]), env);
    const arr = asArray(first);
    if (arr) return arr.sum();
    return mathSum(...allCellArgs(node, env));
  }
  if (fname === "math.sin" || fname === "sin") return mathSin(cellArg(node, env, 0, ["angle", "x"]));
  if (fname === "math.cos" || fname === "cos") return mathCos(cellArg(node, env, 0, ["angle", "x"]));
  if (fname === "math.tan" || fname === "tan") return mathTan(cellArg(node, env, 0, ["angle", "x"]));
  if (fname === "math.asin" || fname === "asin") return mathAsin(cellArg(node, env, 0, ["x"]));
  if (fname === "math.acos" || fname === "acos") return mathAcos(cellArg(node, env, 0, ["x"]));
  if (fname === "math.atan" || fname === "atan") return mathAtan(cellArg(node, env, 0, ["x"]));
  if (fname === "math.todegrees") return mathToDegrees(cellArg(node, env, 0, ["radians", "x"]));
  if (fname === "math.toradians") return mathToRadians(cellArg(node, env, 0, ["degrees", "x"]));
  if (fname === "math.isfinite") return mathIsFinite(cellArg(node, env, 0, ["number", "x"]));
  if (fname === "math.round_to_mintick") {
    const tick = typeof env.ctx["syminfo.mintick"] === "number" ? (env.ctx["syminfo.mintick"] as number) : 0.01;
    return mathRoundToMintick(cellArg(node, env, 0, ["number", "x"]), tick);
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
  if (fname === "ta.wpr" || fname === "wpr") {
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
    const positional = asArgs(node.args).filter((a) => argKeyword(a) == null);
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
  if (fname === "ta.cross" || fname === "cross") {
    if (typeof ta.cross !== "function") return NA;
    return (ta.cross as TaEngine["cross"]).call(
      env.ta,
      site,
      srcArg(node, env),
      unwrap(evalExpr(callArg(node.args, 1, ["source2", "b", "series2"]), env)),
    );
  }
  if (fname === "ta.bbw" || fname === "bbw") {
    if (typeof ta.bbw !== "function") return NA;
    return (ta.bbw as TaEngine["bbw"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["mult", "multiplier"], 2),
    );
  }
  if (fname === "ta.dema" || fname === "dema") {
    if (typeof ta.dema !== "function") return NA;
    return (ta.dema as TaEngine["dema"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.tema" || fname === "tema") {
    if (typeof ta.tema !== "function") return NA;
    return (ta.tema as TaEngine["tema"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.highestbars" || fname === "highestbars") {
    if (typeof ta.highestbars !== "function") return NA;
    return (ta.highestbars as TaEngine["highestbars"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
    );
  }
  if (fname === "ta.lowestbars" || fname === "lowestbars") {
    if (typeof ta.lowestbars !== "function") return NA;
    return (ta.lowestbars as TaEngine["lowestbars"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
    );
  }
  if (fname === "ta.alma" || fname === "alma") {
    if (typeof ta.alma !== "function") return NA;
    return (ta.alma as TaEngine["alma"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["offset"], 0.85),
      lenOrDefault(node, env, 3, ["sigma"], 6),
    );
  }
  if (fname === "ta.cmo" || fname === "cmo") {
    if (typeof ta.cmo !== "function") return NA;
    return (ta.cmo as TaEngine["cmo"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.kama" || fname === "kama") {
    if (typeof ta.kama !== "function") return NA;
    return (ta.kama as TaEngine["kama"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["fastLength", "fast", "fastlen"], 2),
      lenOrDefault(node, env, 3, ["slowLength", "slow", "slowlen"], 30),
    );
  }
  if (fname === "ta.accdist" || fname === "accdist" || fname === "ta.ad" || fname === "ad") {
    const hArg = callArg(node.args, 0, ["high"]);
    const lArg = callArg(node.args, 1, ["low"]);
    const cArg = callArg(node.args, 2, ["close"]);
    const vArg = callArg(node.args, 3, ["volume"]);
    return env.ta.accdist(
      site,
      hArg == null ? num(env.ctx.high) : unwrap(evalExpr(hArg, env)),
      lArg == null ? num(env.ctx.low) : unwrap(evalExpr(lArg, env)),
      cArg == null ? num(env.ctx.close) : unwrap(evalExpr(cArg, env)),
      vArg == null ? num(env.ctx.volume) : unwrap(evalExpr(vArg, env)),
    );
  }
  if (fname === "ta.obv" || fname === "obv") {
    if (typeof ta.obv !== "function") return NA;
    const cArg = callArg(node.args, 0, ["source", "close"]);
    const vArg = callArg(node.args, 1, ["volume"]);
    const close = cArg == null ? num(env.ctx.close) : unwrap(evalExpr(cArg, env));
    const volume = vArg == null ? num(env.ctx.volume) : unwrap(evalExpr(vArg, env));
    return (ta.obv as TaEngine["obv"]).call(env.ta, site, close, volume);
  }
  if (fname === "ta.pivothigh" || fname === "pivothigh") {
    if (typeof ta.pivothigh !== "function") return NA;
    return (ta.pivothigh as TaEngine["pivothigh"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["leftbars", "left"], 5),
      lenOrDefault(node, env, 2, ["rightbars", "right"], 5),
    );
  }
  if (fname === "ta.pivotlow" || fname === "pivotlow") {
    if (typeof ta.pivotlow !== "function") return NA;
    return (ta.pivotlow as TaEngine["pivotlow"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 1, ["leftbars", "left"], 5),
      lenOrDefault(node, env, 2, ["rightbars", "right"], 5),
    );
  }
  if (fname === "ta.hma" || fname === "hma") {
    if (typeof ta.hma !== "function") return NA;
    return (ta.hma as TaEngine["hma"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.mfi" || fname === "mfi") {
    if (typeof ta.mfi !== "function") return NA;
    const positional = asArgs(node.args).filter((a) => a.name == null);
    if (positional.length <= 1) {
      return (ta.mfi as TaEngine["mfi"]).call(
        env.ta,
        site,
        num(env.ctx.high),
        num(env.ctx.low),
        num(env.ctx.close),
        num(env.ctx.volume),
        lenArg(node, env, 0),
      );
    }
    if (positional.length === 2) {
      return (ta.mfi as TaEngine["mfi"]).call(
        env.ta,
        site,
        srcArg(node, env),
        srcArg(node, env),
        srcArg(node, env),
        num(env.ctx.volume),
        lenArg(node, env, 1),
      );
    }
    return (ta.mfi as TaEngine["mfi"]).call(
      env.ta,
      site,
      unwrap(evalExpr(callArg(node.args, 0, ["high"]), env)),
      unwrap(evalExpr(callArg(node.args, 1, ["low"]), env)),
      unwrap(evalExpr(callArg(node.args, 2, ["close"]), env)),
      unwrap(evalExpr(callArg(node.args, 3, ["volume"]), env)),
      lenArg(node, env, 4),
    );
  }
  if (fname === "ta.sar" || fname === "sar") {
    if (typeof ta.sar !== "function") return NA;
    return (ta.sar as TaEngine["sar"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      lenOrDefault(node, env, 0, ["start"], 0.02),
      lenOrDefault(node, env, 1, ["increment"], 0.02),
      lenOrDefault(node, env, 2, ["maximum", "max"], 0.2),
    );
  }
  if (fname === "ta.dmi" || fname === "dmi") {
    if (typeof ta.dmi !== "function") return NA;
    const r = (ta.dmi as TaEngine["dmi"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      lenOrDefault(node, env, 0, ["diLength", "length"], 14),
      lenOrDefault(node, env, 1, ["adxSmoothing", "adxlen"], 14),
    );
    return tupleOf([r.plus, r.minus, r.adx]);
  }
  if (fname === "ta.adx" || fname === "adx") {
    if (typeof ta.adx !== "function") return NA;
    return (ta.adx as TaEngine["adx"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      lenOrDefault(node, env, 0, ["length"], 14),
    );
  }
  if (fname === "ta.correlation" || fname === "correlation") {
    if (typeof ta.correlation !== "function") return NA;
    return (ta.correlation as TaEngine["correlation"]).call(
      env.ta,
      site,
      srcArg(node, env),
      unwrap(evalExpr(callArg(node.args, 1, ["source2", "b", "series2"]), env)),
      lenArg(node, env, 2),
    );
  }
  if (fname === "ta.swma" || fname === "swma") {
    if (typeof ta.swma !== "function") return NA;
    const len = callArg(node.args, 1, ["length"]);
    return (ta.swma as TaEngine["swma"]).call(
      env.ta,
      site,
      srcArg(node, env),
      len == null ? undefined : lenArg(node, env, 1),
    );
  }
  if (fname === "ta.cog" || fname === "cog") {
    if (typeof ta.cog !== "function") return NA;
    return (ta.cog as TaEngine["cog"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.tsi" || fname === "tsi") {
    if (typeof ta.tsi !== "function") return NA;
    const positional = asArgs(node.args).filter((a) => a.name == null);
    if (positional.length === 2) {
      return (ta.tsi as TaEngine["tsi"]).call(
        env.ta,
        site,
        num(env.ctx.close),
        lenOrDefault(node, env, 1, ["long", "long_length"], 25),
        lenOrDefault(node, env, 0, ["short", "short_length"], 13),
      );
    }
    return (ta.tsi as TaEngine["tsi"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenOrDefault(node, env, 2, ["long", "long_length"], 25),
      lenOrDefault(node, env, 1, ["short", "short_length"], 13),
    );
  }
  if (fname === "ta.kcw" || fname === "kcw") {
    if (typeof ta.kcw !== "function") return NA;
    return (ta.kcw as TaEngine["kcw"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      lenArg(node, env, 0),
      lenOrDefault(node, env, 1, ["mult", "multiplier"], 2),
    );
  }
  if (fname === "ta.dev" || fname === "dev") {
    if (typeof ta.dev !== "function") return NA;
    return (ta.dev as TaEngine["dev"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.variance" || fname === "variance") {
    if (typeof ta.variance !== "function") return NA;
    return (ta.variance as TaEngine["variance"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.median" || fname === "median") {
    if (typeof ta.median !== "function") return NA;
    return (ta.median as TaEngine["median"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.mode" || fname === "mode") {
    if (typeof ta.mode !== "function") return NA;
    return (ta.mode as TaEngine["mode"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.percentrank" || fname === "percentrank") {
    if (typeof ta.percentrank !== "function") return NA;
    return (ta.percentrank as TaEngine["percentrank"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
    );
  }
  if (fname === "ta.percentile_nearest_rank") {
    if (typeof ta.percentileNearest !== "function") return NA;
    return (ta.percentileNearest as TaEngine["percentileNearest"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["percentage", "percent"], 50),
    );
  }
  if (fname === "ta.percentile_linear_interpolation") {
    if (typeof ta.percentileLinear !== "function") return NA;
    return (ta.percentileLinear as TaEngine["percentileLinear"]).call(
      env.ta,
      site,
      srcArg(node, env),
      lenArg(node, env, 1),
      lenOrDefault(node, env, 2, ["percentage", "percent"], 50),
    );
  }
  if (fname === "ta.cum" || fname === "cum") {
    if (typeof ta.cum !== "function") return NA;
    return (ta.cum as TaEngine["cum"]).call(env.ta, site, srcArg(node, env));
  }
  if (fname === "ta.barssince" || fname === "barssince") {
    if (typeof ta.barssince !== "function") return NA;
    return (ta.barssince as TaEngine["barssince"]).call(
      env.ta,
      site,
      unwrap(evalExpr(callArg(node.args, 0, ["condition", "cond"]), env)),
    );
  }
  if (fname === "ta.valuewhen" || fname === "valuewhen") {
    if (typeof ta.valuewhen !== "function") return NA;
    return (ta.valuewhen as TaEngine["valuewhen"]).call(
      env.ta,
      site,
      unwrap(evalExpr(callArg(node.args, 0, ["condition", "cond"]), env)),
      unwrap(evalExpr(callArg(node.args, 1, ["source"]), env)),
      lenOrDefault(node, env, 2, ["occurrence"], 0),
    );
  }
  if (fname === "ta.range") {
    if (typeof ta.range !== "function") return NA;
    return (ta.range as TaEngine["range"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if ((fname === "ta.max" || fname === "ta.min") && typeof ta.max === "function") {
    const fn = fname === "ta.max" ? ta.max : ta.min;
    return (fn as TaEngine["max"]).call(env.ta, site, srcArg(node, env), lenArg(node, env, 1));
  }
  if (fname === "ta.accdist" || fname === "accdist") {
    if (typeof ta.accdist !== "function") return NA;
    return (ta.accdist as TaEngine["accdist"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      num(env.ctx.volume),
    );
  }
  if (fname === "ta.pvt" || fname === "pvt") {
    if (typeof ta.pvt !== "function") return NA;
    return (ta.pvt as TaEngine["pvt"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  if (fname === "ta.wad" || fname === "wad") {
    if (typeof ta.wad !== "function") return NA;
    return (ta.wad as TaEngine["wad"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
    );
  }
  if (fname === "ta.nvi" || fname === "nvi") {
    if (typeof ta.nvi !== "function") return NA;
    return (ta.nvi as TaEngine["nvi"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  if (fname === "ta.pvi" || fname === "pvi") {
    if (typeof ta.pvi !== "function") return NA;
    return (ta.pvi as TaEngine["pvi"]).call(env.ta, site, num(env.ctx.close), num(env.ctx.volume));
  }
  if (fname === "ta.iii" || fname === "iii") {
    if (typeof ta.iii !== "function") return NA;
    return (ta.iii as TaEngine["iii"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      num(env.ctx.volume),
    );
  }
  if (fname === "ta.wvad" || fname === "wvad") {
    if (typeof ta.wvad !== "function") return NA;
    return (ta.wvad as TaEngine["wvad"]).call(
      env.ta,
      site,
      num(env.ctx.open),
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
      num(env.ctx.volume),
    );
  }
  if (fname === "ta.pivot_point_levels") {
    if (typeof ta.pivotPoints !== "function") return NA;
    const r = (ta.pivotPoints as TaEngine["pivotPoints"]).call(
      env.ta,
      site,
      num(env.ctx.high),
      num(env.ctx.low),
      num(env.ctx.close),
    );
    return tupleOf([r.pp, r.r1, r.s1, r.r2, r.s2]);
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
  if (fname === "array.unshift") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    arr?.unshift(unwrap(evalExpr(callArg(node.args, 1, ["value"]), env)));
    return NA;
  }
  if (fname === "array.shift") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.shift() : NA;
  }
  if (fname === "array.includes") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr?.includes(unwrap(evalExpr(callArg(node.args, 1, ["value"]), env))) ? 1 : 0;
  }
  if (fname === "array.first") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.first() : NA;
  }
  if (fname === "array.last") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.last() : NA;
  }
  if (fname === "array.insert") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["index"]), env));
    const v = unwrap(evalExpr(callArg(node.args, 2, ["value"]), env));
    if (arr && i != null) arr.insert(i, v);
    return NA;
  }
  if (fname === "array.remove") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["index"]), env));
    return arr && i != null ? arr.remove(i) : NA;
  }
  if (fname === "array.fill") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    arr?.fill(unwrap(evalExpr(callArg(node.args, 1, ["value"]), env)));
    return NA;
  }
  if (fname === "array.slice") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const from = unwrap(evalExpr(callArg(node.args, 1, ["index_from", "from"]), env)) ?? 0;
    const toArg = callArg(node.args, 2, ["index_to", "to"]);
    const to = toArg == null ? undefined : unwrap(evalExpr(toArg, env)) ?? undefined;
    return arr ? arr.slice(from, to) : NA;
  }
  if (fname === "array.copy") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.copy() : NA;
  }
  if (fname === "array.reverse") {
    asArray(evalExpr(callArg(node.args, 0, ["id"]), env))?.reverse();
    return NA;
  }
  if (fname === "array.sort") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const orderRaw = evalExpr(callArg(node.args, 1, ["order"]), env);
    const order = typeof orderRaw === "string" && orderRaw.toLowerCase().includes("desc") ? "desc" : "asc";
    arr?.sort(order);
    return NA;
  }
  if (fname === "array.indexof") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.indexof(unwrap(evalExpr(callArg(node.args, 1, ["value"]), env))) : NA;
  }
  if (fname === "array.avg") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.avg() : NA;
  }
  if (fname === "array.min") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.min() : NA;
  }
  if (fname === "array.max") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.max() : NA;
  }
  if (fname === "array.sum") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    return arr ? arr.sum() : NA;
  }
  if (fname === "array.join") {
    const arr = asArray(evalExpr(callArg(node.args, 0, ["id"]), env));
    const sep = evalAsString(callArg(node.args, 1, ["separator", "sep"]), env);
    return arr ? arr.join(sep ?? ",") : NA;
  }
  if (fname === "array.new_bool" || fname === "array.new_string") {
    const size = unwrap(evalExpr(callArg(node.args, 0, ["size"]), env)) ?? 0;
    const initial = unwrap(evalExpr(callArg(node.args, 1, ["initial_value"]), env));
    return new PineArray(size, initial);
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
  if (name === "matrix.transpose") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.transpose() : NA;
  }
  if (name === "matrix.copy") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.copy() : NA;
  }
  if (name === "matrix.elements_count") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.elementsCount() : NA;
  }
  if (name === "matrix.is_square") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isSquare() ? 1 : 0;
  }
  if (name === "matrix.sum" || name === "matrix.sum_all") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.sum() : NA;
  }
  if (name === "matrix.avg" || name === "matrix.avg_all") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.avg() : NA;
  }
  if (name === "matrix.min" || name === "matrix.min_all") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.min() : NA;
  }
  if (name === "matrix.max" || name === "matrix.max_all") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.max() : NA;
  }
  if (name === "matrix.trace") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.trace() : NA;
  }
  if (name === "matrix.det") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.det() : NA;
  }
  if (name === "matrix.row") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["row", "index"]), env));
    if (!m || i == null) return NA;
    const arr = new PineArray();
    for (const v of m.row(i)) arr.push(v);
    return arr;
  }
  if (name === "matrix.col" || name === "matrix.column") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["column", "col", "index"]), env));
    if (!m || i == null) return NA;
    const arr = new PineArray();
    for (const v of m.col(i)) arr.push(v);
    return arr;
  }
  if (name === "matrix.mult") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const otherVal = evalExpr(callArg(node.args, 1, ["other", "matrix_2"]), env);
    if (!m) return NA;
    const otherM = asMatrix(otherVal);
    return otherM ? m.mult(otherM) : m.mult(unwrap(otherVal) ?? 0);
  }
  if (name === "matrix.inv") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.inv() : NA;
  }
  if (name === "matrix.pow") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const p = unwrap(evalExpr(callArg(node.args, 1, ["power", "n"]), env));
    return m && p != null ? m.pow(p) : NA;
  }
  if (name === "matrix.kron") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const other = asMatrix(evalExpr(callArg(node.args, 1, ["other"]), env));
    return m && other ? m.kron(other) : NA;
  }
  if (name === "matrix.diff") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const other = asMatrix(evalExpr(callArg(node.args, 1, ["other"]), env));
    return m && other ? m.diff(other) : NA;
  }
  if (name === "matrix.rank") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m ? m.rank() : NA;
  }
  if (name === "matrix.swap_rows") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["row1", "i"]), env));
    const j = unwrap(evalExpr(callArg(node.args, 2, ["row2", "j"]), env));
    if (m && i != null && j != null) m.swapRows(i, j);
    return NA;
  }
  if (name === "matrix.swap_columns") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    const i = unwrap(evalExpr(callArg(node.args, 1, ["column1", "i"]), env));
    const j = unwrap(evalExpr(callArg(node.args, 2, ["column2", "j"]), env));
    if (m && i != null && j != null) m.swapColumns(i, j);
    return NA;
  }
  if (name === "matrix.is_zero") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isZero() ? 1 : 0;
  }
  if (name === "matrix.is_identity") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isIdentity() ? 1 : 0;
  }
  if (name === "matrix.is_diagonal") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isDiagonal() ? 1 : 0;
  }
  if (name === "matrix.is_symmetric") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isSymmetric() ? 1 : 0;
  }
  if (name === "matrix.is_antisymmetric") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isAntisymmetric() ? 1 : 0;
  }
  if (name === "matrix.is_triangular") {
    const m = asMatrix(evalExpr(callArg(node.args, 0, ["id"]), env));
    return m && m.isTriangular() ? 1 : 0;
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
  if (fname === "table.new") return env.drawings.tableNew(env.barIndex);
  if (fname === "polyline.new") return env.drawings.polylineNew(env.barIndex);
  if (fname === "linefill.new") {
    const a = unwrap(evalExpr(callArg(node.args, 0, ["id1"]), env));
    const b = unwrap(evalExpr(callArg(node.args, 1, ["id2"]), env));
    return env.drawings.linefillNew(
      env.barIndex,
      a == null ? undefined : a,
      b == null ? undefined : b,
    );
  }
  if (fname === "line.set_xy") {
    const id = unwrap(evalExpr(callArg(node.args, 0, ["id"]), env));
    if (id != null) {
      env.drawings.lineSetXy(
        id,
        unwrap(evalExpr(callArg(node.args, 1, ["x1"]), env)) ?? 0,
        unwrap(evalExpr(callArg(node.args, 2, ["y1"]), env)) ?? 0,
        unwrap(evalExpr(callArg(node.args, 3, ["x2"]), env)) ?? 0,
        unwrap(evalExpr(callArg(node.args, 4, ["y2"]), env)) ?? 0,
      );
    }
    return NA;
  }
  if (fname === "label.set_text") {
    const id = unwrap(evalExpr(callArg(node.args, 0, ["id"]), env));
    if (id != null) env.drawings.labelSetText(id, evalAsString(callArg(node.args, 1, ["text"]), env) ?? "");
    return NA;
  }
  if (fname === "line.delete" || fname === "label.delete" || fname === "box.delete") {
    const id = unwrap(evalExpr(callArg(node.args, 0, ["id"]), env));
    if (id != null) {
      if (fname === "line.delete") env.drawings.lineDelete(id);
      else if (fname === "label.delete") env.drawings.labelDelete(id);
      else env.drawings.boxDelete(id);
    }
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
      occ,
    );
  }
  if (fname === "str.replace_all") {
    const s = evalExpr(callArg(node.args, 0, ["source"]), env);
    const target = evalExpr(callArg(node.args, 1, ["target"]), env);
    const repl = evalExpr(callArg(node.args, 2, ["replacement"]), env);
    return strReplaceAll(
      typeof s === "string" ? s : null,
      typeof target === "string" ? target : null,
      typeof repl === "string" ? repl : null,
    );
  }
  if (fname === "str.startswith") {
    const ok = strStartsWith(evalAsString(callArg(node.args, 0, ["source"]), env), evalAsString(callArg(node.args, 1, ["str"]), env));
    return ok == null ? NA : ok ? 1 : 0;
  }
  if (fname === "str.endswith") {
    const ok = strEndsWith(evalAsString(callArg(node.args, 0, ["source"]), env), evalAsString(callArg(node.args, 1, ["str"]), env));
    return ok == null ? NA : ok ? 1 : 0;
  }
  if (fname === "str.substring") {
    const endArg = callArg(node.args, 2, ["end_pos", "end"]);
    return strSubstring(
      evalAsString(callArg(node.args, 0, ["source"]), env),
      unwrap(evalExpr(callArg(node.args, 1, ["begin_pos", "begin"]), env)),
      endArg == null ? undefined : unwrap(evalExpr(endArg, env)),
    );
  }
  if (fname === "str.repeat") {
    return strRepeat(
      evalAsString(callArg(node.args, 0, ["source"]), env),
      unwrap(evalExpr(callArg(node.args, 1, ["n", "times"]), env)),
    );
  }
  if (fname === "str.trim") {
    return strTrim(evalAsString(callArg(node.args, 0, ["source"]), env));
  }
  if (fname === "str.split") {
    const parts = strSplit(
      evalAsString(callArg(node.args, 0, ["source"]), env),
      evalAsString(callArg(node.args, 1, ["separator", "sep"]), env),
    );
    return parts == null ? NA : tupleOf(parts);
  }
  if (fname === "str.tonumber" || fname === "tonumber") {
    return strToNumber(evalAsString(callArg(node.args, 0, ["source", "string"]), env));
  }
  if (fname === "tostring") {
    const v = evalExpr(callArg(node.args, 0, ["value", "source"]), env);
    return typeof v === "string" ? v : strTostring(unwrap(v));
  }
  if (fname === "str.pos") {
    return strPos(
      evalAsString(callArg(node.args, 0, ["source"]), env),
      evalAsString(callArg(node.args, 1, ["str", "substr"]), env),
    );
  }
  if (fname === "str.match") {
    return strMatch(
      evalAsString(callArg(node.args, 0, ["source"]), env),
      evalAsString(callArg(node.args, 1, ["regex", "pattern"]), env),
    );
  }
  if (fname === "str.format") {
    const fmt = evalAsString(callArg(node.args, 0, ["formatString", "format"]), env);
    const args = asArgs(node.args).slice(1).map((a) => {
      const v = evalExpr(a.value, env);
      return typeof v === "string" ? v : unwrap(v);
    });
    return strFormat(fmt, ...args);
  }
  if (fname === "str.join") {
    const first = evalExpr(callArg(node.args, 0, ["array", "parts"]), env);
    const sep = evalAsString(callArg(node.args, 1, ["separator", "sep"]), env);
    const parts = isTuple(first)
      ? first.elts.map((e) => (typeof e === "string" ? e : e == null ? null : String(unwrap(e))))
      : null;
    return parts ? strJoin(parts, sep) : NA;
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

function pushUdfFrame(env: Env, site: string): void {
  let state = env.udfSites.get(site);
  if (!state) {
    state = { ctx: {}, series: new Map(), varInited: new Set() };
    env.udfSites.set(site, state);
  }
  for (const id of state.varInited) {
    const s = state.series.get(id);
    if (s == null) continue;
    while (s.length < env.barIndex) s.push(s.current);
    if (s.length === env.barIndex) s.push(s.current);
    state.ctx[id] = s.current;
  }
  env.frames.push(state);
}

function evalUdf(def: UdfDef, node: Call, env: Env): Value {
  const args = asArgs(node.args);
  const bound = new Set<string>();
  pushUdfFrame(env, siteKey(node, env));
  try {
    let pos = 0;
    for (const a of args) {
      if (argKeyword(a) != null) continue;
      const p = def.params[pos++];
      if (p) {
        bindName(env, p.name, evalExpr(a.value, env));
        bound.add(p.name);
      }
    }
    for (const a of args) {
      const kw = argKeyword(a);
      if (kw == null) continue;
      if (def.params.some((p) => p.name === kw)) {
        bindName(env, kw, evalExpr(argValue(a), env));
        bound.add(kw);
      }
    }
    for (const p of def.params) {
      if (!bound.has(p.name) && p.default != null) bindName(env, p.name, evalExpr(p.default, env));
    }

    let last: Value = NA;
    for (const s of def.body) {
      const v = execStmt(s, env);
      if (s.kind === "Expr" || s.kind === "Assign" || s.kind === "ReAssign") last = v;
    }
    return last;
  } finally {
    env.frames.pop();
  }
}
