/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Strategy event bus plus a tiny market-fill + pending limit/stop model
 * (not a full broker). entry/close/exit stay event-only. fillEntry/fillClose
 * update a single signed position and fills. processPending is called once
 * per bar BEFORE the script body. Optional commission, slippage, pyramiding.
 * Non-finite qty/price is a no-op (never corrupts position).
 * fillEntry from flat / reverse leftover opens a trade; flatten moves it to closed.
 */

export type StrategyDirection = "long" | "short";

export interface BrokerSettings {
  commission?: number; // fraction of notional, default 0 (0.001 = 0.1%)
  slippage?: number; // price units added against the trade, default 0
  pyramiding?: number; // max same-direction adds; 0 = no extra adds; omitted = unlimited
}

export interface StrategyEvent {
  type: "entry" | "close" | "exit" | "cancel" | "close_all" | "cancel_all" | "fill";
  id: string;
  direction?: StrategyDirection;
  qty?: number | null;
  bar: number;
}

export interface Position {
  qty: number; // signed: >0 long, <0 short
  avgPrice: number | null;
}

export interface Fill {
  bar: number;
  id: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
}

export interface PendingOrder {
  id: string;
  direction: StrategyDirection;
  qty: number;
  limit: number | null;
  stop: number | null;
  bar: number;
}

export interface PlaceEntryOpts {
  limit?: number | null;
  stop?: number | null;
  /** Market fill price when both limit and stop are unset. */
  price?: number;
  comment?: string;
  time?: number;
}

/** One open or closed strategy trade (qty is absolute). */
export interface Trade {
  id: string;
  direction: StrategyDirection;
  qty: number;
  entryBar: number;
  entryPrice: number;
  entryTime?: number;
  exitBar?: number;
  exitPrice?: number;
  profit?: number;
  commission: number;
  comment?: string;
  max_runup?: number;
  max_drawdown?: number;
}

export interface BarOhlc {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function optLevel(v: number | null | undefined): number | null {
  return isFiniteNumber(v) ? v : null;
}

/** Raw trigger price (slippage applied later via recordFill). */
function triggerPrice(order: PendingOrder, open: number, high: number, low: number): number | null {
  const lim = order.limit;
  const stop = order.stop;
  const d = order.direction;
  if (lim != null && stop != null) {
    // Stop-limit: stop must trigger and limit must still be available.
    if (d === "long" && high >= stop && low <= lim) return lim;
    if (d === "short" && low <= stop && high >= lim) return lim;
    return null;
  }
  if (lim != null) {
    if (d === "long" && low <= lim) return Math.min(lim, open);
    if (d === "short" && high >= lim) return Math.max(lim, open);
    return null;
  }
  if (stop != null) {
    if (d === "long" && high >= stop) return Math.max(stop, open);
    if (d === "short" && low <= stop) return Math.min(stop, open);
    return null;
  }
  return null;
}

function finiteOr(v: unknown, fallback: number): number {
  return isFiniteNumber(v) ? v : fallback;
}

/** Omitted / non-finite → unlimited (`undefined`). Else max(0, trunc). */
function normalizePyramiding(v: unknown): number | undefined {
  if (v == null || !isFiniteNumber(v)) return undefined;
  return Math.max(0, Math.trunc(v));
}

/** 1 / "long" / *long* → long; -1 / "short" / *short* → short. */
function mapDirection(direction: unknown): StrategyDirection {
  if (direction === 1 || direction === "1") return "long";
  if (direction === -1 || direction === "-1") return "short";
  const s = String(direction ?? "").toLowerCase();
  if (s.includes("long")) return "long";
  if (s.includes("short")) return "short";
  return "long";
}

export class StrategyBook {
  readonly events: StrategyEvent[] = [];
  readonly position: Position = { qty: 0, avgPrice: null };
  readonly fills: Fill[] = [];
  readonly pending: PendingOrder[] = [];
  readonly openTrades: Trade[] = [];
  readonly closedTrades: Trade[] = [];
  commissionPaid = 0;
  realizedPnl = 0;
  closedCount = 0;
  wintrades = 0;
  losstrades = 0;
  eventrades = 0;
  grossprofit = 0;
  /** Positive magnitude of losing-trade profits. */
  grossloss = 0;
  initialCapital = 1_000_000;

  get opentrades(): number {
    return this.openTrades.length;
  }

  get closedtrades(): number {
    return this.closedTrades.length;
  }

  private commission: number;
  private slippage: number;
  private pyramiding: number | undefined;
  private sameDirAdds = 0;

  constructor(settings?: BrokerSettings) {
    this.commission = finiteOr(settings?.commission, 0);
    this.slippage = finiteOr(settings?.slippage, 0);
    this.pyramiding = normalizePyramiding(settings?.pyramiding);
  }

  /** Mark-to-market equity: initial + realized − commission + open PnL. */
  equity(mark: number): number {
    this.ensureSanePosition();
    const q = this.position.qty;
    const avg = this.position.avgPrice;
    const realized = isFiniteNumber(this.realizedPnl) ? this.realizedPnl : 0;
    const paid = isFiniteNumber(this.commissionPaid) ? this.commissionPaid : 0;
    const open =
      q === 0 || !isFiniteNumber(avg) || !isFiniteNumber(mark) ? 0 : q * (mark - avg);
    return this.initialCapital + realized - paid + open;
  }

  closedTrade(i: number): Trade | null {
    return this.pickTrade(this.closedTrades, i);
  }

  openTrade(i: number): Trade | null {
    return this.pickTrade(this.openTrades, i);
  }

  closedEntryBar(i: number): number | null {
    return this.closedTrade(i)?.entryBar ?? null;
  }

  closedEntryPrice(i: number): number | null {
    return this.closedTrade(i)?.entryPrice ?? null;
  }

  closedExitBar(i: number): number | null {
    return this.closedTrade(i)?.exitBar ?? null;
  }

  closedExitPrice(i: number): number | null {
    return this.closedTrade(i)?.exitPrice ?? null;
  }

  closedProfit(i: number): number | null {
    const t = this.closedTrade(i);
    return t != null && t.profit !== undefined ? t.profit : null;
  }

  closedSize(i: number): number | null {
    return this.closedTrade(i)?.qty ?? null;
  }

  closedId(i: number): string | null {
    return this.closedTrade(i)?.id ?? null;
  }

  closedCommission(i: number): number | null {
    return this.closedTrade(i)?.commission ?? null;
  }

  openEntryBar(i: number): number | null {
    return this.openTrade(i)?.entryBar ?? null;
  }

  openEntryPrice(i: number): number | null {
    return this.openTrade(i)?.entryPrice ?? null;
  }

  openSize(i: number): number | null {
    return this.openTrade(i)?.qty ?? null;
  }

  openId(i: number): string | null {
    return this.openTrade(i)?.id ?? null;
  }

  openProfit(i: number, markPrice: number): number | null {
    const t = this.openTrade(i);
    if (t == null || !isFiniteNumber(markPrice)) return null;
    return this.markProfit(t, markPrice);
  }

  avgTrade(): number {
    const n = this.closedTrades.length;
    return n === 0 ? 0 : (this.grossprofit - this.grossloss) / n;
  }

  avgWinningTrade(): number {
    return this.wintrades === 0 ? 0 : this.grossprofit / this.wintrades;
  }

  avgLosingTrade(): number {
    return this.losstrades === 0 ? 0 : this.grossloss / this.losstrades;
  }

  /** Update per-open-trade max_runup / max_drawdown vs mark (high/low if finite, else close). */
  markOpenTrades(high: number, low: number, close: number): void {
    if (this.openTrades.length === 0) return;
    for (const t of this.openTrades) {
      const fav = t.direction === "long"
        ? (isFiniteNumber(high) ? high : close)
        : (isFiniteNumber(low) ? low : close);
      const adv = t.direction === "long"
        ? (isFiniteNumber(low) ? low : close)
        : (isFiniteNumber(high) ? high : close);
      if (isFiniteNumber(fav)) {
        const runup = this.markProfit(t, fav);
        if (runup > 0) t.max_runup = Math.max(t.max_runup ?? 0, runup);
      }
      if (isFiniteNumber(adv)) {
        const dd = this.markProfit(t, adv);
        if (dd < 0) t.max_drawdown = Math.max(t.max_drawdown ?? 0, -dd);
      }
    }
  }

  configure(settings: BrokerSettings): void {
    if (isFiniteNumber(settings.commission)) this.commission = settings.commission;
    if (isFiniteNumber(settings.slippage)) this.slippage = settings.slippage;
    if (settings.pyramiding !== undefined) {
      const pyr = normalizePyramiding(settings.pyramiding);
      if (pyr !== undefined || settings.pyramiding == null) this.pyramiding = pyr;
    }
  }

  entry(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty?: number | null,
  ): void {
    const event: StrategyEvent = {
      type: "entry",
      id: String(id ?? ""),
      direction: mapDirection(direction),
      bar: isFiniteNumber(bar) ? bar : 0,
    };
    if (qty !== undefined) event.qty = qty;
    this.events.push(event);
  }

  close(bar: number, id: string): void {
    this.events.push({
      type: "close",
      id: String(id ?? ""),
      bar: isFiniteNumber(bar) ? bar : 0,
    });
  }

  exit(bar: number, id: string): void {
    this.events.push({
      type: "exit",
      id: String(id ?? ""),
      bar: isFiniteNumber(bar) ? bar : 0,
    });
  }

  cancel(bar: number, id: string): void {
    this.dropPending(String(id ?? ""));
    this.events.push({
      type: "cancel",
      id: String(id ?? ""),
      bar: isFiniteNumber(bar) ? bar : 0,
    });
  }

  /**
   * Always emit `close_all`. When `mark` is finite and a position is open,
   * flatten at that price first (fills + realized PnL) without a `close` event.
   * Also drops the pending book.
   */
  closeAll(bar: number, mark?: number): void {
    const b = isFiniteNumber(bar) ? bar : 0;
    this.dropPending();
    if (isFiniteNumber(mark) && this.position.qty !== 0) {
      this.flattenAt(b, "close_all", mark);
    }
    this.events.push({ type: "close_all", id: "", bar: b });
  }

  cancelAll(bar: number): void {
    this.dropPending();
    this.events.push({
      type: "cancel_all",
      id: "",
      bar: isFiniteNumber(bar) ? bar : 0,
    });
  }

  /**
   * Place an entry. No limit/stop → market via fillEntry (needs `opts.price`).
   * Otherwise records a pending order. Always emits an `entry` event
   * (market path emits it through fillEntry).
   */
  placeEntry(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty: number,
    opts?: PlaceEntryOpts,
  ): void {
    const limit = optLevel(opts?.limit);
    const stop = optLevel(opts?.stop);
    if (limit == null && stop == null) {
      if (isFiniteNumber(opts?.price)) this.fillEntry(bar, id, direction, qty, opts.price, opts);
      else this.entry(bar, id, direction, qty);
      return;
    }
    const dir = mapDirection(direction);
    const absQty = isFiniteNumber(qty) ? Math.abs(qty) : Number.NaN;
    const b = isFiniteNumber(bar) ? bar : 0;
    const oid = String(id ?? "");
    this.entry(b, oid, dir, isFiniteNumber(absQty) ? absQty : qty);
    if (!isFiniteNumber(absQty) || absQty === 0) return;
    this.upsertPending({ id: oid, direction: dir, qty: absQty, limit, stop, bar: b });
  }

  /** Alias of {@link placeEntry} (`strategy.order`). */
  order(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty: number,
    opts?: PlaceEntryOpts,
  ): void {
    this.placeEntry(bar, id, direction, qty, opts);
  }

  /**
   * Fill pending limit/stop/stop-limit orders against this bar's OHLC.
   * Hosts call this once per bar BEFORE the script body (Python interpret).
   * Returns ids that filled this bar.
   */
  processPending(bar: number, ohlc: BarOhlc): string[] {
    if (this.pending.length === 0 || ohlc == null) return [];
    const hasAny =
      isFiniteNumber(ohlc.open) ||
      isFiniteNumber(ohlc.high) ||
      isFiniteNumber(ohlc.low) ||
      isFiniteNumber(ohlc.close);
    if (!hasAny) return [];
    const b = isFiniteNumber(bar) ? bar : 0;
    const close = isFiniteNumber(ohlc.close)
      ? ohlc.close
      : isFiniteNumber(ohlc.open)
        ? ohlc.open
        : (isFiniteNumber(ohlc.high) ? ohlc.high : ohlc.low as number);
    const open = isFiniteNumber(ohlc.open) ? ohlc.open : close;
    const high = isFiniteNumber(ohlc.high) ? ohlc.high : Math.max(open, close);
    const low = isFiniteNumber(ohlc.low) ? ohlc.low : Math.min(open, close);
    const filled: string[] = [];
    for (const order of this.pending.slice()) {
      if (!this.pending.some((p) => p.id === order.id)) continue;
      const px = triggerPrice(order, open, high, low);
      if (px == null) continue;
      this.dropPending(order.id);
      const applied = this.applyEntryFill(b, order.id, order.direction, order.qty, px, false);
      if (applied) {
        this.events.push({
          type: "fill",
          id: order.id,
          direction: order.direction,
          qty: order.qty,
          bar: b,
        });
        filled.push(order.id);
      }
    }
    return filled;
  }

  /** Market entry at `price`. Flat/same-dir adds qty; opposite closes then reverses. */
  fillEntry(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty: number,
    price: number,
    opts?: Pick<PlaceEntryOpts, "comment" | "time">,
  ): void {
    this.applyEntryFill(bar, id, direction, qty, price, true, opts);
  }

  /** Flatten at `price` and record a close event. */
  fillClose(bar: number, id: string, price: number): void {
    this.ensureSanePosition();
    const b = isFiniteNumber(bar) ? bar : 0;
    const oid = String(id ?? "");
    if (this.position.qty !== 0) {
      if (!isFiniteNumber(price)) return;
      this.flattenAt(b, oid, price);
    }
    this.close(b, oid);
  }

  private applyEntryFill(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty: number,
    price: number,
    emitEntry: boolean,
    opts?: Pick<PlaceEntryOpts, "comment" | "time">,
  ): boolean {
    this.ensureSanePosition();
    if (!isFiniteNumber(qty) || qty === 0 || !isFiniteNumber(price)) return false;
    const absQty = Math.abs(qty);
    if (!isFiniteNumber(absQty) || absQty === 0) return false;
    const dir = mapDirection(direction);
    const signed = dir === "long" ? absQty : -absQty;
    const b = isFiniteNumber(bar) ? bar : 0;
    const oid = String(id ?? "");

    if (this.position.qty !== 0 && Math.sign(this.position.qty) !== Math.sign(signed)) {
      if (!this.flattenAt(b, oid, price)) return false;
      this.close(b, oid);
    } else if (
      this.position.qty !== 0 &&
      this.pyramiding !== undefined &&
      this.sameDirAdds >= this.pyramiding
    ) {
      return false;
    }

    // After a reverse flatten the book is flat — this is a fresh first entry.
    if (this.position.qty !== 0) this.sameDirAdds++;
    else this.sameDirAdds = 0;
    this.addPosition(b, oid, signed, price, opts);
    if (emitEntry) this.entry(b, oid, dir, absQty);
    return true;
  }

  private upsertPending(order: PendingOrder): void {
    const i = this.pending.findIndex((p) => p.id === order.id);
    if (i >= 0) this.pending[i] = order;
    else this.pending.push(order);
  }

  private dropPending(id?: string): void {
    if (id === undefined) {
      this.pending.length = 0;
      return;
    }
    for (let i = this.pending.length - 1; i >= 0; i--) {
      if (this.pending[i]!.id === id) this.pending.splice(i, 1);
    }
  }

  private addPosition(
    bar: number,
    id: string,
    signedQty: number,
    price: number,
    opts?: Pick<PlaceEntryOpts, "comment" | "time">,
  ): void {
    if (!isFiniteNumber(signedQty) || signedQty === 0 || !isFiniteNumber(price)) return;
    const oldQty = this.position.qty;
    const oldAbs = Math.abs(oldQty);
    const addAbs = Math.abs(signedQty);
    const side = signedQty > 0 ? "buy" : "sell";
    const px = this.recordFill(bar, id, side, addAbs, price);
    if (!isFiniteNumber(px)) return;
    const fee = this.fillFee(addAbs, px);
    const oldAvg = this.position.avgPrice;
    this.position.avgPrice =
      oldAbs === 0 || !isFiniteNumber(oldAvg)
        ? px
        : (oldAvg * oldAbs + px * addAbs) / (oldAbs + addAbs);
    const nextQty = oldQty + signedQty;
    // Guard against −0 and any non-finite leftover from a bad add.
    this.position.qty = isFiniteNumber(nextQty) && nextQty !== 0 ? nextQty : 0;
    if (this.position.qty === 0) {
      this.position.avgPrice = null;
      return;
    }
    const dir: StrategyDirection = this.position.qty > 0 ? "long" : "short";
    const comment = opts?.comment != null ? String(opts.comment) : undefined;
    const entryTime = isFiniteNumber(opts?.time) ? opts.time : undefined;
    if (oldAbs === 0 || this.openTrades.length === 0) {
      this.openTrades.length = 0;
      const trade: Trade = {
        id,
        direction: dir,
        qty: Math.abs(this.position.qty),
        entryBar: bar,
        entryPrice: this.position.avgPrice ?? px,
        commission: fee,
      };
      if (entryTime !== undefined) trade.entryTime = entryTime;
      if (comment !== undefined) trade.comment = comment;
      this.openTrades.push(trade);
      return;
    }
    const t = this.openTrades[0]!;
    t.qty = Math.abs(this.position.qty);
    t.entryPrice = this.position.avgPrice ?? px;
    t.commission += fee;
  }

  /**
   * Flatten the open position at `price`. Returns false when there is nothing
   * to close or the fill cannot be recorded without corrupting state.
   */
  private flattenAt(bar: number, id: string, price: number): boolean {
    const q = this.position.qty;
    if (q === 0 || !isFiniteNumber(q) || !isFiniteNumber(price)) return false;
    const side = q > 0 ? "sell" : "buy";
    const absQ = Math.abs(q);
    const px = this.recordFill(bar, id, side, absQ, price);
    if (!isFiniteNumber(px)) return false;
    const avg = this.position.avgPrice;
    const basis = isFiniteNumber(avg) ? avg : px;
    const pnl = q * (px - basis);
    if (isFiniteNumber(pnl)) this.realizedPnl += pnl;
    this.closeOpenTrades(bar, id, px, absQ, q > 0 ? "long" : "short", basis);
    this.position.qty = 0;
    this.position.avgPrice = null;
    this.sameDirAdds = 0;
    this.closedCount += 1;
    return true;
  }

  private ensureSanePosition(): void {
    const q = this.position.qty;
    const avg = this.position.avgPrice;
    if (!isFiniteNumber(q) || (q !== 0 && !isFiniteNumber(avg))) {
      this.position.qty = 0;
      this.position.avgPrice = null;
      this.sameDirAdds = 0;
      this.openTrades.length = 0;
    }
  }

  private closeOpenTrades(
    bar: number,
    id: string,
    exitPrice: number,
    absQ: number,
    direction: StrategyDirection,
    basis: number,
  ): void {
    if (this.openTrades.length === 0 && absQ > 0) {
      this.openTrades.push({
        id,
        direction,
        qty: absQ,
        entryBar: bar,
        entryPrice: basis,
        commission: 0,
      });
    }
    const totalQty = this.openTrades.reduce((s, t) => s + t.qty, 0);
    const exitFeeTotal = this.fillFee(absQ, exitPrice);
    for (const ot of this.openTrades) {
      const share = totalQty > 0 ? ot.qty / totalQty : 1;
      const exitComm = exitFeeTotal * share;
      const profit = this.markProfit(ot, exitPrice) - exitComm;
      const closed: Trade = {
        id: ot.id,
        direction: ot.direction,
        qty: ot.qty,
        entryBar: ot.entryBar,
        entryPrice: ot.entryPrice,
        exitBar: bar,
        exitPrice,
        profit,
        commission: ot.commission + exitComm,
      };
      if (ot.entryTime !== undefined) closed.entryTime = ot.entryTime;
      if (ot.comment !== undefined) closed.comment = ot.comment;
      if (ot.max_runup !== undefined) closed.max_runup = ot.max_runup;
      if (ot.max_drawdown !== undefined) closed.max_drawdown = ot.max_drawdown;
      this.closedTrades.push(closed);
      this.noteClosedProfit(profit);
    }
    this.openTrades.length = 0;
  }

  private noteClosedProfit(profit: number): void {
    if (!isFiniteNumber(profit)) return;
    if (profit > 0) {
      this.grossprofit += profit;
      this.wintrades += 1;
    } else if (profit < 0) {
      this.grossloss += -profit;
      this.losstrades += 1;
    } else {
      this.eventrades += 1;
    }
  }

  private markProfit(t: Trade, mark: number): number {
    const signed = t.direction === "long" ? 1 : -1;
    return signed * (mark - t.entryPrice) * t.qty - t.commission;
  }

  private fillFee(qty: number, price: number): number {
    const rate = isFiniteNumber(this.commission) ? this.commission : 0;
    const fee = Math.abs(qty) * Math.abs(price) * rate;
    return isFiniteNumber(fee) ? fee : 0;
  }

  private pickTrade(list: Trade[], i: unknown): Trade | null {
    if (!isFiniteNumber(i) || !Number.isInteger(i) || i < 0 || i >= list.length) return null;
    return list[i] ?? null;
  }

  /** Long/buy pays +slip; short/sell receives −slip. Records actual fill price. */
  private recordFill(
    bar: number,
    id: string,
    side: "buy" | "sell",
    qty: number,
    price: number,
  ): number {
    const slip = isFiniteNumber(this.slippage) ? this.slippage : 0;
    const px = side === "buy" ? price + slip : price - slip;
    if (!isFiniteNumber(px) || !isFiniteNumber(qty) || qty === 0) return Number.NaN;
    this.fills.push({ bar, id, side, qty, price: px });
    const rate = isFiniteNumber(this.commission) ? this.commission : 0;
    const fee = Math.abs(qty) * Math.abs(px) * rate;
    if (isFiniteNumber(fee)) this.commissionPaid += fee;
    return px;
  }
}
