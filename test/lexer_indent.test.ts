import { describe, expect, test } from "bun:test";
import { Token } from "antlr4";
import PinescriptLexer from "../src/generated/PinescriptLexer.ts";
import { tokenize } from "../src/ast/helper.ts";

function names(source: string): string[] {
  return tokenize(source)
    .filter((t) => t.channel === Token.DEFAULT_CHANNEL && t.type !== Token.EOF)
    .map((t) => PinescriptLexer.symbolicNames[t.type] ?? String(t.type));
}

describe("lexer indent / dedent", () => {
  test("if true / indented plot emits INDENT and DEDENT", () => {
    const src = "if true\n    plot(close)\n";
    const toks = names(src);
    expect(toks).toContain("IF");
    expect(toks).toContain("TRUE");
    expect(toks).toContain("INDENT");
    expect(toks).toContain("DEDENT");
    expect(toks.indexOf("INDENT")).toBeLessThan(toks.indexOf("NAME"));
    expect(toks.lastIndexOf("DEDENT")).toBeGreaterThan(toks.indexOf("NAME"));
  });
});
