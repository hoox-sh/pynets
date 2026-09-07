/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Object-mode compile broker. Python analog: CompileStrategyBroker.
 * Injected as `__h.strategy`. Wraps StrategyBook (fills + ledger + risk).
 */
import {
  StrategyBook,
  type BarOhlc,
  type BrokerSettings,
  type PlaceEntryOpts,
  type PlaceExitOpts,
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

function optNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function asExitOpts(v: unknown): PlaceExitOpts {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return {};
  const rec = v as Record<string, unknown>;
  return {
    from_entry: rec.from_entry == null || rec.from_entry === "" ? null : String(rec.from_entry),
    qty: optNum(rec.qty),
    qty_percent: optNum(rec.qty_percent),
    profit: optNum(rec.profit),
    limit: optNum(rec.limit),
    loss: optNum(rec.loss),
    stop: optNum(rec.stop),
    trail_price: optNum(rec.trail_price),
    trail_points: optNum(rec.trail_points),
    trail_offset: optNum(rec.trail_offset),
    comment: rec.comment == null ? undefined : String(rec.comment),
  };
}

export class CompileStrategy {
  readonly book: StrategyBook;
  private bar = 0;
  private mark = 0;
  private time = 0;
  private ohlc: BarOhlc = {};

  constructor(settings?: BrokerSettings) {
    this.book = new StrategyBook(settings);
  }

  /** Apply `strategy(...)` declaration kwargs (every bar, same as interpret). */
  configure(settings?: unknown): void {
    if (settings == null || typeof settings !== "object" || Array.isArray(settings)) return;
    const rec = settings as Record<string, unknown>;
    const broker: BrokerSettings = {};
    const commission = optNum(rec.commission);
    if (commission != null) broker.commission = commission;
    const slippage = optNum(rec.slippage);
    if (slippage != null) broker.slippage = slippage;
    if (rec.pyramiding !== undefined) {
      const pyr = optNum(rec.pyramiding);
      broker.pyramiding = pyr == null ? undefined : Math.trunc(pyr);
    }
    if (typeof rec.avg_price_model === "string") broker.avg_price_model = rec.avg_price_model;
    const leverage = optNum(rec.leverage);
    if (leverage != null) broker.leverage = leverage;
    const ml = optNum(rec.margin_long);
    if (ml != null) broker.margin_long = ml;
    const ms = optNum(rec.margin_short);
    if (ms != null) broker.margin_short = ms;
    if (typeof rec.default_qty_type === "string") broker.default_qty_type = rec.default_qty_type;
    const dqv = optNum(rec.default_qty_value);
    if (dqv != null) broker.default_qty_value = dqv;
    if (Object.keys(broker).length) this.book.configure(broker);
    const capital = optNum(rec.initial_capital);
    if (capital != null) this.book.initialCapital = capital;
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
    this.ohlc = ohlc;
    this.book.processPending(this.bar, ohlc);
    this.book.markOpenTrades(ohlc.high, ohlc.low, ohlc.close);
  }

  entry(id?: unknown, direction?: unknown, qty?: unknown, opts?: PlaceEntryOpts): void {
    const fillPrice = opts?.price ?? this.mark;
    const q = qty == null ? this.book.resolveDefaultQty(fillPrice) : num(qty, 1);
    this.book.placeEntry(this.bar, str(id, "entry"), asDir(direction), q, {
      price: fillPrice,
      time: opts?.time ?? this.time,
      limit: opts?.limit,
      stop: opts?.stop,
      comment: opts?.comment,
      oca_name: opts?.oca_name,
      oca_type: opts?.oca_type,
    });
  }

  close(id?: unknown, qty?: unknown): void {
    this.book.fillClose(this.bar, str(id, ""), this.mark, {
      time: this.time,
      qty: optNum(qty),
    });
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

  exit(id?: unknown, opts?: unknown): void {
    const parsed = asExitOpts(opts);
    this.book.placeExit(this.bar, str(id, "exit"), {
      ...parsed,
      price: this.mark,
      time: this.time,
      ohlc: this.ohlc,
    });
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

  leverage(): number {
    return this.book.leverage;
  }

  margin_liquidation_price(): number | null {
    return this.book.marginLiquidationPrice();
  }

  position_avg_price(): number | null {
    return this.book.position.avgPrice;
  }

  initial_capital(): number {
    return this.book.initialCapital;
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
