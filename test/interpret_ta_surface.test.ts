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

  test("ta.vpt aliases ta.pvt and bar 0 is 0", () => {
    const pvt = interpret(`indicator("t")\nplot(ta.pvt)`, BARS);
    const vpt = interpret(`indicator("t")\nplot(ta.vpt)`, BARS);
    expect(pvt.plots[0]).toBe(0);
    expect(vpt.plots).toEqual(pvt.plots);
  });

  test("ta.ao attribute and ta.aroon unpack", () => {
    const long = Array.from({ length: 40 }, (_, i) => ({
      open: 100 + i,
      high: 101 + i,
      low: 99 + i,
      close: 100 + i,
      volume: 1,
    }));
    const ao = interpret(`indicator("t")\nplot(ta.ao)`, long);
    expect(ao.plots.slice(0, 33).every((v) => v == null)).toBe(true);
    expect(typeof ao.plots[33]).toBe("number");
    const aroon = interpret(
      `indicator("t")\n[adown, aup] = ta.aroon(14)\nplot(aup)`,
      long,
    );
    expect(aroon.plots.slice(0, 14).every((v) => v == null)).toBe(true);
    expect(typeof aroon.plots[14]).toBe("number");
  });

  test("ta.accdist attribute and ta.wpr", () => {
    const ad = interpret(`indicator("t")\nplot(ta.accdist)`, BARS);
    expect(typeof ad.plots[7]).toBe("number");
    const wpr = interpret(`indicator("t")\nplot(ta.wpr(3))`, BARS);
    expect(wpr.plots[0]).toBeNull();
    expect(typeof wpr.plots[7]).toBe("number");
  });
});
