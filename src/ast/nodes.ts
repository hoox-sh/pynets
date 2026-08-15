/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Hand-written ASDL subset (Pinescript.asdl). Field names match Python.
 */
export type ASTKind =
  | "Script"
  | "Expression"
  | "Expr"
  | "Assign"
  | "ReAssign"
  | "FunctionDef"
  | "TypeDef"
  | "EnumDef"
  | "Param"
  | "Call"
  | "Name"
  | "Constant"
  | "Arg"
  | "Attribute"
  | "Subscript"
  | "BinOp"
  | "UnaryOp"
  | "Compare"
  | "If"
  | "Tuple"
  | "Conditional"
  | "ForTo"
  | "ForIn"
  | "While"
  | "Switch"
  | "Case"
  | "BoolOp"
  | "And"
  | "Or"
  | "Break"
  | "Continue"
  | "Load"
  | "Store"
  | "Eq"
  | "NotEq"
  | "Lt"
  | "LtE"
  | "Gt"
  | "GtE"
  | "Add"
  | "Sub"
  | "Mult"
  | "Div"
  | "Mod"
  | "UAdd"
  | "USub"
  | "Not"
  | "Invert"
  | "Var"
  | "VarIp";

export interface AST {
  readonly kind: ASTKind;
  lineno?: number;
  col_offset?: number;
  end_lineno?: number | null;
  end_col_offset?: number | null;
}

export interface Script extends AST {
  kind: "Script";
  body: stmt[];
  annotations: string[];
}

export interface Expression extends AST {
  kind: "Expression";
  body: expr;
}

export interface Expr extends AST {
  kind: "Expr";
  value: expr;
}

export interface Assign extends AST {
  kind: "Assign";
  target: expr;
  value: expr | null;
  type: expr | null;
  mode: Var | VarIp | null;
  export: number | null;
  annotations: string[];
}

export interface ReAssign extends AST {
  kind: "ReAssign";
  target: expr;
  value: expr;
}

export interface Var extends AST {
  kind: "Var";
}

export interface VarIp extends AST {
  kind: "VarIp";
}

export type decl_mode = Var | VarIp;

export type stmt = Expr | Assign | ReAssign | FunctionDef | TypeDef | EnumDef | Break | Continue;

export interface FunctionDef extends AST {
  kind: "FunctionDef";
  name: string;
  args: Param[];
  body: stmt[];
  method: number | null;
  export: number | null;
  annotations: string[];
}

export interface TypeDef extends AST {
  kind: "TypeDef";
  name: string;
  body: stmt[];
  export: number | null;
  annotations: string[];
}

export interface EnumDef extends AST {
  kind: "EnumDef";
  name: string;
  body: stmt[];
  export: number | null;
  annotations: string[];
}

export interface Param extends AST {
  kind: "Param";
  name: string;
  default: expr | null;
  type: expr | null;
}

export interface Call extends AST {
  kind: "Call";
  func: expr;
  args: Arg[];
}

export interface Name extends AST {
  kind: "Name";
  id: string;
  ctx: Load | Store;
}

export interface Constant extends AST {
  kind: "Constant";
  value: unknown;
  kind_lit?: string | null;
}

export interface Arg extends AST {
  kind: "Arg";
  value: expr;
  name: string | null;
}

export interface Attribute extends AST {
  kind: "Attribute";
  value: expr;
  attr: string;
  ctx: Load | Store;
}

export interface Subscript extends AST {
  kind: "Subscript";
  value: expr;
  slice: expr | null;
  ctx: Load | Store;
}

export interface BinOp extends AST {
  kind: "BinOp";
  left: expr;
  op: operator;
  right: expr;
}

export interface UnaryOp extends AST {
  kind: "UnaryOp";
  op: unary_op;
  operand: expr;
}

export interface Compare extends AST {
  kind: "Compare";
  left: expr;
  ops: compare_op[];
  comparators: expr[];
}

export interface If extends AST {
  kind: "If";
  test: expr;
  body: stmt[];
  orelse: stmt[];
}

export interface Tuple extends AST {
  kind: "Tuple";
  elts: expr[];
  ctx: Load | Store;
}

export interface Conditional extends AST {
  kind: "Conditional";
  test: expr;
  body: expr;
  orelse: expr;
}

export interface ForTo extends AST {
  kind: "ForTo";
  target: expr;
  start: expr;
  end: expr;
  body: stmt[];
  step: expr | null;
}

export interface ForIn extends AST {
  kind: "ForIn";
  target: expr;
  iter: expr;
  body: stmt[];
}

export interface While extends AST {
  kind: "While";
  test: expr;
  body: stmt[];
}

export interface Switch extends AST {
  kind: "Switch";
  cases: Case[];
  subject: expr | null;
}

export interface Case extends AST {
  kind: "Case";
  body: stmt[];
  pattern: expr | null;
}

export interface BoolOp extends AST {
  kind: "BoolOp";
  op: bool_op;
  values: expr[];
}

export interface Break extends AST {
  kind: "Break";
}

export interface Continue extends AST {
  kind: "Continue";
}

export type expr =
  | Call
  | Name
  | Constant
  | Attribute
  | Subscript
  | BinOp
  | UnaryOp
  | Compare
  | If
  | Tuple
  | Conditional
  | ForTo
  | ForIn
  | While
  | Switch
  | BoolOp;

export interface Load extends AST {
  kind: "Load";
}
export interface Store extends AST {
  kind: "Store";
}

export interface Add extends AST {
  kind: "Add";
}
export interface Sub extends AST {
  kind: "Sub";
}
export interface Mult extends AST {
  kind: "Mult";
}
export interface Div extends AST {
  kind: "Div";
}
export interface Mod extends AST {
  kind: "Mod";
}
export type operator = Add | Sub | Mult | Div | Mod;

export interface UAdd extends AST {
  kind: "UAdd";
}
export interface USub extends AST {
  kind: "USub";
}
export interface Not extends AST {
  kind: "Not";
}
export interface Invert extends AST {
  kind: "Invert";
}
export type unary_op = UAdd | USub | Not | Invert;

export interface Eq extends AST {
  kind: "Eq";
}
export interface NotEq extends AST {
  kind: "NotEq";
}
export interface Lt extends AST {
  kind: "Lt";
}
export interface LtE extends AST {
  kind: "LtE";
}
export interface Gt extends AST {
  kind: "Gt";
}
export interface GtE extends AST {
  kind: "GtE";
}
export type compare_op = Eq | NotEq | Lt | LtE | Gt | GtE;

export interface And extends AST {
  kind: "And";
}
export interface Or extends AST {
  kind: "Or";
}
export type bool_op = And | Or;

export const Load: Load = { kind: "Load" };
export const Store: Store = { kind: "Store" };
export const Var: Var = { kind: "Var" };
export const VarIp: VarIp = { kind: "VarIp" };
export const Add: Add = { kind: "Add" };
export const Sub: Sub = { kind: "Sub" };
export const Mult: Mult = { kind: "Mult" };
export const Div: Div = { kind: "Div" };
export const Mod: Mod = { kind: "Mod" };
export const UAdd: UAdd = { kind: "UAdd" };
export const USub: USub = { kind: "USub" };
export const NotOp: Not = { kind: "Not" };
export const Invert: Invert = { kind: "Invert" };
export const Eq: Eq = { kind: "Eq" };
export const NotEq: NotEq = { kind: "NotEq" };
export const Lt: Lt = { kind: "Lt" };
export const LtE: LtE = { kind: "LtE" };
export const Gt: Gt = { kind: "Gt" };
export const GtE: GtE = { kind: "GtE" };
export const And: And = { kind: "And" };
export const Or: Or = { kind: "Or" };

export function script(body: stmt[] = [], annotations: string[] = []): Script {
  return { kind: "Script", body, annotations };
}

export function expression(body: expr): Expression {
  return { kind: "Expression", body };
}

export function exprStmt(value: expr): Expr {
  return { kind: "Expr", value };
}

export function call(func: expr, args: Arg[] = []): Call {
  return { kind: "Call", func, args };
}

export function name(id: string, ctx: Load | Store = Load): Name {
  return { kind: "Name", id, ctx };
}

export function constant(value: unknown, kind_lit: string | null = null): Constant {
  return { kind: "Constant", value, kind_lit };
}

export function arg(value: expr, name: string | null = null): Arg {
  return { kind: "Arg", value, name };
}

export function attribute(value: expr, attrName: string, ctx: Load | Store = Load): Attribute {
  return { kind: "Attribute", value, attr: attrName, ctx };
}

export function subscript(value: expr, slice: expr | null = null, ctx: Load | Store = Load): Subscript {
  return { kind: "Subscript", value, slice, ctx };
}

export function binOp(left: expr, op: operator, right: expr): BinOp {
  return { kind: "BinOp", left, op, right };
}

export function unaryOp(op: unary_op, operand: expr): UnaryOp {
  return { kind: "UnaryOp", op, operand };
}

export function assign(
  target: expr,
  value: expr | null,
  type: expr | null = null,
  mode: decl_mode | null = null,
  exported: number | null = null,
  annotations: string[] = [],
): Assign {
  return {
    kind: "Assign",
    target,
    value,
    type,
    mode,
    export: exported,
    annotations,
  };
}

export function reAssign(target: expr, value: expr): ReAssign {
  return { kind: "ReAssign", target, value };
}

export function functionDef(
  name: string,
  args: Param[] = [],
  body: stmt[] = [],
  method: number | null = null,
  exported: number | null = null,
  annotations: string[] = [],
): FunctionDef {
  return {
    kind: "FunctionDef",
    name,
    args,
    body,
    method,
    export: exported,
    annotations,
  };
}

export function typeDef(
  name: string,
  body: stmt[] = [],
  exported: number | null = null,
  annotations: string[] = [],
): TypeDef {
  return {
    kind: "TypeDef",
    name,
    body,
    export: exported,
    annotations,
  };
}

export function enumDef(
  name: string,
  body: stmt[] = [],
  exported: number | null = null,
  annotations: string[] = [],
): EnumDef {
  return {
    kind: "EnumDef",
    name,
    body,
    export: exported,
    annotations,
  };
}

export function param(
  name: string,
  defaultValue: expr | null = null,
  type: expr | null = null,
): Param {
  return { kind: "Param", name, default: defaultValue, type };
}

export function compare(left: expr, ops: compare_op[], comparators: expr[]): Compare {
  return { kind: "Compare", left, ops, comparators };
}

export function ifExpr(test: expr, body: stmt[] = [], orelse: stmt[] = []): If {
  return { kind: "If", test, body, orelse };
}

export function tupleExpr(elts: expr[], ctx: Load | Store = Store): Tuple {
  return { kind: "Tuple", elts, ctx };
}

export function conditional(test: expr, body: expr, orelse: expr): Conditional {
  return { kind: "Conditional", test, body, orelse };
}

export function forTo(
  target: expr,
  start: expr,
  end: expr,
  body: stmt[],
  step: expr | null = null,
): ForTo {
  return { kind: "ForTo", target, start, end, body, step };
}

export function forIn(target: expr, iter: expr, body: stmt[]): ForIn {
  return { kind: "ForIn", target, iter, body };
}

export function whileExpr(test: expr, body: stmt[] = []): While {
  return { kind: "While", test, body };
}

export function switchExpr(cases: Case[] = [], subject: expr | null = null): Switch {
  return { kind: "Switch", cases, subject };
}

export function caseNode(body: stmt[] = [], pattern: expr | null = null): Case {
  return { kind: "Case", body, pattern };
}

export function boolOp(op: bool_op, values: expr[] = []): BoolOp {
  return { kind: "BoolOp", op, values };
}

export function breakStmt(): Break {
  return { kind: "Break" };
}

export function continueStmt(): Continue {
  return { kind: "Continue" };
}
