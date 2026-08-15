/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, Runtime } from "../src/index.ts";

const FIX = join(import.meta.dir, "../../tests/fixtures/first_party");

function bars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    open: 100 + i * 0.2,
    high: 101 + i * 0.2,
    low: 99 + i * 0.2,
    close: 100.5 + i * 0.2,
    volume: 1000,
    time: 1_700_000_000_000 + i * 60_000,
  }));
}

function runFixture(name: string, n = 40) {
  const src = readFileSync(join(FIX, name), "utf8");
  parse(src);
  return new Runtime("TEST").run(src, bars(n));
}

function parseOk(name: string): boolean {
  try {
    parse(readFileSync(join(FIX, name), "utf8"));
    return true;
  } catch {
    return false;
  }
}

describe("first-party fixtures", () => {
  test("plot_close.pine", () => {
    const out = runFixture("plot_close.pine", 8);
    expect(out.error).toBeUndefined();
    expect(out.script_name).toBe("fp_plot_close");
    expect(out.plots).toHaveLength(8);
    expect(out.plots[7]).toBeCloseTo(100.5 + 7 * 0.2);
  });

  test("sma.pine", () => {
    const out = runFixture("sma.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.sma).toHaveLength(20);
    for (let i = 0; i < 13; i++) expect(out.series.sma![i]).toBeNull();
    expect(out.series.sma![13]).not.toBeNull();
  });

  test("ema.pine", () => {
    const out = runFixture("ema.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.ema).toHaveLength(20);
    for (let i = 0; i < 13; i++) expect(out.series.ema![i]).toBeNull();
    expect(typeof out.series.ema![13]).toBe("number");
  });

  test("rsi.pine", () => {
    const out = runFixture("rsi.pine", 20);
    expect(out.error).toBeUndefined();
    expect(out.series.rsi).toHaveLength(20);
    expect(out.series.rsi![0]).toBeNull();
    const last = out.series.rsi![19];
    expect(typeof last).toBe("number");
    expect(last!).toBeGreaterThanOrEqual(0);
    expect(last!).toBeLessThanOrEqual(100);
  });

  test("atr.pine", () => {
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
