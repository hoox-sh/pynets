/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

function bars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    open: 100 + i * 0.1,
    high: 101 + i * 0.2,
    low: 99 + i * 0.05,
    close: 100.5 + i * 0.1,
    volume: 1000 + i,
    time: i * 86_400_000,
  }));
}

type Bar = { open: number; high: number; low: number; close: number; volume: number; time?: number };

function both(source: string, ohlcv: Bar[] = bars(40)) {
  return {
    compiled: new Runtime("TEST", { mode: "compile" }).run(source, ohlcv),
    interpreted: new Runtime("TEST").run(source, ohlcv),
  };
}

describe("compile vs interpret ta.ao", () => {
  test("ta.ao warmup: first 33 bars na, finite from bar 33", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.ao())`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(compiled.plots.slice(0, 33).every((v) => v == null)).toBe(true);
    expect(typeof compiled.plots[33]).toBe("number");
    expect(Number.isFinite(compiled.plots[33]!)).toBe(true);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("bare ta.ao attribute matches ta.ao() call", () => {
    const attr = both(`indicator("t")\nplot(ta.ao)`);
    const call = both(`indicator("t")\nplot(ta.ao())`);
    expect(attr.compiled.error).toBeUndefined();
    expect(call.compiled.error).toBeUndefined();
    expect(attr.compiled.plots).toEqual(call.compiled.plots);
    expect(attr.compiled.plots).toEqual(attr.interpreted.plots);
  });

  test("ta.ao(2, 3) custom lengths match interpret", () => {
    const ohlcv = [1, 2, 3, 4, 5].map((c) => ({
      open: c,
      high: c + 1,
      low: c - 1,
      close: c,
      volume: 1,
    }));
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.ao(2, 3))`, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual([null, null, 0.5, 0.5, 0.5]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});

describe("compile vs interpret ta.aroon", () => {
  test("ta.aroon(14) warmup: first 14 bars na, up finite at bar 14", () => {
    const { compiled, interpreted } = both(
      `indicator("t")
[adown, aup] = ta.aroon(14)
plot(aup)`,
      bars(20),
    );
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots.slice(0, 14).every((v) => v == null)).toBe(true);
    expect(typeof compiled.plots[14]).toBe("number");
    expect(Number.isFinite(compiled.plots[14]!)).toBe(true);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.aroon(14) tuple order is [down, up]", () => {
    const { compiled, interpreted } = both(
      `indicator("t")
[adown, aup] = ta.aroon(14)
plot(aup, "aup")
plot(adown, "adown")`,
      bars(80),
    );
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    const series = (compiled as { series?: Record<string, Array<number | null>> }).series;
    expect(series?.aup?.at(-1)).toBe(100);
    expect(series?.adown?.at(-1)).toBe(0);
  });

  test("ta.aroon(2) ties keep oldest extreme", () => {
    const ohlcv = [
      { open: 1, high: 1, low: 0, close: 1, volume: 1 },
      { open: 2, high: 3, low: 1, close: 2, volume: 1 },
      { open: 2, high: 2, low: 0, close: 2, volume: 1 },
    ];
    const up = both(
      `indicator("t")
[adown, aup] = ta.aroon(2)
plot(aup)`,
      ohlcv,
    );
    const down = both(
      `indicator("t")
[adown, aup] = ta.aroon(2)
plot(adown)`,
      ohlcv,
    );
    expect(up.compiled.error).toBeUndefined();
    expect(down.compiled.error).toBeUndefined();
    // Bar 2 window highs [1,3,2]: hh at k=1, up = 50. Lows [0,1,0]: bar 2 ties
    // bar 0 at 0 but strict `<` keeps the oldest, down = 0.
    expect(up.compiled.plots).toEqual([null, null, 50]);
    expect(down.compiled.plots).toEqual([null, null, 0]);
    expect(up.compiled.plots).toEqual(up.interpreted.plots);
    expect(down.compiled.plots).toEqual(down.interpreted.plots);
  });

  test("ta.aroon ties on equal highs keep the oldest bar", () => {
    // All highs equal within the window: up stays at the oldest index.
    const ohlcv = [5, 5, 5, 5, 5, 5].map((c) => ({
      open: c,
      high: c,
      low: c - 1,
      close: c,
      volume: 1,
    }));
    const { compiled, interpreted } = both(
      `indicator("t")
[adown, aup] = ta.aroon(3)
plot(aup)`,
      ohlcv,
    );
    expect(compiled.error).toBeUndefined();
    // window = 4, oldest high always the kept extreme: barsSince = 3, up = 0
    expect(compiled.plots).toEqual([null, null, null, 0, 0, 0]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});
