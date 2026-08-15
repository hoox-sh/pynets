/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, interpret, parse, unparse } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));

describe("if / compare", () => {
  test("parse bar_index == 1 if", () => {
    const src = `indicator("t")
if bar_index == 1
    plot(close)
plot(close, title="c")`;
    const tree = parse(src);
    const dumped = dump(tree);
    expect(dumped).toContain("If");
    expect(dumped).toContain("Compare");
    expect(unparse(tree)).toContain("bar_index == 1");
  });

  test("if bar_index == 1 does not plot on bar 0", () => {
    const out = interpret(
      `indicator("t")
x = 0
if bar_index == 1
    x := 9
plot(x)`,
      BARS,
    );
    expect(out.plots).toEqual([0, 9, 0, 0, 0]);
  });

  test("if close > 2", () => {
    const out = interpret(
      `indicator("t")
x = 0
if close > 2
    x := 1
plot(x)`,
      BARS,
    );
    expect(out.plots).toEqual([0, 0, 1, 1, 1]);
  });
});
