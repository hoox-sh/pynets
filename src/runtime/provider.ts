/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Bar source adapters. Hosts feed OHLCV; this module does not invent
 * foreign market data. Fetch adapters implement `BarProvider`.
 */

export interface ProviderBar {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  time?: number;
}

export interface BarProvider {
  fetch(opts: {
    symbol: string;
    timeframe?: string | null;
    limit?: number;
  }): Promise<ProviderBar[]>;
}

/** In-memory bars — tests and custom feeds. */
export class MemoryProvider implements BarProvider {
  constructor(private readonly bars: ProviderBar[]) {}

  async fetch(opts: { limit?: number }): Promise<ProviderBar[]> {
    const n = opts.limit;
    if (n == null || n >= this.bars.length) return this.bars.slice();
    return this.bars.slice(-n);
  }
}
