/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret } from "../src/index.ts";

const BARS_1_TO_5 = [1, 2, 3, 4, 5].map((close) => ({ close }));

describe("interpret ta.sma / ta.rsi", () => {
  test("ta.sma(close, 3) on 1..5", () => {
    const out = interpret(`indicator("t")\nplot(ta.sma(close, 3))`, BARS_1_TO_5);
    expect(out.plots).toEqual([null, null, 2, 3, 4]);
  });

  test("sma(close, 3) alias matches ta.sma", () => {
    const out = interpret(`indicator("t")\nplot(sma(close, 3))`, BARS_1_TO_5);
    expect(out.plots).toEqual([null, null, 2, 3, 4]);
  });

  test("ta.sma named source/length", () => {
    const out = interpret(
      `indicator("t")\nplot(ta.sma(source=close, length=3))`,
      BARS_1_TO_5,
    );
    expect(out.plots).toEqual([null, null, 2, 3, 4]);
  });

  test("ta.rsi(close, 2) warms up then is finite", () => {
    const out = interpret(`indicator("t")\nplot(ta.rsi(close, 2))`, BARS_1_TO_5);
    expect(out.plots[0]).toBeNull();
    expect(out.plots[1]).toBeNull();
    for (let i = 2; i < out.plots.length; i++) {
      expect(typeof out.plots[i]).toBe("number");
      expect(Number.isFinite(out.plots[i]!)).toBe(true);
    }
  });
});
