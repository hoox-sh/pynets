/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 10,
  time: 1_700_000_000_000 + i * 60_000,
}));

describe("interpret wave3 wiring", () => {
  test("ta.hma / ta.adx resolve", () => {
    const hma = interpret(`indicator("t")\nplot(ta.hma(close, 4))`, BARS);
    expect(hma.plots.some((v) => v != null)).toBe(true);
    const adx = interpret(`indicator("t")\nplot(ta.adx(3))`, BARS);
    expect(adx.plots.length).toBe(5);
  });

  test("str.startswith / tonumber / substring", () => {
    const a = interpret(`indicator("t")\nplot(str.startswith("hello", "he") ? 1 : 0)`, BARS);
    expect(a.plots[0]).toBe(1);
    const n = interpret(`indicator("t")\nplot(str.tonumber("12.5"))`, BARS);
    expect(n.plots[0]).toBe(12.5);
    const s = interpret(`indicator("t")\nplot(str.length(str.substring("hello", 1, 3)))`, BARS);
    expect(s.plots[0]).toBe(2);
  });

  test("request.financial is na; currency_rate same pair is 1", () => {
    const fin = interpret(`indicator("t")\nplot(na(request.financial("AAPL", "net_income", "FQ")) ? 1 : 0)`, BARS);
    expect(fin.plots[0]).toBe(1);
    const fx = interpret(`indicator("t")\nplot(request.currency_rate("USD", "USD"))`, BARS);
    expect(fx.plots[0]).toBe(1);
  });

  test("matrix.inv 2x2 identity product", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
m = matrix.new<float>(2, 2, 0)
matrix.set(m, 0, 0, 1)
matrix.set(m, 0, 1, 2)
matrix.set(m, 1, 0, 3)
matrix.set(m, 1, 1, 4)
inv = matrix.inv(m)
plot(matrix.get(inv, 0, 0))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBeCloseTo(-2);
  });

  test("strategy limit entry fills when low crosses", () => {
    const out = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=1, limit=2.5)
plot(strategy.position_size)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(0);
    expect(out.plots[4]).toBe(1);
  });

  test("table.new / line.delete do not throw", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
t = table.new(position.top_right, 1, 1)
ln = line.new(bar_index, close, bar_index, close)
line.delete(ln)
plot(1)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(1);
    expect(out.drawings?.some((d) => d.kind === "table")).toBe(true);
  });
});
