/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Object-mode compile broker. Python analog: CompileStrategyBroker.
 * Injected as `__h.strategy`. Wraps StrategyBook (fills + ledger + risk).
 */
import {
  StrategyBook,
  type BrokerSettings,
  type PlaceEntryOpts,
  type StrategyDirection,
  type StrategyEvent,
  type StrategySummary,
} from "../strategy.ts";

function asDir(v: unknown): StrategyDirection | number | string {
  if (v == null) return "long";
  if (v === 1 || v === "1" || v === "long" || v === "strategy.long" || v === "buy") return "long";
  if (v === -1 || v === "-1" || v === "short" || v === "strategy.short" || v === "sell") return "short";
  return String(v);
}

function num(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

export class CompileStrategy {
  readonly book: StrategyBook;
  private bar = 0;
  private mark = 0;
  private time = 0;

  constructor(settings?: BrokerSettings) {
    this.book = new StrategyBook(settings);
  }

  beginBar(
    bar: unknown,
    open: unknown,
    high: unknown,
    low: unknown,
    close: unknown,
    time?: unknown,
  ): void {
    this.bar = num(bar, 0);
    this.mark = num(close, 0);
    this.time = time == null ? this.bar : num(time, this.bar);
    const ohlc = {
      open: num(open, this.mark),
      high: num(high, this.mark),
      low: num(low, this.mark),
      close: this.mark,
    };
    this.book.processPending(this.bar, ohlc);
    this.book.markOpenTrades(ohlc.high, ohlc.low, ohlc.close);
  }

  entry(id?: unknown, direction?: unknown, qty?: unknown, opts?: PlaceEntryOpts): void {
    const q = qty == null ? 1 : num(qty, 1);
    this.book.placeEntry(this.bar, str(id, "entry"), asDir(direction), q, {
      price: opts?.price ?? this.mark,
      time: opts?.time ?? this.time,
      limit: opts?.limit,
      stop: opts?.stop,
      comment: opts?.comment,
      oca_name: opts?.oca_name,
      oca_type: opts?.oca_type,
    });
  }

  close(id?: unknown, _qty?: unknown): void {
    this.book.fillClose(this.bar, str(id, ""), this.mark, { time: this.time });
  }

  close_all(_comment?: unknown): void {
    this.book.closeAll(this.bar, this.mark);
  }

  order(id?: unknown, direction?: unknown, qty?: unknown, opts?: PlaceEntryOpts): void {
    this.entry(id, direction, qty, opts);
  }

  cancel(id?: unknown): void {
    this.book.cancel(this.bar, str(id, ""));
  }

  cancel_all(): void {
    this.book.cancelAll(this.bar);
  }

  exit(from_entry?: unknown, _qty?: unknown): void {
    this.book.fillClose(this.bar, str(from_entry, ""), this.mark, { time: this.time });
  }

  position_size(): number {
    return this.book.position.qty;
  }

  netprofit(): number {
    return this.book.realizedPnl;
  }

  equity(): number {
    return this.book.equity(this.mark);
  }

  openprofit(): number {
    const q = this.book.position.qty;
    const avg = this.book.position.avgPrice;
    if (q === 0 || avg == null || !Number.isFinite(avg)) return 0;
    return q * (this.mark - avg);
  }

  opentrades(): number {
    return this.book.opentrades;
  }

  closedtrades(): number {
    return this.book.closedtrades;
  }

  risk_allow_entry_in(value?: unknown): void {
    this.book.riskAllowEntryIn(value);
  }

  risk_max_position_size(percent?: unknown): void {
    this.book.riskMaxPositionSize(percent);
  }

  risk_max_drawdown(value?: unknown, type?: unknown): void {
    this.book.riskMaxDrawdown(value, type);
  }

  extras(): CompileStrategyExtras {
    return {
      __events: this.book.events.slice(),
      __fills: this.book.fills.slice(),
      __position_size: this.book.position.qty,
      __netprofit: this.book.realizedPnl,
      __equity: this.book.equity(this.mark),
      __strategy: this.book.summary(this.mark),
    };
  }
}

export interface CompileStrategyExtras {
  __events: StrategyEvent[];
  __fills: StrategyBook["fills"];
  __position_size: number;
  __netprofit: number;
  __equity: number;
  __strategy: StrategySummary;
}

export function createCompileStrategy(settings?: BrokerSettings): CompileStrategy {
  return new CompileStrategy(settings);
}
