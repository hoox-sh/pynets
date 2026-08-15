/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * `request.security` stub matching Python foreign-na policy:
 * same-symbol simple OHLCV passthrough, including HTF last-close;
 * foreign → na. HTF *value* passthrough; no invented foreign data.
 * Forward-fill of the last completed HTF bar is the host's job.
 * Interpret should call this from `evalCall`; this module is host-agnostic.
 */

export type Cell = number | null;

export interface SecurityArgs {
  symbol?: string | null;
  timeframe?: string | null;
  expression?: unknown;
}

const REQUEST_FNS = new Set([
  "request.security",
  "request.security_lower_tf",
]);

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const MINUTES_PER_WEEK = 10080;
const MINUTES_PER_MONTH = 43200; // 30-day month

/** Bare / alias tokens used as chart periods. */
const NAMED_TF_MINUTES: Record<string, number> = {
  H: MINUTES_PER_HOUR,
  "1H": MINUTES_PER_HOUR,
  D: MINUTES_PER_DAY,
  "1D": MINUTES_PER_DAY,
  W: MINUTES_PER_WEEK,
  "1W": MINUTES_PER_WEEK,
  M: MINUTES_PER_MONTH,
  MO: MINUTES_PER_MONTH,
  "1M": MINUTES_PER_MONTH,
  "1MO": MINUTES_PER_MONTH,
};

export function isRequestBuiltin(fname: string | null | undefined): boolean {
  return fname != null && REQUEST_FNS.has(fname);
}

/**
 * Pine timeframe → minutes. `"1"` `"5"` `"15"` `"60"` `"1h"` `"240"`
 * `"1D"` `"1W"` (and aliases `D`/`W`/`H`) → minutes; unknown → `null`.
 */
export function timeframeMinutes(tf: string | null | undefined): number | null {
  if (tf == null) return null;
  const raw = tf.trim();
  if (raw === "") return null;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return n > 0 ? n : null;
  }
  const u = raw.toUpperCase();
  const named = NAMED_TF_MINUTES[u];
  if (named != null) return named;
  const m = /^(\d+)(MO|H|D|W|M)$/.exec(u);
  if (m == null) return null;
  const n = Number(m[1]);
  if (!(n > 0)) return null;
  switch (m[2]) {
    case "MO":
      return n * MINUTES_PER_MONTH;
    case "H":
      return n * MINUTES_PER_HOUR;
    case "D":
      return n * MINUTES_PER_DAY;
    case "W":
      return n * MINUTES_PER_WEEK;
    case "M":
      return n; // "15M" is minutes; "1M" is monthly via NAMED_TF_MINUTES
    default:
      return null;
  }
}

/**
 * Same-symbol last-close → `sameSymbolValue` (same TF, empty TF, or HTF).
 * Foreign ticker → na. Does not invent foreign closes.
 *
 * HTF *value* passthrough: when request TF minutes > host TF minutes the
 * current host sample is returned; forward-fill of last completed HTF bar
 * is the host's job. Different TF on the same symbol is allowed.
 */
export function resolveSecurity(
  hostSymbol: string,
  hostTimeframe: string | null,
  args: SecurityArgs,
  sameSymbolValue: Cell,
): Cell {
  if (!sameSymbol(args.symbol, hostSymbol)) return null;
  const reqMin = timeframeMinutes(args.timeframe);
  const hostMin = timeframeMinutes(hostTimeframe);
  // HTF last-close (req minutes > host): passthrough; host forward-fills.
  if (reqMin != null && hostMin != null && reqMin > hostMin) {
    return sameSymbolValue;
  }
  return sameSymbolValue;
}

/**
 * Empty / missing request symbol is the chart. Compare case-insensitively after
 * stripping an exchange prefix (`NASDAQ:AAPL` ≡ `AAPL`).
 */
function sameSymbol(
  requestSymbol: string | null | undefined,
  hostSymbol: string,
): boolean {
  const req = (requestSymbol ?? "").trim();
  if (req === "") return true;
  return bareTicker(req) === bareTicker(hostSymbol);
}

function bareTicker(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  const colon = s.lastIndexOf(":");
  return colon >= 0 ? s.slice(colon + 1) : s;
}
