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

  /** `offset` bars ago. `0` is current; negative / OOB is `na`. */
  get(offset: number): Cell {
    if (!Number.isFinite(offset) || offset < 0) return NA;
    const idx = this.data.length - 1 - Math.trunc(offset);
    if (idx < 0 || idx >= this.data.length) return NA;
    return this.data[idx]!;
  }

  get length(): number {
    return this.data.length;
  }
}
