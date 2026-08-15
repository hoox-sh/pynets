import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";
import { PinescriptSyntaxError } from "../src/parser/error.ts";

const PLOT_CLOSE = `//@version=5
indicator("fp_plot_close")
plot(close, title="close")`;

const TINY = `indicator("t")
plot(close)`;

describe("parse / unparse", () => {
  test("plot_close fixture round-trips by dump", () => {
    const tree = parse(PLOT_CLOSE);
    expect(tree.kind).toBe("Script");
    const again = parse(unparse(tree));
    expect(dump(again)).toBe(dump(tree));
  });

  test("indicator + plot(close) is a Script with two calls", () => {
    const tree = parse(TINY);
    expect(tree.kind).toBe("Script");
    const dumped = dump(tree);
    expect(dumped).toContain("indicator");
    expect(dumped).toContain("plot");
    expect(dumped).toContain("close");
    expect(unparse(tree)).toContain('indicator("t")');
    expect(unparse(tree)).toContain("plot(close)");
  });

  test("eval mode parses an expression", () => {
    const tree = parse("close + 1", "<unknown>", "eval");
    expect(tree.kind).toBe("Expression");
    expect(unparse(tree)).toBe("close + 1");
  });

  test("parse('plot(') throws PinescriptSyntaxError with lineno/col_offset", () => {
    expect(() => parse("plot(")).toThrow(PinescriptSyntaxError);
    try {
      parse("plot(");
      throw new Error("expected parse to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(PinescriptSyntaxError);
      const pe = err as PinescriptSyntaxError;
      expect(pe.lineno).toBe(1);
      expect(typeof pe.col_offset).toBe("number");
      expect(pe.col_offset).toBeGreaterThanOrEqual(0);
    }
  });

  test("unparse emits //@version annotation", () => {
    const src = unparse(parse(PLOT_CLOSE));
    expect(src.startsWith("//@version=5")).toBe(true);
  });

  test("m[1, 2] unparses as comma slice and re-parses", () => {
    const tree = parse("x = m[1, 2]");
    expect(unparse(tree)).toBe("x = m[1, 2]");
    expect(dump(parse(unparse(tree)))).toBe(dump(tree));
  });

  test("function / switch / for round-trip by dump", () => {
    const src = `f(x) => x + 1
y = switch
    close > 0 => 1
    => 0
for i = 0 to 3
    plot(i)
`;
    const tree = parse(src);
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    expect(dumped).toContain("Switch");
    expect(dumped).toContain("ForTo");
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });
});
