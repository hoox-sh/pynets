/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `timeframe.*` conversion helpers. Token parse via `timeframeMinutes`
 * (same 30-day month as `request.ts`). na / empty / unknown → null.
 */

import { timeframeMinutes } from "./request.ts";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_WEEK = 604_800;
const SECONDS_PER_MONTH = 2_592_000; // 30-day month

/** `"1"`/`"5"`/`"60"`/`"1H"`/`"D"`/`"1W"`/`"1M"` → seconds; unknown / empty / na → null. */
export function timeframeInSeconds(period: string | null): number | null {
  const minutes = timeframeMinutes(period);
  return minutes == null ? null : minutes * SECONDS_PER_MINUTE;
}

/**
 * Compact token whose duration is the closest that does not go under `seconds`.
 * `"1"`, `"5"`, `"60"`, `"D"`, `"W"`, `"M"` (and `ND` / `NW` / `NM` when n > 1).
 */
export function timeframeFromSeconds(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds <= SECONDS_PER_MINUTE) return "1";
  if (seconds <= SECONDS_PER_DAY) {
    const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
    return minutes >= SECONDS_PER_DAY / SECONDS_PER_MINUTE ? "D" : String(minutes);
  }
  if (seconds <= SECONDS_PER_WEEK) {
    const days = Math.ceil(seconds / SECONDS_PER_DAY);
    if (days >= 7) return "W";
    return days <= 1 ? "D" : `${days}D`;
  }
  if (seconds <= SECONDS_PER_MONTH) {
    const weeks = Math.ceil(seconds / SECONDS_PER_WEEK);
    if (weeks * SECONDS_PER_WEEK >= SECONDS_PER_MONTH) return "M";
    return weeks <= 1 ? "W" : `${weeks}W`;
  }
  const months = Math.ceil(seconds / SECONDS_PER_MONTH);
  return months <= 1 ? "M" : `${months}M`;
}

/** Seconds / minutes / hours — not D/W/M. Unknown / empty / na → false. */
export function timeframeIsIntraday(period: string | null): boolean {
  if (timeframeIsDaily(period) || timeframeIsWeekly(period) || timeframeIsMonthly(period)) {
    return false;
  }
  return timeframeMinutes(period) != null;
}

export function timeframeIsDaily(period: string | null): boolean {
  const p = norm(period);
  if (p == null || /^\d+$/.test(p)) return false;
  return p === "D" || p === "DAY" || p === "DAYS" || /^\d+D$/.test(p);
}

export function timeframeIsWeekly(period: string | null): boolean {
  const p = norm(period);
  if (p == null || /^\d+$/.test(p)) return false;
  return p === "W" || p === "WEEK" || p === "WEEKS" || /^\d+W$/.test(p);
}

/** `"M"` / `"1M"` / `"MO"` / `"nMO"` are monthly; `"15M"` is minutes. */
export function timeframeIsMonthly(period: string | null): boolean {
  const p = norm(period);
  if (p == null || /^\d+$/.test(p)) return false;
  return p === "M" || p === "1M" || p === "MO" || p === "MONTH" || p === "MONTHS" || /^\d+MO$/.test(p);
}

/** Pine `timeframe.isseconds` / `isinseconds` — `"1S"` / `"15S"`. */
export function timeframeIsSeconds(period: string | null): boolean {
  const p = norm(period);
  if (p == null) return false;
  return p.endsWith("S") && /^\d+$/.test(p.slice(0, -1));
}

/**
 * Pine `timeframe.isminutes`. Numeric `"1"`/`"5"` (not `"60"` hours);
 * `"15M"` minutes, not monthly `"1M"` / `"M"`.
 */
export function timeframeIsMinutes(period: string | null): boolean {
  if (timeframeIsHours(period) || timeframeIsDwm(period) || timeframeIsSeconds(period)) return false;
  const p = norm(period);
  if (p == null) return false;
  if (/^\d+$/.test(p)) return true;
  return p.endsWith("M") && /^\d+$/.test(p.slice(0, -1)) && p !== "1M";
}

/** Pine `timeframe.ishours` — `"1H"` / numeric minutes ≥ 60. */
export function timeframeIsHours(period: string | null): boolean {
  if (timeframeIsDaily(period) || timeframeIsWeekly(period) || timeframeIsMonthly(period)) return false;
  const p = norm(period);
  if (p == null) return false;
  if (p.endsWith("H")) return true;
  return /^\d+$/.test(p) && Number(p) >= 60;
}

/** Pine `timeframe.isdwm` — daily / weekly / monthly. */
export function timeframeIsDwm(period: string | null): boolean {
  return timeframeIsDaily(period) || timeframeIsWeekly(period) || timeframeIsMonthly(period);
}

/** Leading integer, or 1 when missing / empty / na. */
export function timeframeMultiplier(period: string | null): number {
  if (period == null || period === "") return 1;
  const m = period.trim().match(/^(\d+)/);
  return m ? Number(m[1]) : 1;
}

function norm(period: string | null): string | null {
  if (period == null) return null;
  const p = period.trim().toUpperCase();
  return p === "" ? null : p;
}
