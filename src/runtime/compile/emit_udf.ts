/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * UDF FunctionDef emission for JS compile.
 * Signature: `function name(__bar_idx, __h, ...formals, ...__st_*)`.
 * Series formals are full arrays (no default). Series locals persist in
 * `__st_${safeFunc}_${safeLocal}`. Last Expr (and last Assign/ReAssign)
 * becomes the Pine return value.
 */
import type { Assign, Expr, FunctionDef, Param, ReAssign, expr, stmt } from "../../ast/nodes.ts";
import type { EmitCtx } from "./types.ts";

/** JS / emit keywords that cannot be used as identifiers. Pine `from` included. */
const RESERVED = new Set([
  "arguments",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "__bar_idx",
  "__h",
]);

/** Pine UDF / formal → ordered `__st_*` idents (same order as the def tail). */
const funcStArrays = new WeakMap<EmitCtx, Map<string, string[]>>();

function safeIdent(name: string): string {
  if (!name) return "_";
  let s = /^[A-Za-z_$]/.test(name) ? name : `_${name}`;
  s = s.replace(/[^A-Za-z0-9_$]/g, "_");
  return RESERVED.has(s) ? `${s}_` : s;
}

/** Persistent series-local array: `__st_${safeFunc}_${safeLocal}`. */
function stIdent(funcSafe: string, localPine: string): string {
  return `__st_${funcSafe}_${safeIdent(localPine)}`;
}

function stripSemi(code: string): string {
  return code.trim().replace(/;+\s*$/, "");
}

function indentBody(code: string): string {
  return code
    .split("\n")
    .map((ln) => (ln.length ? `  ${ln}` : ln))
    .join("\n");
}

function ensureSemi(code: string): string {
  const t = code.trimEnd();
  if (!t) return t;
  if (/[;{}]$/.test(t)) return t;
  return `${t};`;
}

const CTRL_KINDS = new Set(["If", "ForTo", "ForIn", "While", "Switch"]);

function isCtrlExpr(node: stmt): boolean {
  return node.kind === "Expr" && CTRL_KINDS.has(node.value.kind);
}

function isVarMode(mode: Assign["mode"]): boolean {
  if (mode == null) return false;
  const k = typeof mode === "object" && mode != null && "kind" in mode ? mode.kind : String(mode);
  return k === "Var" || k === "VarIp";
}

function emitDefault(param: Param, visitStmt: (s: stmt) => string): string {
  if (param.default == null) return "null";
  return visitExpr(param.default, visitStmt);
}

function visitExpr(value: expr, visitStmt: (s: stmt) => string): string {
  const dummy: Expr = { kind: "Expr", value };
  const visited = stripSemi(visitStmt(dummy));
  return visited || "null";
}

function lastAssignReturn(node: Assign | ReAssign, localSt: Map<string, string>): string {
  const target = node.target;
  if (target.kind === "Name") {
    const st = localSt.get(target.id);
    if (st != null) return `  return ${st}[__bar_idx];`;
    return `  return ${safeIdent(target.id)};`;
  }
  return "  return null;";
}

function asReturn(code: string): string {
  const t = stripSemi(code);
  if (!t) return "  return null;";
  if (/^return\b/.test(t)) return indentBody(ensureSemi(t));
  return `  return ${t};`;
}

function walkFnBody(node: unknown, visit: (n: { kind?: string; [k: string]: unknown }) => void): void {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkFnBody(item, visit);
    return;
  }
  const n = node as { kind?: string; [k: string]: unknown };
  if (n.kind === "FunctionDef" || n.kind === "TypeDef" || n.kind === "EnumDef") {
    visit(n);
    return;
  }
  if (typeof n.kind === "string") visit(n);
  for (const v of Object.values(n)) walkFnBody(v, visit);
}

function addTargetNames(target: unknown, into: Set<string>): void {
  if (target == null || typeof target !== "object") return;
  const t = target as { kind?: string; id?: string; elts?: unknown[] };
  if (t.kind === "Name" && typeof t.id === "string") {
    into.add(t.id);
    return;
  }
  if (t.kind === "Tuple") {
    for (const el of t.elts ?? []) addTargetNames(el, into);
  }
}

function rememberSt(ctx: EmitCtx, pine: string, safe: string, st: string[]): void {
  let m = funcStArrays.get(ctx);
  if (m == null) {
    m = new Map();
    funcStArrays.set(ctx, m);
  }
  m.set(pine, st);
  if (safe !== pine) m.set(safe, st);
}

function stForFunc(ctx: EmitCtx, pine: string, safe: string): string[] {
  const mapped = funcStArrays.get(ctx)?.get(pine) ?? funcStArrays.get(ctx)?.get(safe);
  if (mapped != null) return mapped;
  const prefix = `__st_${safe}_`;
  return [...ctx.stArrays].filter((a) => a.startsWith(prefix)).sort();
}

function formalPineNames(node: FunctionDef): string[] {
  const params = Array.isArray(node.args) ? node.args : [];
  const names: string[] = [];
  for (let i = 0; i < params.length; i++) {
    const p = params[i]!;
    names.push(node.method && i === 0 && !p.name ? "this" : p.name);
  }
  return names;
}

export function emitFunctionDef(ctx: EmitCtx, node: FunctionDef, visitStmt: (s: stmt) => string): void {
  const pineName = node.name;
  ctx.userFuncs.add(pineName);
  const safe = safeIdent(pineName);
  if (safe !== pineName) ctx.userFuncs.add(safe);

  const params = Array.isArray(node.args) ? node.args : [];
  const pineParams = formalPineNames(node);
  ctx.funcParamNames.set(pineName, pineParams);
  if (safe !== pineName) ctx.funcParamNames.set(safe, pineParams);

  const paramSet = new Set(pineParams);
  const body = Array.isArray(node.body) ? node.body : [];

  const seriesSet = new Set<string>();
  const assigned = new Set<string>();
  const varLocals = new Set<string>();
  const historyNames = new Set<string>();
  const varDefaults = new Map<string, expr | null>();

  walkFnBody(body, (n) => {
    if (n.kind === "Subscript") {
      const value = n.value as { kind?: string; id?: string } | undefined;
      if (value?.kind === "Name" && typeof value.id === "string") {
        historyNames.add(value.id);
        if (paramSet.has(value.id)) seriesSet.add(value.id);
      }
    }
    if (n.kind === "Assign" || n.kind === "ReAssign") {
      addTargetNames(n.target, assigned);
      if (n.kind === "Assign" && isVarMode(n.mode as Assign["mode"])) {
        const names = new Set<string>();
        addTargetNames(n.target, names);
        for (const id of names) {
          if (paramSet.has(id)) continue;
          varLocals.add(id);
          if (!varDefaults.has(id)) varDefaults.set(id, (n.value as expr | null) ?? null);
        }
      }
    }
  });

  ctx.funcSeriesParams.set(pineName, seriesSet);
  if (safe !== pineName) ctx.funcSeriesParams.set(safe, seriesSet);

  const seriesLocals = [...new Set([...varLocals, ...historyNames])]
    .filter((id) => assigned.has(id) && !paramSet.has(id))
    .sort();

  const localSt = new Map<string, string>();
  const stNames: string[] = [];
  for (const s of seriesLocals) {
    const st = stIdent(safe, s);
    ctx.stArrays.add(st);
    localSt.set(s, st);
    stNames.push(st);
  }
  rememberSt(ctx, pineName, safe, stNames);

  const prevFunc = ctx.currentFunc;
  const prevParams = ctx.currentParamNames;
  const prevSeries = ctx.currentSeriesParams;
  ctx.currentFunc = pineName;
  ctx.currentParamNames = new Set(pineParams);
  ctx.currentSeriesParams = seriesSet;

  try {
    const formals: string[] = [];
    for (let i = 0; i < params.length; i++) {
      const pine = pineParams[i]!;
      const ident = safeIdent(pine);
      if (seriesSet.has(pine)) formals.push(ident);
      else formals.push(`${ident} = ${emitDefault(params[i]!, visitStmt)}`);
    }

    const lines: string[] = [];
    for (const s of seriesLocals) {
      const st = localSt.get(s)!;
      const init = varDefaults.get(s);
      const def = init != null ? visitExpr(init, visitStmt) : "null";
      lines.push(`  if (__bar_idx === 0) ${st}[0] = ${def};`);
      lines.push(`  else ${st}[__bar_idx] = ${st}[__bar_idx - 1];`);
    }

    const visitBody = (s: stmt): string => {
      if (s.kind !== "Assign" && s.kind !== "ReAssign") return visitStmt(s);
      if (s.target.kind !== "Name" || !localSt.has(s.target.id)) return visitStmt(s);
      const st = localSt.get(s.target.id)!;
      if (s.kind === "Assign" && isVarMode(s.mode)) return "";
      const rhs = s.value != null ? visitExpr(s.value, visitStmt) : "null";
      return `${st}[__bar_idx] = __h.naNum(${rhs});`;
    };

    let emittedReturn = false;
    for (let i = 0; i < body.length; i++) {
      const s = body[i]!;
      const raw = visitBody(s);
      if (!raw || !raw.trim()) continue;
      const isLast = i === body.length - 1;
      if (isLast && s.kind === "Expr" && !isCtrlExpr(s)) {
        lines.push(asReturn(raw));
        emittedReturn = true;
        continue;
      }
      lines.push(indentBody(ensureSemi(raw)));
      if (isLast && (s.kind === "Assign" || s.kind === "ReAssign")) {
        lines.push(lastAssignReturn(s, localSt));
        emittedReturn = true;
      }
    }
    if (!emittedReturn) lines.push("  return null;");

    const argList = ["__bar_idx", "__h", ...formals, ...stNames].join(", ");
    ctx.functions.push(`function ${safe}(${argList}) {\n${lines.join("\n")}\n}`);
  } finally {
    ctx.currentFunc = prevFunc;
    ctx.currentParamNames = prevParams;
    ctx.currentSeriesParams = prevSeries;
  }
}

export function emitUserFuncCall(ctx: EmitCtx, name: string, args: string[]): string {
  const pine = ctx.userFuncs.has(name)
    ? name
    : ([...ctx.userFuncs].find((n) => safeIdent(n) === name) ?? name);
  const safe = safeIdent(pine);
  const st = stForFunc(ctx, pine, safe);
  const parts = ["__bar_idx", "__h", ...args, ...st];
  return `${safe}(${parts.join(", ")})`;
}
