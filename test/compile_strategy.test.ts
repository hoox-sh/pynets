/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import { compileEligible, compileToResult } from "../src/runtime/compile/index.ts";

const BARS = [10, 11, 12, 13, 14].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const ENTRY_SRC = `//@version=5
strategy("t")
if bar_index == 1
    strategy.entry("L", strategy.long)
plot(strategy.position_size)
`;

const CLOSE_ALL_SRC = `//@version=5
strategy("t")
if bar_index == 1
    strategy.entry("L", strategy.long)
if bar_index == last_bar_index
    strategy.close_all()
plot(strategy.position_size)
`;

const IMPORT_SRC = `//@version=5
indicator("lib")
import foo/bar/1
plot(close)
`;

const REQUEST_SRC = `//@version=5
indicator("sec")
plot(request.security("X", "1D", close))
`;

type Eventish = { type?: string; kind?: string; comment?: string };

function lastPlot(plots: Array<number | null | undefined> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

function isNonZero(v: number | null): boolean {
  return typeof v === "number" && Number.isFinite(v) && Math.abs(v) > 1e-9;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function collectEvents(...roots: unknown[]): Eventish[] {
  const out: Eventish[] = [];
  for (const root of roots) {
    const rec = asRecord(root);
    if (rec == null) continue;
    for (const key of ["events", "__events"] as const) {
      const pool = rec[key];
      if (!Array.isArray(pool)) continue;
      for (const ev of pool) {
        if (ev != null && typeof ev === "object") out.push(ev as Eventish);
      }
    }
    if (rec.extras != null) out.push(...collectEvents(rec.extras));
    if (rec.series != null) out.push(...collectEvents(rec.series));
  }
  return out;
}

function extrasBlob(...roots: unknown[]): string {
  const parts: string[] = [];
  for (const root of roots) {
    const rec = asRecord(root);
    if (rec == null) continue;
    const extras = rec.extras ?? rec;
    try {
      parts.push(JSON.stringify(extras));
    } catch {
      parts.push(String(extras));
    }
  }
  return parts.join(" ").toLowerCase();
}

function eventText(ev: Eventish): string {
  return `${ev.type ?? ""} ${ev.kind ?? ""} ${ev.comment ?? ""}`.toLowerCase();
}

function plotsMatch(a: Array<number | null>, b: Array<number | null>, eps = 1e-9): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x == null && y == null) continue;
    if (x == null || y == null) return false;
    if (Math.abs(x - y) > eps) return false;
  }
  return true;
}

describe("compile vs interpret strategy", () => {
  test("strategy.entry on bar 1: last position_size is 1 and events include entry", () => {
    const compiled = new Runtime("TEST", { mode: "compile" }).run(ENTRY_SRC, BARS);
    const interpreted = new Runtime("TEST").run(ENTRY_SRC, BARS);
    const fromCompile = compileToResult(ENTRY_SRC, BARS);

    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(fromCompile.mode).toBe("compile");

    const compiledLast = lastPlot(compiled.plots);
    const interpretLast = lastPlot(interpreted.plots);
    expect(isNonZero(compiledLast)).toBe(true);
    expect(isNonZero(interpretLast)).toBe(true);
    expect(compiledLast).toBeCloseTo(1, 9);
    expect(interpretLast).toBeCloseTo(1, 9);

    const events = collectEvents(compiled, fromCompile);
    expect(events.some((ev) => eventText(ev).includes("entry"))).toBe(true);
  });

  test("entry then close_all on last bar: last position_size is 0 and extras/events have close_all or flatten", () => {
    const compiled = new Runtime("TEST", { mode: "compile" }).run(CLOSE_ALL_SRC, BARS);
    const interpreted = new Runtime("TEST").run(CLOSE_ALL_SRC, BARS);
    const fromCompile = compileToResult(CLOSE_ALL_SRC, BARS);

    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(fromCompile.mode).toBe("compile");

    expect(lastPlot(compiled.plots)).toBeCloseTo(0, 9);
    expect(lastPlot(interpreted.plots)).toBeCloseTo(0, 9);

    const events = collectEvents(compiled, fromCompile);
    const blob = `${events.map(eventText).join(" ")} ${extrasBlob(compiled, fromCompile)}`;
    expect(blob).toMatch(/close_all|flatten/);
  });

  test("plot(strategy.position_size) after entry matches interpret within 1e-9", () => {
    const compiled = new Runtime("TEST", { mode: "compile" }).run(ENTRY_SRC, BARS);
    const interpreted = new Runtime("TEST").run(ENTRY_SRC, BARS);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toHaveLength(interpreted.plots.length);
    expect(plotsMatch(compiled.plots, interpreted.plots)).toBe(true);
    expect(isNonZero(lastPlot(compiled.plots))).toBe(true);
  });

  test("import is eligible; request stays eligible", () => {
    const importElig = compileEligible(IMPORT_SRC);
    expect(importElig.ok).toBe(true);

    const requestElig = compileEligible(REQUEST_SRC);
    expect(requestElig.ok).toBe(true);

    const fromCompile = compileToResult(IMPORT_SRC, BARS);
    expect(fromCompile.mode).toBe("compile");
    expect(lastPlot(fromCompile.plots)).toBe(BARS[BARS.length - 1]!.close);

    const importRun = new Runtime("TEST", { mode: "compile" }).run(IMPORT_SRC, BARS);
    expect(importRun.error).toBeUndefined();
    expect(importRun.mode).toBe("compile");
    expect(lastPlot(importRun.plots)).toBe(BARS[BARS.length - 1]!.close);
    const requestRun = new Runtime("TEST", { mode: "compile" }).run(REQUEST_SRC, BARS);
    expect(requestRun.error).toBeUndefined();
    expect(requestRun.mode).toBe("compile");
    expect(requestRun.plots.every((v) => v == null)).toBe(true);
  });

  test("strategy.exit profit ticks match interpret", () => {
    const src = `strategy("t")
if bar_index == 0
    strategy.entry("L", strategy.long, 1)
    strategy.exit("X", profit=100)
plot(strategy.position_size)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 100.2, high: 100.5, low: 100, close: 100.4, volume: 1000, time: 1_700_000_060_000 },
      { open: 100.4, high: 101.5, low: 100.2, close: 101.2, volume: 1000, time: 1_700_000_120_000 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, ohlcv);
    const interpreted = new Runtime("TEST").run(src, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots).toEqual([1, 1, 0]);
  });

  test("trail_points=0 does not disable trail_offset", () => {
    const src = `strategy("t")
if bar_index == 0
    strategy.entry("L", strategy.long, 1)
    strategy.exit("XT", trail_points=0, trail_offset=100)
plot(strategy.position_size)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 109.5, high: 110, low: 109.2, close: 109.8, volume: 1000, time: 1_700_000_060_000 },
      { open: 109.5, high: 109.6, low: 109.1, close: 109.2, volume: 1000, time: 1_700_000_120_000 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, ohlcv);
    const interpreted = new Runtime("TEST").run(src, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots.at(-1)).toBe(1);
  });

  test("qty_percent sizes the compile exit", () => {
    const src = `strategy("t")
if bar_index == 0
    strategy.entry("L", strategy.long, 10)
    strategy.exit("X", qty_percent=50)
plot(strategy.position_size)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_060_000 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, ohlcv);
    const interpreted = new Runtime("TEST").run(src, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots.at(-1)).toBe(5);
  });

  test("Runtime mode=compile on strategy script has no error", () => {
    const out = new Runtime("TEST", { mode: "compile" }).run(ENTRY_SRC, BARS);
    expect(out.error).toBeUndefined();
    expect(out.mode).toBe("compile");
  });

  test("plot(strategy.leverage) after leverage=10 matches interpret", () => {
    const src = `strategy("t", leverage=10)
plot(strategy.leverage)`;
    const bars = [{ close: 100 }, { close: 101 }];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, bars);
    const interpreted = new Runtime("TEST").run(src, bars);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots).toEqual([10, 10]);
  });

  test("futures avg_price_model stays sticky after partial close", () => {
    const src = `strategy("t", pyramiding=1, avg_price_model="futures")
if bar_index == 0
    strategy.entry("A", strategy.long, 1)
if bar_index == 1
    strategy.entry("B", strategy.long, 1)
if bar_index == 2
    strategy.close("A", qty=1)
plot(strategy.position_avg_price)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 120, high: 120, low: 120, close: 120, volume: 1000, time: 1_700_000_060_000 },
      { open: 130, high: 130, low: 130, close: 130, volume: 1000, time: 1_700_000_120_000 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, ohlcv);
    const interpreted = new Runtime("TEST").run(src, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots[1]).toBeCloseTo(110);
    expect(compiled.plots[2]).toBeCloseTo(110);
  });

  test("strategy.avg_price_futures token selects sticky avg", () => {
    const src = `strategy("t", pyramiding=1, avg_price_model=strategy.avg_price_futures)
if bar_index == 0
    strategy.entry("A", strategy.long, 1)
if bar_index == 1
    strategy.entry("B", strategy.long, 1)
if bar_index == 2
    strategy.close("A", qty=1)
plot(strategy.position_avg_price)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 120, high: 120, low: 120, close: 120, volume: 1000, time: 1_700_000_060_000 },
      { open: 130, high: 130, low: 130, close: 130, volume: 1000, time: 1_700_000_120_000 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, ohlcv);
    const interpreted = new Runtime("TEST").run(src, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots[2]).toBeCloseTo(110);
  });

  test("stock default reweights FIFO avg after partial close", () => {
    const src = `strategy("t", pyramiding=1)
if bar_index == 0
    strategy.entry("A", strategy.long, 1)
if bar_index == 1
    strategy.entry("B", strategy.long, 1)
if bar_index == 2
    strategy.close("A", qty=1)
plot(strategy.position_avg_price)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 120, high: 120, low: 120, close: 120, volume: 1000, time: 1_700_000_060_000 },
      { open: 130, high: 130, low: 130, close: 130, volume: 1000, time: 1_700_000_120_000 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, ohlcv);
    const interpreted = new Runtime("TEST").run(src, ohlcv);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots[1]).toBeCloseTo(110);
    expect(compiled.plots[2]).toBeCloseTo(120);
  });

  test("cash default qty scales by leverage", () => {
    const src = `strategy("t", default_qty_type=strategy.cash, default_qty_value=1000, leverage=10)
if bar_index == 0
    strategy.entry("L", strategy.long)
plot(strategy.position_size)`;
    const bars = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1 },
      { open: 100, high: 100, low: 100, close: 100, volume: 1 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, bars);
    const interpreted = new Runtime("TEST").run(src, bars);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    // qty = 1000 * 10 / 100 = 100
    expect(compiled.plots[0]).toBeCloseTo(100);
  });

  test("margin_liquidation_price after leveraged long matches interpret", () => {
    const src = `strategy("t", leverage=10)
if bar_index == 0
    strategy.entry("L", strategy.long, 1)
plot(strategy.margin_liquidation_price)`;
    const bars = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1 },
      { open: 100, high: 100, low: 100, close: 100, volume: 1 },
    ];
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, bars);
    const interpreted = new Runtime("TEST").run(src, bars);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    // liq = 100 * (1 - 1/10) = 90
    expect(compiled.plots[0]).toBeCloseTo(90);
  });
});
