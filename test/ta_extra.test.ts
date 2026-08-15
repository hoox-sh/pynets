/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { TaEngine, type Cell } from "../src/runtime/ta.ts";

describe("ta.alma incremental", () => {
  test("period 3 default offset/sigma on [1,2,3,4]", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4].map((x) => ta.alma("alma:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    const m = 0.85 * 2;
    const s = 3 / 6;
    const w = [0, 1, 2].map((i) => Math.exp(-((i - m) ** 2) / (2 * s * s)));
    const wsum = w[0]! + w[1]! + w[2]!;
    expect(out[2]).toBeCloseTo((1 * w[0]! + 2 * w[1]! + 3 * w[2]!) / wsum);
    expect(out[3]).toBeCloseTo((2 * w[0]! + 3 * w[1]! + 4 * w[2]!) / wsum);
  });

  test("any na in window → na; does not reuse a poisoned value", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.alma("alma:0", x, 3));
    expect(out[2]).not.toBeNull();
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
  });

  test("period<=0 or non-finite offset/sigma → na", () => {
    const ta = new TaEngine();
    expect(ta.alma("a:0", 1, 0)).toBeNull();
    expect(ta.alma("a:1", 1, 3, Number.NaN, 6)).toBeNull();
    expect(ta.alma("a:2", 1, 3, 0.85, Number.POSITIVE_INFINITY)).toBeNull();
  });

  test("sites do not share windows", () => {
    const ta = new TaEngine();
    expect(ta.alma("a", 1, 2)).toBeNull();
    expect(ta.alma("b", 10, 2)).toBeNull();
    expect(ta.alma("a", 3, 2)).toBeCloseTo(
      (() => {
        const m = 0.85;
        const s = 2 / 6;
        const w0 = Math.exp(-((0 - m) ** 2) / (2 * s * s));
        const w1 = Math.exp(-((1 - m) ** 2) / (2 * s * s));
        return (1 * w0 + 3 * w1) / (w0 + w1);
      })(),
    );
    expect(ta.alma("b", 30, 2)).not.toBeNull();
  });
});

describe("ta.cmo incremental", () => {
  test("period 3 on a pure rise is 100 after n+1 samples", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.cmo("cmo:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeNull();
    expect(out[3]).toBe(100);
    expect(out[4]).toBe(100);
  });

  test("mixed window: (up-down)/(up+down)*100", () => {
    const ta = new TaEngine();
    const out = [1, 3, 2, 4].map((x) => ta.cmo("cmo:0", x, 2));
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(100 / 3);
    expect(out[3]).toBeCloseTo(100 / 3);
  });

  test("flat window / zero denom → 0; na pairs skipped", () => {
    const ta = new TaEngine();
    expect([4, 4, 4].map((x) => ta.cmo("cmo:flat", x, 2))[2]).toBe(0);
    const src: Cell[] = [1, 2, null, 4];
    const out = src.map((x) => ta.cmo("cmo:na", x, 2));
    expect(out[2]).toBe(100);
    expect(out[3]).toBe(0);
  });

  test("period<=0 → na", () => {
    const ta = new TaEngine();
    expect(ta.cmo("cmo:0", 1, 0)).toBeNull();
    expect(ta.cmo("cmo:0", 1, -2)).toBeNull();
  });
});

describe("ta.kama incremental", () => {
  test("period 3: first output on bar index length (need length+1 samples)", () => {
    const ta = new TaEngine();
    const src = [1, 2, 3, 4, 5];
    const out = src.map((x) => ta.kama("kama:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeNull();
    const fastest = 2 / 3;
    const slowest = 2 / 31;
    const sc = fastest * fastest;
    const k3 = 3 + sc * (4 - 3);
    expect(out[3]).toBeCloseTo(k3);
    expect(out[4]).toBeCloseTo(k3 + sc * (5 - k3));
  });

  test("na source returns na and does not seed", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, null, 3, 4];
    const out = src.map((x) => ta.kama("kama:0", x, 3));
    expect(out[2]).toBeNull();
    expect(out[3]).toBeNull();
    expect(typeof out[4]).toBe("number");
  });

  test("sites are independent", () => {
    const ta = new TaEngine();
    [1, 2, 3, 4].forEach((x) => ta.kama("a", x, 3));
    expect(ta.kama("b", 10, 3)).toBeNull();
  });
});

describe("ta.obv incremental", () => {
  test("0 until 3 samples; then signed volume from the 3rd bar", () => {
    const ta = new TaEngine();
    const close = [10, 11, 12, 11, 11];
    const vol = [1, 1, 2, 3, 4];
    const out = close.map((c, i) => ta.obv("obv:0", c, vol[i]!));
    expect(out).toEqual([0, 0, 2, -1, -1]);
  });

  test("na close skips the add; na volume counts as 0", () => {
    const ta = new TaEngine();
    const close: Cell[] = [10, 11, null, 13];
    const vol: Cell[] = [1, 1, 5, null];
    const out = close.map((c, i) => ta.obv("obv:0", c, vol[i]!));
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBe(0);
    expect(out[3]).toBe(0);
  });
});

describe("ta.pivothigh / pivotlow incremental", () => {
  test("left-only high: current > last `left` bars after left+right warmup", () => {
    const ta = new TaEngine();
    const src = [1, 3, 2, 4, 0];
    const out = src.map((x) => ta.pivothigh("ph:0", x, 1, 1));
    expect(out).toEqual([null, null, null, 4, null]);
  });

  test("left-only low", () => {
    const ta = new TaEngine();
    const src = [3, 1, 2, 0, 4];
    const out = src.map((x) => ta.pivotlow("pl:0", x, 1, 1));
    expect(out).toEqual([null, null, null, 0, null]);
  });

  test("negative / non-finite bars → na; left=0 every bar after warmup", () => {
    const ta = new TaEngine();
    expect(ta.pivothigh("ph:0", 1, -1, 1)).toBeNull();
    expect(ta.pivothigh("ph:1", 1, Number.NaN, 1)).toBeNull();
    const out = [1, 2, 3].map((x) => ta.pivothigh("ph:2", x, 0, 0));
    expect(out).toEqual([1, 2, 3]);
  });

  test("does not share state across sites", () => {
    const ta = new TaEngine();
    [1, 5, 2].forEach((x) => ta.pivothigh("a", x, 1, 1));
    expect(ta.pivothigh("b", 1, 1, 1)).toBeNull();
  });
});

describe("ta.hma incremental", () => {
  test("period 4 warms up then is finite", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5, 6].map((x) => ta.hma("hma:0", x, 4));
    expect(out[0]).toBeNull();
    expect(out[3]).toBeNull();
    expect(typeof out[5]).toBe("number");
    expect(Number.isFinite(out[5]!)).toBe(true);
  });

  test("period<=0 → na", () => {
    const ta = new TaEngine();
    expect(ta.hma("hma:0", 1, 0)).toBeNull();
  });
});

describe("ta.mfi incremental", () => {
  test("needs period+1 typical prices", () => {
    const ta = new TaEngine();
    const h = [10, 11, 12, 13];
    const l = [8, 9, 10, 11];
    const c = [9, 10, 11, 12];
    const v = [1, 1, 1, 1];
    const out = h.map((x, i) => ta.mfi("mfi:0", x, l[i]!, c[i]!, v[i]!, 2));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBe(100);
    expect(out[3]).toBe(100);
  });

  test("na high poisons that bar", () => {
    const ta = new TaEngine();
    expect(ta.mfi("mfi:0", null, 8, 9, 1, 2)).toBeNull();
    expect(ta.mfi("mfi:0", 11, 9, 10, 1, 2)).toBeNull();
    expect(ta.mfi("mfi:0", 12, 10, 11, 1, 2)).toBeNull();
  });
});

describe("ta.sar incremental", () => {
  test("first valid bar is the low", () => {
    const ta = new TaEngine();
    expect(ta.sar("sar:0", 10, 8)).toBe(8);
    const second = ta.sar("sar:0", 12, 9);
    expect(typeof second).toBe("number");
    expect(Number.isFinite(second!)).toBe(true);
  });

  test("leading na stays na; non-finite params → na", () => {
    const ta = new TaEngine();
    expect(ta.sar("sar:0", null, 8)).toBeNull();
    expect(ta.sar("sar:0", 10, 8)).toBe(8);
    expect(ta.sar("sar:1", 10, 8, Number.NaN)).toBeNull();
  });
});

describe("ta.adx / ta.dmi incremental", () => {
  test("adx is 0 while warming then finite", () => {
    const ta = new TaEngine();
    const h = [10, 12, 13, 15, 16, 18];
    const l = [8, 9, 10, 11, 12, 14];
    const c = [9, 11, 12, 14, 15, 17];
    const out = h.map((x, i) => ta.adx("adx:0", x, l[i]!, c[i]!, 3));
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(typeof out[5]).toBe("number");
    expect(Number.isFinite(out[5]!)).toBe(true);
  });

  test("dmi returns plus/minus/adx; invalid diLength is all na", () => {
    const ta = new TaEngine();
    expect(ta.dmi("dmi:0", 10, 8, 9, 0, 3)).toEqual({ plus: null, minus: null, adx: null });
    const r = ta.dmi("dmi:1", 10, 8, 9, 3, 3);
    expect(r.plus === null || typeof r.plus === "number").toBe(true);
  });
});

describe("ta.correlation incremental", () => {
  test("period 3 on a line is 1", () => {
    const ta = new TaEngine();
    const a = [1, 2, 3, 4];
    const b = [2, 4, 6, 8];
    const out = a.map((x, i) => ta.correlation("corr:0", x, b[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(1);
    expect(out[3]).toBeCloseTo(1);
  });

  test("length<2 or zero variance → na", () => {
    const ta = new TaEngine();
    expect(ta.correlation("c:0", 1, 1, 1)).toBeNull();
    const out = [1, 1, 1].map((x) => ta.correlation("c:1", x, x, 3));
    expect(out[2]).toBeNull();
  });
});

describe("ta.accdist incremental", () => {
  test("flat bar (h==l) adds 0; CLV * volume accumulates", () => {
    const ta = new TaEngine();
    expect(ta.accdist("ad", 2, 2, 2, 10)).toBe(0);
    // h=3 l=1 c=3 → clv = 1; * vol 4 → 4
    expect(ta.accdist("ad", 3, 1, 3, 4)).toBe(4);
    // na high keeps last
    expect(ta.accdist("ad", null, 1, 2, 10)).toBe(4);
  });
});

describe("ta call-site isolation", () => {
  test("sma windows are per site", () => {
    const ta = new TaEngine();
    expect(ta.sma("x", 1, 2)).toBeNull();
    expect(ta.sma("y", 10, 2)).toBeNull();
    expect(ta.sma("x", 3, 2)).toBe(2);
    expect(ta.sma("y", 20, 2)).toBe(15);
  });
});
