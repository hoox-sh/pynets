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

function both(source: string, bars = BARS) {
  return {
    compiled: new Runtime("TEST", { mode: "compile" }).run(source, bars),
    interpreted: new Runtime("TEST").run(source, bars),
  };
}

describe("compile bare ta.<attr> whitelist", () => {
  test("bare ta.rsi is not whitelisted: na on compile and interpret", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.rsi)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(compiled.plots).toEqual([null, null, null]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("bare ta.vwap sources hlc3 and matches interpret", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.vwap)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    // Bar 0 hlc3 = (100+90+95)/3 = 95 = cum vwap of one bar.
    expect(compiled.plots[0]).toBe(95);
    // Bar 1 hlc3 = (105+95+103)/3 = 101; cum = (950 + 202) / 12.
    expect(compiled.plots[1]).toBeCloseTo((95 * 10 + 101 * 2) / 12, 12);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("bare ta.ao still auto-calls on the whitelist", () => {
    const long = Array.from({ length: 40 }, (_, i) => ({
      open: 100 + i * 0.1,
      high: 101 + i * 0.2,
      low: 99 + i * 0.05,
      close: 100.5 + i * 0.1,
      volume: 1000 + i,
      time: i * 86_400_000,
    }));
    const attr = both(`indicator("t")\nplot(ta.ao)`, long);
    const call = both(`indicator("t")\nplot(ta.ao())`, long);
    expect(attr.compiled.error).toBeUndefined();
    expect(call.compiled.error).toBeUndefined();
    expect(attr.compiled.plots.slice(33).some((v) => v != null)).toBe(true);
    expect(attr.compiled.plots).toEqual(call.compiled.plots);
    expect(attr.compiled.plots).toEqual(attr.interpreted.plots);
  });

  test("bare ta.obv still auto-calls on the whitelist", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.obv)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).not.toEqual([null, null, null]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  // NOTE: the task brief listed bare `ta.aroon` as whitelisted, but interpret's
  // evalTaAttr (the mirrored source of truth) does not handle `aroon` — it
  // falls through to na. The compile whitelist mirrors interpret exactly, so
  // bare `ta.aroon` is na on BOTH backends (explicit `ta.aroon(len)` still works).
  test("bare ta.aroon is na on both backends, matching interpret's whitelist", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.aroon)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual([null, null, null]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("explicit-arg ta calls are unaffected by the whitelist gate", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot(ta.rsi(close, 2))`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots[2]).not.toBeNull();
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});
