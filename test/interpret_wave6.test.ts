/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, Runtime } from "../src/index.ts";

const BARS = [100, 110].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1,
  time: 1_700_000_000_000 + i * 60_000,
}));

describe("interpret wave6", () => {
  test("strategy closedtrades after flatten", () => {
    const out = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=1)
if bar_index == 1
    strategy.close("L")
plot(strategy.closedtrades)
plot(strategy.wintrades, title="w")
plot(strategy.closedtrades.profit(0), title="p")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[1]).toBe(1);
    expect(out.series.w?.[1]).toBe(1);
    expect(out.series.p?.[1]).toBeCloseTo(10);
  });

  test("UDT new + field", () => {
    const out = interpret(
      `indicator("t")
type Point
    float x = 1
    float y = 2
p = Point.new()
plot(p.x)`,
      BARS,
    );
    expect(out.plots[0]).toBe(1);
  });

  test("enum member access", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
enum Side
    long
    short
s = Side.long
plot(s == Side.long ? 1 : 0)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(1);
  });

  test("color.red and timeframe.in_seconds", () => {
    const c = interpret(`indicator("t")\nplot(color.r(color.red))`, BARS);
    expect(c.plots[0]).toBe(255);
    const tf = new Runtime("TEST", { timeframe: "5" }).run(
      `indicator("t")\nplot(timeframe.in_seconds())`,
      BARS,
    );
    expect(tf.plots[0]).toBe(300);
  });

  test("matrix.add_row + rows", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
m = matrix.new<float>(1, 2, 0)
matrix.add_row(m)
plot(matrix.rows(m))`,
      BARS,
    );
    expect(out.plots[0]).toBe(2);
  });
});
