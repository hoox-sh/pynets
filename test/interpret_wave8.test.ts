/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [100, 110].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1,
  time: Date.UTC(2020, 0, 1) + i * 60_000,
}));

describe("interpret wave8", () => {
  test("strategy summary on RuntimeResult", () => {
    const out = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=1)
if bar_index == 1
    strategy.close("L")
plot(strategy.netprofit)
plot(strategy.percent_profitable, title="pp")
plot(strategy.max_drawdown, title="dd")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.strategy).toBeDefined();
    expect(out.strategy?.netprofit).toBeCloseTo(10);
    expect(out.strategy?.percentProfitable).toBe(100);
    expect(out.strategy?.closedtrades).toBe(1);
    expect(out.series.pp?.[1]).toBe(100);
  });

  test("str.format_time default", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(str.length(str.format_time(timestamp(2020, 1, 1))))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBeGreaterThan(10);
  });

  test("UDT method binds this", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
type Point
    float x = 1
method double(Point this) =>
    this.x * 2
p = Point.new(x=3)
plot(p.double())`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(6);
  });

  test("import exported type + method", () => {
    const rt = new Runtime("TEST");
    rt.registerLibrarySource(
      "User",
      "Geom",
      1,
      `//@version=5
library("Geom")
export type Point
    float x = 1
export method double(Point this) =>
    this.x * 2`,
    );
    const out = rt.run(
      `indicator("t")
import User/Geom/1 as g
p = g.Point.new(x=4)
plot(p.double())`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(8);
  });

  test("line.set_xy + get_x1", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
var line ln = line.new(0, 0, 1, 1)
if bar_index == 0
    line.set_xy(ln, 2, 3, 4, 5)
plot(line.get_x1(ln))
plot(line.get_y2(ln), title="y2")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(2);
    expect(out.series.y2?.[0]).toBe(5);
  });
});
