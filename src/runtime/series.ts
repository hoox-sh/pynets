/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine series lookback polarity matches Python `PineSeries` / TradingView:
 *   get(0) = current bar, get(1) = previous bar, OOB / negative → na (null).
 */
export const NA = null;
export type Na = null;
export type Cell = number | Na;

export class PineSeries {
  private readonly data: Cell[] = [];

  push(value: Cell): void {
    this.data.push(value);
  }

  setCurrent(value: Cell): void {
    if (this.data.length === 0) this.data.push(value);
    else this.data[this.data.length - 1] = value;
  }

  get current(): Cell {
    return this.data.length === 0 ? NA : this.data[this.data.length - 1]!;
  }

  /** `offset` bars ago. `0` is current; negative / non-finite / OOB is `na`. */
  get(offset: number): Cell {
    if (typeof offset !== "number" || !Number.isFinite(offset) || offset < 0) return NA;
    const n = this.data.length;
    if (n === 0) return NA;
    const idx = n - 1 - Math.trunc(offset);
    if (idx < 0 || idx >= n) return NA;
    const v = this.data[idx];
    if (v == null) return NA;
    if (typeof v === "number" && !Number.isFinite(v)) return NA;
    return v;
  }

  get length(): number {
    return this.data.length;
  }
}
