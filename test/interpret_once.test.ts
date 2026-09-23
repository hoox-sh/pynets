/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, interpret, parse, unparse } from "../src/index.ts";
import { PinescriptSyntaxError } from "../src/parser/error.ts";
import { compileToResult } from "../src/runtime/compile/index.ts";

const BARS = [100.5, 101.5, 102.5, 103.5, 104.5].map((close) => ({ close }));

const ONCE_COND = `indicator("t")
var int n = 0
once close > 102
    n := n + 1
plot(n)`;

const ONCE_BARE = `indicator("t")
var int n = 0
once
    n := 7
plot(n)`;

describe("once structure", () => {
  test("parse / unparse with condition", () => {
    const src = `indicator("t")
var int n = 0
once close > 102
    n := 1
plot(n)`;
    const tree = parse(src);
    expect(dump(tree)).toContain("Once");
    expect(unparse(tree)).toContain("once close > 102");
    expect(dump(parse(unparse(tree)))).toBe(dump(tree));
  });

  test("parse / unparse without condition", () => {
    const src = `indicator("t")
var int n = 0
once
    n := 1
plot(n)`;
    const tree = parse(src);
    expect(dump(tree)).toContain("Once(");
    expect(unparse(tree).includes("once\n")).toBe(true);
  });

  test("once as identifier still parses", () => {
    const tree = parse(`indicator("t")
once = 3
plot(once)`);
    expect(dump(tree)).toContain('"once"');
  });

  test("fires once on historical bars", () => {
    const out = interpret(ONCE_COND, BARS);
    expect(out.plots).toEqual([0, 0, 1, 1, 1]);
  });

  test("bare once fires on first bar", () => {
    const out = interpret(ONCE_BARE, BARS);
    expect(out.plots).toEqual([7, 7, 7, 7, 7]);
  });

  test("compile fires once on historical bars", () => {
    const out = compileToResult(ONCE_COND, BARS);
    expect(out.plots).toEqual([0, 0, 1, 1, 1]);
  });

  test("compile bare once fires on first bar", () => {
    const out = compileToResult(ONCE_BARE, BARS);
    expect(out.plots).toEqual([7, 7, 7, 7, 7]);
  });

  test("nested once inside if fires on the first true bar", () => {
    const src = `indicator("t")
var int n = 0
if close > 101
    once
        n := 4
plot(n)`;
    expect(interpret(src, BARS).plots).toEqual([0, 4, 4, 4, 4]);
    expect(compileToResult(src, BARS).plots).toEqual([0, 4, 4, 4, 4]);
  });

  test("na condition does not fire", () => {
    const src = `indicator("t")
var int n = 0
once close > close[10]
    n := 1
plot(n)`;
    expect(interpret(src, BARS).plots).toEqual([0, 0, 0, 0, 0]);
    expect(compileToResult(src, BARS).plots).toEqual([0, 0, 0, 0, 0]);
  });

  test("once cannot be assigned", () => {
    const src = `indicator("t")
x = once close > open
    1
plot(x)`;
    expect(() => parse(src)).toThrow(PinescriptSyntaxError);
  });
});
