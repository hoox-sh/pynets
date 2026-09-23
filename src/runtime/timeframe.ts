/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `timeframe.*` conversion helpers. Token parse via `timeframeMinutes`
 * (same 30-day month as `request.ts`). na / empty / unknown → null.
 */

import { timeframeMinutes } from "./request.ts";

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
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

/** Bare `D`/`W`/`M` plus `1D`/`1W`/`1M` only. Case-sensitive — `"d"` is a fixed bucket. */
const CALENDAR_TFS = new Set(["D", "W", "M", "1D", "1W", "1M"]);

const PERIOD_SHORTCUTS: Record<string, number> = {
  "1H": SECONDS_PER_HOUR,
  H: SECONDS_PER_HOUR,
  D: SECONDS_PER_DAY,
  W: SECONDS_PER_WEEK,
  MO: SECONDS_PER_MONTH,
  M: SECONDS_PER_MONTH,
  "1M": SECONDS_PER_MONTH,
  MONTH: SECONDS_PER_MONTH,
  MONTHS: SECONDS_PER_MONTH,
};

/** Python `TIMEFRAME_SUFFIXES` insertion order (`M` before `MO`). */
const PERIOD_SUFFIXES: Array<[string, number]> = [
  ["M", SECONDS_PER_MONTH],
  ["H", SECONDS_PER_HOUR],
  ["D", SECONDS_PER_DAY],
  ["W", SECONDS_PER_WEEK],
  ["MO", SECONDS_PER_MONTH],
];

const UTC_ZONE_NAMES = new Set(["UTC", "utc", "Etc/UTC", "GMT", "gmt", "syminfo.timezone"]);
const OFFSET_RE = /^(?:(?:UTC|GMT)\s*)?([+-])\s*(\d{1,2})(?::(\d{2})|(\d{2}))?$/i;

type ChangeZone = { off: number } | { iana: string };

const zoneFmt = new Map<string, Intl.DateTimeFormat | null>();

/**
 * `timeframe.change` / `timeframe_period_changed`.
 * Bar 0 is a new period. Missing time, NaN, or an unusable tf → false.
 * Calendar frames use *tz* (unset / unknown → UTC). Everything else is a
 * fixed-width UTC bucket from `timeframe_in_seconds`.
 */
export function timeframePeriodChanged(
  currTs: unknown,
  prevTs: unknown,
  timeframeStr: string | null | undefined,
  barIndex?: number | null,
  tz?: unknown,
): boolean {
  const currId = periodId(currTs, timeframeStr, tz);
  if (currId == null) return false;
  if (barIndex != null) {
    if (barIndex <= 0) return true;
    if (prevTs == null) return false;
  } else if (prevTs == null) {
    return true;
  }
  const prevId = periodId(prevTs, timeframeStr, tz);
  if (prevId == null) return false;
  return currId !== prevId;
}

function periodId(ts: unknown, timeframeStr: string | null | undefined, tz: unknown): number | null {
  if (timeframeStr == null) return null;
  const raw = String(timeframeStr).trim();
  if (raw === "") return null;
  const ms = normalizeTimeMs(ts);
  if (ms == null) return null;
  if (CALENDAR_TFS.has(raw)) return calendarId(ms, raw, tz);
  const sec = periodSeconds(raw);
  if (sec == null || sec <= 0) return null;
  return Math.floor(ms / (sec * 1000));
}

/** Python `timeframe_in_seconds` (not `timeframeMinutes` — `"15M"` is 15 months). */
function periodSeconds(raw: string): number | null {
  const tf = raw.trim().toUpperCase();
  if (tf === "") return null;
  const shortcut = PERIOD_SHORTCUTS[tf];
  if (shortcut != null) return shortcut;
  if (tf.endsWith("M") && /^\d+$/.test(tf.slice(0, -1))) {
    return Number(tf.slice(0, -1)) * SECONDS_PER_MONTH;
  }
  if (/^\d+$/.test(tf)) return Number(tf) * SECONDS_PER_MINUTE;
  for (const [suffix, mult] of PERIOD_SUFFIXES) {
    if (!tf.endsWith(suffix)) continue;
    const head = tf.slice(0, -suffix.length);
    if (head !== "" && /^\d+$/.test(head)) return Number(head) * mult;
  }
  return null;
}

function calendarId(ms: number, raw: string, tz: unknown): number | null {
  const kind = raw[raw.length - 1];
  const civil = civilInZone(ms, resolveZone(tz));
  if (civil == null) return null;
  if (kind === "D") return civil.year * 10_000 + civil.month * 100 + civil.day;
  if (kind === "W") return isoWeekId(civil.year, civil.month, civil.day);
  return civil.year * 12 + civil.month;
}

function normalizeTimeMs(ts: unknown): number | null {
  if (ts == null) return null;
  const t = typeof ts === "number" ? ts : typeof ts === "string" ? Number(ts) : NaN;
  if (!Number.isFinite(t)) return null;
  return t < 1e11 ? t * 1000 : t;
}

function resolveZone(tz: unknown): ChangeZone {
  if (typeof tz !== "string") return { off: 0 };
  const s = tz.trim();
  if (s === "" || UTC_ZONE_NAMES.has(s)) return { off: 0 };
  const m = OFFSET_RE.exec(s);
  if (m) {
    const sign = m[1] === "+" ? 1 : -1;
    const hours = Number(m[2]);
    const mins = Number(m[3] || m[4] || 0);
    const off = sign * (hours * 60 + mins) * 60_000;
    if (!Number.isFinite(off) || Math.abs(off) >= 86_400_000) return { off: 0 };
    return { off };
  }
  return { iana: s };
}

function civilInZone(ms: number, zone: ChangeZone): { year: number; month: number; day: number } | null {
  if (!Number.isFinite(ms)) return null;
  if ("off" in zone) return utcCivil(ms + zone.off);
  let fmt = zoneFmt.get(zone.iana);
  if (fmt === undefined) {
    try {
      fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: zone.iana,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      fmt = null;
    }
    zoneFmt.set(zone.iana, fmt);
  }
  if (fmt == null) return utcCivil(ms);
  let year = NaN;
  let month = NaN;
  let day = NaN;
  for (const p of fmt.formatToParts(new Date(ms))) {
    if (p.type === "year") year = Number(p.value);
    else if (p.type === "month") month = Number(p.value);
    else if (p.type === "day") day = Number(p.value);
  }
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return utcCivil(ms);
  return { year, month, day };
}

function utcCivil(ms: number): { year: number; month: number; day: number } {
  const d = new Date(ms);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** ISO year*100+week of a civil date (Monday start), matching `datetime.isocalendar`. */
function isoWeekId(year: number, month: number, day: number): number {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNr = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNr);
  const isoYear = date.getUTCFullYear();
  const diffDays = Math.round((date.getTime() - Date.UTC(isoYear, 0, 1)) / 86_400_000);
  const week = Math.ceil((diffDays + 1) / 7);
  return isoYear * 100 + week;
}
