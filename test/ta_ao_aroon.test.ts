/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { TaEngine } from "../src/runtime/ta.ts";

describe("ta.ao incremental", () => {
  test("SMA(hl2,2) - SMA(hl2,3) on hl2=1..5", () => {
    const ta = new TaEngine();
    // high=c+1, low=c-1 → hl2 = close
    const out = [1, 2, 3, 4, 5].map((c) => ta.ao("ao:0", c + 1, c - 1, 2, 3));
    expect(out).toEqual([null, null, 0.5, 0.5, 0.5]);
  });

  test("default 5/34 first finite at bar 33", () => {
    const ta = new TaEngine();
    const out: Array<number | null> = [];
    for (let i = 0; i < 40; i++) {
      const c = 100 + i;
      out.push(ta.ao("ao:def", c + 1, c - 1));
    }
    expect(out.slice(0, 33).every((v) => v == null)).toBe(true);
    expect(typeof out[33]).toBe("number");
    expect(Number.isFinite(out[33]!)).toBe(true);
  });

  test("fast/slow <= 0 is na", () => {
    const ta = new TaEngine();
    expect(ta.ao("ao:z", 2, 0, 0, 3)).toBeNull();
    expect(ta.ao("ao:z2", 2, 0, 2, 0)).toBeNull();
  });

  test("sites do not share state", () => {
    const ta = new TaEngine();
    expect(ta.ao("a", 2, 0, 2, 3)).toBeNull();
    expect(ta.ao("b", 2, 0, 2, 3)).toBeNull();
    expect(ta.ao("a", 3, 1, 2, 3)).toBeNull();
    expect(ta.ao("a", 4, 2, 2, 3)).toBe(0.5);
    expect(ta.ao("b", 4, 2, 2, 3)).toBeNull();
  });
});

describe("ta.aroon incremental", () => {
  test("length=2 first finite at bar 2; ties keep oldest extreme", () => {
    const ta = new TaEngine();
    expect(ta.aroon("ar:0", 1, 0, 2)).toEqual({ down: null, up: null });
    expect(ta.aroon("ar:0", 3, 1, 2)).toEqual({ down: null, up: null });
    // window highs [1,3,2] lows [0,1,0]; hh at k=1, ll at k=0 (oldest tie)
    expect(ta.aroon("ar:0", 2, 0, 2)).toEqual({ down: 0, up: 50 });
  });

  test("default 14 first finite at bar 14", () => {
    const ta = new TaEngine();
    for (let i = 0; i < 14; i++) {
      expect(ta.aroon("ar:def", 10 + i, 9 + i)).toEqual({ down: null, up: null });
    }
    const last = ta.aroon("ar:def", 30, 8);
    expect(typeof last.up).toBe("number");
    expect(typeof last.down).toBe("number");
    // newest high → bars_since_hh=0 → up=100; newest? low=8 is lowest
    expect(last.up).toBe(100);
    expect(last.down).toBe(100);
  });

  test("length<=0 is na", () => {
    const ta = new TaEngine();
    expect(ta.aroon("ar:z", 2, 0, 0)).toEqual({ down: null, up: null });
  });
});
