/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile-path types. TS compile is JS emit (Python object-mode analog).
 * No Numba / nopython backend.
 */
import type { Call, FunctionDef, expr, stmt } from "../../ast/nodes.ts";

export type CompileBackend = "js";

export type RuntimeMode = "interpret" | "compile" | "auto";

export interface CompilePlotMeta {
  title: string;
}

export interface CompileEligibility {
  ok: boolean;
  reason?: string;
}

export class CompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompileError";
  }
}

export class CompileEmitError extends CompileError {
  constructor(message: string) {
    super(message);
    this.name = "CompileEmitError";
  }
}

export class CompileLoadError extends CompileError {
  constructor(message: string) {
    super(message);
    this.name = "CompileLoadError";
  }
}

export class CompileIneligibleError extends CompileError {
  constructor(message: string) {
    super(message);
    this.name = "CompileIneligibleError";
  }
}

/** Visitor state while lowering a Script to JS. */
export interface EmitCtx {
  arrays: Set<string>;
  plots: CompilePlotMeta[];
  varNames: Set<string>;
  functions: string[];
  userFuncs: Set<string>;
  usesStrategy: boolean;
  nextSite: number;
  errors: string[];
  /** Pine UDF name currently being emitted (null at script scope). */
  currentFunc: string | null;
  /** Formal names of the current UDF. */
  currentParamNames: Set<string>;
  /** Current UDF formals that must be passed as full series arrays. */
  currentSeriesParams: Set<string>;
  /** Pine UDF name → series formal names (call-site packing). */
  funcSeriesParams: Map<string, Set<string>>;
  /** Pine UDF name → formal order. */
  funcParamNames: Map<string, string[]>;
  /** Persistent `__st_*` arrays allocated in the bar-loop frame. */
  stArrays: Set<string>;
  /** type name → field order + default JS exprs. */
  udtTypes: Map<string, { fields: string[]; defaults: Record<string, string> }>;
  usesDrawings: boolean;
  /** enum name → member names. */
  enumTypes: Map<string, string[]>;
}

export interface EmitFns {
  visit(node: expr | stmt | null | undefined): string;
  visitStmt(node: stmt): string;
  emitCall(node: Call): string;
}

export type VisitFn = (node: expr | stmt | null | undefined) => string;

export type EmitCallFn = (ctx: EmitCtx, node: Call, visit: VisitFn) => string;

export type EmitUdfFn = (ctx: EmitCtx, node: FunctionDef, visitStmt: (s: stmt) => string) => void;

/** Generated module entry: arrays in, titled plot series out. */
export type ExecuteCompiled = (
  open: Array<number | null>,
  high: Array<number | null>,
  low: Array<number | null>,
  close: Array<number | null>,
  volume: Array<number | null>,
  time: Array<number | null>,
) => Record<string, Array<number | null>>;

export interface CompiledScript {
  readonly source: string;
  readonly plots: CompilePlotMeta[];
  readonly backend: CompileBackend;
  run(
    open: ArrayLike<number | null | undefined>,
    high: ArrayLike<number | null | undefined>,
    low: ArrayLike<number | null | undefined>,
    close: ArrayLike<number | null | undefined>,
    volume?: ArrayLike<number | null | undefined> | null,
    time?: ArrayLike<number | null | undefined> | null,
    extras?: { inputs?: Record<string, number | string | boolean> },
  ): Record<string, Array<number | null>>;
}

export interface CompileCacheStats {
  source_entries: number;
  source_max: number;
}
