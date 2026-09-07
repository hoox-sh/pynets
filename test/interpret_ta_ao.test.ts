/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

function bars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    open: 100 + i * 0.1,
    high: 101 + i * 0.2,
    low: 99 + i * 0.05,
    close: 100.5 + i * 0.1,
    volume: 1000 + i,
    time: i * 86_400_000,
  }));
}

describe("interpret ta.ao / ta.aroon", () => {
  test("plot(ta.ao) first finite at bar 33", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(ta.ao)`,
      bars(40),
    );
    expect(out.error).toBeUndefined();
    expect(out.plots.slice(0, 33).every((v) => v == null)).toBe(true);
    expect(typeof out.plots[33]).toBe("number");
    expect(Number.isFinite(out.plots[33]!)).toBe(true);
  });

  test("plot(ta.ao()) matches plot(ta.ao)", () => {
    const srcAttr = `indicator("t")
plot(ta.ao)`;
    const srcCall = `indicator("t")
plot(ta.ao())`;
    const ohlcv = bars(40);
    const a = new Runtime("TEST").run(srcAttr, ohlcv);
    const b = new Runtime("TEST").run(srcCall, ohlcv);
    expect(a.error).toBeUndefined();
    expect(b.error).toBeUndefined();
    expect(a.plots).toEqual(b.plots);
  });

  test("ta.ao(2, 3) on hl2=close is 0.5 after warmup", () => {
    const ohlcv = [1, 2, 3, 4, 5].map((c) => ({
      open: c,
      high: c + 1,
      low: c - 1,
      close: c,
      volume: 1,
    }));
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(ta.ao(2, 3))`,
      ohlcv,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots).toEqual([null, null, 0.5, 0.5, 0.5]);
  });

  test("[adown, aup] = ta.aroon(14) first finite at bar 14", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
[adown, aup] = ta.aroon(14)
plot(aup)`,
      bars(20),
    );
    expect(out.error).toBeUndefined();
    expect(out.plots.slice(0, 14).every((v) => v == null)).toBe(true);
    expect(typeof out.plots[14]).toBe("number");
    expect(Number.isFinite(out.plots[14]!)).toBe(true);
  });

  test("plot(ta.ao) last value matches Python Runtime on 80 bars", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(ta.ao, "ao")
[adown, aup] = ta.aroon(14)
plot(aup, "aup")
plot(adown, "adown")`,
      bars(80),
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[33]).toBeCloseTo(1.8125);
    expect(out.plots.at(-1)).toBeCloseTo(1.8125);
    const series = (out as { series?: Record<string, Array<number | null>> }).series;
    expect(series?.aup?.at(-1)).toBe(100);
    expect(series?.adown?.at(-1)).toBe(0);
    expect(series?.aup?.[14]).toBe(100);
  });

  test("ta.aroon(2) unpack matches kernel ties", () => {
    const ohlcv = [
      { open: 1, high: 1, low: 0, close: 1, volume: 1 },
      { open: 2, high: 3, low: 1, close: 2, volume: 1 },
      { open: 2, high: 2, low: 0, close: 2, volume: 1 },
    ];
    const up = new Runtime("TEST").run(
      `indicator("t")
[adown, aup] = ta.aroon(2)
plot(aup)`,
      ohlcv,
    );
    const down = new Runtime("TEST").run(
      `indicator("t")
[adown, aup] = ta.aroon(2)
plot(adown)`,
      ohlcv,
    );
    expect(up.error).toBeUndefined();
    expect(down.error).toBeUndefined();
    expect(up.plots).toEqual([null, null, 50]);
    expect(down.plots).toEqual([null, null, 0]);
  });
});

// Non-monotonic bars so ao/aroon outputs distinguish different lengths
// (monotonic data pins aroon up at 100 / down at 0 for every length).
function wigglyBars(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const c = 100 + 10 * Math.sin(i * 1.7) + (i % 5);
    return { open: c, high: c + 1, low: c - 1, close: c, volume: 1, time: i * 86_400_000 };
  });
}

function plotsOf(body: string, ohlcv: ReturnType<typeof bars>): Array<number | null> {
  const out = new Runtime("TEST").run(`indicator("t")\n${body}`, ohlcv);
  expect(out.error).toBeUndefined();
  return out.plots;
}

describe("interpret ta.ao / ta.aroon fractional length gate (Python _is_period_like)", () => {
  test("ta.ao(7.5, 34) ignores fractional fast → default 5 (behaves as ta.ao())", () => {
    const b = wigglyBars(80);
    expect(plotsOf("plot(ta.ao(7.5, 34))", b)).toEqual(plotsOf("plot(ta.ao())", b));
    expect(plotsOf("plot(ta.ao(7.5, 34))", b)).not.toEqual(plotsOf("plot(ta.ao(7, 34))", b));
  });

  test("ta.ao(7.0, 34.0) whole floats pass as 7/34", () => {
    const b = wigglyBars(80);
    expect(plotsOf("plot(ta.ao(7.0, 34.0))", b)).toEqual(plotsOf("plot(ta.ao(7, 34))", b));
  });

  test("ta.aroon(20.5) ignores fractional length → default 14 (behaves as ta.aroon())", () => {
    const b = wigglyBars(60);
    expect(plotsOf("[d, u] = ta.aroon(20.5)\nplot(u)", b)).toEqual(
      plotsOf("[d, u] = ta.aroon()\nplot(u)", b),
    );
    expect(plotsOf("[d, u] = ta.aroon(20.5)\nplot(u)", b)).not.toEqual(
      plotsOf("[d, u] = ta.aroon(20)\nplot(u)", b),
    );
  });
});

describe("interpret ta.ao / ta.aroon kwarg append fallback (Python legacy merge)", () => {
  test("ta.ao(slow=10) appends kwarg positionally → fast=10", () => {
    const b = wigglyBars(80);
    expect(plotsOf("plot(ta.ao(slow=10))", b)).toEqual(plotsOf("plot(ta.ao(10))", b));
    expect(plotsOf("plot(ta.ao(slow=10))", b)).not.toEqual(plotsOf("plot(ta.ao())", b));
  });

  test("ta.ao(len=8) binds fast=8 — kwarg names are ignored, order only", () => {
    const b = wigglyBars(80);
    expect(plotsOf("plot(ta.ao(len=8))", b)).toEqual(plotsOf("plot(ta.ao(8))", b));
    expect(plotsOf("plot(ta.ao(len=8))", b)).not.toEqual(plotsOf("plot(ta.ao())", b));
  });

  test("ta.ao(2, slow=3) appends kwarg after positionals → ao(2, 3)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.ao(2, slow=3))", b)).toEqual(plotsOf("plot(ta.ao(2, 3))", b));
  });

  test("ta.ao(slow=3, fast=2) binds in kwarg order → fast=3, slow=2", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.ao(slow=3, fast=2))", b)).toEqual(plotsOf("plot(ta.ao(3, 2))", b));
    expect(plotsOf("plot(ta.ao(slow=3, fast=2))", b)).not.toEqual(plotsOf("plot(ta.ao(2, 3))", b));
  });

  test("ta.aroon(length=20) appends kwarg positionally → length=20", () => {
    const b = wigglyBars(60);
    expect(plotsOf("[d, u] = ta.aroon(length=20)\nplot(u)", b)).toEqual(
      plotsOf("[d, u] = ta.aroon(20)\nplot(u)", b),
    );
    expect(plotsOf("[d, u] = ta.aroon(length=20)\nplot(u)", b)).not.toEqual(
      plotsOf("[d, u] = ta.aroon()\nplot(u)", b),
    );
  });

  test("ta.aroon(3, length=5) appends → length=3 (kwarg name does not bind)", () => {
    const b = wigglyBars(60);
    expect(plotsOf("[d, u] = ta.aroon(3, length=5)\nplot(u)", b)).toEqual(
      plotsOf("[d, u] = ta.aroon(3)\nplot(u)", b),
    );
    expect(plotsOf("[d, u] = ta.aroon(3, length=5)\nplot(u)", b)).not.toEqual(
      plotsOf("[d, u] = ta.aroon(5)\nplot(u)", b),
    );
  });
});
