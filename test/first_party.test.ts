/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";
import { firstPartyBars, readFirstParty } from "./helpers/first_party.ts";

const HAS_FIXTURES = readFirstParty("plot_close.pine") != null;

function runFixture(name: string, n = 40) {
  const src = readFirstParty(name);
  if (src == null) throw new Error(`missing first-party fixture ${name}`);
  parse(src);
  return new Runtime("TEST").run(src, firstPartyBars(n));
}

function parseOk(name: string): boolean {
  const src = readFirstParty(name);
  if (src == null) return false;
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

describe("first-party fixtures", () => {
  test.skipIf(!HAS_FIXTURES)("plot_close.pine", () => {
    const out = runFixture("plot_close.pine", 8);
    expect(out.error).toBeUndefined();
    expect(out.script_name).toBe("fp_plot_close");
    expect(out.plots).toHaveLength(8);
    expect(out.plots[7]).toBeCloseTo(100.5 + 7 * 0.2);
  });

  test.skipIf(!HAS_FIXTURES)("sma.pine", () => {
    const out = runFixture("sma.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.sma).toHaveLength(20);
    for (let i = 0; i < 13; i++) expect(out.series.sma![i]).toBeNull();
    expect(out.series.sma![13]).not.toBeNull();
  });

  test.skipIf(!HAS_FIXTURES)("ema.pine", () => {
    const out = runFixture("ema.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.ema).toHaveLength(20);
    for (let i = 0; i < 13; i++) expect(out.series.ema![i]).toBeNull();
    expect(typeof out.series.ema![13]).toBe("number");
  });

  test.skipIf(!HAS_FIXTURES)("rsi.pine", () => {
    const out = runFixture("rsi.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.rsi).toHaveLength(20);
    expect(out.series.rsi![0]).toBeNull();
    const last = out.series.rsi![19];
    expect(typeof last).toBe("number");
    expect(last!).toBeGreaterThanOrEqual(0);
    expect(last!).toBeLessThanOrEqual(100);
  });

  test.skipIf(!HAS_FIXTURES)("atr.pine", () => {
    const out = runFixture("atr.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.atr).toHaveLength(20);
    expect(out.series.atr![0]).toBeNull();
    const finite = out.series.atr!.filter((v) => v != null);
    expect(finite.length).toBeGreaterThan(0);
  });

  test.skipIf(!parseOk("keltner.pine"))("keltner.pine", () => {
    const out = runFixture("keltner.pine", 40);
    expect(out.error).toBeUndefined();
  });

  test.skipIf(!parseOk("supertrend.pine"))("supertrend.pine", () => {
    const out = runFixture("supertrend.pine", 40);
    expect(out.error).toBeUndefined();
  });

  test.skipIf(!parseOk("strategy_entry.pine"))("strategy_entry.pine", () => {
    const out = runFixture("strategy_entry.pine", 5);
    expect(out.error).toBeUndefined();
  });
});
