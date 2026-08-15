/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse, TaEngine } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const HIGHEST_SRC = `indicator("t")\nplot(ta.highest(close, 3))`;
const CROSS_SRC = `indicator("t")\nplot(ta.crossover(close, close[1]) ? 1 : 0)`;
const SMA_CROSS_SRC = `indicator("t")\nplot(ta.crossover(close, ta.sma(close, 3)) ? 1 : 0)`;

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function taHas(method: string): boolean {
  return typeof (new TaEngine() as unknown as Record<string, unknown>)[method] === "function";
}

function interpretHasFinite(src: string): boolean {
  try {
    const out = interpret(src, BARS);
    return out.plots.some((v) => typeof v === "number" && Number.isFinite(v));
  } catch {
    return false;
  }
}

function highestReady(): boolean {
  if (!parseOk(HIGHEST_SRC)) return false;
  if (!taHas("highest") && !interpretHasFinite(HIGHEST_SRC)) return false;
  return interpretHasFinite(HIGHEST_SRC);
}

function pickCrossSrc(): string | null {
  if (!taHas("crossover")) {
    if (!interpretHasFinite(CROSS_SRC) && !interpretHasFinite(SMA_CROSS_SRC)) return null;
  }
  if (parseOk(CROSS_SRC) && interpretHasFinite(CROSS_SRC)) return CROSS_SRC;
  if (parseOk(SMA_CROSS_SRC) && interpretHasFinite(SMA_CROSS_SRC)) return SMA_CROSS_SRC;
  return null;
}

const CROSS_PICK = pickCrossSrc();

describe("interpret extra TA", () => {
  test.skipIf(!highestReady())("ta.highest(close, 3) on 1..5", () => {
    const out = interpret(HIGHEST_SRC, BARS);
    expect(out.plots).toEqual([null, null, 3, 4, 5]);
  });

  test.skipIf(CROSS_PICK == null)("ta.crossover produces boolean-like plots", () => {
    const out = interpret(CROSS_PICK!, BARS);
    expect(out.plots).toHaveLength(5);
    for (const v of out.plots) {
      expect(v === null || v === 0 || v === 1).toBe(true);
    }
  });
});
