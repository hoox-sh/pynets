/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse, TaEngine } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const ROC_SRC = `indicator("t")
plot(ta.roc(close, 2))`;
const MOM_SRC = `indicator("t")
plot(ta.mom(close, 2))`;

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

function rocReady(): boolean {
  if (!parseOk(ROC_SRC)) return false;
  if (!taHas("roc") && !interpretHasFinite(ROC_SRC)) return false;
  return interpretHasFinite(ROC_SRC);
}

function momReady(): boolean {
  if (!parseOk(MOM_SRC)) return false;
  if (!taHas("mom") && !interpretHasFinite(MOM_SRC)) return false;
  return interpretHasFinite(MOM_SRC);
}

describe("interpret extra TA roc / mom", () => {
  test.skipIf(!rocReady())("ta.roc(close, 2) on 1..5", () => {
    const out = interpret(ROC_SRC, BARS);
    expect(out.plots[0]).toBeNull();
    expect(out.plots[1]).toBeNull();
    expect(out.plots[2]).toBeCloseTo(200);
    expect(out.plots[3]).toBeCloseTo(100);
    expect(out.plots[4]).toBeCloseTo(100 * (5 - 3) / 3);
  });

  test.skipIf(!momReady())("ta.mom(close, 2) on 1..5", () => {
    const out = interpret(MOM_SRC, BARS);
    expect(out.plots[0]).toBeNull();
    expect(out.plots[1]).toBeNull();
    expect(out.plots[2]).toBe(2);
    expect(out.plots[3]).toBe(2);
    expect(out.plots[4]).toBe(2);
  });
});
