/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { compileToResult, interpret } from "../src/index.ts";

type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
};

function bars(n: number, step = 86_400_000): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const close = 100 + 8 * Math.sin(i * 0.37) + (i % 7) * 0.4;
    const open = close - 0.3 + (i % 3) * 0.1;
    return {
      open,
      high: Math.max(open, close) + 0.8 + (i % 5) * 0.15,
      low: Math.min(open, close) - 0.6 - (i % 4) * 0.1,
      close,
      volume: 1000 + ((i * 37) % 500),
      time: i * step,
    };
  });
}

const BARS40 = bars(40);
const HOURLY = bars(24, 3_600_000);

function expectPlots(src: string, ohlcv: Bar[] = BARS40): void {
  expect(compileToResult(src, ohlcv).plots).toEqual(interpret(src, ohlcv).plots);
}

describe("compile vs interpret gap", () => {
  test("ta.uo", () => {
    expectPlots(`indicator("t")\nplot(ta.uo(7, 14, 28))`);
  });

  test("ta.dpo", () => {
    expectPlots(`indicator("t")\nplot(ta.dpo(20))`);
  });

  test("ta.donchian via .high", () => {
    expectPlots(`indicator("t")
dc = ta.donchian(20)
plot(dc.high)`);
  });

  test("ta.stochrsi via .stochrsi", () => {
    expectPlots(`indicator("t")
s = ta.stochrsi(14, 14)
plot(s.stochrsi)`);
  });

  test("matrix.sum_row", () => {
    expectPlots(`indicator("t")
m = matrix.new<float>(2, 2, 0)
matrix.set(m, 0, 0, 1)
matrix.set(m, 0, 1, 2)
matrix.set(m, 1, 0, 3)
matrix.set(m, 1, 1, 4)
plot(matrix.sum_row(m, 0))`);
  });

  test('timeframe.change("60")', () => {
    expectPlots(`indicator("t")\nplot(timeframe.change("60") ? 1 : 0)`, HOURLY);
  });

  test("time_close", () => {
    expectPlots(`indicator("t")\nplot(time_close)`);
  });

  test("round_to_mintick vs math.round_to_mintick", () => {
    const srcBare = `indicator("t")\nplot(round_to_mintick(1.26))`;
    const srcMath = `indicator("t")\nplot(math.round_to_mintick(1.26))`;
    expectPlots(srcBare);
    expectPlots(srcMath);
    expect(compileToResult(srcBare, BARS40).plots).toEqual(compileToResult(srcMath, BARS40).plots);
  });

  test("array.newint", () => {
    expectPlots(`indicator("t")
a = array.newint(3, 1)
plot(array.get(a, 0))`);
  });

  test("plotcandle", () => {
    expectPlots(`indicator("t")\nplotcandle(open, high, low, close)`);
  });

  test("ta.rci / ta.kst / ta.bb_pct / ta.emv", () => {
    expectPlots(`indicator("t")\nplot(ta.rci(close, 9))`);
    expectPlots(`indicator("t")\nplot(ta.kst(10, 15, 20, 30))`);
    expectPlots(`indicator("t")\nplot(ta.bb_pct(20, 2))`);
    expectPlots(`indicator("t")\nplot(ta.emv(14))`);
  });

  test("ta.ichimoku / ta.fractal / ta.atr_stop / ta.zigzag", () => {
    expectPlots(`indicator("t")
i = ta.ichimoku(9, 26)
plot(i.tenkan_sen)`);
    expectPlots(`indicator("t")
f = ta.fractal(2)
plot(f.is_high_fractal)`);
    expectPlots(`indicator("t")
stops = ta.atr_stop(ta.atr(14), 2.0)
plot(stops.long_stop)`);
    expectPlots(`indicator("t")
[h, l, d] = ta.zigzag(close, 5)
plot(h)`);
  });

  test("time_close() / plotbar / array.newbox / syminfo.prefix", () => {
    expectPlots(`indicator("t")\nplot(time_close())`);
    expectPlots(`indicator("t")\nplotbar(open, high, low, close)`);
    expectPlots(`indicator("t")
b = array.newbox(2, 7)
plot(array.get(b, 1))`);
    expectPlots(`indicator("t")\nplot(syminfo.prefix("NASDAQ:AAPL") == "NASDAQ" ? 1 : 0)`);
  });
});
