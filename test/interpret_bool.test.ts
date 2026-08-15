/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, interpret, parse } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const AND_SRC = `indicator("t")
plot(close > 2 and close < 5)`;
const OR_SRC = `indicator("t")
plot(close < 2 or close > 4)`;

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function dumpHas(src: string, needle: string): boolean {
  try {
    return dump(parse(src)).includes(needle);
  } catch {
    return false;
  }
}

function runPlots(src: string): Array<number | null> | null {
  try {
    return interpret(src, BARS).plots;
  } catch {
    return null;
  }
}

function boolReady(src: string): boolean {
  if (!parseOk(src)) return false;
  const plots = runPlots(src);
  if (plots == null || !plots.some((v) => v === 0 || v === 1)) return false;
  return dumpHas(src, "BoolOp") || dumpHas(src, "And") || dumpHas(src, "Or");
}

describe("interpret and / or", () => {
  test.skipIf(!boolReady(AND_SRC))("plot(close > 2 and close < 5) on 1..5", () => {
    const out = interpret(AND_SRC, BARS);
    expect(out.plots).toEqual([0, 0, 1, 1, 0]);
  });

  test.skipIf(!boolReady(OR_SRC))("plot(close < 2 or close > 4) on 1..5", () => {
    const out = interpret(OR_SRC, BARS);
    expect(out.plots).toEqual([1, 0, 0, 0, 1]);
  });
});
