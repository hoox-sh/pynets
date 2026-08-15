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

  test("4-space indent is one INDENT; operator line-join hides NEWLINE", () => {
    const indented = names("if true\n    x = 1\n");
    expect(indented.filter((t) => t === "INDENT")).toHaveLength(1);
    expect(indented.filter((t) => t === "DEDENT")).toHaveLength(1);

    const joined = names("x = 1 +\n    2\n");
    expect(joined).not.toContain("INDENT");
    expect(joined).toContain("PLUS");
    expect(joined.filter((t) => t === "NEWLINE")).toHaveLength(1);
  });
});
