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
