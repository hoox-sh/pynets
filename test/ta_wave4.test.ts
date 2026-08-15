/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { TaEngine, type Cell } from "../src/runtime/ta.ts";

describe("ta.swma incremental", () => {
  test("omitted period is 4-sample weights 1/2/2/1", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5, 6].map((x) => ta.swma("swma:0", x));
    expect(out.slice(0, 3)).toEqual([null, null, null]);
    expect(out[3]).toBeCloseTo(2.5);
    expect(out[4]).toBeCloseTo(3.5);
    expect(out[5]).toBeCloseTo(4.5);
  });

  test("NaN period uses the same 4-sample path", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4].map((x) => ta.swma("swma:nan", x, Number.NaN));
    expect(out[3]).toBeCloseTo(2.5);
  });

  test("period 5 uses symmetric weights [1,2,3,2,1]", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5, 6].map((x) => ta.swma("swma:5", x, 5));
    expect(out.slice(0, 4)).toEqual([null, null, null, null]);
    expect(out[4]).toBeCloseTo((1 + 4 + 9 + 8 + 5) / 9);
    expect(out[5]).toBeCloseTo(4);
  });

  test("any na in window → na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5, 6, 7];
    const out = src.map((x) => ta.swma("swma:na", x));
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
    expect(out[5]).toBeNull();
    expect(out[6]).toBeNull();
    expect(ta.swma("swma:na", 8)).toBeCloseTo((5 + 12 + 14 + 8) / 6);
  });

  test("period<=0 is na; sites do not share windows", () => {
    const ta = new TaEngine();
    expect(ta.swma("swma:p", 1, 0)).toBeNull();
    expect(ta.swma("swma:p", 1, -2)).toBeNull();
    expect(ta.swma("swma:a", 1, 2)).toBeNull();
    expect(ta.swma("swma:b", 10, 2)).toBeNull();
    expect(ta.swma("swma:a", 3, 2)).toBeCloseTo(2);
    expect(ta.swma("swma:b", 30, 2)).toBeCloseTo(20);
  });
});

describe("ta.cog incremental", () => {
  test("period 3 on [1..6] matches -sum((i+1)*rev)/sum", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5, 6].map((x) => ta.cog("cog:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(-10 / 6);
    expect(out[3]).toBeCloseTo(-16 / 9);
    expect(out[4]).toBeCloseTo(-22 / 12);
    expect(out[5]).toBeCloseTo(-28 / 15);
  });

  test("zero-sum window and period<=0 are na", () => {
    const ta = new TaEngine();
    expect([1, -1, 0].map((x) => ta.cog("cog:0", x, 3))[2]).toBeNull();
    expect(ta.cog("cog:p", 1, 0)).toBeNull();
  });
});

describe("ta.tsi incremental", () => {
  test("long 3 short 2 on a rise is 100 after warmup", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5, 6].map((x) => ta.tsi("tsi:0", x, 3, 2));
    expect(out.slice(0, 4)).toEqual([null, null, null, null]);
    expect(out[4]).toBeCloseTo(100);
    expect(out[5]).toBeCloseTo(100);
  });

  test("mixed series matches nested EMA of momentum", () => {
    const ta = new TaEngine();
    const src = [10, 12, 11, 13, 9, 14, 15, 8, 12, 16];
    const out = src.map((x) => ta.tsi("tsi:m", x, 3, 2));
    expect(out.slice(0, 4)).toEqual([null, null, null, null]);
    expect(out[4]).toBeCloseTo(-11.11111111111111);
    expect(out[5]).toBeCloseTo(32.231404958677686);
    expect(out[6]).toBeCloseTo(46.30872483221476);
    expect(out[7]).toBeCloseTo(-35.58165971959075);
    expect(out[8]).toBeCloseTo(-2.0432764751973975);
    expect(out[9]).toBeCloseTo(35.67625349961822);
  });

  test("na mid-series delays seed; invalid periods are na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [10, 12, null, 13, 14, 15, 16, 17];
    const out = src.map((x) => ta.tsi("tsi:na", x, 3, 2));
    expect(out.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(out[6]).toBeCloseTo(100);
    expect(out[7]).toBeCloseTo(100);
    expect(ta.tsi("tsi:p", 1, 0, 2)).toBeNull();
    expect(ta.tsi("tsi:p2", 1, 3, 0)).toBeNull();
  });
});

describe("ta.kcw incremental", () => {
  test("(up-lo)/mid from kc; warmup is na", () => {
    const bands = new TaEngine();
    const widthTa = new TaEngine();
    const highs = [10, 12, 13, 15, 16, 18];
    const lows = [8, 9, 10, 11, 12, 14];
    const closes = [9, 11, 12, 14, 15, 17];
    const kc = highs.map((h, i) => bands.kc("kc:0", h, lows[i]!, closes[i]!, 3, 2));
    const width = highs.map((h, i) => widthTa.kcw("kcw:0", h, lows[i]!, closes[i]!, 3, 2));
    expect(width[0]).toBeNull();
    expect(width[1]).toBeNull();
    for (let i = 3; i < width.length; i++) {
      const { mid, up, lo } = kc[i]!;
      expect(width[i]).toBeCloseTo((up! - lo!) / mid!);
    }
  });

  test("mid 0 or na → na", () => {
    const zero = new TaEngine();
    const zeros = [0, 0, 0, 0];
    const zOut = zeros.map((c) => zero.kcw("kcw:0", c, c, c, 3, 2));
    expect(zOut[2]).toBeNull();
    const ta = new TaEngine();
    expect(ta.kcw("kcw:p", 10, 8, 9, 0, 2)).toBeNull();
    const naTa = new TaEngine();
    expect(naTa.kcw("kcw:na", null, null, null, 3, 2)).toBeNull();
  });
});

describe("ta.dev incremental", () => {
  test("period 3 on [1,2,3,4,5] is mean abs dev", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.dev("dev:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(2 / 3);
    expect(out[3]).toBeCloseTo(2 / 3);
    expect(out[4]).toBeCloseTo(2 / 3);
  });

  test("any na in window → na; period<=0 is na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.dev("dev:na", x, 3));
    expect(out[2]).toBeCloseTo(2 / 3);
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
    expect(ta.dev("dev:p", 1, 0)).toBeNull();
  });
});

describe("ta.variance incremental", () => {
  test("period 3 on [1,2,3,4] is sample variance", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4].map((x) => ta.variance("var:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(1);
    expect(out[3]).toBeCloseTo(1);
  });

  test("matches stdev^2; period<=1 is na; na poisons window", () => {
    const ta = new TaEngine();
    const src = [1, 2, 4, 7, 11];
    const varOut = src.map((x) => ta.variance("var:sd", x, 3));
    const sdTa = new TaEngine();
    const sdOut = src.map((x) => sdTa.stdev("sd:0", x, 3));
    for (let i = 2; i < src.length; i++) {
      expect(varOut[i]).toBeCloseTo(sdOut[i]! * sdOut[i]!);
    }
    expect(ta.variance("var:1", 1, 1)).toBeNull();
    expect(ta.variance("var:0p", 1, 0)).toBeNull();
    const naTa = new TaEngine();
    const poisoned = ([1, 2, null, 4] as Cell[]).map((x) => naTa.variance("var:na", x, 3));
    expect(poisoned[2]).toBeNull();
    expect(poisoned[3]).toBeNull();
  });
});

describe("ta.median incremental", () => {
  test("odd window is middle; even window averages the two middles", () => {
    const odd = new TaEngine();
    const even = new TaEngine();
    expect([1, 3, 2].map((x) => odd.median("med:o", x, 3))[2]).toBe(2);
    expect([1, 2, 3, 4].map((x) => even.median("med:e", x, 4))[3]).toBe(2.5);
  });

  test("needs full window; median of finite samples only", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, null, 3, 5];
    const out = src.map((x) => ta.median("med:na", x, 3));
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(2);
    expect(out[3]).toBe(4);
    expect(ta.median("med:p", 1, 0)).toBeNull();
  });
});

describe("ta.mode incremental", () => {
  test("most frequent finite value", () => {
    const ta = new TaEngine();
    const out = [1, 2, 2, 3].map((x) => ta.mode("mode:0", x, 4));
    expect(out[3]).toBe(2);
  });

  test("ties keep the first in-window value", () => {
    const ta = new TaEngine();
    expect([1, 1, 2, 2].map((x) => ta.mode("mode:t", x, 4))[3]).toBe(1);
    expect([3, 1, 2].map((x) => ta.mode("mode:u", x, 3))[2]).toBe(3);
  });

  test("needs full window; all-na window is na", () => {
    const ta = new TaEngine();
    expect(ta.mode("mode:w", 1, 3)).toBeNull();
    const out = ([null, null, null] as Cell[]).map((x) => ta.mode("mode:na", x, 3));
    expect(out[2]).toBeNull();
  });
});

describe("ta.percentrank incremental", () => {
  test("100 * count(x<current)/count", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.percentrank("pr:0", x, 5));
    expect(out.slice(0, 4)).toEqual([null, null, null, null]);
    expect(out[4]).toBe(80);
  });

  test("<2 finite samples → 50; current na → na", () => {
    const ta = new TaEngine();
    expect([5, 5, 5].map((x) => ta.percentrank("pr:flat", x, 3))[2]).toBe(0);
    const one = new TaEngine();
    const src: Cell[] = [1, null, null];
    expect(src.map((x) => one.percentrank("pr:1", x, 3))[2]).toBe(50);
    const naCur = new TaEngine();
    const mixed: Cell[] = [1, 2, null];
    expect(mixed.map((x) => naCur.percentrank("pr:na", x, 3))[2]).toBeNull();
  });
});

describe("ta.percentileNearest / percentileLinear incremental", () => {
  test("nearest rank on [1..5]", () => {
    const ta = new TaEngine();
    const src = [1, 2, 3, 4, 5];
    expect(src.map((x) => ta.percentileNearest("pn:50", x, 5, 50))[4]).toBe(3);
    expect(src.map((x) => ta.percentileNearest("pn:25", x, 5, 25))[4]).toBe(2);
    expect(src.map((x) => ta.percentileNearest("pn:75", x, 5, 75))[4]).toBe(4);
    expect(src.map((x) => ta.percentileNearest("pn:0", x, 5, 0))[4]).toBe(1);
    expect(src.map((x) => ta.percentileNearest("pn:100", x, 5, 100))[4]).toBe(5);
  });

  test("linear interpolation on [1..5]", () => {
    const ta = new TaEngine();
    const src = [1, 2, 3, 4, 5];
    expect(src.map((x) => ta.percentileLinear("pl:50", x, 5, 50))[4]).toBe(3);
    expect(src.map((x) => ta.percentileLinear("pl:25", x, 5, 25))[4]).toBe(2);
    expect(src.map((x) => ta.percentileLinear("pl:0", x, 5, 0))[4]).toBe(1);
    expect(src.map((x) => ta.percentileLinear("pl:100", x, 5, 100))[4]).toBe(5);
    expect(src.map((x) => ta.percentileLinear("pl:12.5", x, 5, 12.5))[4]).toBeCloseTo(1.5);
  });

  test("needs full window; all-na and bad period/percentage are na", () => {
    const ta = new TaEngine();
    expect(ta.percentileNearest("pn:w", 1, 3, 50)).toBeNull();
    expect(
      ([null, null, null] as Cell[]).map((x) => ta.percentileLinear("pl:na", x, 3, 50))[2],
    ).toBeNull();
    expect(ta.percentileNearest("pn:p", 1, 0, 50)).toBeNull();
    expect(ta.percentileLinear("pl:pct", 1, 3, Number.NaN)).toBeNull();
  });
});

describe("ta.cum incremental", () => {
  test("running sum; na contributes 0", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, null, 4];
    expect(src.map((x) => ta.cum("cum:0", x))).toEqual([1, 3, 3, 7]);
  });

  test("pure-na source yields 0; sites are independent", () => {
    const ta = new TaEngine();
    expect(ta.cum("cum:na", null)).toBe(0);
    expect(ta.cum("cum:na", null)).toBe(0);
    expect(ta.cum("cum:a", 5)).toBe(5);
    expect(ta.cum("cum:b", 10)).toBe(10);
    expect(ta.cum("cum:a", 2)).toBe(7);
  });
});

describe("ta.barssince incremental", () => {
  test("truthy resets to 0; else increment; never true is na", () => {
    const ta = new TaEngine();
    const cond: Cell[] = [0, 0, 1, 0, 0, 1, 0];
    expect(cond.map((c) => ta.barssince("bs:0", c))).toEqual([null, null, 0, 1, 2, 0, 1]);
  });

  test("null is not truthy; non-zero is", () => {
    const ta = new TaEngine();
    expect(ta.barssince("bs:n", null)).toBeNull();
    expect(ta.barssince("bs:n", 0)).toBeNull();
    expect(ta.barssince("bs:n", 2)).toBe(0);
    expect(ta.barssince("bs:n", 0)).toBe(1);
  });
});

describe("ta.valuewhen incremental", () => {
  test("occurrence 0 is the most recent true source", () => {
    const ta = new TaEngine();
    const cond: Cell[] = [0, 1, 0, 1, 0, 0, 1];
    const src = [10, 20, 30, 40, 50, 60, 70];
    expect(cond.map((c, i) => ta.valuewhen("vw:0", c, src[i]!))).toEqual([
      null,
      20,
      20,
      40,
      40,
      40,
      70,
    ]);
  });

  test("occurrence 1 is the previous true source", () => {
    const ta = new TaEngine();
    const cond: Cell[] = [0, 1, 0, 1, 0, 0, 1];
    const src = [10, 20, 30, 40, 50, 60, 70];
    expect(cond.map((c, i) => ta.valuewhen("vw:1", c, src[i]!, 1))).toEqual([
      null,
      null,
      null,
      20,
      20,
      20,
      40,
    ]);
  });

  test("negative occurrence is na; source na is stored", () => {
    const ta = new TaEngine();
    expect(ta.valuewhen("vw:neg", 1, 5, -1)).toBeNull();
    expect(ta.valuewhen("vw:na", 1, null)).toBeNull();
    expect(ta.valuewhen("vw:na", 0, 9)).toBeNull();
  });
});

describe("ta.range / ta.max / ta.min incremental", () => {
  test("range is highest-lowest over the period", () => {
    const ta = new TaEngine();
    const src = [1, 3, 2, 5, 4];
    const out = src.map((x) => ta.range("rng:0", x, 3));
    expect(out).toEqual([null, null, 2, 3, 3]);
  });

  test("max/min alias highest/lowest", () => {
    const ta = new TaEngine();
    const src = [1, 3, 2, 5, 4];
    const hi = src.map((x) => ta.highest("hi:0", x, 3));
    const lo = src.map((x) => ta.lowest("lo:0", x, 3));
    const mx = src.map((x) => ta.max("mx:0", x, 3));
    const mn = src.map((x) => ta.min("mn:0", x, 3));
    expect(mx).toEqual(hi);
    expect(mn).toEqual(lo);
    expect(hi).toEqual([null, null, 3, 5, 5]);
    expect(lo).toEqual([null, null, 1, 2, 2]);
  });

  test("period<=0 is na", () => {
    const ta = new TaEngine();
    expect(ta.range("rng:p", 1, 0)).toBeNull();
    expect(ta.max("mx:p", 1, 0)).toBeNull();
    expect(ta.min("mn:p", 1, 0)).toBeNull();
  });
});
