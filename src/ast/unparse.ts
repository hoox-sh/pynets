/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Slice-1 unparser: expressions plus Assign / ReAssign / var / varip,
 * Tuple / Conditional / ForTo / ForIn / While / Switch / Case /
 * BoolOp / Break / Continue / TypeDef / EnumDef.
 */
import type {
  AST,
  Arg,
  Assign,
  Attribute,
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
  Name,
  Param,
  ReAssign,
  Script,
  Subscript,
  Switch,
  Tuple,
  TypeDef,
  UnaryOp,
  While,
  expr,
  stmt,
} from "./nodes.ts";

const OP: Record<string, string> = {
  Add: "+",
  Sub: "-",
  Mult: "*",
  Div: "/",
  Mod: "%",
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
      return `${emitExpr(node.value)}.${node.attr}`;
    case "Subscript":
      return `${emitExpr(node.value)}[${node.slice ? emitExpr(node.slice) : ""}]`;
    case "BinOp":
      return `${emitExpr(node.left)} ${OP[node.op.kind] ?? "?"} ${emitExpr(node.right)}`;
    case "UnaryOp":
      return `${UOP[node.op.kind] ?? ""}${emitExpr(node.operand)}`;
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
  }
}

function emitCompare(node: Compare): string {
  let out = emitExpr(node.left);
  for (let i = 0; i < node.ops.length; i++) {
    out += ` ${CMP[node.ops[i]!.kind] ?? "??"} ${emitExpr(node.comparators[i]!)}`;
  }
  return out;
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

function emitConditional(node: Conditional): string {
  return `${emitExpr(node.test)} ? ${emitExpr(node.body)} : ${emitExpr(node.orelse)}`;
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
  return node.values.map(emitExpr).join(` ${op} `);
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
  return `${emitExpr(node.func)}(${asArgs(node.args).map(emitArg).join(", ")})`;
}

function emitStmt(node: stmt): string {
  if (node == null || typeof node !== "object") return "";
  if (node.kind === "Expr") return emitExpr(node.value);
  if (node.kind === "Assign") return emitAssign(node);
  if (node.kind === "ReAssign") return emitReAssign(node);
  if (node.kind === "FunctionDef") return emitFunctionDef(node);
  if (node.kind === "TypeDef") return emitTypeDef(node);
  if (node.kind === "EnumDef") return emitEnumDef(node);
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
  if (node.kind === "FunctionDef") return emitFunctionDef(node as FunctionDef);
  if (node.kind === "TypeDef") return emitTypeDef(node as TypeDef);
  if (node.kind === "EnumDef") return emitEnumDef(node as EnumDef);
  if (node.kind === "Param") return emitParam(node as Param);
  if (node.kind === "Var") return "var";
  if (node.kind === "VarIp") return "varip";
  if (node.kind === "Call") return emitCall(node as Call);
  if (node.kind === "Name") return (node as Name).id;
  if (node.kind === "Constant") return emitConstant(node as Constant);
  if (node.kind === "Arg") return emitArg(node as Arg);
  if (node.kind === "Attribute") {
    const a = node as Attribute;
    return `${emitExpr(a.value)}.${a.attr}`;
  }
  if (node.kind === "Subscript") {
    const s = node as Subscript;
    return `${emitExpr(s.value)}[${s.slice ? emitExpr(s.slice) : ""}]`;
  }
  if (node.kind === "BinOp") {
    const b = node as BinOp;
    return `${emitExpr(b.left)} ${OP[b.op.kind] ?? "?"} ${emitExpr(b.right)}`;
  }
  if (node.kind === "UnaryOp") {
    const u = node as UnaryOp;
    return `${UOP[u.op.kind] ?? ""}${emitExpr(u.operand)}`;
  }
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
  if (node.kind === "Break") return "break";
  if (node.kind === "Continue") return "continue";
  return "";
}
