/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Slice-1 unparser: expressions plus Assign / ReAssign / var / varip,
 * Tuple / Conditional / ForTo / ForIn / While / Switch / Case /
 * BoolOp / Break / Continue / TypeDef / EnumDef.
 *
 * Parenthesization is precedence-driven, ported from PYNE's
 * pynescript.ast.unparser (Precedence ladder + per-child assignment): a child
 * is wrapped only when the precedence its parent assigns exceeds the child's
 * own binding level, so unparse output always reparses to the same tree.
 */
import type {
  AST,
  Arg,
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
  Expr,
  Expression,
  ForIn,
  ForTo,
  FunctionDef,
  If,
  Import,
  Name,
  Param,
  Qualify,
  ReAssign,
  Script,
  Specialize,
  Subscript,
  Switch,
  Tuple,
  TypeDef,
  UnaryOp,
  While,
  expr,
  stmt,
  type_qual,
} from "./nodes.ts";

const OP: Record<string, string> = {
  Add: "+",
  Sub: "-",
  Mult: "*",
  Div: "/",
  Mod: "%",
  BitAnd: "&",
  BitOr: "|",
  BitXor: "^",
  LShift: "<<",
  RShift: ">>",
};

const TYPE_QUAL: Record<string, string> = {
  Const: "const",
  Input: "input",
  Simple: "simple",
  Series: "series",
};

const UOP: Record<string, string> = {
  UAdd: "+",
  USub: "-",
  Not: "not ",
  Invert: "~",
};

const CMP: Record<string, string> = {
  Eq: "==",
  NotEq: "!=",
  Lt: "<",
  LtE: "<=",
  Gt: ">",
  GtE: ">=",
};

const BOOLOP: Record<string, string> = {
  And: "and",
  Or: "or",
};

/**
 * Operator binding levels for parenthesization — port of PYNE's
 * `pynescript.ast.unparser.Precedence` ladder (higher binds tighter).
 * A child is wrapped in parens when the precedence its parent assigns to it
 * is strictly greater than the child's own binding level.
 */
const PREC = {
  TEST: 1, // ternary '?', ':' — loosest
  OR: 2,
  AND: 3,
  BITOR: 4,
  BITXOR: 5,
  BITAND: 6,
  EQ: 7,
  INEQ: 8, // Python Precedence.CMP alias
  SHIFT: 9,
  EXPR: 10,
  ARITH: 11,
  TERM: 12,
  FACTOR: 13, // unary +,-,~,not (Python Precedence.NOT alias)
  ATOM: 14, // names, literals, attr, calls — tightest
} as const;

function nextPrec(prec: number): number {
  return Math.min(prec + 1, PREC.ATOM);
}

const BINOP_PREC: Record<string, number> = {
  Add: PREC.ARITH,
  Sub: PREC.ARITH,
  Mult: PREC.TERM,
  Div: PREC.TERM,
  Mod: PREC.TERM,
  BitAnd: PREC.BITAND,
  BitOr: PREC.BITOR,
  BitXor: PREC.BITXOR,
  LShift: PREC.SHIFT,
  RShift: PREC.SHIFT,
};

// Python assigns NOT = FACTOR (same level) for unary ops.
const UNOP_PREC = PREC.FACTOR;

const BOOLOP_PREC: Record<string, number> = {
  And: PREC.AND,
  Or: PREC.OR,
};

// Python Precedence.CMP — Compare children are checked against INEQ.
const COMPARE_PREC = PREC.INEQ;

/**
 * Natural binding level of an expression node — the precedence the Python
 * unparser's visitor checks against its parent-assigned level. Node kinds
 * without an operator (atoms, Call, Attribute, …) never self-parenthesize in
 * the SoT unparser, hence `undefined`.
 */
function ownPrec(node: expr): number | undefined {
  switch (node.kind) {
    case "BinOp":
      return BINOP_PREC[node.op.kind];
    case "UnaryOp":
      return UNOP_PREC;
    case "BoolOp":
      return BOOLOP_PREC[node.op.kind];
    case "Compare":
      return COMPARE_PREC;
    case "Conditional":
      return PREC.TEST;
    default:
      return undefined;
  }
}

/**
 * Emit a child expression, parenthesizing it when the parent-assigned
 * precedence exceeds the child's own binding level. Mirrors Python's
 * `NodeUnparser.require_parens` / `_needs_parens` rule: compare is strictly
 * greater-than, so equal levels stay unparenthesized (left-associative
 * chaining is encoded by the parent's per-slot precedence assignment).
 */
function emitChild(node: expr, required: number): string {
  const src = emitExpr(node);
  const prec = ownPrec(node);
  return prec !== undefined && required > prec ? `(${src})` : src;
}

function quoteString(value: string): string {
  if (value.includes("\n") || value.includes("\r")) {
    if (!value.includes('"""')) return `"""${value}"""`;
    if (!value.includes("'''")) return `'''${value}'''`;
  }
  return JSON.stringify(value);
}

function emitExpr(node: expr): string {
  switch (node.kind) {
    case "Name":
      return node.id;
    case "Constant":
      return emitConstant(node);
    case "Call":
      return emitCall(node);
    case "Attribute":
      return `${emitChild(node.value, PREC.ATOM)}.${node.attr}`;
    case "Subscript":
      return `${emitExpr(node.value)}[${emitSlice(node.slice)}]`;
    case "BinOp":
      return emitBinOp(node);
    case "UnaryOp":
      return emitUnaryOp(node);
    case "Compare":
      return emitCompare(node);
    case "If":
      return emitIf(node);
    case "Tuple":
      return emitTuple(node);
    case "Conditional":
      return emitConditional(node);
    case "ForTo":
      return emitForTo(node);
    case "ForIn":
      return emitForIn(node);
    case "While":
      return emitWhile(node);
    case "Switch":
      return emitSwitch(node);
    case "BoolOp":
      return emitBoolOp(node);
    case "Qualify":
      return emitQualify(node);
    case "Specialize":
      return emitSpecialize(node);
    case "AugAssign":
      return emitAugAssign(node);
  }
}

function emitTypeQual(node: type_qual): string {
  return TYPE_QUAL[node.kind] ?? node.kind.toLowerCase();
}

function emitQualify(node: Qualify): string {
  return `${emitTypeQual(node.qualifier)} ${emitExpr(node.value)}`;
}

function emitSpecializeArgs(args: expr | null): string {
  if (args == null) return "";
  if (args.kind === "Tuple") return args.elts.map(emitExpr).join(", ");
  return emitExpr(args);
}

function emitSpecialize(node: Specialize): string {
  return `${emitExpr(node.value)}<${emitSpecializeArgs(node.args)}>`;
}

function emitCompare(node: Compare): string {
  // Python: all Compare children are checked against CMP.next() (= SHIFT) so
  // chained comparisons and tighter-binding operands stay unparenthesized.
  const required = nextPrec(COMPARE_PREC);
  let out = emitChild(node.left, required);
  for (let i = 0; i < node.ops.length; i++) {
    out += ` ${CMP[node.ops[i]!.kind] ?? "??"} ${emitChild(node.comparators[i]!, required)}`;
  }
  return out;
}

function emitBinOp(node: BinOp): string {
  // Python: left child keeps the operator's level, right child uses next()
  // so `a - b - c` prints bare while `a - (b - c)` re-parenthesizes.
  const prec = BINOP_PREC[node.op.kind] ?? PREC.TEST;
  return `${emitChild(node.left, prec)} ${OP[node.op.kind] ?? "?"} ${emitChild(node.right, nextPrec(prec))}`;
}

function emitUnaryOp(node: UnaryOp): string {
  // Python: the operand is checked at the unary operator's own level (FACTOR),
  // so -(a + b) and not (a and b) wrap while -a * b and not not a do not.
  return `${UOP[node.op.kind] ?? ""}${emitChild(node.operand, UNOP_PREC)}`;
}

function emitIf(node: If): string {
  const body = node.body.map(emitStmt).join("; ");
  if (node.orelse.length === 0) return `if ${emitExpr(node.test)}\n    ${body}`;
  const els = node.orelse.map(emitStmt).join("; ");
  return `if ${emitExpr(node.test)}\n    ${body}\nelse\n    ${els}`;
}

function emitTuple(node: Tuple): string {
  return `[${node.elts.map(emitExpr).join(", ")}]`;
}

function emitSlice(slice: expr | null | undefined): string {
  if (slice == null) return "";
  if (slice.kind === "Tuple") return slice.elts.map(emitExpr).join(", ");
  return emitExpr(slice);
}

function emitConditional(node: Conditional): string {
  // Python: test/body at TEST.next() (nested ternaries there wrap); orelse at
  // TEST so `a ? b : c ? d : e` stays right-associative without parens.
  return `${emitChild(node.test, PREC.OR)} ? ${emitChild(node.body, PREC.OR)} : ${emitChild(node.orelse, PREC.TEST)}`;
}

function emitForBody(body: stmt[]): string {
  if (!body.length) return "";
  const parts = body.map(emitStmt);
  if (parts.length === 1 && !parts[0]!.includes("\n")) return ` ${parts[0]}`;
  return parts.map((p) => `\n    ${p.replaceAll("\n", "\n    ")}`).join("");
}

function emitForTo(node: ForTo): string {
  let head = `for ${emitExpr(node.target)} = ${emitExpr(node.start)} to ${emitExpr(node.end)}`;
  if (node.step) head += ` by ${emitExpr(node.step)}`;
  return head + emitForBody(node.body);
}

function emitForIn(node: ForIn): string {
  return `for ${emitExpr(node.target)} in ${emitExpr(node.iter)}${emitForBody(node.body)}`;
}

function emitIndentedBody(body: stmt[]): string {
  if (!body.length) return "";
  return body.map((st) => `\n    ${emitStmt(st).replaceAll("\n", "\n    ")}`).join("");
}

function emitWhile(node: While): string {
  return `while ${emitExpr(node.test)}${emitIndentedBody(node.body)}`;
}

function emitCaseBody(body: stmt[]): string {
  if (!body.length) return "";
  if (body.length === 1 && body[0]!.kind === "Expr") {
    return ` ${emitExpr(body[0]!.value)}`;
  }
  const parts = body.map(emitStmt);
  if (parts.length === 1 && !parts[0]!.includes("\n")) return ` ${parts[0]}`;
  return parts.map((p) => `\n    ${p.replaceAll("\n", "\n    ")}`).join("");
}

function emitCase(node: Case): string {
  const prefix = node.pattern ? `${emitExpr(node.pattern)} =>` : "=>";
  return prefix + emitCaseBody(node.body);
}

function emitSwitch(node: Switch): string {
  const head = node.subject ? `switch ${emitExpr(node.subject)}` : "switch";
  if (!node.cases.length) return head;
  return head + node.cases.map((c) => `\n    ${emitCase(c).replaceAll("\n", "\n    ")}`).join("");
}

function emitBoolOp(node: BoolOp): string {
  const op = BOOLOP[node.op.kind] ?? "and";
  const base = BOOLOP_PREC[node.op.kind] ?? PREC.AND;
  // Python raises the required level per value (op.next(), then tighter) so
  // mixed nesting wraps the way the SoT unparser does.
  let required = base;
  return node.values
    .map((v) => {
      required = nextPrec(required);
      return emitChild(v, required);
    })
    .join(` ${op} `);
}

function emitConstant(node: Constant): string {
  if (node.kind_lit) return String(node.value);
  const v = node.value;
  if (v === true) return "true";
  if (v === false) return "false";
  if (v === null || v === undefined) return "na";
  if (typeof v === "string") return quoteString(v);
  return String(v);
}

function emitArg(node: Arg): string {
  const inner = emitExpr(node.value);
  return node.name ? `${node.name}=${inner}` : inner;
}

function asArgs(args: Arg | Arg[] | null | undefined): Arg[] {
  if (args == null) return [];
  return Array.isArray(args) ? args : [args];
}

function emitCall(node: Call): string {
  // Python forces the callee to ATOM so e.g. a computed callee parenthesizes.
  return `${emitChild(node.func, PREC.ATOM)}(${asArgs(node.args).map(emitArg).join(", ")})`;
}

function emitImport(node: Import): string {
  const path = `import ${node.namespace}/${node.name}/${node.version}`;
  return node.alias ? `${path} as ${node.alias}` : path;
}

function emitStmt(node: stmt): string {
  if (node == null || typeof node !== "object") return "";
  if (node.kind === "Expr") return emitExpr(node.value);
  if (node.kind === "Assign") return emitAssign(node);
  if (node.kind === "ReAssign") return emitReAssign(node);
  if (node.kind === "AugAssign") return emitAugAssign(node);
  if (node.kind === "FunctionDef") return emitFunctionDef(node);
  if (node.kind === "TypeDef") return emitTypeDef(node);
  if (node.kind === "EnumDef") return emitEnumDef(node);
  if (node.kind === "Import") return emitImport(node);
  if (node.kind === "Break") return "break";
  if (node.kind === "Continue") return "continue";
  return "";
}

function asParams(args: Param | Param[] | null | undefined): Param[] {
  if (args == null) return [];
  return Array.isArray(args) ? args : [args];
}

function emitParam(node: Param): string {
  let out = node.name;
  if (node.type) out = `${emitExpr(node.type)} ${out}`;
  if (node.default) out += `=${emitExpr(node.default)}`;
  return out;
}

function emitTypeDef(node: TypeDef): string {
  const chunks: string[] = [];
  if (node.export) chunks.push("export");
  chunks.push("type");
  chunks.push(node.name);
  const line = `${chunks.join(" ")}${emitIndentedBody(node.body)}`;
  if (node.annotations.length) return `${node.annotations.join("\n")}\n${line}`;
  return line;
}

function emitEnumDef(node: EnumDef): string {
  const chunks: string[] = [];
  if (node.export) chunks.push("export");
  chunks.push("enum");
  chunks.push(node.name);
  const line = `${chunks.join(" ")}${emitIndentedBody(node.body)}`;
  if (node.annotations.length) return `${node.annotations.join("\n")}\n${line}`;
  return line;
}

function emitFunctionDef(node: FunctionDef): string {
  const chunks: string[] = [];
  if (node.export) chunks.push("export");
  if (node.method) chunks.push("method");
  if (node.returns) chunks.push(emitExpr(node.returns));
  chunks.push(`${node.name}(${asParams(node.args).map(emitParam).join(", ")}) =>`);
  const head = chunks.join(" ");
  const body = node.body;
  let line: string;
  if (body.length === 1 && body[0]!.kind === "Expr") {
    line = `${head} ${emitExpr(body[0]!.value)}`;
  } else if (!body.length) {
    line = head;
  } else {
    line = `${head}${body.map((st) => `\n    ${emitStmt(st).replaceAll("\n", "\n    ")}`).join("")}`;
  }
  if (node.annotations.length) return `${node.annotations.join("\n")}\n${line}`;
  return line;
}

function emitAssign(node: Assign): string {
  const chunks: string[] = [];
  if (node.export) chunks.push("export");
  if (node.mode) chunks.push(node.mode.kind === "VarIp" ? "varip" : "var");
  if (node.type) chunks.push(emitExpr(node.type));
  chunks.push(emitExpr(node.target));
  const head = chunks.join(" ");
  const line = node.value == null ? head : `${head} = ${emitExpr(node.value)}`;
  if (node.annotations.length) return `${node.annotations.join("\n")}\n${line}`;
  return line;
}

function emitReAssign(node: ReAssign): string {
  return `${emitExpr(node.target)} := ${emitExpr(node.value)}`;
}

function emitAugAssign(node: AugAssign): string {
  return `${emitExpr(node.target)} ${OP[node.op.kind] ?? "?"}= ${emitExpr(node.value)}`;
}

export function unparse(node: AST): string {
  if (node.kind === "Script") {
    const s = node as Script;
    const lines: string[] = [];
    for (const ann of s.annotations) lines.push(ann);
    for (const st of s.body) lines.push(emitStmt(st));
    return lines.join("\n");
  }
  if (node.kind === "Expression") return emitExpr((node as Expression).body);
  if (node.kind === "Expr") return emitExpr((node as Expr).value);
  if (node.kind === "Assign") return emitAssign(node as Assign);
  if (node.kind === "ReAssign") return emitReAssign(node as ReAssign);
  if (node.kind === "AugAssign") return emitAugAssign(node as AugAssign);
  if (node.kind === "FunctionDef") return emitFunctionDef(node as FunctionDef);
  if (node.kind === "TypeDef") return emitTypeDef(node as TypeDef);
  if (node.kind === "EnumDef") return emitEnumDef(node as EnumDef);
  if (node.kind === "Param") return emitParam(node as Param);
  if (node.kind === "Var") return "var";
  if (node.kind === "VarIp") return "varip";
  if (node.kind === "Const") return "const";
  if (node.kind === "Input") return "input";
  if (node.kind === "Simple") return "simple";
  if (node.kind === "Series") return "series";
  if (node.kind === "Qualify") return emitQualify(node as Qualify);
  if (node.kind === "Specialize") return emitSpecialize(node as Specialize);
  if (node.kind === "Call") return emitCall(node as Call);
  if (node.kind === "Name") return (node as Name).id;
  if (node.kind === "Constant") return emitConstant(node as Constant);
  if (node.kind === "Arg") return emitArg(node as Arg);
  if (node.kind === "Attribute") {
    const a = node as Attribute;
    return `${emitChild(a.value, PREC.ATOM)}.${a.attr}`;
  }
  if (node.kind === "Subscript") {
    const s = node as Subscript;
    return `${emitExpr(s.value)}[${emitSlice(s.slice)}]`;
  }
  if (node.kind === "BinOp") return emitBinOp(node as BinOp);
  if (node.kind === "UnaryOp") return emitUnaryOp(node as UnaryOp);
  if (node.kind === "Compare") return emitCompare(node as Compare);
  if (node.kind === "If") return emitIf(node as If);
  if (node.kind === "Tuple") return emitTuple(node as Tuple);
  if (node.kind === "Conditional") return emitConditional(node as Conditional);
  if (node.kind === "ForTo") return emitForTo(node as ForTo);
  if (node.kind === "ForIn") return emitForIn(node as ForIn);
  if (node.kind === "While") return emitWhile(node as While);
  if (node.kind === "Switch") return emitSwitch(node as Switch);
  if (node.kind === "Case") return emitCase(node as Case);
  if (node.kind === "BoolOp") return emitBoolOp(node as BoolOp);
  if (node.kind === "Import") return emitImport(node as Import);
  if (node.kind === "Break") return "break";
  if (node.kind === "Continue") return "continue";
  return "";
}
