/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret } from "../src/index.ts";

const BARS = [
  { open: 95, high: 100, low: 90, close: 95, volume: 10 },
  { open: 95, high: 105, low: 95, close: 103, volume: 2 },
  { open: 103, high: 102, low: 92, close: 94, volume: 3 },
];

const VOL1 = [
  { open: 95, high: 100, low: 90, close: 95, volume: 1 },
  { open: 95, high: 105, low: 95, close: 103, volume: 1 },
  { open: 103, high: 102, low: 92, close: 94, volume: 1 },
];

const KLINGER_BARS = [100, 101, 102, 101, 103, 104, 102, 105].map((close, i) => ({
  open: close,
  high: close + 2,
  low: close - 2,
  close,
  volume: 10 * (i + 1),
}));

describe("interpret ta.wad", () => {
  test("bar0 is 0; bar1 up is vol*(close-low)=16", () => {
    const out = interpret(`indicator("t")\nplot(ta.wad)`, BARS);
    expect(out.plots).toEqual([0, 16, -8]);
  });

  test("ta.wad() and bare wad match the attribute form", () => {
    const attr = interpret(`indicator("t")\nplot(ta.wad)`, BARS);
    const call = interpret(`indicator("t")\nplot(ta.wad())`, BARS);
    const bare = interpret(`indicator("t")\nplot(wad())`, BARS);
    expect(call.plots).toEqual(attr.plots);
    expect(bare.plots).toEqual(attr.plots);
  });

  test("4-arg form uses explicit H/L/C/V", () => {
    const out = interpret(`indicator("t")\nplot(ta.wad(high, low, close, volume))`, BARS);
    expect(out.plots).toEqual([0, 16, -8]);
  });
});

describe("interpret ta.wvad", () => {
  test("volume=1 path equals wad / rolling volume", () => {
    const wad = interpret(`indicator("t")\nplot(ta.wad)`, VOL1);
    const wvad = interpret(`indicator("t")\nplot(ta.wvad(2))`, VOL1);
    expect(wad.plots).toEqual([0, 8, 0]);
    expect(wvad.plots[0]).toBe(0);
    expect(wvad.plots[1]).toBe(4);
    expect(wvad.plots[2]).toBe(0);
  });

  test("plot(ta.wvad) attribute matches ta.wvad()", () => {
    const attr = interpret(`indicator("t")\nplot(ta.wvad)`, BARS);
    const call = interpret(`indicator("t")\nplot(ta.wvad())`, BARS);
    expect(attr.plots).toEqual(call.plots);
    expect(attr.plots[1]).toBeCloseTo(16 / 12);
  });

  test("period<=0 → 0; default period 20 matches Python", () => {
    const zero = interpret(`indicator("t")\nplot(ta.wvad(0))`, BARS);
    expect(zero.plots).toEqual([0, 0, 0]);
    const def = interpret(`indicator("t")\nplot(ta.wvad())`, BARS);
    const p20 = interpret(`indicator("t")\nplot(ta.wvad(20))`, BARS);
    expect(def.plots[1]).toBeCloseTo(16 / 12);
    expect(p20.plots[2]).toBeCloseTo(-8 / 15);
    expect(def.plots).toEqual(p20.plots);
  });

  test("bare wvad alias and 5-arg form", () => {
    const bare = interpret(`indicator("t")\nplot(wvad(20))`, BARS);
    const five = interpret(`indicator("t")\nplot(ta.wvad(high, low, close, volume, 20))`, BARS);
    expect(bare.plots[1]).toBeCloseTo(16 / 12);
    expect(five.plots).toEqual(bare.plots);
  });
});

describe("interpret ta.cmf", () => {
  test("plot(ta.cmf) attribute matches ta.cmf()", () => {
    const attr = interpret(`indicator("t")\nplot(ta.cmf)`, BARS);
    const call = interpret(`indicator("t")\nplot(ta.cmf())`, BARS);
    expect(attr.plots).toEqual(call.plots);
  });

  test("known H/L/C/V window matches Python", () => {
    const out = interpret(`indicator("t")\nplot(ta.cmf(20))`, BARS);
    expect(out.plots[0]).toBe(0);
    expect(out.plots[1]).toBeCloseTo(0.1);
    expect(out.plots[2]).toBeCloseTo(-0.04);
  });

  test("period<=0 → na", () => {
    const out = interpret(`indicator("t")\nplot(ta.cmf(0))`, BARS);
    expect(out.plots).toEqual([null, null, null]);
  });

  test("bare cmf and 5-arg (close, high, low, volume, period)", () => {
    const bare = interpret(`indicator("t")\nplot(cmf(2))`, BARS);
    const five = interpret(`indicator("t")\nplot(ta.cmf(close, high, low, volume, 2))`, BARS);
    expect(bare.plots[1]).toBeCloseTo(0.1);
    expect(bare.plots[2]).toBeCloseTo(-0.12);
    expect(five.plots).toEqual(bare.plots);
  });
});

describe("interpret ta.klinger", () => {
  test("fast=2 slow=3 last value matches Python", () => {
    const out = interpret(
      `indicator("t")\nplot(ta.klinger(high, low, close, volume, 2, 3))`,
      KLINGER_BARS,
    );
    expect(out.plots[0]).toBeNull();
    expect(out.plots[1]).toBeNull();
    expect(out.plots[2]).toBeCloseTo(13.333333333333332);
    expect(out.plots[out.plots.length - 1]).toBeCloseTo(11.089677640603568);
  });

  test("bare klinger alias matches ta.klinger", () => {
    const fq = interpret(
      `indicator("t")\nplot(ta.klinger(high, low, close, volume, 2, 3))`,
      KLINGER_BARS,
    );
    const bare = interpret(
      `indicator("t")\nplot(klinger(high, low, close, volume, 2, 3))`,
      KLINGER_BARS,
    );
    expect(bare.plots).toEqual(fq.plots);
  });
});
