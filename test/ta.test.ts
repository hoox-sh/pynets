/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { TaEngine, type Cell } from "../src/runtime/ta.ts";

describe("ta.sma incremental", () => {
  test("period 3 on [1,2,3,4,5] → [null,null,2,3,4]", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.sma("sma:0", x, 3));
    expect(out).toEqual([null, null, 2, 3, 4]);
  });

  test("null in window poisons that window", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.sma("sma:0", x, 3));
    expect(out).toEqual([null, null, 2, null, null]);
  });
});

describe("ta.rsi incremental", () => {
  test("period 2 on a short rising series: null warmup then finite", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.rsi("rsi:0", x, 2));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out.length).toBe(5);
    for (let i = 2; i < out.length; i++) {
      expect(typeof out[i]).toBe("number");
      expect(Number.isFinite(out[i]!)).toBe(true);
    }
  });
});

describe("ta.ema incremental", () => {
  test("period 3 SMA-seeds then EMA", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.ema("ema:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBe(2);
    const alpha = 2 / 4;
    expect(out[3]).toBeCloseTo(alpha * 4 + (1 - alpha) * 2);
    expect(out[4]).toBeCloseTo(alpha * 5 + (1 - alpha) * (out[3] as number));
  });
});

describe("ta.atr incremental", () => {
  test("first bar na then finite", () => {
    const ta = new TaEngine();
    const highs = [10, 12, 13, 15, 16];
    const lows = [8, 9, 10, 11, 12];
    const closes = [9, 11, 12, 14, 15];
    const out = highs.map((h, i) => ta.atr("atr:0", h, lows[i]!, closes[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeNull();
    expect(typeof out[3]).toBe("number");
    expect(Number.isFinite(out[3]!)).toBe(true);
  });
});

describe("ta period<=0", () => {
  test("sma and rsi return null", () => {
    const ta = new TaEngine();
    expect(ta.sma("sma:0", 1, 0)).toBeNull();
    expect(ta.sma("sma:0", 1, -1)).toBeNull();
    expect(ta.rsi("rsi:0", 1, 0)).toBeNull();
    expect(ta.rsi("rsi:0", 1, -3)).toBeNull();
  });
});

describe("ta.kc incremental", () => {
  test("period 3 mult 2 on 6 rising bars: warmup then up>mid>lo", () => {
    const ta = new TaEngine();
    const highs = [10, 12, 13, 15, 16, 18];
    const lows = [8, 9, 10, 11, 12, 14];
    const closes = [9, 11, 12, 14, 15, 17];
    const out = highs.map((h, i) => ta.kc("kc:0", h, lows[i]!, closes[i]!, 3, 2));
    expect(out[0]!.mid).toBeNull();
    expect(out[1]!.mid).toBeNull();
    for (let i = 3; i < out.length; i++) {
      const { mid, up, lo } = out[i]!;
      expect(typeof mid).toBe("number");
      expect(Number.isFinite(mid!)).toBe(true);
      expect(Number.isFinite(up!)).toBe(true);
      expect(Number.isFinite(lo!)).toBe(true);
      expect(up!).toBeGreaterThan(mid!);
      expect(mid!).toBeGreaterThan(lo!);
    }
  });
});

describe("ta.supertrend incremental", () => {
  test("factor 3 period 3: later bars finite st and dir is 1 or -1", () => {
    const ta = new TaEngine();
    const highs = [10, 12, 13, 15, 16, 18];
    const lows = [8, 9, 10, 11, 12, 14];
    const closes = [9, 11, 12, 14, 15, 17];
    const out = highs.map((h, i) => ta.supertrend("st:0", h, lows[i]!, closes[i]!, 3, 3));
    for (let i = 3; i < out.length; i++) {
      expect(typeof out[i]!.st).toBe("number");
      expect(Number.isFinite(out[i]!.st!)).toBe(true);
      expect(out[i]!.dir === 1 || out[i]!.dir === -1).toBe(true);
    }
  });
});

describe("ta.tr incremental", () => {
  test("first sample null, second finite", () => {
    const ta = new TaEngine();
    expect(ta.tr("tr:0", 10, 8, 9)).toBeNull();
    const second = ta.tr("tr:0", 12, 9, 11);
    expect(typeof second).toBe("number");
    expect(Number.isFinite(second!)).toBe(true);
  });
});

describe("ta.highest incremental", () => {
  test("period 3 on [1,3,2,5,4] → [null,null,3,5,5]", () => {
    const ta = new TaEngine();
    const out = [1, 3, 2, 5, 4].map((x) => ta.highest("hi:0", x, 3));
    expect(out).toEqual([null, null, 3, 5, 5]);
  });

  test("skips na inside a full window", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 5, null, 3];
    const out = src.map((x) => ta.highest("hi:0", x, 3));
    expect(out).toEqual([null, null, 5, 5]);
  });

  test("period<=0 returns null", () => {
    const ta = new TaEngine();
    expect(ta.highest("hi:0", 1, 0)).toBeNull();
    expect(ta.highest("hi:0", 1, -2)).toBeNull();
  });
});

describe("ta.lowest incremental", () => {
  test("period 3 on [1,3,2,5,4] → [null,null,1,2,2]", () => {
    const ta = new TaEngine();
    const out = [1, 3, 2, 5, 4].map((x) => ta.lowest("lo:0", x, 3));
    expect(out).toEqual([null, null, 1, 2, 2]);
  });

  test("skips na inside a full window", () => {
    const ta = new TaEngine();
    const src: Cell[] = [4, 1, null, 3];
    const out = src.map((x) => ta.lowest("lo:0", x, 3));
    expect(out).toEqual([null, null, 1, 1]);
  });
});

describe("ta.stdev incremental", () => {
  test("period 3 sample stdev of [1,2,3,4,5] is 1", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.stdev("sd:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBe(1);
    expect(out[3]).toBe(1);
    expect(out[4]).toBe(1);
  });

  test("any na in window → na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.stdev("sd:0", x, 3));
    expect(out).toEqual([null, null, 1, null, null]);
  });

  test("period<=1 returns null", () => {
    const ta = new TaEngine();
    expect(ta.stdev("sd:0", 1, 1)).toBeNull();
    expect(ta.stdev("sd:0", 1, 0)).toBeNull();
  });
});

describe("ta.change incremental", () => {
  test("length 1: current - previous", () => {
    const ta = new TaEngine();
    const out = [10, 12, 15].map((x) => ta.change("ch:0", x));
    expect(out).toEqual([null, 2, 3]);
  });

  test("length 2 lookback", () => {
    const ta = new TaEngine();
    const out = [1, 2, 4, 7].map((x) => ta.change("ch:0", x, 2));
    expect(out).toEqual([null, null, 3, 5]);
  });

  test("na if current or lookback missing", () => {
    const ta = new TaEngine();
    const src: Cell[] = [10, 12, null, 16];
    const out = src.map((x) => ta.change("ch:0", x, 1));
    expect(out).toEqual([null, 2, null, null]);
  });
});

describe("ta.wma incremental", () => {
  test("period 3 weights 1..3 oldest→newest", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.wma("wma:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(14 / 6);
    expect(out[3]).toBeCloseTo(20 / 6);
    expect(out[4]).toBeCloseTo(26 / 6);
  });

  test("any na in window → na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.wma("wma:0", x, 3));
    expect(out[2]).toBeCloseTo(14 / 6);
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
  });
});

describe("ta.crossover / ta.crossunder", () => {
  test("crossover is 1 on the first strict a>b after a<=b", () => {
    const ta = new TaEngine();
    const a = [1, 2, 3, 2, 1];
    const b = [2, 2, 2, 2, 2];
    const out = a.map((x, i) => ta.crossover("xo:0", x, b[i]!));
    expect(out).toEqual([0, 0, 1, 0, 0]);
  });

  test("crossunder is 1 on the first strict a<b after a>=b", () => {
    const ta = new TaEngine();
    const a = [1, 2, 3, 2, 1];
    const b = [2, 2, 2, 2, 2];
    const out = a.map((x, i) => ta.crossunder("xu:0", x, b[i]!));
    expect(out).toEqual([0, 0, 0, 0, 1]);
  });

  test("first bar is 0 even when a>b immediately", () => {
    const ta = new TaEngine();
    expect(ta.crossover("xo:1", 3, 1)).toBe(0);
    expect(ta.crossunder("xu:1", 1, 3)).toBe(0);
  });

  test("na operand is not a cross", () => {
    const ta = new TaEngine();
    expect(ta.crossover("xo:2", 1, 2)).toBe(0);
    expect(ta.crossover("xo:2", 3, null)).toBe(0);
    expect(ta.crossover("xo:2", 4, 1)).toBe(0);
  });
});

describe("ta.macd incremental", () => {
  test("fast/slow warmup then hist when signal is finite", () => {
    const ta = new TaEngine();
    const src = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = src.map((x) => ta.macd("macd:0", x, 3, 5, 2));
    expect(out[0]!.macd).toBeNull();
    expect(out[3]!.macd).toBeNull();
    expect(out[4]!.macd).toBeCloseTo(1);
    expect(out[4]!.signal).toBeNull();
    expect(out[4]!.hist).toBeNull();
    expect(out[5]!.macd).toBeCloseTo(1);
    expect(out[5]!.signal).toBeCloseTo(1);
    expect(out[5]!.hist).toBeCloseTo(0);
    expect(out[6]!.hist).toBeCloseTo(0);
  });
});

describe("ta.bb incremental", () => {
  test("period 3 mult 2: mid=sma, up/lo = mid ± 2*stdev", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.bb("bb:0", x, 3, 2));
    expect(out[0]).toEqual({ mid: null, up: null, lo: null });
    expect(out[1]).toEqual({ mid: null, up: null, lo: null });
    expect(out[2]!.mid).toBe(2);
    expect(out[2]!.up).toBe(4);
    expect(out[2]!.lo).toBe(0);
    expect(out[3]).toEqual({ mid: 3, up: 5, lo: 1 });
    expect(out[4]).toEqual({ mid: 4, up: 6, lo: 2 });
  });

  test("na in window nulls all bands", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.bb("bb:0", x, 3));
    expect(out[2]!.mid).toBe(2);
    expect(out[3]).toEqual({ mid: null, up: null, lo: null });
    expect(out[4]).toEqual({ mid: null, up: null, lo: null });
  });
});

describe("ta.sum incremental", () => {
  test("period 3 on [1,2,3,4,5] → [null,null,6,9,12]", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.sum("sum:0", x, 3));
    expect(out).toEqual([null, null, 6, 9, 12]);
  });

  test("null in window poisons that window", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.sum("sum:0", x, 3));
    expect(out).toEqual([null, null, 6, null, null]);
  });

  test("period<=0 returns null", () => {
    const ta = new TaEngine();
    expect(ta.sum("sum:0", 1, 0)).toBeNull();
    expect(ta.sum("sum:0", 1, -2)).toBeNull();
  });
});

describe("ta.roc incremental", () => {
  test("length 1: 100*(x-prev)/prev", () => {
    const ta = new TaEngine();
    const out = [10, 12, 15].map((x) => ta.roc("roc:0", x, 1));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeCloseTo(20);
    expect(out[2]).toBeCloseTo(25);
  });

  test("length 2 lookback", () => {
    const ta = new TaEngine();
    const out = [10, 12, 15, 20].map((x) => ta.roc("roc:0", x, 2));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(50);
    expect(out[3]).toBeCloseTo((20 - 12) / 12 * 100);
  });

  test("na if lookback missing", () => {
    const ta = new TaEngine();
    const src: Cell[] = [10, 12, null, 16];
    const out = src.map((x) => ta.roc("roc:0", x, 1));
    expect(out).toEqual([null, 20, null, null]);
  });

  test("na if denom 0", () => {
    const ta = new TaEngine();
    const out = [0, 10, 20].map((x) => ta.roc("roc:0", x, 1));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(100);
  });
});

describe("ta.mom incremental", () => {
  test("length 1: current - previous", () => {
    const ta = new TaEngine();
    const out = [10, 12, 15].map((x) => ta.mom("mom:0", x, 1));
    expect(out).toEqual([null, 2, 3]);
  });

  test("length 2 lookback", () => {
    const ta = new TaEngine();
    const out = [1, 2, 4, 7].map((x) => ta.mom("mom:0", x, 2));
    expect(out).toEqual([null, null, 3, 5]);
  });

  test("na if current or lookback missing", () => {
    const ta = new TaEngine();
    const src: Cell[] = [10, 12, null, 16];
    const out = src.map((x) => ta.mom("mom:0", x, 1));
    expect(out).toEqual([null, 2, null, null]);
  });
});

describe("ta.vwma incremental", () => {
  test("period 3: sum(src*vol)/sum(vol)", () => {
    const ta = new TaEngine();
    const src = [1, 2, 3, 4];
    const vol = [10, 10, 10, 20];
    const out = src.map((x, i) => ta.vwma("vwma:0", x, vol[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(2);
    expect(out[3]).toBeCloseTo(130 / 40);
  });

  test("any na in src or vol → na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const vol = [10, 10, 10, 10, 10];
    const out = src.map((x, i) => ta.vwma("vwma:0", x, vol[i]!, 3));
    expect(out[2]).toBeCloseTo(2);
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
  });

  test("zero volume sum is na", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3].map((x) => ta.vwma("vwma:0", x, 0, 3));
    expect(out[2]).toBeNull();
  });
});

describe("ta.cci incremental", () => {
  test("period 3: (tp-sma)/(0.015*meanDev)", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3].map((x) => ta.cci("cci:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    // sma=2, meanDev=(|1-2|+|2-2|+|3-2|)/3 = 2/3 → (3-2)/(0.015*2/3)=100
    expect(out[2]).toBeCloseTo(100);
  });

  test("any na in window → na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.cci("cci:0", x, 3));
    expect(out[2]).toBeCloseTo(100);
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
  });

  test("zero mean deviation is na", () => {
    const ta = new TaEngine();
    const out = [4, 4, 4].map((x) => ta.cci("cci:0", x, 3));
    expect(out[2]).toBeNull();
  });
});

describe("ta.willr incremental", () => {
  test("period 3: -100*(hh-c)/(hh-ll)", () => {
    const ta = new TaEngine();
    const highs = [10, 12, 11];
    const lows = [8, 9, 8];
    const closes = [9, 11, 10];
    const out = highs.map((h, i) => ta.willr("wr:0", h, lows[i]!, closes[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    // hh=12, ll=8, c=10 → -100*(12-10)/(12-8) = -50
    expect(out[2]).toBeCloseTo(-50);
  });

  test("incomplete window is na", () => {
    const ta = new TaEngine();
    expect(ta.willr("wr:0", 10, 8, 9, 3)).toBeNull();
    expect(ta.willr("wr:0", 12, 9, 11, 3)).toBeNull();
  });

  test("hh==ll is na", () => {
    const ta = new TaEngine();
    const out = [10, 10, 10].map((x) => ta.willr("wr:0", x, x, x, 3));
    expect(out[2]).toBeNull();
  });
});

describe("ta.stoch incremental", () => {
  test("period 3: 100*(c-ll)/(hh-ll)", () => {
    const ta = new TaEngine();
    const highs = [10, 12, 11];
    const lows = [8, 9, 8];
    const closes = [9, 11, 10];
    const out = highs.map((h, i) => ta.stoch("stoch:0", closes[i]!, h, lows[i]!, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    // hh=12, ll=8, c=10 → 100*(10-8)/(12-8) = 50
    expect(out[2]).toBeCloseTo(50);
  });

  test("incomplete window is na", () => {
    const ta = new TaEngine();
    expect(ta.stoch("stoch:0", 9, 10, 8, 3)).toBeNull();
    expect(ta.stoch("stoch:0", 11, 12, 9, 3)).toBeNull();
  });

  test("hh==ll is na", () => {
    const ta = new TaEngine();
    const out = [10, 10, 10].map((x) => ta.stoch("stoch:0", x, x, x, 3));
    expect(out[2]).toBeNull();
  });

  test("period<=0 returns null", () => {
    const ta = new TaEngine();
    expect(ta.stoch("stoch:0", 9, 10, 8, 0)).toBeNull();
    expect(ta.stoch("stoch:0", 9, 10, 8, -1)).toBeNull();
  });
});

describe("ta.linreg incremental", () => {
  test("period 3 offset 0 on a line returns the endpoint", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 5].map((x) => ta.linreg("lr:0", x, 3));
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(3);
    expect(out[3]).toBeCloseTo(4);
    expect(out[4]).toBeCloseTo(5);
  });

  test("offset 1 evaluates one bar back on the fitted line", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3].map((x) => ta.linreg("lr:0", x, 3, 1));
    expect(out[2]).toBeCloseTo(2);
  });

  test("non-colinear window: fitted value at end", () => {
    const ta = new TaEngine();
    const out = [1, 3, 2].map((x) => ta.linreg("lr:0", x, 3));
    // mean_x=1, mean_y=2, slope=0.5 → 2 + 0.5*(2-1) = 2.5
    expect(out[2]).toBeCloseTo(2.5);
  });

  test("any na in window → na", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.linreg("lr:0", x, 3));
    expect(out[2]).toBeCloseTo(3);
    expect(out[3]).toBeNull();
    expect(out[4]).toBeNull();
  });

  test("length<2 returns null", () => {
    const ta = new TaEngine();
    expect(ta.linreg("lr:0", 1, 1)).toBeNull();
    expect(ta.linreg("lr:0", 1, 0)).toBeNull();
  });
});

describe("ta.vwap incremental", () => {
  test("cumulative src*vol / cum vol", () => {
    const ta = new TaEngine();
    const src = [10, 20, 30];
    const vol = [1, 1, 2];
    const out = src.map((x, i) => ta.vwap("vwap:0", x, vol[i]!));
    expect(out[0]).toBeCloseTo(10);
    expect(out[1]).toBeCloseTo(15);
    expect(out[2]).toBeCloseTo(22.5);
  });

  test("skips na source and keeps previous", () => {
    const ta = new TaEngine();
    const src: Cell[] = [10, null, 30];
    const vol = [1, 1, 1];
    const out = src.map((x, i) => ta.vwap("vwap:0", x, vol[i]!));
    expect(out[0]).toBeCloseTo(10);
    expect(out[1]).toBeCloseTo(10);
    expect(out[2]).toBeCloseTo(20);
  });

  test("zero volume returns the price", () => {
    const ta = new TaEngine();
    expect(ta.vwap("vwap:0", 10, 0)).toBe(10);
    expect(ta.vwap("vwap:0", 20, 2)).toBeCloseTo(20);
  });
});

describe("ta.rising incremental", () => {
  test("length 2: 1 after two consecutive rises", () => {
    const ta = new TaEngine();
    const out = [1, 2, 3, 4, 2].map((x) => ta.rising("r:0", x, 2));
    expect(out).toEqual([0, 0, 1, 1, 0]);
  });

  test("warmup is 0 and equals is not rising", () => {
    const ta = new TaEngine();
    const out = [1, 1, 2, 3].map((x) => ta.rising("r:0", x, 1));
    expect(out).toEqual([0, 0, 1, 1]);
  });

  test("na breaks the streak", () => {
    const ta = new TaEngine();
    const src: Cell[] = [1, 2, 3, null, 5];
    const out = src.map((x) => ta.rising("r:0", x, 1));
    expect(out).toEqual([0, 1, 1, 0, 0]);
  });

  test("period<=0 returns 0", () => {
    const ta = new TaEngine();
    expect(ta.rising("r:0", 1, 0)).toBe(0);
    expect(ta.rising("r:0", 1, -2)).toBe(0);
  });
});

describe("ta.falling incremental", () => {
  test("length 2: 1 after two consecutive declines", () => {
    const ta = new TaEngine();
    const out = [5, 4, 3, 2, 4].map((x) => ta.falling("f:0", x, 2));
    expect(out).toEqual([0, 0, 1, 1, 0]);
  });

  test("warmup is 0 and equals is not falling", () => {
    const ta = new TaEngine();
    const out = [3, 3, 2, 1].map((x) => ta.falling("f:0", x, 1));
    expect(out).toEqual([0, 0, 1, 1]);
  });

  test("na breaks the streak", () => {
    const ta = new TaEngine();
    const src: Cell[] = [5, 4, 3, null, 1];
    const out = src.map((x) => ta.falling("f:0", x, 1));
    expect(out).toEqual([0, 1, 1, 0, 0]);
  });
});
