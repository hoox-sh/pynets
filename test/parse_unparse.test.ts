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

  test("parse('plot(') throws", () => {
    expect(() => parse("plot(")).toThrow(PinescriptSyntaxError);
  });

  test("unparse emits //@version annotation", () => {
    const src = unparse(parse(PLOT_CLOSE));
    expect(src.startsWith("//@version=5")).toBe(true);
  });
});
