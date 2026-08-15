/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `ticker.*` symbol ids. Stringify to the symbol (Python `TickerInfo`).
 */

export class TickerId {
  heikinashi = false;
  renko = false;
  kagi = false;
  linebreak = false;
  pointfigure = false;

  constructor(
    public symbol: string,
    public session?: string,
    public adjust?: string,
  ) {}

  toString(): string {
    return this.symbol;
  }
}

export function tickerNew(symbol: string, session?: string, adjust?: string): TickerId {
  return new TickerId(symbol, session, adjust);
}

export function tickerHeikinashi(symbol: string): TickerId {
  const t = new TickerId(typeof symbol === "string" ? symbol : String(symbol));
  t.heikinashi = true;
  return t;
}

export function tickerStandard(symbol: string): TickerId {
  return new TickerId(symbol);
}

export function tickerRenko(symbol: string): TickerId {
  const t = new TickerId(symbol);
  t.renko = true;
  return t;
}
