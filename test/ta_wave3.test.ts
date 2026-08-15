/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { TaEngine, type Cell } from "../src/runtime/ta.ts";

describe("ta.hma incremental", () => {
  test("period 4 on [1..8] warms up then 5,6,7,8", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => ta.hma("hma:0", x, 4));
    expect(out.slice(0, 4)).toEqual([null, null, null, null]);
    expect(out[4]).toBeCloseTo(5);
    expect(out[5]).toBeCloseTo(6);
    expect(out[6]).toBeCloseTo(7);
    expect(out[7]).toBeCloseTo(8);
  });

  test("period 1 is the source", () => {
    const ta = new TaEngine();
    expect(ta.hma("hma:1", 4, 1)).toBe(4);
    expect(ta.hma("hma:1", 9, 1)).toBe(9);
  });

  test("period<=0 returns null", () => {
    const ta = new TaEngine();
    expect(ta.hma("hma:0", 1, 0)).toBeNull();
    expect(ta.hma("hma:0", 1, -2)).toBeNull();
  });

  test("call sites do not share wma state", () => {
    const ta = new TaEngine();
    const a = [1, 2, 3, 4, 5].map((x) => ta.hma("hma:a", x, 4));
    const b = [1, 2, 3, 4, 5].map((x) => ta.hma("hma:b", x, 4));
    expect(a).toEqual(b);
    expect(a[4]).toBeCloseTo(5);
  });
});

describe("ta.mfi incremental", () => {
  const highs = [10, 12, 11, 13, 14, 15, 16];
  const lows = [8, 9, 8, 10, 11, 12, 13];
  const closes = [9, 11, 10, 12, 13, 14, 15];
  const vols = [100, 100, 100, 100, 100, 100, 100];

  test("period 3 needs 4 typical prices then matches Python", () => {
    const ta = new TaEngine();
    const out = highs.map((h, i) => ta.mfi("mfi:0", h, lows[i]!, closes[i]!, vols[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeNull();
    expect(out[3]).toBeCloseTo(69.79166666666667);
    expect(out[4]).toBeCloseTo(71.56862745098039);
    expect(out[5]).toBe(100);
    expect(out[6]).toBe(100);
  });

  test("only +MF → 100, only −MF → 0, equal TP → 50", () => {
    const up = new TaEngine();
    const down = new TaEngine();
    const flat = new TaEngine();
    const plus = [10, 11, 12, 13, 14].map((h) =>
      up.mfi("mfi:+", h, h - 2, h - 1, 100, 2),
    );
    const minus = [14, 13, 12, 11, 10].map((h) =>
      down.mfi("mfi:-", h, h - 2, h - 1, 100, 2),
    );
    const eq = [10, 10, 10, 10].map((h) => flat.mfi("mfi:=", h, 8, 9, 100, 2));
    expect(plus.slice(0, 2)).toEqual([null, null]);
    expect(plus.slice(2)).toEqual([100, 100, 100]);
    expect(minus.slice(2)).toEqual([0, 0, 0]);
    expect(eq.slice(2)).toEqual([50, 50]);
  });

  test("na high/low/close poisons that window", () => {
    const ta = new TaEngine();
    const hs: Cell[] = [10, null, 12, 13, 14];
    const ls = [8, 9, 10, 11, 12];
    const cs = [9, 10, 11, 12, 13];
    const out = hs.map((h, i) => ta.mfi("mfi:na", h, ls[i]!, cs[i]!, 100, 2));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeNull();
    expect(out[3]).toBeNull();
    expect(out[4]).toBe(100);
  });

  test("missing volume counts as 0; period<=0 is na", () => {
    const ta = new TaEngine();
    expect(ta.mfi("mfi:p", 10, 8, 9, 100, 0)).toBeNull();
    const out = [10, 11, 12].map((h) => ta.mfi("mfi:v", h, h - 2, h - 1, null, 2));
    expect(out[2]).toBe(50);
  });
});

describe("ta.sar incremental", () => {
  test("matches Python state machine on a short rising series", () => {
    const ta = new TaEngine();
    const highs = [10, 12, 11, 13, 14, 15, 16];
    const lows = [8, 9, 8, 10, 11, 12, 13];
    const out = highs.map((h, i) => ta.sar("sar:0", h, lows[i]!));
    expect(out[0]).toBe(8);
    expect(out[1]).toBeCloseTo(8.04);
    expect(out[2]).toBeCloseTo(12);
    expect(out[3]).toBeCloseTo(8);
    expect(out[4]).toBeCloseTo(8.1);
    expect(out[5]).toBeCloseTo(8.336);
    expect(out[6]).toBeCloseTo(8.73584);
  });

  test("leading na stays na then starts at first valid low", () => {
    const ta = new TaEngine();
    const highs: Cell[] = [null, null, 10, 12, 13, 11, 14];
    const lows: Cell[] = [null, null, 8, 9, 10, 8, 11];
    const out = highs.map((h, i) => ta.sar("sar:na", h, lows[i]!));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBe(8);
    expect(out[3]).toBeCloseTo(8.04);
    expect(out[4]).toBeCloseTo(8.1984);
    expect(out[5]).toBeCloseTo(13);
    expect(out[6]).toBeCloseTo(8);
  });

  test("custom start/increment/maximum are per-site", () => {
    const ta = new TaEngine();
    const a = ta.sar("sar:a", 10, 8, 0.02, 0.02, 0.2);
    const b = ta.sar("sar:b", 10, 8, 0.01, 0.01, 0.1);
    expect(a).toBe(8);
    expect(b).toBe(8);
    expect(ta.sar("sar:a", 12, 9, 0.02, 0.02, 0.2)).toBeCloseTo(8.04);
    expect(ta.sar("sar:b", 12, 9, 0.01, 0.01, 0.1)).toBeCloseTo(8.02);
  });
});

describe("ta.dmi / ta.adx incremental", () => {
  const highs = [10, 12, 11, 13, 14, 15, 16];
  const lows = [8, 9, 8, 10, 11, 12, 13];
  const closes = [9, 11, 10, 12, 13, 14, 15];

  test("adx period 3 is 0 until DX RMA seeds, then Python values", () => {
    const ta = new TaEngine();
    const out = highs.map((h, i) => ta.adx("adx:0", h, lows[i]!, closes[i]!, 3));
    expect(out.slice(0, 5)).toEqual([0, 0, 0, 0, 0]);
    expect(out[5]).toBeCloseTo(68.79120879120879);
    expect(out[6]).toBeCloseTo(73.69585740719761);
  });

  test("dmi 0-first +DI/−DI; ADX matches standalone adx", () => {
    const ta = new TaEngine();
    const adxOnly = new TaEngine();
    const out = highs.map((h, i) => ta.dmi("dmi:0", h, lows[i]!, closes[i]!, 3, 3));
    const adx = highs.map((h, i) => adxOnly.adx("adx:0", h, lows[i]!, closes[i]!, 3));
    expect(out[0]).toEqual({ plus: null, minus: null, adx: 0 });
    expect(out[1]).toEqual({ plus: null, minus: null, adx: 0 });
    expect(out[2]).toEqual({ plus: null, minus: null, adx: 0 });
    expect(out[3]!.plus).toBeCloseTo(37.03703703703704);
    expect(out[3]!.minus).toBeCloseTo(7.407407407407408);
    expect(out[3]!.adx).toBe(0);
    expect(out[4]!.plus).toBeCloseTo(35.802469135802475);
    expect(out[4]!.minus).toBeCloseTo(4.938271604938272);
    expect(out[5]!.plus).toBeCloseTo(34.979423868312765);
    expect(out[5]!.minus).toBeCloseTo(3.2921810699588487);
    expect(out[5]!.adx).toBeCloseTo(68.79120879120879);
    expect(out[6]!.plus).toBeCloseTo(34.430727023319626);
    expect(out[6]!.minus).toBeCloseTo(2.1947873799725657);
    expect(out[6]!.adx).toBeCloseTo(73.69585740719761);
    for (let i = 0; i < out.length; i++) {
      expect(out[i]!.adx).toBeCloseTo(adx[i]!);
    }
  });

  test("invalid diLength is all-na; invalid adx period is 0", () => {
    const ta = new TaEngine();
    expect(ta.dmi("dmi:bad", 10, 8, 9, 0, 3)).toEqual({ plus: null, minus: null, adx: null });
    expect(ta.adx("adx:bad", 10, 8, 9, 0)).toBe(0);
    expect(ta.adx("adx:bad", 10, 8, 9, -1)).toBe(0);
  });
});

describe("ta.correlation incremental", () => {
  test("length 3 perfect linear pair → 1 after warmup", () => {
    const ta = new TaEngine();
    const a = [1, 2, 3, 4, 5, 6];
    const b = [2, 4, 6, 8, 10, 12];
    const out = a.map((x, i) => ta.correlation("corr:0", x, b[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    for (let i = 2; i < out.length; i++) {
      expect(out[i]).toBeCloseTo(1);
    }
  });

  test("inverse series → -1", () => {
    const ta = new TaEngine();
    const a = [1, 2, 3, 4, 5];
    const b = [5, 4, 3, 2, 1];
    const out = a.map((x, i) => ta.correlation("corr:inv", x, b[i]!, 3));
    expect(out[2]).toBeCloseTo(-1);
    expect(out[3]).toBeCloseTo(-1);
  });

  test("na pairs are skipped; length<2 and zero variance are na", () => {
    const ta = new TaEngine();
    const a: Cell[] = [1, null, 3, 4, 5];
    const b = [2, 4, 6, 8, 10];
    const out = a.map((x, i) => ta.correlation("corr:na", x, b[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(1);
    expect(out[3]).toBeCloseTo(1);
    expect(out[4]).toBeCloseTo(1);

    const z = new TaEngine();
    const zero = [5, 5, 5, 5, 5].map((x, i) => z.correlation("corr:z", x, i + 1, 3));
    expect(zero).toEqual([null, null, null, null, null]);

    const short = new TaEngine();
    expect(short.correlation("corr:1", 1, 2, 1)).toBeNull();
    expect(short.correlation("corr:0", 1, 2, 0)).toBeNull();
  });
});
