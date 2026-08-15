/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Public parse / unparse / dump — mirrors pynescript.ast.helper.
 */
import { CharStreams, CommonTokenStream, Token } from "antlr4";
import { PinescriptASTBuilder } from "./builder.ts";
import { dump } from "./dump.ts";
import { unparse } from "./unparse.ts";
import type { AST, Script } from "./nodes.ts";
import PinescriptLexer from "../generated/PinescriptLexer.ts";
import PinescriptParser from "../generated/PinescriptParser.ts";
import { PinescriptErrorListener, PinescriptSyntaxError } from "../parser/error.ts";

export { dump, unparse };
export { PinescriptSyntaxError };

export type ParseMode = "exec" | "eval";

function attachAnnotations(tree: AST, tokens: CommonTokenStream): void {
  if (tree.kind !== "Script") return;
  const script = tree as Script;
  tokens.fill();
  const anns: string[] = [];
  for (const tok of tokens.tokens) {
    if (tok == null || tok.type !== PinescriptLexer.COMMENT) continue;
    const text = (tok.text ?? "").trim();
    if (text.startsWith("//@")) anns.push(text);
  }
  if (anns.length) script.annotations = anns;
}

export function parse(
  source: string,
  _filename = "<unknown>",
  mode: ParseMode = "exec",
): AST {
  if (mode !== "exec" && mode !== "eval") {
    throw new Error(`invalid argument mode: ${mode}`);
  }
  const stream = CharStreams.fromString(source);
  const lexer = new PinescriptLexer(stream);
  const tokens = new CommonTokenStream(lexer);
  const parser = new PinescriptParser(tokens);
  const listener = PinescriptErrorListener.INSTANCE;

  lexer.removeErrorListeners();
  parser.removeErrorListeners();
  lexer.addErrorListener(listener as never);
  parser.addErrorListener(listener as never);

  const rule = mode === "exec" ? parser.start_script() : parser.start_expression();
  const builder = new PinescriptASTBuilder();
  const node = builder.visit(rule) as AST;
  if (!node || typeof node !== "object" || !("kind" in node)) {
    throw new PinescriptSyntaxError("parse produced no AST");
  }
  if (mode === "exec" && source.includes("@")) {
    attachAnnotations(node, tokens);
  }
  return node;
}

export function tokenize(source: string): Token[] {
  const stream = CharStreams.fromString(source);
  const lexer = new PinescriptLexer(stream);
  lexer.removeErrorListeners();
  lexer.addErrorListener(PinescriptErrorListener.INSTANCE as never);
  const tokens: Token[] = [];
  for (;;) {
    const tok = lexer.nextToken();
    tokens.push(tok);
    if (tok.type === Token.EOF) break;
  }
  return tokens;
}
