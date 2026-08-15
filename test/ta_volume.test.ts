/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { TaEngine, type Cell } from "../src/runtime/ta.ts";

describe("ta.accdist incremental", () => {
  test("CLV * volume accumulates; close at mid is 0", () => {
    const ta = new TaEngine();
    // clv=((100-95)-(105-100))/10=0
    expect(ta.accdist("ad:0", 105, 95, 100, 1000)).toBe(0);
    // clv=((104-96)-(106-104))/10=0.6 → +720
    expect(ta.accdist("ad:0", 106, 96, 104, 1200)).toBe(720);
  });

  test("close at high is +vol; close at low is -vol", () => {
    const high = new TaEngine();
    const low = new TaEngine();
    expect(high.accdist("ad:+", 105, 95, 105, 1000)).toBe(1000);
    expect(low.accdist("ad:-", 105, 95, 95, 1000)).toBe(-1000);
  });

  test("zero range → clv 0; vol na → 0 increment", () => {
    const ta = new TaEngine();
    expect(ta.accdist("ad:0", 100, 100, 100, 1000)).toBe(0);
    expect(ta.accdist("ad:0", 105, 95, 105, null)).toBe(0);
    expect(ta.accdist("ad:0", 105, 95, 105, 500)).toBe(500);
  });

  test("H/L/C na keeps previous ad (initial 0)", () => {
    const ta = new TaEngine();
    expect(ta.accdist("ad:0", null, 95, 100, 1000)).toBe(0);
    expect(ta.accdist("ad:0", 105, 95, 105, 1000)).toBe(1000);
    expect(ta.accdist("ad:0", 106, null, 104, 1200)).toBe(1000);
    expect(ta.accdist("ad:0", 106, 96, null, 1200)).toBe(1000);
  });

  test("sites do not share state", () => {
    const ta = new TaEngine();
    expect(ta.accdist("a", 105, 95, 105, 1000)).toBe(1000);
    expect(ta.accdist("b", 105, 95, 95, 1000)).toBe(-1000);
    expect(ta.accdist("a", 105, 95, 105, 100)).toBe(1100);
  });
});

describe("ta.pvt incremental", () => {
  test("first bar 0; then adds vol*(c-prev)/prev", () => {
    const ta = new TaEngine();
    expect(ta.pvt("pvt:0", 10, 100)).toBe(0);
    expect(ta.pvt("pvt:0", 11, 200)).toBe(20);
    expect(ta.pvt("pvt:0", 12, 150)).toBeCloseTo(20 + 150 / 11);
  });

  test("prev 0 or na close skips the add", () => {
    const ta = new TaEngine();
    expect(ta.pvt("pvt:0", 10, 100)).toBe(0);
    expect(ta.pvt("pvt:0", 0, 100)).toBe(-100);
    expect(ta.pvt("pvt:0", 5, 100)).toBe(-100);
    expect(ta.pvt("pvt:0", null, 100)).toBe(-100);
    // last finite prev is 5 → add 100*(10-5)/5
    expect(ta.pvt("pvt:0", 10, 100)).toBe(0);
  });

  test("vol na counts as 0; sites stay isolated", () => {
    const ta = new TaEngine();
    expect(ta.pvt("a", 10, 100)).toBe(0);
    expect(ta.pvt("a", 11, null)).toBe(0);
    expect(ta.pvt("b", 20, 50)).toBe(0);
    expect(ta.pvt("b", 22, 100)).toBe(10);
  });
});

describe("ta.wad incremental", () => {
  test("first bar 0; up adds close-low; down subtracts high-close", () => {
    const ta = new TaEngine();
    expect(ta.wad("wad:0", 100, 90, 95)).toBe(0);
    expect(ta.wad("wad:0", 105, 95, 103)).toBe(8);
    expect(ta.wad("wad:0", 102, 92, 94)).toBe(0);
  });

  test("unchanged close and H/L/C na keep previous", () => {
    const ta = new TaEngine();
    expect(ta.wad("wad:0", 100, 90, 95)).toBe(0);
    expect(ta.wad("wad:0", 105, 95, 103)).toBe(8);
    expect(ta.wad("wad:0", 106, 96, 103)).toBe(8);
    expect(ta.wad("wad:0", null, 96, 100)).toBe(8);
    expect(ta.wad("wad:0", 104, 94, 110)).toBe(24);
  });

  test("sites do not share state", () => {
    const ta = new TaEngine();
    expect(ta.wad("a", 100, 90, 95)).toBe(0);
    expect(ta.wad("b", 100, 90, 95)).toBe(0);
    expect(ta.wad("a", 105, 95, 103)).toBe(8);
    expect(ta.wad("b", 102, 92, 90)).toBe(-12);
  });
});

describe("ta.nvi incremental", () => {
  test("starts at 1000; updates only when volume decreases", () => {
    const ta = new TaEngine();
    expect(ta.nvi("nvi:0", 100, 1000)).toBe(1000);
    expect(ta.nvi("nvi:0", 101, 900)).toBe(1010);
    expect(ta.nvi("nvi:0", 100.5, 1100)).toBe(1010);
  });

  test("prev close 0 yields no change; vol na is 0", () => {
    const ta = new TaEngine();
    expect(ta.nvi("nvi:0", 0, 100)).toBe(1000);
    expect(ta.nvi("nvi:0", 10, 50)).toBe(1000);
    expect(ta.nvi("nvi:0", 20, null)).toBe(2000);
  });

  test("sites do not share state", () => {
    const ta = new TaEngine();
    expect(ta.nvi("a", 100, 1000)).toBe(1000);
    expect(ta.nvi("b", 100, 1000)).toBe(1000);
    expect(ta.nvi("a", 110, 500)).toBe(1100);
    expect(ta.nvi("b", 90, 500)).toBe(900);
  });
});

describe("ta.pvi incremental", () => {
  test("starts at 1000; updates only when volume increases", () => {
    const ta = new TaEngine();
    expect(ta.pvi("pvi:0", 100, 1000)).toBe(1000);
    expect(ta.pvi("pvi:0", 101, 900)).toBe(1000);
    expect(ta.pvi("pvi:0", 100.5, 1100)).toBeCloseTo(1000 * (1 + (100.5 - 101) / 101));
  });

  test("equal volume does not update; sites stay isolated", () => {
    const ta = new TaEngine();
    expect(ta.pvi("a", 100, 1000)).toBe(1000);
    expect(ta.pvi("a", 110, 1000)).toBe(1000);
    expect(ta.pvi("b", 100, 100)).toBe(1000);
    expect(ta.pvi("b", 120, 200)).toBe(1200);
  });
});

describe("ta.iii incremental", () => {
  test("((2c-h-l)/(h-l))*volume; mid-range is 0", () => {
    const ta = new TaEngine();
    expect(ta.iii("iii:0", 105, 95, 100, 1000)).toBe(0);
    expect(ta.iii("iii:0", 105, 95, 105, 1000)).toBe(1000);
    expect(ta.iii("iii:0", 105, 95, 95, 1000)).toBe(-1000);
  });

  test("zero range → 0; H/L/C na → na; vol na → 0", () => {
    const ta = new TaEngine();
    expect(ta.iii("iii:0", 100, 100, 100, 1000)).toBe(0);
    expect(ta.iii("iii:0", null, 95, 100, 1000)).toBeNull();
    expect(ta.iii("iii:0", 105, null, 100, 1000)).toBeNull();
    expect(ta.iii("iii:0", 105, 95, null, 1000)).toBeNull();
    expect(ta.iii("iii:0", 105, 95, 105, null)).toBe(0);
  });
});

describe("ta.wvad incremental", () => {
  test("cumulative ((c-o)/(h-l))*volume", () => {
    const ta = new TaEngine();
    expect(ta.wvad("wvad:0", 98, 105, 95, 100, 1000)).toBe(200);
    expect(ta.wvad("wvad:0", 104, 106, 96, 104, 1200)).toBe(200);
  });

  test("zero range adds 0; O/H/L/C na keeps previous; vol na → 0", () => {
    const ta = new TaEngine();
    expect(ta.wvad("wvad:0", 100, 100, 100, 100, 1000)).toBe(0);
    expect(ta.wvad("wvad:0", 98, 105, 95, 100, 1000)).toBe(200);
    expect(ta.wvad("wvad:0", null, 105, 95, 100, 1000)).toBe(200);
    expect(ta.wvad("wvad:0", 98, 105, 95, 105, null)).toBe(200);
  });

  test("sites do not share state", () => {
    const ta = new TaEngine();
    expect(ta.wvad("a", 98, 105, 95, 100, 1000)).toBe(200);
    expect(ta.wvad("b", 102, 105, 95, 100, 1000)).toBe(-200);
  });
});

describe("ta.pivotPoints classic floor", () => {
  test("pp=(h+l+c)/3, r1=2pp-l, s1=2pp-h, r2=pp+(h-l), s2=pp-(h-l)", () => {
    const ta = new TaEngine();
    const out = ta.pivotPoints("pp:0", 12, 6, 9);
    expect(out.pp).toBe(9);
    expect(out.r1).toBe(12);
    expect(out.s1).toBe(6);
    expect(out.r2).toBe(15);
    expect(out.s2).toBe(3);
  });

  test("optional type is ignored; na high/low/close → all na", () => {
    const ta = new TaEngine();
    const classic = ta.pivotPoints("pp:0", 12, 6, 9, "classic");
    expect(classic.pp).toBe(9);
    expect(ta.pivotPoints("pp:0", null, 6, 9)).toEqual({
      pp: null,
      r1: null,
      s1: null,
      r2: null,
      s2: null,
    });
    expect(ta.pivotPoints("pp:0", 12, null, 9)).toEqual({
      pp: null,
      r1: null,
      s1: null,
      r2: null,
      s2: null,
    });
    const src: Cell = Number.NaN;
    expect(ta.pivotPoints("pp:0", 12, 6, src).pp).toBeNull();
  });
});
