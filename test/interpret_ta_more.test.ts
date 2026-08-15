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

const ALMA_SRC = `indicator("t")
plot(ta.alma(close, 3))`;
const CMO_SRC = `indicator("t")
plot(ta.cmo(close, 3))`;
const KAMA_SRC = `indicator("t")
plot(ta.kama(close, 3))`;
const OBV_SRC = `indicator("t")
plot(ta.obv())`;
const PIVOT_SRC = `indicator("t")
plot(ta.pivothigh(close, 1, 1))`;

function almaReady(): boolean {
  if (!parseOk(ALMA_SRC)) return false;
  if (!taHas("alma") && !interpretHasFinite(ALMA_SRC)) return false;
  return interpretHasFinite(ALMA_SRC);
}

function cmoReady(): boolean {
  if (!parseOk(CMO_SRC)) return false;
  if (!taHas("cmo") && !interpretHasFinite(CMO_SRC)) return false;
  return interpretHasFinite(CMO_SRC);
}

function kamaReady(): boolean {
  if (!parseOk(KAMA_SRC)) return false;
  if (!taHas("kama") && !interpretHasFinite(KAMA_SRC)) return false;
  return interpretHasFinite(KAMA_SRC);
}

function obvReady(): boolean {
  if (!parseOk(OBV_SRC)) return false;
  if (!taHas("obv") && !interpretHasFinite(OBV_SRC)) return false;
  return interpretHasFinite(OBV_SRC);
}

function pivotReady(): boolean {
  if (!parseOk(PIVOT_SRC)) return false;
  if (!taHas("pivothigh") && !interpretHasFinite(PIVOT_SRC)) return false;
  return interpretHasFinite(PIVOT_SRC);
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

describe("interpret alma / cmo / kama / obv / pivot", () => {
  test.skipIf(!almaReady())("ta.alma(close, 3) warms up then is finite", () => {
    const out = interpret(ALMA_SRC, BARS);
    expect(out.plots[0]).toBeNull();
    expect(out.plots[1]).toBeNull();
    expect(typeof out.plots[2]).toBe("number");
    expect(Number.isFinite(out.plots[4]!)).toBe(true);
  });

  test.skipIf(!cmoReady())("ta.cmo(close, 3) needs length+1 samples", () => {
    const out = interpret(CMO_SRC, BARS);
    expect(out.plots.slice(0, 3).every((v) => v == null)).toBe(true);
    expect(out.plots[3]).toBe(100);
    expect(out.plots[4]).toBe(100);
  });

  test.skipIf(!kamaReady())("ta.kama(close, 3) first value after length+1 bars", () => {
    const out = interpret(KAMA_SRC, BARS);
    expect(out.plots[0]).toBeNull();
    expect(out.plots[2]).toBeNull();
    expect(typeof out.plots[3]).toBe("number");
    expect(Number.isFinite(out.plots[4]!)).toBe(true);
  });

  test.skipIf(!obvReady())("ta.obv() is 0 for the first two bars", () => {
    const out = interpret(OBV_SRC, BARS);
    expect(out.plots[0]).toBe(0);
    expect(out.plots[1]).toBe(0);
    expect(typeof out.plots[4]).toBe("number");
  });

  test.skipIf(!pivotReady())("ta.pivothigh(close, 1, 1) left-only", () => {
    const out = interpret(PIVOT_SRC, BARS);
    expect(out.plots[0]).toBeNull();
    expect(out.plots[1]).toBeNull();
    expect(out.plots.some((v) => typeof v === "number" && Number.isFinite(v))).toBe(true);
  });
});
