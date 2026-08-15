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

describe("derived prices + calendar", () => {
  test("hl2 / hlc3 / last_bar_index", () => {
    const hl2 = interpret(`indicator("t")\nplot(hl2)`, BARS);
    expect(hl2.plots).toEqual(BARS.map((b) => (b.high + b.low) / 2));
    const last = interpret(`indicator("t")\nplot(last_bar_index)`, BARS);
    expect(last.plots).toEqual([4, 4, 4, 4, 4]);
    const y = interpret(`indicator("t")\nplot(year)`, BARS);
    expect(y.plots[0]).toBe(2023);
  });
});

describe("na compare (Python / Pine)", () => {
  test("na==na is true; na==1 is false", () => {
    const eq = interpret(`indicator("t")\nplot(na == na ? 1 : 0)`, BARS);
    expect(eq.plots).toEqual([1, 1, 1, 1, 1]);
    const mixed = interpret(`indicator("t")\nplot(close == na ? 1 : 0)`, BARS);
    expect(mixed.plots).toEqual([0, 0, 0, 0, 0]);
    const look = interpret(`indicator("t")\nplot(close[1] == na ? 1 : 0)`, BARS);
    expect(look.plots[0]).toBe(1);
    expect(look.plots[1]).toBe(0);
  });
});

describe("math + utility wiring", () => {
  test("math.round / sign / avg / iff / fixnan", () => {
    const rnd = interpret(`indicator("t")\nplot(math.round(1.5))`, BARS);
    expect(rnd.plots[0]).toBe(2);
    const sign = interpret(`indicator("t")\nplot(math.sign(-3))`, BARS);
    expect(sign.plots[0]).toBe(-1);
    const avg = interpret(`indicator("t")\nplot(math.avg(2, 4, 6))`, BARS);
    expect(avg.plots[0]).toBe(4);
    const iff = interpret(`indicator("t")\nplot(iff(close > 3, 10, 0))`, BARS);
    expect(iff.plots).toEqual([0, 0, 0, 10, 10]);
    const fix = interpret(`indicator("t")\nplot(fixnan(close[10]))`, BARS);
    expect(fix.plots).toEqual([0, 0, 0, 0, 0]);
  });

  test("trig + string concat", () => {
    const s = interpret(`indicator("t")\nplot(math.sin(0))`, BARS);
    expect(s.plots[0]).toBe(0);
    const cat = interpret(`indicator("t")\nplot(str.length("a" + "b"))`, BARS);
    expect(cat.plots[0]).toBe(2);
  });
});

describe("array extra + strategy series", () => {
  test("array.sum / first / last", () => {
    const out = interpret(
      `indicator("t")
a = array.new_float(0)
array.push(a, 1)
array.push(a, 2)
array.push(a, 3)
plot(array.sum(a))`,
      BARS,
    );
    expect(out.plots[0]).toBe(6);
  });

  test("strategy.position_size after fillEntry", () => {
    const out = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=2)
plot(strategy.position_size)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(2);
    expect(out.plots[4]).toBe(2);
  });

  test("strategy.close_all / cancel emit events", () => {
    const out = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=1)
if bar_index == 2
    strategy.close_all()
if bar_index == 3
    strategy.cancel("L")
plot(close)`,
      BARS,
    );
    expect(out.events?.some((e) => e.type === "close" || e.type === "close_all")).toBe(true);
    expect(out.events?.some((e) => e.type === "cancel")).toBe(true);
  });
});

describe("matrix extras", () => {
  test("matrix.det / transpose / sum", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
m = matrix.new<float>(2, 2, 0)
matrix.set(m, 0, 0, 1)
matrix.set(m, 0, 1, 2)
matrix.set(m, 1, 0, 3)
matrix.set(m, 1, 1, 4)
plot(matrix.det(m))
plot(matrix.sum(m), title="sum")
plot(matrix.trace(m), title="tr")`,
      BARS,
    );
    expect(out.plots[0]).toBeCloseTo(-2);
    expect(out.series.sum?.[0]).toBe(10);
    expect(out.series.tr?.[0]).toBe(5);
  });
});

describe("ta extras", () => {
  test("ta.cross / ta.bbw resolve", () => {
    const cross = interpret(`indicator("t")\nplot(ta.cross(close, 3))`, BARS);
    expect(cross.plots.some((v) => v === 1)).toBe(true);
    const bbw = interpret(`indicator("t")\nplot(ta.bbw(close, 3, 2))`, BARS);
    expect(bbw.plots.slice(0, 2).every((v) => v == null)).toBe(true);
    expect(typeof bbw.plots[4]).toBe("number");
  });

  test("ta.cmo / ta.obv / ta.alma resolve", () => {
    const cmo = interpret(`indicator("t")\nplot(ta.cmo(close, 3))`, BARS);
    expect(cmo.plots.slice(0, 3).every((v) => v == null)).toBe(true);
    expect(typeof cmo.plots[4]).toBe("number");
    const obv = interpret(`indicator("t")\nplot(ta.obv())`, BARS);
    expect(obv.plots[0]).toBe(0);
    expect(obv.plots[1]).toBe(0);
    expect(typeof obv.plots[4]).toBe("number");
    const alma = interpret(`indicator("t")\nplot(ta.alma(close, 3))`, BARS);
    expect(alma.plots[0]).toBeNull();
    expect(typeof alma.plots[4]).toBe("number");
  });
});
