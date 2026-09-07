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

  test("pyramiding=1 allows one add then blocks", () => {
    const book = new StrategyBook({ pyramiding: 1 });
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "L2", "long", 1, 110);
    book.fillEntry(2, "L3", "long", 1, 120);
    expect(book.position).toEqual({ qty: 2, avgPrice: 105 });
    expect(book.fills).toHaveLength(2);
    expect(book.events.filter((e) => e.type === "entry")).toHaveLength(2);
  });

  test("equity is initial + realized − commission + open PnL", () => {
    const book = new StrategyBook({ commission: 0.001 });
    book.fillEntry(0, "L", "long", 2, 100);
    expect(book.equity(110)).toBeCloseTo(1_000_000 + 20 - 0.2);
    book.fillClose(1, "L", 110);
    expect(book.equity(110)).toBeCloseTo(1_000_000 + 20 - 0.42);
    expect(book.equity(Number.NaN)).toBeCloseTo(1_000_000 + 20 - 0.42);
  });
});

describe("StrategyBook NaN / Inf harden", () => {
  test("NaN/Inf qty or price is a no-op", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", Number.NaN, 100);
    book.fillEntry(1, "L", "long", 1, Number.NaN);
    book.fillEntry(2, "L", "long", Number.POSITIVE_INFINITY, 100);
    book.fillEntry(3, "L", "long", 1, Number.NEGATIVE_INFINITY);
    expect(book.position).toEqual({ qty: 0, avgPrice: null });
    expect(book.fills).toHaveLength(0);
    expect(book.events).toHaveLength(0);

    book.fillEntry(4, "L", "long", 1, 100);
    const snap = { ...book.position, fills: book.fills.length, events: book.events.length };
    book.fillClose(5, "L", Number.NaN);
    book.fillClose(6, "L", Number.POSITIVE_INFINITY);
    expect(book.position.qty).toBe(snap.qty);
    expect(book.position.avgPrice).toBe(100);
    expect(book.fills).toHaveLength(snap.fills);
    expect(book.realizedPnl).toBe(0);
  });

  test("zero qty does not flatten an open position", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 2, 100);
    book.fillEntry(1, "S", "short", 0, 110);
    expect(book.position).toEqual({ qty: 2, avgPrice: 100 });
    expect(book.fills).toHaveLength(1);
  });

  test("configure ignores non-finite broker settings", () => {
    const book = new StrategyBook({ commission: 0.001, slippage: 1, pyramiding: 0 });
    book.configure({
      commission: Number.NaN,
      slippage: Number.POSITIVE_INFINITY,
      pyramiding: Number.NaN,
    });
    book.fillEntry(0, "L", "long", 1, 100);
    expect(book.fills[0]!.price).toBe(101);
    expect(book.commissionPaid).toBeCloseTo(0.101);
    book.fillEntry(1, "L", "long", 1, 110);
    expect(book.position.qty).toBe(1);
  });
});

describe("StrategyBook reverse / leftover", () => {
  test("unequal reverse leaves exactly the new signed qty", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 2, 100);
    book.fillEntry(1, "S", "short", 1, 110);
    expect(book.position.qty).toBe(-1);
    expect(book.position.avgPrice).toBe(110);
    expect(book.position.qty).toBeGreaterThanOrEqual(-1);
    expect(book.realizedPnl).toBe(20);
    expect(book.events.map((e) => e.type)).toEqual(["entry", "close", "entry"]);
  });

  test("pyramiding=0 still allows an opposite flip then blocks same-dir add", () => {
    const book = new StrategyBook({ pyramiding: 0 });
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "S", "short", 1, 110);
    expect(book.position).toEqual({ qty: -1, avgPrice: 110 });
    book.fillEntry(2, "S2", "short", 1, 120);
    expect(book.position).toEqual({ qty: -1, avgPrice: 110 });
    expect(book.events.filter((e) => e.type === "entry")).toHaveLength(2);
  });
});

describe("StrategyBook close_all / cancel", () => {
  test("event-only entry/close do not change position", () => {
    const book = new StrategyBook();
    book.entry(0, "L", "long", 1);
    book.close(1, "L");
    book.exit(2, "X");
    expect(book.position.qty).toBe(0);
    expect(book.fills).toHaveLength(0);
    expect(book.events.map((e) => e.type)).toEqual(["entry", "close", "exit"]);
  });

  test("closeAll with mark flattens and still emits close_all", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.closeAll(1, 110);
    expect(book.position.qty).toBe(0);
    expect(book.position.avgPrice).toBeNull();
    expect(book.realizedPnl).toBe(10);
    expect(book.fills).toHaveLength(2);
    expect(book.events.map((e) => e.type)).toEqual(["entry", "close_all"]);
  });

  test("closeAll without mark is event-only", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.closeAll(1);
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    expect(book.events.at(-1)).toEqual({ type: "close_all", id: "", bar: 1 });
  });

  test("closeAll with NaN mark does not flatten", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.closeAll(1, Number.NaN);
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    expect(book.events.at(-1)?.type).toBe("close_all");
  });

  test("cancel and cancelAll emit events", () => {
    const book = new StrategyBook();
    book.cancel(0, "L");
    book.cancelAll(1);
    expect(book.events).toEqual([
      { type: "cancel", id: "L", bar: 0 },
      { type: "cancel_all", id: "", bar: 1 },
    ]);
    expect(book.position.qty).toBe(0);
  });
});

describe("StrategyBook pending orders", () => {
  test("market placeEntry fills immediately", () => {
    const market = new StrategyBook();
    market.fillEntry(0, "L", "long", 1, 100);
    const book = new StrategyBook();
    book.placeEntry(0, "L", "long", 1, { price: 100 });
    expect(book.pending).toHaveLength(0);
    expect(book.position).toEqual(market.position);
    expect(book.fills).toEqual(market.fills);
    expect(book.events).toEqual(market.events);
  });

  test("long limit fills when low crosses", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "L", "long", 1, { limit: 100 });
    expect(book.position.qty).toBe(0);
    expect(book.fills).toHaveLength(0);
    expect(book.pending).toEqual([
      { id: "L", direction: "long", qty: 1, limit: 100, stop: null, bar: 0 },
    ]);
    expect(book.events).toEqual([
      { type: "entry", id: "L", direction: "long", qty: 1, bar: 0 },
    ]);

    expect(book.processPending(1, { open: 105, high: 106, low: 101, close: 104 })).toEqual([]);
    expect(book.position.qty).toBe(0);
    expect(book.pending).toHaveLength(1);

    expect(book.processPending(2, { open: 105, high: 106, low: 99, close: 101 })).toEqual(["L"]);
    expect(book.pending).toHaveLength(0);
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    expect(book.fills).toEqual([{ bar: 2, id: "L", side: "buy", qty: 1, price: 100 }]);
    expect(book.events.map((e) => e.type)).toEqual(["entry", "fill"]);
  });

  test("cancel removes pending so it does not fill", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "L", "long", 1, { limit: 100 });
    book.cancel(1, "L");
    expect(book.pending).toHaveLength(0);
    expect(book.events.map((e) => e.type)).toEqual(["entry", "cancel"]);
    expect(book.processPending(2, { open: 105, high: 106, low: 99, close: 101 })).toEqual([]);
    expect(book.fills).toHaveLength(0);
    expect(book.position.qty).toBe(0);
  });

  test("long limit gaps through open", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "L", "long", 1, { limit: 100 });
    book.processPending(1, { open: 95, high: 98, low: 94, close: 96 });
    expect(book.fills[0]?.price).toBe(95);
    expect(book.position.avgPrice).toBe(95);
  });

  test("cancelAll drops pending", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "L", "long", 1, { limit: 100 });
    book.cancelAll(1);
    expect(book.pending).toHaveLength(0);
    book.processPending(2, { open: 105, high: 106, low: 99, close: 101 });
    expect(book.fills).toHaveLength(0);
  });

  test("non-finite bar does not fill pending", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "L", "long", 1, { limit: 100 });
    expect(
      book.processPending(1, {
        open: Number.NaN,
        high: Number.POSITIVE_INFINITY,
        low: Number.NaN,
        close: Number.NEGATIVE_INFINITY,
      }),
    ).toEqual([]);
    expect(book.pending).toHaveLength(1);
    expect(book.fills).toHaveLength(0);
    expect(book.position.qty).toBe(0);
  });
});

describe("StrategyBook trade ledger", () => {
  test("long 1@100 close@110 → one winning closed trade", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    expect(book.opentrades).toBe(1);
    expect(book.openTrades).toHaveLength(1);
    expect(book.openEntryPrice(0)).toBe(100);
    expect(book.openEntryBar(0)).toBe(0);
    expect(book.openSize(0)).toBe(1);
    expect(book.openId(0)).toBe("L");
    expect(book.openProfit(0, 105)).toBe(5);
    expect(book.closedtrades).toBe(0);
    expect(book.closedCount).toBe(0);

    book.fillClose(1, "L", 110);
    expect(book.openTrades).toHaveLength(0);
    expect(book.opentrades).toBe(0);
    expect(book.closedtrades).toBe(1);
    expect(book.closedCount).toBe(1);
    expect(book.closedTrades).toHaveLength(1);
    expect(book.closedTrades[0]?.profit).toBe(10);
    expect(book.wintrades).toBe(1);
    expect(book.losstrades).toBe(0);
    expect(book.eventrades).toBe(0);
    expect(book.grossprofit).toBe(10);
    expect(book.grossloss).toBe(0);
    expect(book.closedEntryPrice(0)).toBe(100);
    expect(book.closedExitPrice(0)).toBe(110);
    expect(book.closedEntryBar(0)).toBe(0);
    expect(book.closedExitBar(0)).toBe(1);
    expect(book.closedProfit(0)).toBe(10);
    expect(book.closedSize(0)).toBe(1);
    expect(book.closedId(0)).toBe("L");
    expect(book.closedCommission(0)).toBe(0);
    expect(book.avgTrade()).toBe(10);
    expect(book.avgWinningTrade()).toBe(10);
    expect(book.avgLosingTrade()).toBe(0);

    expect(book.closedTrade(1)).toBeNull();
    expect(book.closedEntryPrice(1)).toBeNull();
    expect(book.closedProfit(-1)).toBeNull();
    expect(book.openTrade(0)).toBeNull();
    expect(book.openEntryPrice(0)).toBeNull();
    expect(book.openProfit(0, 110)).toBeNull();
  });

  test("closed profit subtracts commission", () => {
    const book = new StrategyBook({ commission: 0.001 });
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillClose(1, "L", 110);
    expect(book.closedProfit(0)).toBeCloseTo(10 - 0.21);
    expect(book.closedCommission(0)).toBeCloseTo(0.21);
    expect(book.wintrades).toBe(1);
  });

  test("reverse leftover closes the old trade then opens the new", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "S", "short", 1, 110);
    expect(book.closedtrades).toBe(1);
    expect(book.closedProfit(0)).toBe(10);
    expect(book.closedId(0)).toBe("L");
    expect(book.wintrades).toBe(1);
    expect(book.opentrades).toBe(1);
    expect(book.openTrade(0)?.direction).toBe("short");
    expect(book.openEntryPrice(0)).toBe(110);
    expect(book.openId(0)).toBe("S");
    expect(book.openProfit(0, 100)).toBe(10);
  });

  test("same-dir add merges into one open trade", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillEntry(1, "L", "long", 1, 110);
    expect(book.opentrades).toBe(1);
    expect(book.openSize(0)).toBe(2);
    expect(book.openEntryPrice(0)).toBe(105);
    book.fillClose(2, "L", 120);
    expect(book.closedtrades).toBe(1);
    expect(book.closedSize(0)).toBe(2);
    expect(book.closedProfit(0)).toBe(30);
  });

  test("order is a placeEntry alias", () => {
    const book = new StrategyBook();
    book.order(0, "L", "long", 1, { price: 100 });
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    expect(book.opentrades).toBe(1);
    expect(book.openId(0)).toBe("L");
  });

  test("losing short increments losstrades and grossloss", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "S", "short", 1, 100);
    book.fillClose(1, "S", 110);
    expect(book.closedProfit(0)).toBe(-10);
    expect(book.wintrades).toBe(0);
    expect(book.losstrades).toBe(1);
    expect(book.grossloss).toBe(10);
    expect(book.avgLosingTrade()).toBe(10);
  });
});

describe("StrategyBook risk + OCA", () => {
  test("allow_entry_in long blocks short fillEntry", () => {
    const book = new StrategyBook();
    book.riskAllowEntryIn("long");
    book.fillEntry(0, "S", "short", 1, 100);
    expect(book.position.qty).toBe(0);
    expect(book.position.avgPrice).toBeNull();
    expect(book.fills).toHaveLength(0);
    expect(book.events).toHaveLength(0);
    book.fillEntry(1, "L", "long", 1, 100);
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
  });

  test("max_position_size caps qty to 10% of equity", () => {
    const book = new StrategyBook();
    expect(book.initialCapital).toBe(1_000_000);
    book.riskMaxPositionSize(10);
    book.fillEntry(0, "L", "long", 50_000, 100);
    // 10% of 1e6 = 100_000 notional / 100 = 1000
    expect(book.position.qty).toBeCloseTo(1000);
    expect(book.fills[0]?.qty).toBeCloseTo(1000);
  });

  test("max_drawdown absolute blocks after losing close", () => {
    const book = new StrategyBook();
    book.riskMaxDrawdown(50, "absolute");
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillClose(1, "L", 40); // −60 ≥ 50
    expect(book.position.qty).toBe(0);
    book.fillEntry(2, "L2", "long", 1, 100);
    expect(book.position.qty).toBe(0);
    expect(book.fills).toHaveLength(2);
    expect(book.entries_blocked).toBe(true);
  });

  test("max_cons_loss_days blocks after two losing days", () => {
    const book = new StrategyBook();
    book.riskMaxConsLossDays(2);
    const d1 = 1_700_000_000;
    const d2 = d1 + 86_400;
    const d3 = d1 + 2 * 86_400;
    // Day PnL is finalized on the next day's close (Python note_closed_trade_day).
    book.fillEntry(0, "L1", "long", 1, 100, { time: d1 });
    book.fillClose(1, "L1", 90, { time: d1 });
    book.fillEntry(2, "L2", "long", 1, 100, { time: d2 });
    book.fillClose(3, "L2", 90, { time: d2 });
    book.fillEntry(4, "L3", "long", 1, 100, { time: d3 });
    book.fillClose(5, "L3", 90, { time: d3 });
    expect(book.consecutive_loss_days).toBeGreaterThanOrEqual(2);
    expect(book.entries_blocked).toBe(true);
    book.fillEntry(6, "L4", "long", 1, 100, { time: d3 + 86_400 });
    expect(book.position.qty).toBe(0);
  });

  test("OCA cancel drops sibling after fill", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "A", "long", 1, { limit: 100, oca_name: "G", oca_type: "cancel" });
    book.placeEntry(0, "B", "long", 1, { limit: 100, oca_name: "G", oca_type: "strategy.oca.cancel" });
    expect(book.pending).toHaveLength(2);
    expect(book.processPending(1, { open: 105, high: 106, low: 99, close: 101 })).toEqual(["A"]);
    expect(book.pending).toHaveLength(0);
    expect(book.position).toEqual({ qty: 1, avgPrice: 100 });
    expect(book.fills).toEqual([{ bar: 1, id: "A", side: "buy", qty: 1, price: 100 }]);
    expect(book.events.some((e) => e.type === "cancel" && e.id === "B")).toBe(true);
  });

  test("OCA reduce reduces sibling qty after fill", () => {
    const book = new StrategyBook();
    book.placeEntry(0, "A", "long", 1, { limit: 100, oca_name: "G", oca_type: "reduce" });
    book.placeEntry(0, "B", "long", 3, { limit: 90, oca_name: "G", oca_type: "strategy.oca.reduce" });
    expect(book.processPending(1, { open: 105, high: 106, low: 99, close: 101 })).toEqual(["A"]);
    expect(book.pending).toHaveLength(1);
    expect(book.pending[0]?.id).toBe("B");
    expect(book.pending[0]?.qty).toBe(2);
    expect(book.position.qty).toBe(1);
    expect(book.fills).toHaveLength(1);
  });
});

describe("StrategyBook summary stats", () => {
  test("long 1@100 close@110 → netprofit 10, percentProfitable 100, profitFactor > 0, summary fields", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillClose(1, "L", 110);
    expect(book.netprofit()).toBe(10);
    expect(book.percentProfitable()).toBe(100);
    expect(book.profitFactor()).toBeGreaterThan(0);
    const s = book.summary(110);
    expect(s.netprofit).toBe(10);
    expect(s.netprofitPercent).toBeCloseTo(100 * 10 / 1_000_000);
    expect(s.openprofit).toBe(0);
    expect(s.equity).toBe(book.equity(110));
    expect(s.wintrades).toBe(1);
    expect(s.losstrades).toBe(0);
    expect(s.eventrades).toBe(0);
    expect(s.closedtrades).toBe(1);
    expect(s.opentrades).toBe(0);
    expect(s.grossprofit).toBe(10);
    expect(s.grossloss).toBe(0);
    expect(s.avgTrade).toBe(10);
    expect(s.avgWinningTrade).toBe(10);
    expect(s.avgLosingTrade).toBe(0);
    expect(s.percentProfitable).toBe(100);
    expect(s.profitFactor).toBeGreaterThan(0);
    expect(s.maxDrawdown).toBe(book.maxDrawdown());
    expect(s.maxDrawdownPercent).toBe(book.maxDrawdownPercent());
    expect(s.maxRunup).toBe(book.maxRunup());
    expect(s.maxRunupPercent).toBe(book.maxRunupPercent());
    expect(s.initialCapital).toBe(1_000_000);
    expect(book.openprofit(Number.NaN)).toBe(0);
  });

  test("win then loss → percentProfitable 50, profitFactor = gp/gl", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillClose(1, "L", 110);
    book.fillEntry(2, "L2", "long", 1, 110);
    book.fillClose(3, "L2", 100);
    expect(book.wintrades).toBe(1);
    expect(book.losstrades).toBe(1);
    expect(book.percentProfitable()).toBe(50);
    expect(book.grossprofit).toBe(10);
    expect(book.grossloss).toBe(10);
    expect(book.profitFactor()).toBe(book.grossprofit / book.grossloss);
    expect(book.summary(100).percentProfitable).toBe(50);
    expect(book.summary(100).profitFactor).toBe(1);
  });

  test("maxDrawdown after a losing close is positive magnitude", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 1, 100);
    book.fillClose(1, "L", 90);
    expect(book.maxDrawdown()).toBeGreaterThan(0);
    expect(book.maxDrawdown()).toBe(10);
    expect(book.maxDrawdownPercent()).toBeCloseTo((100 * 10) / 1_000_000);
    expect(book.netprofit()).toBe(-10);
  });

  test("maxContractsHeldAll after qty 2 then flatten", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 2, 100);
    expect(book.maxContractsHeldAll()).toBe(2);
    expect(book.maxContractsHeldLong()).toBe(2);
    expect(book.maxContractsHeldShort()).toBe(0);
    book.fillClose(1, "L", 110);
    expect(book.position.qty).toBe(0);
    expect(book.maxContractsHeldAll()).toBe(2);
    expect(book.maxContractsHeldLong()).toBe(2);
  });
});

describe("StrategyBook exit / trail / qty_percent", () => {
  test("trail_points=0 + valid trail_offset still trails", () => {
    const book = new StrategyBook();
    book.mintick = 0.01;
    book.fillEntry(0, "L", "long", 1, 100);
    book.placeExit(0, "XT", { trail_points: 0, trail_offset: 100 });
    expect(book.position.qty).toBe(1);
    expect(book.pending).toHaveLength(1);
    expect(book.pending[0]?.trail_offset).toBeCloseTo(1);
    expect(book.pending[0]?.kind).toBe("exit");
    book.processPending(1, { open: 109.5, high: 110, low: 109.2, close: 109.8 });
    expect(book.position.qty).toBe(1);
    expect(book.pending[0]?.stop).toBeCloseTo(109);
  });

  test("trail_points wins over trail_offset when both > 0", () => {
    const book = new StrategyBook();
    book.mintick = 0.01;
    book.fillEntry(0, "L", "long", 2, 100);
    // points=100 → $1; offset=500 would be $5 if it won
    book.placeExit(0, "XT", { trail_points: 100, trail_offset: 500 });
    expect(book.pending[0]?.trail_offset).toBeCloseTo(1);
    book.processPending(1, { open: 109.5, high: 110, low: 109.2, close: 109.8 });
    expect(book.position.qty).toBe(2);
    expect(book.pending[0]?.stop).toBeCloseTo(109);
  });

  test("profit ticks close at entry + ticks*mintick", () => {
    const book = new StrategyBook();
    book.mintick = 0.01;
    book.fillEntry(0, "L", "long", 1, 100);
    book.placeExit(0, "X", { profit: 100 });
    expect(book.position.qty).toBe(1);
    expect(book.pending[0]?.limit).toBeCloseTo(101);
    expect(book.processPending(1, { open: 100.2, high: 100.5, low: 100, close: 100.4 })).toEqual([]);
    expect(book.position.qty).toBe(1);
    expect(book.processPending(2, { open: 100.4, high: 101.5, low: 100.2, close: 101.2 })).toEqual(["X"]);
    expect(book.position.qty).toBe(0);
    expect(book.closedTrades[0]?.exitPrice).toBeCloseTo(101);
  });

  test("loss ticks close at entry − ticks*mintick", () => {
    const book = new StrategyBook();
    book.mintick = 0.01;
    book.fillEntry(0, "L", "long", 1, 100);
    book.placeExit(0, "X", { loss: 50 });
    expect(book.pending[0]?.stop).toBeCloseTo(99.5);
    expect(book.processPending(1, { open: 100, high: 100.2, low: 99.6, close: 99.8 })).toEqual([]);
    expect(book.processPending(2, { open: 99.8, high: 99.9, low: 99, close: 99.2 })).toEqual(["X"]);
    expect(book.position.qty).toBe(0);
    expect(book.closedTrades[0]?.exitPrice).toBeCloseTo(99.5);
  });

  test("qty_percent sizes the exit and wins over qty", () => {
    const half = new StrategyBook();
    half.fillEntry(0, "L", "long", 10, 100);
    half.placeExit(0, "X", { from_entry: "L", qty_percent: 50, price: 100 });
    expect(half.position.qty).toBe(5);
    expect(half.closedTrades[0]?.qty).toBe(5);
    expect(half.events.some((e) => e.type === "exit" && e.qty === 5)).toBe(true);

    const wins = new StrategyBook();
    wins.fillEntry(0, "L", "long", 10, 100);
    wins.placeExit(0, "X", { qty: 1, qty_percent: 40, price: 100 });
    expect(wins.position.qty).toBe(6);
  });

  test("from_entry targets that entry id", () => {
    const book = new StrategyBook({ pyramiding: 1 });
    book.fillEntry(0, "A", "long", 2, 100);
    book.fillEntry(1, "B", "long", 3, 110);
    expect(book.position.qty).toBe(5);
    expect(book.opentrades).toBe(2);
    book.placeExit(2, "XA", { from_entry: "A", price: 120 });
    expect(book.position.qty).toBe(3);
    expect(book.opentrades).toBe(1);
    expect(book.openId(0)).toBe("B");
    expect(book.openSize(0)).toBe(3);
    expect(book.closedTrades).toHaveLength(1);
    expect(book.closedId(0)).toBe("A");
    expect(book.events.some((e) => e.type === "exit" && e.id === "XA" && e.qty === 2)).toBe(true);
  });

  test("unknown from_entry is a soft no-op after the exit event", () => {
    const book = new StrategyBook();
    book.fillEntry(0, "L", "long", 4, 100);
    book.placeExit(1, "X", { from_entry: "NOPE", price: 110 });
    expect(book.position.qty).toBe(4);
    expect(book.closedtrades).toBe(0);
    expect(book.pending).toHaveLength(0);
    expect(book.events.some((e) => e.type === "exit" && e.id === "X")).toBe(true);
  });
});

describe("StrategyBook avg_price_model + leverage", () => {
  test("default avg_price_model is stock; unknown falls back", () => {
    expect(new StrategyBook().avg_price_model).toBe("stock");
    const book = new StrategyBook({ avg_price_model: "not_a_real_model" });
    expect(book.avg_price_model).toBe("stock");
    book.configure({ avg_price_model: "futures" });
    expect(book.avg_price_model).toBe("futures");
    book.configure({ avg_price_model: "strategy.avg_price_inverse" });
    expect(book.avg_price_model).toBe("inverse");
  });

  test("add VWAP is the same for stock and futures", () => {
    const expected = (2 * 100 + 4 * 110) / 6;
    for (const model of ["stock", "futures"] as const) {
      const book = new StrategyBook({ pyramiding: 1, avg_price_model: model });
      book.fillEntry(0, "A", "long", 2, 100);
      book.fillEntry(1, "B", "long", 4, 110);
      expect(book.position.qty).toBe(6);
      expect(book.position.avgPrice).toBeCloseTo(expected);
    }
  });

  test("stock (default): two adds then partial close reweights FIFO", () => {
    const book = new StrategyBook({ pyramiding: 1 });
    expect(book.avg_price_model).toBe("stock");
    book.fillEntry(0, "A", "long", 1, 100);
    book.fillEntry(1, "B", "long", 1, 120);
    expect(book.position).toEqual({ qty: 2, avgPrice: 110 });
    book.placeExit(2, "X", { qty: 1, price: 130 });
    expect(book.position.qty).toBe(1);
    expect(book.position.avgPrice).toBeCloseTo(120);
    expect(book.netprofit()).toBeCloseTo(30);
    expect(book.closedTrades[0]?.entryPrice).toBeCloseTo(100);
  });

  test("futures: two adds then partial close keeps sticky avg", () => {
    const book = new StrategyBook({ pyramiding: 1, avg_price_model: "futures" });
    book.fillEntry(0, "A", "long", 1, 100);
    book.fillEntry(1, "B", "long", 1, 120);
    expect(book.position.avgPrice).toBeCloseTo(110);
    book.placeExit(2, "X", { qty: 1, price: 130 });
    expect(book.position.qty).toBe(1);
    expect(book.position.avgPrice).toBeCloseTo(110);
    expect(book.netprofit()).toBeCloseTo(20);
    expect(book.closedTrades[0]?.entryPrice).toBeCloseTo(110);
  });

  test("leverage=10 cash default qty is margin * leverage / price", () => {
    const book = new StrategyBook({
      leverage: 10,
      default_qty_type: "cash",
      default_qty_value: 1000,
    });
    expect(book.leverage).toBe(10);
    expect(book.margin_long).toBeCloseTo(10);
    expect(book.resolveDefaultQty(100)).toBeCloseTo(100);
    book.fillEntry(0, "L", "long", book.resolveDefaultQty(100), 100);
    expect(book.position.qty).toBeCloseTo(100);
    expect(book.marginLiquidationPrice()).toBeCloseTo(90);
  });

  test("percent_of_equity default qty scales by leverage; fixed ignores it", () => {
    const pct = new StrategyBook({
      leverage: 5,
      default_qty_type: "percent_of_equity",
      default_qty_value: 100,
    });
    pct.initialCapital = 10_000;
    expect(pct.resolveDefaultQty(100)).toBeCloseTo(500);
    const fixed = new StrategyBook({
      leverage: 20,
      default_qty_type: "fixed",
      default_qty_value: 3,
    });
    expect(fixed.resolveDefaultQty(100)).toBe(3);
    const lev1 = new StrategyBook();
    lev1.fillEntry(0, "L", "long", 1, 100);
    expect(lev1.marginLiquidationPrice()).toBeNull();
  });

  test("margin_long derives leverage", () => {
    const book = new StrategyBook({ margin_long: 20 });
    expect(book.leverage).toBeCloseTo(5);
  });
});

describe("StrategyBook summary extras", () => {
  test("percents are 100 * x / 1e6 default capital", () => {
    const book = new StrategyBook();
    expect(book.initialCapital).toBe(1_000_000);
    book.fillEntry(0, "L", "long", 1, 100);
    expect(book.openprofit(110)).toBe(10);
    expect(book.openprofitPercent(110)).toBeCloseTo((100 * 10) / 1_000_000);
    book.fillClose(1, "L", 110);
    expect(book.netprofit()).toBe(10);
    expect(book.netprofitPercent(110)).toBeCloseTo((100 * 10) / 1_000_000);
    expect(book.grossprofitPercent()).toBeCloseTo((100 * 10) / 1_000_000);
    expect(book.grosslossPercent()).toBe(0);
    expect(book.avgTradePercent()).toBeCloseTo((100 * 10) / 1_000_000);
    expect(book.avgWinningTradePercent()).toBeCloseTo((100 * 10) / 1_000_000);
    expect(book.avgLosingTradePercent()).toBe(0);
    expect(book.summary(110).netprofitPercent).toBeCloseTo((100 * 10) / 1_000_000);
  });
});
