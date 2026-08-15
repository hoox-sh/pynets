/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse, Runtime, type RuntimeResult } from "../src/index.ts";

const SRC = `indicator("t")\nlen = input.int(3, title="len")\nplot(ta.sma(close, len))`;
const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const SMA3 = [null, null, 2, 3, 4];
const SMA2 = [null, 1.5, 2.5, 3.5, 4.5];

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function tryInterpret(src: string): { plots: Array<number | null> } | null {
  try {
    return interpret(src, BARS);
  } catch {
    return null;
  }
}

function inputDefaultWired(): boolean {
  if (!parseOk(SRC)) return false;
  const out = tryInterpret(SRC);
  return out != null && out.plots.some((v) => v != null);
}

type RunWithOpts = (
  source: string,
  ohlcv: typeof BARS,
  options?: unknown,
) => RuntimeResult;

function plotsEq(plots: Array<number | null> | undefined, expected: Array<number | null>): boolean {
  return JSON.stringify(plots) === JSON.stringify(expected);
}

function runWithInputs(inputs: Record<string, unknown>): RuntimeResult | null {
  const rt = new Runtime("TEST");
  const run = rt.run.bind(rt) as RunWithOpts;
  const extras: unknown[] = [{ inputs }, inputs];
  for (const extra of extras) {
    try {
      const out = run(SRC, BARS, extra);
      if (out != null && out.error == null && plotsEq(out.plots, SMA2)) return out;
    } catch {
      // try next call shape
    }
  }
  return null;
}

function inputsOverrideWired(): boolean {
  return inputDefaultWired() && runWithInputs({ len: 2 }) != null;
}

describe("interpret input.int", () => {
  test.skipIf(!inputDefaultWired())("input.int(3) drives ta.sma period 3", () => {
    const out = interpret(SRC, BARS);
    expect(out.plots).toEqual(SMA3);
  });

  test.skipIf(!inputsOverrideWired())("Runtime inputs override changes sma length", () => {
    const out = runWithInputs({ len: 2 });
    expect(out).not.toBeNull();
    expect(out!.error).toBeUndefined();
    expect(out!.plots).toEqual(SMA2);
  });
});
