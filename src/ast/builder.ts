/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * ANTLR parse tree → ASDL subset. Slice 1 adds assignment visits
 * (`x = …`, `var`/`varip`, `:=`) on top of slice-0 expressions;
 * TypeDef / EnumDef visit type_declaration and enum_declaration.
 */
import type { ParserRuleContext, RuleNode } from "antlr4";
import PinescriptParserVisitor from "../generated/PinescriptParserVisitor.ts";
import {
  type Additive_expressionContext,
  type Additive_opContext,
  type Argument_definitionContext,
  type Argument_listContext,
  type Attributed_type_nameContext,
  type Break_statementContext,
  type Compound_name_initializationContext,
  type Compound_reassignmentContext,
  type Compound_tuple_initializationContext,
  type Conjunction_expressionContext,
  type Continue_statementContext,
  type Declaration_modeContext,
  type Conditional_expressionContext,
  type Disjunction_expressionContext,
  type Elif_structureContext,
  type Else_blockContext,
  type Enum_declarationContext,
  type Enum_definitionContext,
  type Enum_definitionsContext,
  type Equal_trailing_pairContext,
  type Equality_expressionContext,
  type For_iteratorContext,
  type For_structureContext,
  type For_structure_inContext,
  type For_structure_toContext,
  type Function_declarationContext,
  type Greater_than_equal_trailing_pairContext,
  type Greater_than_trailing_pairContext,
  type Expression_statementContext,
  type Field_definitionContext,
  type Field_definitionsContext,
  type If_structureContext,
  type If_tailContext,
  type Indented_local_blockContext,
  type Inequality_expressionContext,
  type Less_than_equal_trailing_pairContext,
  type Less_than_trailing_pairContext,
  type Inline_local_blockContext,
  type Local_blockContext,
  type Literal_boolContext,
  type Literal_colorContext,
  type Literal_expressionContext,
  type Literal_numberContext,
  type Literal_stringContext,
  type Method_declarationContext,
  type Method_parameter_definitionContext,
  type Method_parameter_listContext,
  type Multiplicative_expressionContext,
  type Multiplicative_opContext,
  type Name_loadContext,
  type Name_storeContext,
  type NameContext,
  type Primary_expression_attributeContext,
  type Primary_expression_callContext,
  type Primary_expression_subscriptContext,
  type Not_equal_trailing_pairContext,
  type Parameter_definitionContext,
  type Parameter_listContext,
  type Simple_name_initializationContext,
  type Simple_reassignmentContext,
  type Simple_tuple_initializationContext,
  type Structure_expressionContext,
  type Structure_statementContext,
  type Switch_casesContext,
  type Switch_default_caseContext,
  type Switch_pattern_caseContext,
  type Switch_structureContext,
  type Trailing_structure_statementsContext,
  type Tuple_declarationContext,
  type Tuple_expressionContext,
  type Type_declarationContext,
  type Type_specificationContext,
  type Simple_statementsContext,
  type Start_expressionContext,
  type Start_scriptContext,
  type Grouped_expressionContext,
  type StatementContext,
  type StatementsContext,
  type Subscript_sliceContext,
  type Unary_expressionContext,
  type Unary_opContext,
  type Variable_declarationContext,
  type While_structureContext,
} from "../generated/PinescriptParser.ts";
import {
  Add,
  And,
  Div,
  Eq,
  Gt,
  GtE,
  Invert,
  Lt,
  LtE,
  NotEq,
  Load,
  Mod,
  Mult,
  NotOp,
  Or,
  Store,
  Sub,
  UAdd,
  USub,
  Var,
  VarIp,
  arg,
  assign,
  attribute,
  binOp,
  boolOp,
  breakStmt,
  call,
  caseNode,
  compare,
  conditional,
  continueStmt,
  constant,
  enumDef,
  expression,
  exprStmt,
  forIn,
  forTo,
  functionDef,
  ifExpr,
  name,
  param,
  reAssign,
  script,
  subscript,
  switchExpr,
  tupleExpr,
  typeDef,
  unaryOp,
  whileExpr,
  type Arg,
  type AST,
  type Assign,
  type Case,
  type compare_op,
  type decl_mode,
  type expr,
  type Name,
  type operator,
  type Param,
  type stmt,
  type unary_op,
} from "./nodes.ts";

function loc(node: AST, ctx: ParserRuleContext): void {
  const start = ctx.start;
  const stop = ctx.stop ?? ctx.start;
  if (start) {
    node.lineno = start.line;
    node.col_offset = start.column;
  }
  if (stop) {
    node.end_lineno = stop.line;
    const text = stop.text ?? "";
    node.end_col_offset = stop.column + text.length;
  }
}

function parseNumberLiteral(text: string): number {
  const cleaned = text.replaceAll("_", "");
  if (/^0[xX]/.test(cleaned)) return Number.parseInt(cleaned, 16);
  if (/^0[bB]/.test(cleaned)) return Number.parseInt(cleaned.slice(2), 2);
  if (/^0[oO]/.test(cleaned)) return Number.parseInt(cleaned.slice(2), 8);
  return Number(cleaned);
}

function unescapeStringBody(inner: string): string {
  let out = "";
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]!;
    if (ch !== "\\" || i + 1 >= inner.length) {
      out += ch;
      continue;
    }
    const next = inner[++i]!;
    switch (next) {
      case "n":
        out += "\n";
        break;
      case "r":
        out += "\r";
        break;
      case "t":
        out += "\t";
        break;
      case "\\":
      case "'":
      case '"':
        out += next;
        break;
      default:
        out += next;
        break;
    }
  }
  return out;
}

function parseStringLiteral(text: string): string {
  if (
    (text.startsWith('"""') && text.endsWith('"""')) ||
    (text.startsWith("'''") && text.endsWith("'''"))
  ) {
    return text.slice(3, -3);
  }
  if (text.length >= 2) {
    const q = text[0]!;
    if ((q === '"' || q === "'") && text.endsWith(q)) {
      return unescapeStringBody(text.slice(1, -1));
    }
  }
  return text;
}

function unwrap(value: unknown): unknown {
  while (Array.isArray(value) && value.length === 1) value = value[0];
  if (Array.isArray(value)) return value.map(unwrap);
  return value;
}

/** antlr4-js `getToken` may return null or a hollow object; require a real symbol. */
function hasTerminal(tok: unknown): boolean {
  if (tok == null || typeof tok !== "object") return false;
  if (!("symbol" in tok)) return false;
  return (tok as { symbol?: unknown }).symbol != null;
}

function isRuleCtx(value: unknown): value is ParserRuleContext {
  return (
    value != null &&
    typeof value === "object" &&
    "ruleIndex" in value &&
    typeof (value as { ruleIndex?: unknown }).ruleIndex === "number"
  );
}

function setStoreCtx(node: expr): expr {
  if (node.kind === "Name" || node.kind === "Attribute" || node.kind === "Subscript") {
    node.ctx = Store;
  }
  return node;
}

export class PinescriptASTBuilder extends PinescriptParserVisitor<unknown> {
  /**
   * antlr4-js default `visitChildren` includes terminals and wraps every
   * child. Skip terminals, unwrap 1-element arrays per child, but do not
   * flatten `visit()` globally (argument lists must stay arrays).
   */
  override visitChildren(node: RuleNode): unknown {
    const children = (node as ParserRuleContext).children ?? [];
    const results: unknown[] = [];
    for (const child of children) {
      if (!isRuleCtx(child)) continue;
      const accept = (child as { accept?: (v: unknown) => unknown }).accept;
      if (typeof accept !== "function") continue;
      const r = unwrap(accept.call(child, this));
      if (r !== undefined && r !== null) results.push(r);
    }
    if (results.length === 0) return undefined;
    if (results.length === 1) return results[0];
    return results;
  }

  visitStart_script = (ctx: Start_scriptContext): unknown => {
    const stmts = ctx.statements();
    const body = stmts ? (this.visit(stmts) as stmt[]) : [];
    return script(body);
  };

  visitStart_expression = (ctx: Start_expressionContext): unknown => {
    return expression(this.visit(ctx.expression()) as expr);
  };

  visitStatements = (ctx: StatementsContext): unknown => {
    const out: stmt[] = [];
    for (const stmtCtx of ctx.statement_list()) {
      const visited = unwrap(this.visit(stmtCtx)) as stmt[] | stmt | undefined;
      if (Array.isArray(visited)) out.push(...(visited as stmt[]));
      else if (visited) out.push(visited);
    }
    return out;
  };

  visitStatement = (ctx: StatementContext): unknown => {
    const comp = ctx.compound_statement();
    const simp = ctx.simple_statements();
    const trail = ctx.trailing_structure_statements();
    if (comp) return [this.visit(comp)];
    if (simp) return this.visit(simp);
    if (trail) return this.visit(trail);
    return [];
  };

  visitSimple_statements = (ctx: Simple_statementsContext): unknown => {
    return ctx.simple_statement_list().map((s) => this.visit(s));
  };

  visitExpression_statement = (ctx: Expression_statementContext): unknown => {
    const node = exprStmt(this.visit(ctx.expression()) as expr);
    loc(node, ctx);
    return node;
  };

  visitConditional_expression = (ctx: Conditional_expressionContext): unknown => {
    const test = this.visit(ctx.disjunction_expression()) as expr;
    if (hasTerminal(ctx.QUESTION())) {
      const body = this.visit(ctx.expression(0)) as expr;
      const orelse = this.visit(ctx.expression(1)) as expr;
      const node = conditional(test, body, orelse);
      loc(node, ctx);
      return node;
    }
    return test;
  };

  visitDisjunction_expression = (ctx: Disjunction_expressionContext): unknown => {
    const exprs = ctx.conjunction_expression_list() ?? [];
    if (exprs.length > 1) {
      const values = exprs.map((e) => this.visit(e) as expr);
      const node = boolOp(Or, values);
      loc(node, ctx);
      return node;
    }
    return this.visit(exprs[0]);
  };

  visitConjunction_expression = (ctx: Conjunction_expressionContext): unknown => {
    const exprs = ctx.bitwise_or_expression_list() ?? [];
    if (exprs.length > 1) {
      const values = exprs.map((e) => this.visit(e) as expr);
      const node = boolOp(And, values);
      loc(node, ctx);
      return node;
    }
    return this.visit(exprs[0]);
  };

  visitAdditive_expression = (ctx: Additive_expressionContext): unknown => {
    if (ctx.additive_op()) {
      const node = binOp(
        this.visit(ctx.additive_expression()) as expr,
        this.visit(ctx.additive_op()) as operator,
        this.visit(ctx.multiplicative_expression()) as expr,
      );
      loc(node, ctx);
      return node;
    }
    return this.visit(ctx.multiplicative_expression());
  };

  visitAdditive_op = (ctx: Additive_opContext): unknown => {
    if (ctx.PLUS()) return Add;
    if (ctx.MINUS()) return Sub;
    return Add;
  };

  visitMultiplicative_expression = (ctx: Multiplicative_expressionContext): unknown => {
    if (ctx.multiplicative_op()) {
      const node = binOp(
        this.visit(ctx.multiplicative_expression()) as expr,
        this.visit(ctx.multiplicative_op()) as operator,
        this.visit(ctx.unary_expression()) as expr,
      );
      loc(node, ctx);
      return node;
    }
    return this.visit(ctx.unary_expression());
  };

  visitMultiplicative_op = (ctx: Multiplicative_opContext): unknown => {
    if (ctx.STAR()) return Mult;
    if (ctx.SLASH()) return Div;
    if (ctx.PERCENT()) return Mod;
    return Mult;
  };

  visitUnary_expression = (ctx: Unary_expressionContext): unknown => {
    if (ctx.unary_op()) {
      const node = unaryOp(
        this.visit(ctx.unary_op()) as unary_op,
        this.visit(ctx.unary_expression()) as expr,
      );
      loc(node, ctx);
      return node;
    }
    return this.visit(ctx.primary_expression());
  };

  visitUnary_op = (ctx: Unary_opContext): unknown => {
    if (ctx.NOT()) return NotOp;
    if (ctx.PLUS()) return UAdd;
    if (ctx.MINUS()) return USub;
    if (ctx.TILDE()) return Invert;
    return UAdd;
  };

  visitPrimary_expression_call = (ctx: Primary_expression_callContext): unknown => {
    const func = this.visit(ctx.primary_expression()) as expr;
    const argsCtx = ctx.argument_list();
    const args = isRuleCtx(argsCtx) ? asArgList(this.visit(argsCtx)) : [];
    const node = call(func, args);
    loc(node, ctx);
    return node;
  };

  visitPrimary_expression_attribute = (
    ctx: Primary_expression_attributeContext,
  ): unknown => {
    const value = this.visit(ctx.primary_expression()) as expr;
    const n = this.visit(ctx.name_load()) as ReturnType<typeof name>;
    const node = attribute(value, n.id, Load);
    loc(node, ctx);
    return node;
  };

  visitPrimary_expression_subscript = (
    ctx: Primary_expression_subscriptContext,
  ): unknown => {
    const value = this.visit(ctx.primary_expression()) as expr;
    const items = this.visit(ctx.subscript_slice()) as expr;
    const node = subscript(value, items, Load);
    loc(node, ctx);
    return node;
  };

  visitArgument_list = (ctx: Argument_listContext): unknown => {
    return ctx.argument_definition_list().map((a) => this.visit(a));
  };

  visitArgument_definition = (ctx: Argument_definitionContext): unknown => {
    const store = ctx.name_store();
    let nameId: string | null = null;
    // Grammar: `(name_store EQUAL)? expression`. antlr4-js `name_store()`
    // can return a hollow object — require a real rule ctx + EQUAL.
    if (isRuleCtx(store) && hasTerminal(ctx.EQUAL())) {
      const visited = this.visit(store);
      if (typeof visited === "string") nameId = visited;
      else if (isName(visited)) nameId = visited.id;
      else {
        const text = store.getText();
        nameId = text.length > 0 ? text : null;
      }
    }
    const node = arg(this.visit(ctx.expression()) as expr, nameId);
    loc(node, ctx);
    return node;
  };

  visitSubscript_slice = (ctx: Subscript_sliceContext): unknown => {
    const items = ctx.expression_list().map((e) => this.visit(e) as expr);
    if (items.length <= 1) return items[0];
    const node = tupleExpr(items, Load);
    loc(node, ctx);
    return node;
  };

  visitLiteral_expression = (ctx: Literal_expressionContext): unknown => {
    const child = ctx.getChild(0);
    const value = this.visit(child);
    const node = constant(value);
    loc(node, ctx);
    if (isRuleCtx(ctx.literal_color())) node.kind_lit = "#";
    return node;
  };

  visitLiteral_number = (ctx: Literal_numberContext): unknown => {
    return parseNumberLiteral(ctx.getText());
  };

  visitLiteral_string = (ctx: Literal_stringContext): unknown => {
    return parseStringLiteral(ctx.getText());
  };

  visitLiteral_bool = (ctx: Literal_boolContext): unknown => {
    if (ctx.TRUE()) return true;
    if (ctx.FALSE()) return false;
    return false;
  };

  visitLiteral_color = (ctx: Literal_colorContext): unknown => {
    return ctx.getText();
  };

  visitName = (ctx: NameContext): unknown => {
    return ctx.getText();
  };

  visitName_load = (ctx: Name_loadContext): unknown => {
    const node = name(ctx.name().getText(), Load);
    loc(node, ctx);
    return node;
  };

  visitName_store = (ctx: Name_storeContext): unknown => {
    const node = name(ctx.name().getText(), Store);
    loc(node, ctx);
    return node;
  };

  visitGrouped_expression = (ctx: Grouped_expressionContext): unknown => {
    return this.visit(ctx.expression());
  };

  visitTuple_expression = (ctx: Tuple_expressionContext): unknown => {
    const elts = (ctx.expression_list() ?? []).map((e) => this.visit(e) as expr);
    const node = tupleExpr(elts, Load);
    loc(node, ctx);
    return node;
  };

  visitType_specification = (ctx: Type_specificationContext): unknown => {
    let typeSpec = this.visit(ctx.attributed_type_name()) as expr;
    if (isRuleCtx(ctx.array_type_suffix())) {
      const node = subscript(typeSpec, null, Load);
      loc(node, ctx);
      node.lineno = typeSpec.lineno;
      node.col_offset = typeSpec.col_offset;
      typeSpec = node;
    }
    return typeSpec;
  };

  visitAttributed_type_name = (ctx: Attributed_type_nameContext): unknown => {
    const names = (ctx.name_load_list() ?? []).map((n) => this.visit(n) as Name);
    if (names.length === 0) return undefined;
    let ident: expr = names[0]!;
    for (let i = 1; i < names.length; i++) {
      const part = names[i]!;
      const node = attribute(ident, part.id, Load);
      node.lineno = ident.lineno;
      node.col_offset = ident.col_offset;
      node.end_lineno = part.end_lineno ?? null;
      node.end_col_offset = part.end_col_offset ?? null;
      ident = node;
    }
    return ident;
  };

  visitSimple_name_initialization = (ctx: Simple_name_initializationContext): unknown => {
    const node = this.visit(ctx.variable_declaration()) as Assign;
    node.value = this.visit(ctx.expression()) as expr;
    if (hasTerminal(ctx.EXPORT())) node.export = 1;
    loc(node, ctx);
    return node;
  };

  visitCompound_name_initialization = (ctx: Compound_name_initializationContext): unknown => {
    const node = this.visit(ctx.variable_declaration()) as Assign;
    const valueCtx = ctx.structure_expression();
    if (isRuleCtx(valueCtx)) node.value = this.visit(valueCtx) as expr;
    if (hasTerminal(ctx.EXPORT())) node.export = 1;
    loc(node, ctx);
    return node;
  };

  visitCompound_tuple_initialization = (ctx: Compound_tuple_initializationContext): unknown => {
    const target = this.visit(ctx.tuple_declaration()) as expr;
    const value = this.visit(ctx.structure_expression()) as expr;
    const node = assign(target, value);
    loc(node, ctx);
    return node;
  };

  visitCompound_reassignment = (ctx: Compound_reassignmentContext): unknown => {
    const target = setStoreCtx(this.visit(ctx.primary_expression()) as expr);
    const value = this.visit(ctx.structure_expression()) as expr;
    const node = reAssign(target, value);
    loc(node, ctx);
    return node;
  };

  visitStructure_expression = (ctx: Structure_expressionContext): unknown => {
    return this.visit(ctx.structure());
  };

  visitTrailing_structure_statements = (ctx: Trailing_structure_statementsContext): unknown => {
    const stmts: stmt[] = [];
    for (const s of ctx.simple_statement_list() ?? []) {
      const visited = unwrap(this.visit(s));
      if (Array.isArray(visited)) stmts.push(...(visited as stmt[]));
      else if (visited) stmts.push(visited as stmt);
    }
    const structure = this.visit(ctx.structure()) as expr;
    const wrapped = exprStmt(structure);
    const structCtx = ctx.structure();
    if (isRuleCtx(structCtx)) loc(wrapped, structCtx);
    else loc(wrapped, ctx);
    stmts.push(wrapped);
    return stmts;
  };

  visitSimple_tuple_initialization = (ctx: Simple_tuple_initializationContext): unknown => {
    const target = this.visit(ctx.tuple_declaration()) as expr;
    const value = this.visit(ctx.expression()) as expr;
    const node = assign(target, value);
    loc(node, ctx);
    return node;
  };

  visitSimple_reassignment = (ctx: Simple_reassignmentContext): unknown => {
    const target = setStoreCtx(this.visit(ctx.primary_expression()) as expr);
    const value = this.visit(ctx.expression()) as expr;
    const node = reAssign(target, value);
    loc(node, ctx);
    return node;
  };

  visitVariable_declaration = (ctx: Variable_declarationContext): unknown => {
    const target = this.visit(ctx.name_store()) as expr;
    const typeCtx = ctx.type_specification();
    const modeCtx = ctx.declaration_mode();
    const typeSpec = isRuleCtx(typeCtx) ? ((this.visit(typeCtx) as expr | undefined) ?? null) : null;
    const mode = isRuleCtx(modeCtx) ? ((this.visit(modeCtx) as decl_mode | undefined) ?? null) : null;
    const node = assign(target, null, typeSpec, mode);
    loc(node, ctx);
    return node;
  };

  visitTuple_declaration = (ctx: Tuple_declarationContext): unknown => {
    const elts = ctx.name_store_list().map((n) => this.visit(n) as expr);
    const node = tupleExpr(elts, Store);
    loc(node, ctx);
    return node;
  };

  visitDeclaration_mode = (ctx: Declaration_modeContext): unknown => {
    if (hasTerminal(ctx.VARIP())) return VarIp;
    if (hasTerminal(ctx.VAR())) return Var;
    return undefined;
  };

  visitFunction_declaration = (ctx: Function_declarationContext): unknown => {
    const fname = this.visit(ctx.name()) as string;
    const argsCtx = ctx.parameter_list();
    const args = isRuleCtx(argsCtx) ? asParamList(this.visit(argsCtx)) : [];
    const body = asStmtList(this.visit(ctx.local_block()));
    const exported = hasTerminal(ctx.EXPORT()) ? 1 : 0;
    const node = functionDef(fname, args, body, 0, exported);
    loc(node, ctx);
    return node;
  };

  visitParameter_list = (ctx: Parameter_listContext): unknown => {
    return ctx.parameter_definition_list().map((p) => this.visit(p));
  };

  visitParameter_definition = (ctx: Parameter_definitionContext): unknown => {
    const nameNode = this.visit(ctx.name_store()) as ReturnType<typeof name>;
    const defaultCtx = ctx.expression();
    const typeCtx = ctx.type_specification();
    const defaultValue = isRuleCtx(defaultCtx)
      ? ((this.visit(defaultCtx) as expr | undefined) ?? null)
      : null;
    const typeSpec = isRuleCtx(typeCtx) ? ((this.visit(typeCtx) as expr | undefined) ?? null) : null;
    const node = param(nameNode.id, defaultValue, typeSpec);
    loc(node, ctx);
    return node;
  };

  visitMethod_declaration = (ctx: Method_declarationContext): unknown => {
    const fname = this.visit(ctx.name()) as string;
    const argsCtx = ctx.method_parameter_list();
    const args = isRuleCtx(argsCtx) ? asParamList(this.visit(argsCtx)) : [];
    const body = asStmtList(this.visit(ctx.local_block()));
    const exported = hasTerminal(ctx.EXPORT()) ? 1 : 0;
    const node = functionDef(fname, args, body, 1, exported);
    loc(node, ctx);
    return node;
  };

  visitMethod_parameter_list = (ctx: Method_parameter_listContext): unknown => {
    return ctx.method_parameter_definition_list().map((p) => this.visit(p));
  };

  visitMethod_parameter_definition = (ctx: Method_parameter_definitionContext): unknown => {
    const typeCtx = ctx.type_specification();
    const nameCtx = ctx.name_store();
    if (isRuleCtx(typeCtx) && isRuleCtx(nameCtx)) {
      const typeSpec = (this.visit(typeCtx) as expr | undefined) ?? null;
      const nameNode = this.visit(nameCtx) as ReturnType<typeof name>;
      const node = param(nameNode.id, null, typeSpec);
      loc(node, ctx);
      return node;
    }
    return this.visit(ctx.parameter_definition());
  };

  visitType_declaration = (ctx: Type_declarationContext): unknown => {
    const tname = this.visit(ctx.name()) as string;
    const body = asStmtList(this.visit(ctx.field_definitions()));
    const exported = hasTerminal(ctx.EXPORT()) ? 1 : 0;
    const node = typeDef(tname, body, exported);
    loc(node, ctx);
    return node;
  };

  visitEnum_declaration = (ctx: Enum_declarationContext): unknown => {
    const ename = this.visit(ctx.name()) as string;
    const body = asStmtList(this.visit(ctx.enum_definitions()));
    const exported = hasTerminal(ctx.EXPORT()) ? 1 : 0;
    const node = enumDef(ename, body, exported);
    loc(node, ctx);
    return node;
  };

  visitField_definitions = (ctx: Field_definitionsContext): unknown => {
    return ctx.field_definition_list().map((d) => this.visit(d));
  };

  visitField_definition = (ctx: Field_definitionContext): unknown => {
    const target = this.visit(ctx.name_store()) as expr;
    const valueCtx = ctx.expression();
    const typeCtx = ctx.type_specification();
    const value = isRuleCtx(valueCtx) ? ((this.visit(valueCtx) as expr | undefined) ?? null) : null;
    const typeSpec = isRuleCtx(typeCtx) ? ((this.visit(typeCtx) as expr | undefined) ?? null) : null;
    const mode = hasTerminal(ctx.VARIP()) ? VarIp : null;
    const node = assign(target, value, typeSpec, mode);
    loc(node, ctx);
    return node;
  };

  visitEnum_definitions = (ctx: Enum_definitionsContext): unknown => {
    return ctx.enum_definition_list().map((d) => this.visit(d));
  };

  visitEnum_definition = (ctx: Enum_definitionContext): unknown => {
    const target = this.visit(ctx.name_store()) as expr;
    const valueCtx = ctx.expression();
    const value = isRuleCtx(valueCtx) ? ((this.visit(valueCtx) as expr | undefined) ?? null) : null;
    const node = assign(target, value);
    loc(node, ctx);
    return node;
  };

  visitStructure_statement = (ctx: Structure_statementContext): unknown => {
    const node = exprStmt(this.visit(ctx.structure()) as expr);
    loc(node, ctx);
    return node;
  };

  visitIf_structure = (ctx: If_structureContext): unknown => {
    const test = this.visit(ctx.expression()) as expr;
    const body = asStmtList(this.visit(ctx.local_block()));
    const tail = ctx.if_tail();
    const orelse = isRuleCtx(tail) ? asStmtList(this.visit(tail)) : [];
    const node = ifExpr(test, body, orelse);
    loc(node, ctx);
    return node;
  };

  visitFor_structure = (ctx: For_structureContext): unknown => {
    const to = ctx.for_structure_to();
    if (isRuleCtx(to)) return this.visit(to);
    const inn = ctx.for_structure_in();
    if (isRuleCtx(inn)) return this.visit(inn);
    return this.visitChildren(ctx);
  };

  visitFor_iterator = (ctx: For_iteratorContext): unknown => {
    const tup = ctx.tuple_declaration();
    if (isRuleCtx(tup)) return this.visit(tup);
    return this.visit(ctx.name_store());
  };

  visitFor_structure_to = (ctx: For_structure_toContext): unknown => {
    const target = this.visit(ctx.for_iterator()) as expr;
    const start = this.visit(ctx.expression(0)) as expr;
    const end = this.visit(ctx.expression(1)) as expr;
    const stepCtx = ctx.expression(2);
    const step = isRuleCtx(stepCtx) ? ((this.visit(stepCtx) as expr | undefined) ?? null) : null;
    const body = asStmtList(this.visit(ctx.local_block()));
    const node = forTo(target, start, end, body, step);
    loc(node, ctx);
    return node;
  };

  visitFor_structure_in = (ctx: For_structure_inContext): unknown => {
    const target = this.visit(ctx.for_iterator()) as expr;
    const iterable = this.visit(ctx.expression()) as expr;
    const body = asStmtList(this.visit(ctx.local_block()));
    const node = forIn(target, iterable, body);
    loc(node, ctx);
    return node;
  };

  visitWhile_structure = (ctx: While_structureContext): unknown => {
    const test = this.visit(ctx.expression()) as expr;
    const body = asStmtList(this.visit(ctx.local_block()));
    const node = whileExpr(test, body);
    loc(node, ctx);
    return node;
  };

  visitSwitch_structure = (ctx: Switch_structureContext): unknown => {
    const cases = asCaseList(this.visit(ctx.switch_cases()));
    const subjectCtx = ctx.expression();
    const subject = isRuleCtx(subjectCtx)
      ? ((this.visit(subjectCtx) as expr | undefined) ?? null)
      : null;
    const node = switchExpr(cases, subject);
    loc(node, ctx);
    return node;
  };

  visitSwitch_cases = (ctx: Switch_casesContext): unknown => {
    const cases: unknown[] = (ctx.switch_pattern_case_list() ?? []).map((c) => this.visit(c));
    const defaultCase = ctx.switch_default_case();
    if (isRuleCtx(defaultCase)) cases.push(this.visit(defaultCase));
    return cases;
  };

  visitSwitch_pattern_case = (ctx: Switch_pattern_caseContext): unknown => {
    const body = asStmtList(this.visit(ctx.local_block()));
    const pattern = this.visit(ctx.expression()) as expr;
    const node = caseNode(body, pattern);
    loc(node, ctx);
    return node;
  };

  visitSwitch_default_case = (ctx: Switch_default_caseContext): unknown => {
    const body = asStmtList(this.visit(ctx.local_block()));
    const node = caseNode(body, null);
    loc(node, ctx);
    return node;
  };

  visitElif_structure = (ctx: Elif_structureContext): unknown => {
    const test = this.visit(ctx.expression()) as expr;
    const body = asStmtList(this.visit(ctx.local_block()));
    const tail = ctx.if_tail();
    const orelse = isRuleCtx(tail) ? asStmtList(this.visit(tail)) : [];
    const inner = ifExpr(test, body, orelse);
    loc(inner, ctx);
    const wrapped = exprStmt(inner);
    loc(wrapped, ctx);
    return [wrapped];
  };

  visitIf_tail = (ctx: If_tailContext): unknown => {
    const elif = ctx.elif_structure();
    if (isRuleCtx(elif)) return this.visit(elif);
    const els = ctx.else_block();
    if (isRuleCtx(els)) return this.visit(els);
    return [];
  };

  visitElse_block = (ctx: Else_blockContext): unknown => {
    return this.visit(ctx.local_block());
  };

  visitLocal_block = (ctx: Local_blockContext): unknown => {
    const indented = ctx.indented_local_block();
    if (isRuleCtx(indented)) return this.visit(indented);
    const inline = ctx.inline_local_block();
    if (isRuleCtx(inline)) return this.visit(inline);
    return [];
  };

  visitIndented_local_block = (ctx: Indented_local_blockContext): unknown => {
    return this.visit(ctx.statements());
  };

  visitInline_local_block = (ctx: Inline_local_blockContext): unknown => {
    return asStmtList(this.visit(ctx.statement()));
  };

  visitEquality_expression = (ctx: Equality_expressionContext): unknown => {
    const left = this.visit(ctx.inequality_expression()) as expr;
    const pairs = ctx.equality_trailing_pair_list() ?? [];
    if (pairs.length === 0) return left;
    const ops: compare_op[] = [];
    const comparators: expr[] = [];
    for (const p of pairs) {
      const pair = this.visit(p) as [compare_op, expr];
      ops.push(pair[0]);
      comparators.push(pair[1]);
    }
    const node = compare(left, ops, comparators);
    loc(node, ctx);
    return node;
  };

  visitEqual_trailing_pair = (ctx: Equal_trailing_pairContext): unknown => {
    return [Eq, this.visit(ctx.inequality_expression())];
  };

  visitNot_equal_trailing_pair = (ctx: Not_equal_trailing_pairContext): unknown => {
    return [NotEq, this.visit(ctx.inequality_expression())];
  };

  visitInequality_expression = (ctx: Inequality_expressionContext): unknown => {
    const left = this.visit(ctx.shift_expression()) as expr;
    const pairs = ctx.inequality_trailing_pair_list() ?? [];
    if (pairs.length === 0) return left;
    const ops: compare_op[] = [];
    const comparators: expr[] = [];
    for (const p of pairs) {
      const pair = unwrap(this.visit(p)) as [compare_op, expr];
      ops.push(pair[0]);
      comparators.push(pair[1]);
    }
    const node = compare(left, ops, comparators);
    loc(node, ctx);
    return node;
  };

  visitLess_than_equal_trailing_pair = (ctx: Less_than_equal_trailing_pairContext): unknown => {
    return [LtE, this.visit(ctx.shift_expression())];
  };

  visitLess_than_trailing_pair = (ctx: Less_than_trailing_pairContext): unknown => {
    return [Lt, this.visit(ctx.shift_expression())];
  };

  visitGreater_than_equal_trailing_pair = (ctx: Greater_than_equal_trailing_pairContext): unknown => {
    return [GtE, this.visit(ctx.shift_expression())];
  };

  visitGreater_than_trailing_pair = (ctx: Greater_than_trailing_pairContext): unknown => {
    return [Gt, this.visit(ctx.shift_expression())];
  };

  visitBreak_statement = (ctx: Break_statementContext): unknown => {
    const node = breakStmt();
    loc(node, ctx);
    return node;
  };

  visitContinue_statement = (ctx: Continue_statementContext): unknown => {
    const node = continueStmt();
    loc(node, ctx);
    return node;
  };
}

function asStmtList(value: unknown): stmt[] {
  const u = unwrap(value);
  if (u == null) return [];
  if (Array.isArray(u)) return u.filter(Boolean) as stmt[];
  return [u as stmt];
}

function asParamList(value: unknown): Param[] {
  const u = unwrap(value);
  if (u == null) return [];
  if (Array.isArray(u)) return u.filter(Boolean) as Param[];
  return [u as Param];
}

function asArgList(value: unknown): Arg[] {
  const u = unwrap(value);
  if (u == null) return [];
  if (Array.isArray(u)) return u.filter(Boolean) as Arg[];
  return [u as Arg];
}

function asCaseList(value: unknown): Case[] {
  const u = unwrap(value);
  if (u == null) return [];
  if (Array.isArray(u)) return u.filter(Boolean) as Case[];
  return [u as Case];
}

function isName(value: unknown): value is Name {
  return (
    value != null &&
    typeof value === "object" &&
    (value as { kind?: unknown }).kind === "Name" &&
    typeof (value as { id?: unknown }).id === "string"
  );
}
