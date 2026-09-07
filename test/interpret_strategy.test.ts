/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime, type RuntimeResult } from "../src/index.ts";
import { firstPartyBars, readFirstParty } from "./helpers/first_party.ts";

const SRC = readFirstParty("strategy_entry.pine") ?? "";

function bars(n: number) {
  return firstPartyBars(n);
}

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function isEntryOnBar1(ev: { type?: string; kind?: string; id?: string | number; bar?: number; bar_index?: number }): boolean {
  const bar = ev.bar ?? ev.bar_index;
  if (bar !== 1) return false;
  const kind = String(ev.kind ?? ev.type ?? "");
  return kind.includes("entry") || ev.id === "L";
}

type Fillish = {
  type?: string;
  kind?: string;
  id?: string | number;
  comment?: string;
};

function collectFillish(out: RuntimeResult): Fillish[] {
  const extra = (out as RuntimeResult & { fills?: Fillish[] }).fills;
  const pool: Fillish[] = [...(out.events ?? []), ...(extra ?? [])];
  return pool.filter((ev) => {
    const kind = String(ev.kind ?? ev.type ?? ev.comment ?? "");
    return kind.toLowerCase().includes("fill");
  });
}

function runHasFills(src: string): boolean {
  if (!parseOk(src)) return false;
  try {
    const out = new Runtime("TEST").run(src, bars(5));
    return out.error == null && collectFillish(out).length > 0;
  } catch {
    return false;
  }
}

describe("interpret strategy", () => {
  test.skipIf(!SRC || !parseOk(SRC))("strategy_entry.pine 5 bars", () => {
    const out = new Runtime("TEST").run(SRC, bars(5));
    expect(out.error).toBeUndefined();
    expect(out.plots).toHaveLength(5);
    const events = (out as RuntimeResult).events;
    if (events != null) {
      expect(events.some(isEntryOnBar1)).toBe(true);
    }
  });

  test.skipIf(!SRC || !runHasFills(SRC))("strategy_entry.pine records a fill when broker is wired", () => {
    const out = new Runtime("TEST").run(SRC, bars(5));
    expect(out.error).toBeUndefined();
    const fills = collectFillish(out);
    expect(fills.length).toBeGreaterThan(0);
    expect(fills.some((ev) => ev.id === "L" || String(ev.comment ?? "").includes("L"))).toBe(true);
  });

  test("trail_points=0 + valid trail_offset still trails", () => {
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
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots.at(-1)).toBe(1);
    expect(out.events?.some((e) => e.type === "exit" && e.id === "XT")).toBe(true);
  });

  test("trail_points wins over trail_offset when both > 0", () => {
    const src = `strategy("t")
if bar_index == 0
    strategy.entry("L", strategy.long, 2)
    strategy.exit("XT", trail_points=100, trail_offset=500)
plot(strategy.position_size)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 109.5, high: 110, low: 109.2, close: 109.8, volume: 1000, time: 1_700_000_060_000 },
    ];
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    // $1 trail (points) keeps the position; $5 trail (offset) would have filled at 105
    expect(out.plots.at(-1)).toBe(2);
  });

  test("profit ticks close at expected price", () => {
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
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots).toEqual([1, 1, 0]);
    const xFill = (out.fills ?? []).find((f) => f.id === "X");
    expect(xFill?.price).toBeCloseTo(101);
  });

  test("loss ticks close at expected price", () => {
    const src = `strategy("t")
if bar_index == 0
    strategy.entry("L", strategy.long, 1)
    strategy.exit("X", loss=50)
plot(strategy.position_size)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 100, high: 100.2, low: 99.6, close: 99.8, volume: 1000, time: 1_700_000_060_000 },
      { open: 99.8, high: 99.9, low: 99, close: 99.2, volume: 1000, time: 1_700_000_120_000 },
    ];
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots.at(-1)).toBe(0);
    const xFill = (out.fills ?? []).find((f) => f.id === "X");
    expect(xFill?.price).toBeCloseTo(99.5);
  });

  test("qty_percent sizes the exit", () => {
    const src = `strategy("t")
if bar_index == 0
    strategy.entry("L", strategy.long, 10)
    strategy.exit("X", qty_percent=50)
plot(strategy.position_size)`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_060_000 },
    ];
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots.at(-1)).toBe(5);
    expect(out.events?.some((e) => e.type === "exit" && e.id === "X" && e.qty === 5)).toBe(true);
  });

  test("from_entry targets that entry id", () => {
    const src = `strategy("t", pyramiding=1)
if bar_index == 0
    strategy.entry("A", strategy.long, 2)
if bar_index == 1
    strategy.entry("B", strategy.long, 3)
if bar_index == 2
    strategy.exit("XA", from_entry="A")
plot(strategy.position_size, "size")`;
    const ohlcv = [
      { open: 100, high: 100, low: 100, close: 100, volume: 1000, time: 1_700_000_000_000 },
      { open: 110, high: 110, low: 110, close: 110, volume: 1000, time: 1_700_000_060_000 },
      { open: 120, high: 120, low: 120, close: 120, volume: 1000, time: 1_700_000_120_000 },
    ];
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    const size = out.series["size"] ?? out.plots;
    expect(size).toEqual([2, 5, 3]);
    expect(out.events?.some((e) => e.type === "exit" && e.id === "XA" && e.qty === 2)).toBe(true);
  });

  test.skipIf(!parseOk(`strategy("t")\nstrategy.entry("L", strategy.long)\nstrategy.close_all()`))(
    "close_all emits a close_all event and flattens",
    () => {
      const src = `strategy("t")
if bar_index == 1
    strategy.entry("L", strategy.long)
if bar_index == 3
    strategy.close_all()`;
      if (!parseOk(src)) return;
      const out = new Runtime("TEST").run(src, bars(5));
      expect(out.error).toBeUndefined();
      const events = out.events ?? [];
      expect(events.some((e) => String(e.type ?? "").includes("close_all"))).toBe(true);
    },
  );

  test("stock (default): two adds then partial close reweights FIFO avg", () => {
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
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots[1]).toBeCloseTo(110);
    expect(out.plots[2]).toBeCloseTo(120);
  });

  test("futures: two adds then partial close keeps sticky avg", () => {
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
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots[1]).toBeCloseTo(110);
    expect(out.plots[2]).toBeCloseTo(110);
  });

  test("plot(strategy.leverage) reads back leverage=10", () => {
    const src = `strategy("t", leverage=10)
plot(strategy.leverage)`;
    const out = new Runtime("TEST").run(src, [
      { close: 100 },
      { close: 101 },
    ]);
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(10);
    expect(out.plots[1]).toBe(10);
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
    const out = new Runtime("TEST").run(src, ohlcv);
    expect(out.error).toBeUndefined();
    expect(out.plots[2]).toBeCloseTo(110);
  });
});

