/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Strategy event bus plus a tiny market-fill + pending limit/stop model
 * (not a full broker). entry/close/exit stay event-only. fillEntry/fillClose
 * update a single signed position and fills. processPending is called once
 * per bar BEFORE the script body. Optional commission, slippage, pyramiding.
 * Non-finite qty/price is a no-op (never corrupts position).
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
  commissionPaid = 0;
  realizedPnl = 0;
  closedCount = 0;
  initialCapital = 1_000_000;

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
      if (isFiniteNumber(opts?.price)) this.fillEntry(bar, id, direction, qty, opts.price);
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
  ): void {
    this.applyEntryFill(bar, id, direction, qty, price, true);
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
    this.addPosition(b, oid, signed, price);
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

  private addPosition(bar: number, id: string, signedQty: number, price: number): void {
    if (!isFiniteNumber(signedQty) || signedQty === 0 || !isFiniteNumber(price)) return;
    const oldQty = this.position.qty;
    const oldAbs = Math.abs(oldQty);
    const addAbs = Math.abs(signedQty);
    const side = signedQty > 0 ? "buy" : "sell";
    const px = this.recordFill(bar, id, side, addAbs, price);
    if (!isFiniteNumber(px)) return;
    const oldAvg = this.position.avgPrice;
    this.position.avgPrice =
      oldAbs === 0 || !isFiniteNumber(oldAvg)
        ? px
        : (oldAvg * oldAbs + px * addAbs) / (oldAbs + addAbs);
    const nextQty = oldQty + signedQty;
    // Guard against −0 and any non-finite leftover from a bad add.
    this.position.qty = isFiniteNumber(nextQty) && nextQty !== 0 ? nextQty : 0;
    if (this.position.qty === 0) this.position.avgPrice = null;
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
    }
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
