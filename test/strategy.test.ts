/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { StrategyBook } from "../src/runtime/strategy.ts";

describe("StrategyBook event bus", () => {
  test("entry then close records 2 events", () => {
    const book = new StrategyBook();
    book.entry(0, "L", "long", 1);
    book.close(1, "L");
    expect(book.events).toHaveLength(2);
    expect(book.events[0]).toEqual({
      type: "entry",
      id: "L",
      direction: "long",
      qty: 1,
      bar: 0,
    });
    expect(book.events[1]).toEqual({ type: "close", id: "L", bar: 1 });
    expect(book.fills).toHaveLength(0);
    expect(book.position.qty).toBe(0);
  });

  test("direction mapping", () => {
    const book = new StrategyBook();
    book.entry(0, "a", 1);
    book.entry(1, "b", -1);
    book.entry(2, "c", "long");
    book.entry(3, "d", "short");
    book.entry(4, "e", "strategy.long");
    book.entry(5, "f", "strategy.short");
    book.entry(6, "g", "foo_LONG_bar");
    expect(book.events.map((e) => e.direction)).toEqual([
      "long",
      "short",
      "long",
      "short",
      "long",
      "short",
      "long",
    ]);
  });
});

describe("StrategyBook market fills", () => {
  test("long 1 @ 100 then close @ 110", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    book.fillClose(1, "L", 110);
    expect(book.position.qty).toBe(0);
    expect(book.position.avgPrice).toBeNull();
    expect(book.fills).toEqual([
      { bar: 0, id: "L", side: "buy", qty: 1, price: 100 },
      { bar: 1, id: "L", side: "sell", qty: 1, price: 110 },
    ]);
    expect(book.events).toHaveLength(2);
    expect(book.events[0]).toEqual({
      type: "entry",
      id: "L",
      direction: "long",
      qty: 1,
      bar: 0,
    });
    expect(book.events[1]).toEqual({ type: "close", id: "L", bar: 1 });
  });

  test("reverse long then short", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "S", "short", 1, 110);
    expect(book.position).toEqual({ qty: -1, avgPrice: 110 });
    expect(book.fills).toEqual([
      { bar: 0, id: "L", side: "buy", qty: 1, price: 100 },
      { bar: 1, id: "S", side: "sell", qty: 1, price: 110 },
      { bar: 1, id: "S", side: "sell", qty: 1, price: 110 },
    ]);
    expect(book.events.map((e) => e.type)).toEqual(["entry", "close", "entry"]);
  });

  test("same-direction add averages price", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "L", "long", 1, 110);
    expect(book.position).toEqual({ qty: 2, avgPrice: 105 });
    expect(book.fills).toHaveLength(2);
  });
});

describe("StrategyBook broker settings", () => {
  test("0.1% commission accumulates on fills", () => {
    const book = new StrategyBook({ commission: 0.001 });
    book.fillEntry(0, "L", "long", 1, 100);
    expect(book.commissionPaid).toBeCloseTo(0.1);
    book.fillClose(1, "L", 110);
    expect(book.commissionPaid).toBeCloseTo(0.21);
    expect(book.realizedPnl).toBe(10);
  });

  test("slippage moves fill price against the trade", () => {
    const book = new StrategyBook({ slippage: 1 });
    book.fillEntry(0, "L", "long", 1, 100);
    expect(book.fills[0]).toEqual({ bar: 0, id: "L", side: "buy", qty: 1, price: 101 });
    expect(book.position.avgPrice).toBe(101);
    book.fillClose(1, "L", 110);
    expect(book.fills[1]).toEqual({ bar: 1, id: "L", side: "sell", qty: 1, price: 109 });

    const short = new StrategyBook({ slippage: 1 });
    short.fillEntry(0, "S", "short", 1, 100);
    expect(short.fills[0]).toEqual({ bar: 0, id: "S", side: "sell", qty: 1, price: 99 });
    expect(short.position.avgPrice).toBe(99);
  });

  test("pyramiding=0 rejects second same-dir add", () => {
    const book = new StrategyBook({ pyramiding: 0 });
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "L", "long", 1, 110);
    expect(book.fills).toHaveLength(1);
    expect(book.fills[0]).toEqual({ bar: 0, id: "L", side: "buy", qty: 1, price: 100 });
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    expect(book.events).toHaveLength(1);
  });
});
