/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [
  { open: 95, high: 100, low: 90, close: 95, volume: 10 },
  { open: 95, high: 105, low: 95, close: 103, volume: 2 },
  { open: 103, high: 102, low: 92, close: 94, volume: 3 },
];

const KLINGER_BARS = [100, 101, 102, 101, 103, 104, 102, 105].map((close, i) => ({
  open: close,
  high: close + 2,
  low: close - 2,
  close,
  volume: 10 * (i + 1),
}));

function both(source: string, bars = BARS) {
  return {
    compiled: new Runtime("TEST", { mode: "compile" }).run(source, bars),
    interpreted: new Runtime("TEST").run(source, bars),
  };
}

describe("compile vs interpret volume TA", () => {
  test("ta.wad bar0 0; bar1 vol*(close-low)=16", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.wad)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(interpreted.plots).toEqual([0, 16, -8]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.wad(high, low, close, volume) matches attribute", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.wad(high, low, close, volume))`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots).toEqual([0, 16, -8]);
  });

  test("ta.wvad default period matches interpret", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.wvad())`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.cmf(20) matches interpret", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.cmf(20))`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.klinger last matches interpret", () => {
    const { compiled, interpreted } = both(
      `indicator("t")\nplot(ta.klinger(high, low, close, volume, 2, 3))`,
      KLINGER_BARS,
    );
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});

describe("compile vs interpret obv / pvt / vpt / nvi / pvi", () => {
  test("ta.obv parity: 0 until 3 samples, then signed volume", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.obv)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(compiled.plots).toEqual([0, 0, -3]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.pvt parity: cum vol*(c-prev)/prev", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.pvt)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots[0]).toBe(0);
    // 2*(103-95)/95 then + 3*(94-103)/103
    expect(compiled.plots[1]).toBeCloseTo(2 * (8 / 95), 12);
    expect(compiled.plots[2]).toBeCloseTo(2 * (8 / 95) - 3 * (9 / 103), 12);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.vpt aliases the pvt kernel on compile and matches interpret", () => {
    const vpt = both(`indicator("t")\nplot(ta.vpt)`);
    const pvt = both(`indicator("t")\nplot(ta.pvt)`);
    expect(vpt.compiled.error).toBeUndefined();
    expect(vpt.compiled.mode).toBe("compile");
    expect(vpt.compiled.plots).not.toEqual([null, null, null]);
    expect(vpt.compiled.plots).toEqual(pvt.compiled.plots);
    expect(vpt.compiled.plots).toEqual(vpt.interpreted.plots);
  });

  test("ta.nvi parity: starts 1000, moves on volume decrease", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.nvi)`);
    expect(compiled.error).toBeUndefined();
    // vol 10→2 decreases: 1000*(1 + (103-95)/95); vol 2→3 increases: no update.
    expect(compiled.plots).toEqual([1000, 1000 * (1 + 8 / 95), 1000 * (1 + 8 / 95)]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("ta.pvi parity: starts 1000, moves on volume increase", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.pvi)`);
    expect(compiled.error).toBeUndefined();
    // vol 10→2 decreases: no update; vol 2→3 increases: 1000*(1 + (94-103)/103).
    expect(compiled.plots).toEqual([1000, 1000, 1000 * (1 - 9 / 103)]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("explicit ta.nvi(close, volume) / ta.pvi(close, volume) match interpret", () => {
    const nvi = both(`indicator("t")\nplot(ta.nvi(close, volume))`);
    const pvi = both(`indicator("t")\nplot(ta.pvi(close, volume))`);
    expect(nvi.compiled.error).toBeUndefined();
    expect(pvi.compiled.error).toBeUndefined();
    expect(nvi.compiled.plots).toEqual(nvi.interpreted.plots);
    expect(pvi.compiled.plots).toEqual(pvi.interpreted.plots);
    expect(nvi.compiled.plots).toEqual([1000, 1000 * (1 + 8 / 95), 1000 * (1 + 8 / 95)]);
    expect(pvi.compiled.plots).toEqual([1000, 1000, 1000 * (1 - 9 / 103)]);
  });

  test("ta.nvi(high, volume) honors explicit args in interpret (not ctx.close)", () => {
    const r = new Runtime("TEST").run(`indicator("t")\nplot(ta.nvi(high, volume))`, BARS);
    expect(r.error).toBeUndefined();
    // high: 100→105→102, volume 10→2→3. Bar1: vol decreases → 1000*(1+(105-100)/100).
    // Bar2: vol increases → unchanged.
    expect(r.plots).toEqual([1000, 1000 * (1 + 5 / 100), 1000 * (1 + 5 / 100)]);
    const c = new Runtime("TEST", { mode: "compile" }).run(
      `indicator("t")\nplot(ta.nvi(high, volume))`,
      BARS,
    );
    expect(c.error).toBeUndefined();
    expect(c.plots).toEqual(r.plots);
  });

  test("ta.pvi(high, volume) honors explicit args in interpret (not ctx.close)", () => {
    const r = new Runtime("TEST").run(`indicator("t")\nplot(ta.pvi(high, volume))`, BARS);
    expect(r.error).toBeUndefined();
    // Bar1: vol decreases → unchanged 1000. Bar2: vol increases → 1000*(1+(102-105)/105).
    expect(r.plots).toEqual([1000, 1000, 1000 * (1 + (102 - 105) / 105)]);
    const c = new Runtime("TEST", { mode: "compile" }).run(
      `indicator("t")\nplot(ta.pvi(high, volume))`,
      BARS,
    );
    expect(c.error).toBeUndefined();
    expect(c.plots).toEqual(r.plots);
  });
});
