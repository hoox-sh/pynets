/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile emit for the wave10 ta.* names. Compare against interpret, which
 * already matches Python Runtime.run.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
};

function bars(n: number): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const close = 100 + 8 * Math.sin(i * 0.37) + (i % 7) * 0.4;
    const open = close - 0.3 + (i % 3) * 0.1;
    return {
      open,
      high: Math.max(open, close) + 0.8 + (i % 5) * 0.15,
      low: Math.min(open, close) - 0.6 - (i % 4) * 0.1,
      close,
      volume: 1000 + ((i * 37) % 500),
      time: i * 86_400_000,
    };
  });
}

const BARS = bars(40);

function expectPlots(body: string): void {
  const src = `indicator("t")\n${body}`;
  const compiled = new Runtime("TEST").run(src, BARS, { mode: "compile" });
  const interpreted = new Runtime("TEST").run(src, BARS, { mode: "interpret" });
  expect(compiled.error).toBeUndefined();
  expect(interpreted.error).toBeUndefined();
  expect(compiled.series).toEqual(interpreted.series);
}

describe("compile wave10 ta vs interpret", () => {
  test("ta.hammer and bare hammer", () => {
    const body = `h = ta.hammer(open, high, low, close)
plot(h.is_hammer, "hm")
plot(h.is_doji, "dj")
plot(h.pattern_strength, "hs")`;
    expectPlots(body);
    expectPlots(body.replaceAll("ta.hammer", "hammer"));
  });

  test("ta.gap_detector", () => {
    expectPlots(`g = ta.gap_detector(high, low, close[1])
plot(g.gap_size, "gs")
plot(g.gap_type, "gt")
plot(g.gap_percent, "gp")`);
  });

  test("ta.macd_signal", () => {
    expectPlots(`plot(ta.macd_signal(close[0], open[0]), "d")
plot(ta.macd_signal(na, close[0]), "n1")
plot(ta.macd_signal(close[0], na), "n2")
plot(ta.macd_signal(true, 1), "b")
plot(ta.macd_signal(5, false), "bf")`);
  });

  test("ta.acceleration_factor", () => {
    expectPlots(`plot(ta.acceleration_factor(close, 5), "af")
plot(ta.acceleration_factor(close, 5.9), "af59")
plot(ta.acceleration_factor(close, 1), "af1")
plot(ta.acceleration_factor(close, true), "afb")`);
  });

  test("ta.stoch_smooth", () => {
    expectPlots(`plot(ta.stoch_smooth(high, low, close, 14, 1, 1), "ss")
plot(ta.stoch_smooth(high, low, close, 14, 3, 3), "wide")
plot(ta.stoch_smooth(high, low, close, 3.9, 1.0, 1.2), "fl")`);
  });

  test("ta.engulfing", () => {
    expectPlots(`e = ta.engulfing(open, high, low, close)
plot(e.is_bullish, "bull")
plot(e.is_bearish, "bear")
plot(e.pattern_strength, "str")`);
  });

  test("ta.inside_bar_pattern", () => {
    expectPlots(`plot(ta.inside_bar_pattern(high, low), "ib")`);
  });

  test("ta.double_top_bottom", () => {
    expectPlots(`d = ta.double_top_bottom(high, low, 10)
plot(d.strength, "st")
plot(d.breakout_level, "bl")
plot(d.pattern_type, "pt")`);
  });

  test("ta.voi", () => {
    expectPlots(`b = volume
s = volume * 0.4
plot(ta.voi(b, s), "v")`);
  });

  test("ta.bid_ask_imbalance", () => {
    expectPlots(`b = volume
a = volume * 0.4
bp = close
ap = open
x = ta.bid_ask_imbalance(b, a, bp, ap)
plot(x.imbalance_ratio, "ir")
plot(x.spread, "sp")`);
  });

  test("ta.rsi_oversold_overbought", () => {
    expectPlots(`rsi = ta.rsi(close, 14)
s = ta.rsi_oversold_overbought(rsi, 40, 60)
plot(s.is_oversold, "os")
plot(s.is_overbought, "ob")
plot(s.rsi, "rsi")`);
  });

  test("ta.rsi_divergence", () => {
    expectPlots(`r = array.from(30.0, 40.0, 35.0, 50.0, 45.0, 60.0, 55.0)
plot(ta.rsi_divergence(r, 3), "v")`);
  });

  test("ta.cumulative_delta", () => {
    expectPlots(`plot(ta.cumulative_delta(close, volume, 5), "v")`);
  });

  test("ta.volume_momentum", () => {
    expectPlots(`plot(ta.volume_momentum(volume, 5), "v")`);
  });

  test("ta.volume_profile_high scalar and array", () => {
    expectPlots(`p = close
v = volume
plot(ta.volume_profile_high(p, v), "bar")
a = array.from(101.0, 102.0, 103.0)
b = array.from(10.0, 50.0, 20.0)
plot(ta.volume_profile_high(a, b), "arr")`);
  });

  test("ta.volume_profile_low", () => {
    expectPlots(`plot(ta.volume_profile_low(close, volume, 10, 4), "v")`);
  });

  test("ta.volume_thrust", () => {
    expectPlots(`sm = volume * 0.1
x = sm[1]
plot(ta.volume_thrust(close, volume, sm, 0.3), "v")`);
  });
});
