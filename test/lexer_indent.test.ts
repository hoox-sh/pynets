import { describe, expect, test } from "bun:test";
import { Token } from "antlr4";
import PinescriptLexer from "../src/generated/PinescriptLexer.ts";
import { parse, tokenize } from "../src/ast/helper.ts";

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

describe("lexer square-bracket wrap parity (Sept 2026 release notes)", () => {
  test("wrapped [...] allows any indent without INDENT/DEDENT", () => {
    for (const n of [1, 2, 3, 4, 8]) {
      const pad = " ".repeat(n);
      const toks = names(`x = close[\n${pad}1]\nplot(x)\n`);
      expect(toks).not.toContain("INDENT");
      expect(toks).not.toContain("DEDENT");
      expect(() =>
        parse(`//@version=5\nindicator("t")\nx = close[\n${pad}1]\nplot(x)\n`),
      ).not.toThrow();
    }
  });

  test("wrapped history-ref expression and tuple parse", () => {
    for (const n of [1, 2, 3]) {
      const pad = " ".repeat(n);
      expect(() =>
        parse(
          `//@version=5\nindicator("t")\nx = close[1 +\n${pad}2]\nplot(x)\n`,
        ),
      ).not.toThrow();
      expect(() =>
        parse(
          `//@version=5\nindicator("t")\n[a, b] = [close,\n${pad}open]\nplot(a)\n`,
        ),
      ).not.toThrow();
    }
  });

  test("newline directly before the closing bracket parses", () => {
    expect(() =>
      parse('//@version=5\nindicator("t")\nx = close[1\n]\nplot(x)\n'),
    ).not.toThrow();
  });

  test("unbalanced bracket does not poison later parses", () => {
    expect(() =>
      parse('//@version=5\nindicator("t")\nplot(close[1)\n'),
    ).toThrow();
    expect(() =>
      parse('//@version=5\nindicator("t")\nplot(close)\n'),
    ).not.toThrow();
  });
});
