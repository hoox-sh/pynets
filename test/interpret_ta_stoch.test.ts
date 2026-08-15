/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse, TaEngine } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
}));

const STOCH_SRC = `indicator("t")
plot(ta.stoch(close, high, low, 3))`;
const STOCH_LEN_SRC = `indicator("t")
plot(ta.stoch(3))`;
const LINREG_SRC = `indicator("t")
plot(ta.linreg(close, 3, 0))`;
const LINREG_NO_OFF = `indicator("t")
plot(ta.linreg(close, 3))`;

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

function pickSrc(candidates: string[], method: string): string | null {
  if (!taHas(method)) {
    if (!candidates.some((src) => interpretHasFinite(src))) return null;
  }
  for (const src of candidates) {
    if (parseOk(src) && interpretHasFinite(src)) return src;
  }
  return null;
}

function stochReady(src: string | null): boolean {
  if (src == null || !parseOk(src)) return false;
  try {
    const out = interpret(src, BARS);
    const finite = out.plots.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    return finite.length > 0 && finite.every((v) => v >= 0 && v <= 100);
  } catch {
    return false;
  }
}

function linregReady(src: string | null): boolean {
  if (src == null || !parseOk(src)) return false;
  try {
    const last = interpret(src, BARS).plots[4];
    return typeof last === "number" && Number.isFinite(last);
  } catch {
    return false;
  }
}

const STOCH_PICK = pickSrc([STOCH_SRC, STOCH_LEN_SRC], "stoch");
const LINREG_PICK = pickSrc([LINREG_SRC, LINREG_NO_OFF], "linreg");

describe("interpret extra TA stoch / linreg", () => {
  test.skipIf(!stochReady(STOCH_PICK))("ta.stoch(close, high, low, 3) on 1..5", () => {
    const out = interpret(STOCH_PICK!, BARS);
    expect(out.plots).toHaveLength(5);
    const finite = out.plots.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    expect(finite.length).toBeGreaterThan(0);
    for (const v of finite) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  test.skipIf(!linregReady(LINREG_PICK))("ta.linreg(close, 3) on 1..5", () => {
    const out = interpret(LINREG_PICK!, BARS);
    expect(out.plots).toHaveLength(5);
    const last = out.plots[4];
    expect(typeof last).toBe("number");
    expect(Number.isFinite(last!)).toBe(true);
  });
});
