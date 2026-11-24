/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Realtime tick rollback must cover every stateful TA kernel, not only the
 * three that used to call `TaEngine.markDirty`. Re-ticking the same forming
 * bar with identical OHLC must produce the same final series as one tick.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = Array.from({ length: 10 }, (_, i) => ({
  open: 100 + i * 0.7,
  high: 102 + i * 1.5,
  low: 99 - i * 0.5,
  close: 101 + i + (i % 3 === 0 ? 0.4 : -0.2),
  volume: 1000 + i * 7,
  time: i * 60_000,
}));

const CASES: Array<{ id: string; body: string }> = [
  { id: "atr", body: `plot(ta.atr(3), "v")` },
  { id: "rma", body: `plot(ta.rma(close, 3), "v")` },
  { id: "stdev", body: `plot(ta.stdev(close, 3), "v")` },
  { id: "change", body: `plot(ta.change(close, 1), "v")` },
  { id: "bbw", body: `plot(ta.bbw(close, 3, 2), "v")` },
  { id: "stoch", body: `plot(ta.stoch(close, high, low, 3), "v")` },
  {
    id: "crossover",
    body: `plot(ta.crossover(close, ta.sma(close, 3)), "v")`,
  },
  { id: "supertrend", body: `plot(ta.supertrend(3, 3).st, "v")` },
  { id: "macd", body: `plot(ta.macd(close, 3, 6, 4).macd, "v")` },
];

function run(body: string, ticks: number) {
  return new Runtime("TEST").run(`indicator("t")\n${body}`, BARS, {
    realtimeLastBar: true,
    realtimeTicks: ticks,
  });
}

describe("realtime TA rollback", () => {
  for (const c of CASES) {
    test(`${c.id} is idempotent across forming-bar ticks`, () => {
      const one = run(c.body, 1);
      const three = run(c.body, 3);
      expect(one.error).toBeUndefined();
      expect(three.error).toBeUndefined();
      expect(three.series.v).toEqual(one.series.v);
    });
  }
});
