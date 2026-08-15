/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5, 6, 7, 8].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 10 + i,
  time: 1_700_000_000_000 + i * 60_000,
}));

describe("interpret TA surface", () => {
  test("ta.swma / ta.cum / ta.barssince", () => {
    const swma = interpret(`indicator("t")\nplot(ta.swma(close))`, BARS);
    expect(swma.plots.slice(0, 3).every((v) => v == null)).toBe(true);
    expect(typeof swma.plots[7]).toBe("number");
    const cum = interpret(`indicator("t")\nplot(ta.cum(close))`, BARS);
    expect(cum.plots[7]).toBe(36);
    const since = interpret(`indicator("t")\nplot(ta.barssince(close == 5))`, BARS);
    expect(since.plots[4]).toBe(0);
    expect(since.plots[7]).toBe(3);
  });

  test("ta.accdist attribute and ta.wpr", () => {
    const ad = interpret(`indicator("t")\nplot(ta.accdist)`, BARS);
    expect(typeof ad.plots[7]).toBe("number");
    const wpr = interpret(`indicator("t")\nplot(ta.wpr(3))`, BARS);
    expect(wpr.plots[0]).toBeNull();
    expect(typeof wpr.plots[7]).toBe("number");
  });
});
