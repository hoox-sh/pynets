/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Strategy event bus plus a tiny market-fill model (not a broker).
 * entry/close/exit stay event-only. fillEntry/fillClose also update a
 * single signed position and fills. Optional commission, slippage, pyramiding.
 */

export type StrategyDirection = "long" | "short";

export interface BrokerSettings {
  commission?: number; // fraction of notional, default 0 (0.001 = 0.1%)
  slippage?: number; // price units added against the trade, default 0
  pyramiding?: number; // max same-direction adds, default unlimited (0 = one-and-done extra)
}

export interface StrategyEvent {
  type: "entry" | "close" | "exit" | "cancel" | "close_all" | "cancel_all";
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
  commissionPaid = 0;
  realizedPnl = 0;
  closedCount = 0;
  initialCapital = 1_000_000;

  private commission: number;
  private slippage: number;
  private pyramiding: number | undefined;
  private sameDirAdds = 0;

  constructor(settings?: BrokerSettings) {
    this.commission = settings?.commission ?? 0;
    this.slippage = settings?.slippage ?? 0;
    this.pyramiding = settings?.pyramiding;
  }

  /** Mark-to-market equity: initial + realized − commission + open PnL. */
  equity(mark: number): number {
    const q = this.position.qty;
    const avg = this.position.avgPrice;
    const open = q === 0 || avg == null ? 0 : q * (mark - avg);
    return this.initialCapital + this.realizedPnl - this.commissionPaid + open;
  }

  configure(settings: BrokerSettings): void {
    if (settings.commission != null) this.commission = settings.commission;
    if (settings.slippage != null) this.slippage = settings.slippage;
    if (settings.pyramiding != null) this.pyramiding = settings.pyramiding;
  }

  entry(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty?: number | null,
  ): void {
    const event: StrategyEvent = {
      type: "entry",
      id,
      direction: mapDirection(direction),
      bar,
    };
    if (qty !== undefined) event.qty = qty;
    this.events.push(event);
  }

  close(bar: number, id: string): void {
    this.events.push({ type: "close", id, bar });
  }

  exit(bar: number, id: string): void {
    this.events.push({ type: "exit", id, bar });
  }

  cancel(bar: number, id: string): void {
    this.events.push({ type: "cancel", id, bar });
  }

  closeAll(bar: number, mark?: number): void {
    if (mark != null && this.position.qty !== 0) this.fillClose(bar, "close_all", mark);
    else this.events.push({ type: "close_all", id: "", bar });
  }

  cancelAll(bar: number): void {
    this.events.push({ type: "cancel_all", id: "", bar });
  }

  /** Market entry at `price`. Flat/same-dir adds qty; opposite closes then reverses. */
  fillEntry(
    bar: number,
    id: string,
    direction: StrategyDirection | number | string,
    qty: number,
    price: number,
  ): void {
    const dir = mapDirection(direction);
    const absQty = Math.abs(qty);
    const signed = dir === "long" ? absQty : -absQty;
    if (this.position.qty !== 0 && Math.sign(this.position.qty) !== Math.sign(signed)) {
      this.fillClose(bar, id, price);
    } else if (
      this.position.qty !== 0 &&
      this.pyramiding !== undefined &&
      this.sameDirAdds >= this.pyramiding
    ) {
      return;
    }
    if (this.position.qty !== 0) this.sameDirAdds++;
    else this.sameDirAdds = 0;
    this.addPosition(bar, id, signed, price);
    this.entry(bar, id, dir, absQty);
  }

  /** Flatten at `price` and record a close event. */
  fillClose(bar: number, id: string, price: number): void {
    const q = this.position.qty;
    if (q !== 0) {
      const side = q > 0 ? "sell" : "buy";
      const absQ = Math.abs(q);
      const px = this.recordFill(bar, id, side, absQ, price);
      const avg = this.position.avgPrice ?? px;
      this.realizedPnl += q > 0 ? (px - avg) * absQ : (avg - px) * absQ;
      this.position.qty = 0;
      this.position.avgPrice = null;
      this.sameDirAdds = 0;
      this.closedCount += 1;
    }
    this.close(bar, id);
  }

  private addPosition(bar: number, id: string, signedQty: number, price: number): void {
    if (signedQty === 0) return;
    const oldQty = this.position.qty;
    const oldAbs = Math.abs(oldQty);
    const addAbs = Math.abs(signedQty);
    const side = signedQty > 0 ? "buy" : "sell";
    const px = this.recordFill(bar, id, side, addAbs, price);
    this.position.avgPrice =
      oldAbs === 0 ? px : ((this.position.avgPrice ?? px) * oldAbs + px * addAbs) / (oldAbs + addAbs);
    this.position.qty = oldQty + signedQty;
  }

  /** Long/buy pays +slip; short/sell receives −slip. Records actual fill price. */
  private recordFill(
    bar: number,
    id: string,
    side: "buy" | "sell",
    qty: number,
    price: number,
  ): number {
    const px = side === "buy" ? price + this.slippage : price - this.slippage;
    this.fills.push({ bar, id, side, qty, price: px });
    this.commissionPaid += Math.abs(qty) * Math.abs(px) * this.commission;
    return px;
  }
}
