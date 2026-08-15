/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * UTC calendar parts and Pine `timestamp` / `weekofyear` / `time_tradingday`.
 * Python `utility.py` / `time_parts.utc_parts_from_ms` SoT. `null` is `na`.
 * Pine `dayofweek`: 1=Sunday … 7=Saturday.
 */
export interface UtcParts {
  year: number;
  month: number;
  dayofmonth: number;
  hour: number;
  minute: number;
  second: number;
  dayofweek: number;
}

const MIN_T = -62_167_219_200; // ~year 0001
const MAX_T = 253_402_300_799; // ~year 9999

/** Unix-ms → UTC parts. Matches Python `utc_parts_from_ms`. */
export function utcPartsFromMs(ms: number): UtcParts {
  let t = Number.isFinite(ms) ? Math.trunc(ms / 1000) : 0;
  if (t < MIN_T) t = MIN_T;
  else if (t > MAX_T) t = MAX_T;

  let days = Math.trunc(t / 86_400);
  let rem = t % 86_400;
  if (rem < 0) {
    days -= 1;
    rem += 86_400;
  }
  const hour = Math.trunc(rem / 3600);
  rem %= 3600;
  const minute = Math.trunc(rem / 60);
  const second = rem % 60;

  // Epoch day 0 (1970-01-01) Thursday. Python weekday Mon=0.
  const weekday = ((days + 3) % 7 + 7) % 7; // 0=Mon … 6=Sun
  const dayofweek = ((weekday + 1) % 7) + 1; // Pine 1=Sun … 7=Sat

  // Civil date from days since Unix epoch (Howard Hinnant).
  const z = days + 719_468;
  const era = Math.trunc((z >= 0 ? z : z - 146_096) / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.trunc((doe - Math.trunc(doe / 1460) + Math.trunc(doe / 36_524) - Math.trunc(doe / 146_096)) / 365);
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.trunc(yoe / 4) - Math.trunc(yoe / 100));
  const mp = Math.trunc((5 * doy + 2) / 153);
  const day = doy - Math.trunc((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = y + (month <= 2 ? 1 : 0);

  return {
    year,
    month,
    dayofmonth: day,
    hour,
    minute,
    second,
    dayofweek,
  };
}

const MS_PER_DAY = 86_400_000;
const SEC_PER_DAY = 86_400;

const MONTH_INDEX: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function floorDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

function floorMod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

/** Days since Unix epoch for civil y-m-d (Howard Hinnant). Valid dates only. */
function daysFromCivil(y: number, m: number, d: number): number {
  y -= m <= 2 ? 1 : 0;
  const era = floorDiv(y >= 0 ? y : y - 399, 400);
  const yoe = y - era * 400;
  const doy = floorDiv(153 * (m + (m > 2 ? -3 : 9)) + 2, 5) + d - 1;
  const doe = yoe * 365 + floorDiv(yoe, 4) - floorDiv(yoe, 100) + doy;
  return era * 146_097 + doe - 719_468;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

function utcMsFromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): number {
  return (daysFromCivil(year, month, day) * SEC_PER_DAY + hour * 3600 + minute * 60 + second) * 1000;
}

/**
 * Month 0 → January of the same year. 13+ / negatives roll years.
 * Year clamped to 1..9999. Floats already truncated by the caller.
 */
function normalizeYearMonth(year: number, month: number): [number, number] {
  let y = year;
  let m = month;
  if (m === 0) {
    m = 1;
  } else if (m < 1 || m > 12) {
    const m0 = m - 1;
    y += floorDiv(m0, 12);
    m = floorMod(m0, 12) + 1;
  }
  if (y < 1) y = 1;
  else if (y > 9999) y = 9999;
  return [y, m];
}

function requiredTrunc(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : null;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

function optionalTrunc(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : fallback;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return fallback;
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  }
  return fallback;
}

function offsetFromHm(sign: string, hours: number, mins: number): number {
  const mult = sign === "+" ? 1 : -1;
  return mult * (hours * 60 + mins);
}

function offsetFromDigits(sign: string, digits: string): number | null {
  if (!digits || digits.length > 4 || !/^\d+$/.test(digits)) return null;
  if (digits.length <= 2) return offsetFromHm(sign, Number(digits), 0);
  const padded = digits.padStart(4, "0");
  return offsetFromHm(sign, Number(padded.slice(0, 2)), Number(padded.slice(2)));
}

/** Pine `UTC` / `GMT` / `UTC-5` / `GMT+10` / `UTC+5:30`. Unknown → 0 (UTC). */
function parseTimezoneOffsetMinutes(tzSpec: string): number {
  const z = tzSpec.trim();
  if (!z || /^(?:syminfo\.timezone|UTC|utc|Etc\/UTC|GMT|gmt)$/.test(z)) return 0;
  const m = /^(?:(?:UTC|GMT)\s*)?([+-])\s*(\d{1,2})(?::(\d{2})|(\d{2}))?$/i.exec(z);
  if (!m) return 0;
  return offsetFromHm(m[1]!, Number(m[2]), Number(m[3] || m[4] || 0));
}

function normalizeTimestampText(s: string): string {
  let out = s.trim().replace(/\s+/g, " ");
  out = out.replace(/\b0000-/, "0001-");
  out = out.replace(/(\d{4}-\d{2}-\d{2}):(\d{1,2}:\d{2})/, "$1 $2");
  out = out.replace(/(\d)([A-Za-z]{3,})/g, "$1 $2");
  out = out.replace(/\bSept\b/gi, "Sep");
  out = out.replace(/\bJanv\b/gi, "Jan");
  return out;
}

function stripTimezone(s: string): { date: string; offsetMin: number } {
  let offsetMin = 0;
  const lead = /^(?:UTC|GMT)\s+/i.exec(s);
  if (lead) s = s.slice(lead[0].length).trim();

  let m = /\s*(?:GMT|UTC)\s*([+-])(\d{1,2})(?::?(\d{2}))?\s*$/i.exec(s);
  if (m && m.index !== undefined) {
    offsetMin = offsetFromHm(m[1]!, Number(m[2]), m[3] ? Number(m[3]) : 0);
    return { date: s.slice(0, m.index).trim(), offsetMin };
  }

  m = /Z\s*$/i.exec(s);
  if (m && s.length > 1 && m.index !== undefined) {
    return { date: s.slice(0, m.index).trim(), offsetMin };
  }

  m = /\s+([+-])(\d{1,2}):(\d{2})\s*$/.exec(s);
  if (m && m.index !== undefined) {
    offsetMin = offsetFromHm(m[1]!, Number(m[2]), Number(m[3]));
    return { date: s.slice(0, m.index).trim(), offsetMin };
  }

  m = /\s+([+-])(\d{1,4})\s*$/.exec(s);
  if (m && m.index !== undefined) {
    const off = offsetFromDigits(m[1]!, m[2]!);
    if (off != null) return { date: s.slice(0, m.index).trim(), offsetMin: off };
  }

  m = /(?<=\d)([+-])(\d{2}):(\d{2})\s*$/.exec(s);
  if (m && m.index !== undefined) {
    offsetMin = offsetFromHm(m[1]!, Number(m[2]), Number(m[3]));
    return { date: s.slice(0, m.index).trim(), offsetMin };
  }

  m = /(?<=\d)([+-])(\d{4})\s*$/.exec(s);
  if (m && m.index !== undefined) {
    const off = offsetFromDigits(m[1]!, m[2]!);
    if (off != null) return { date: s.slice(0, m.index).trim(), offsetMin: off };
  }

  m = /(?<=\d)([+-])(\d{2})\s*$/.exec(s);
  if (m && m.index !== undefined) {
    const head = s.slice(0, m.index);
    if (/\d{1,2}:\d{2}$/.test(head) || head.endsWith("T") || /T\d/.test(head)) {
      const off = offsetFromDigits(m[1]!, m[2]!);
      if (off != null) return { date: head.trim(), offsetMin: off };
    }
  }

  return { date: s.replace(/\s+(?:GMT|UTC)\s*$/i, "").trim(), offsetMin };
}

function civilMsStrict(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): number | null {
  if (year < 1 || year > 9999) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;
  return utcMsFromYmdHms(year, month, day, hour, minute, second);
}

function parseNaiveDateTime(s: string): number | null {
  let m = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    const month = MONTH_INDEX[m[1]!.toLowerCase()];
    if (month == null) return null;
    return civilMsStrict(Number(m[3]), month, Number(m[2]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0));
  }

  m = /^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    const month = MONTH_INDEX[m[2]!.toLowerCase()];
    if (month == null) return null;
    return civilMsStrict(Number(m[3]), month, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0));
  }

  m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    return civilMsStrict(
      Number(m[1]),
      Number(m[2]),
      Number(m[3]),
      Number(m[4] ?? 0),
      Number(m[5] ?? 0),
      Number(m[6] ?? 0),
    );
  }

  m = /^(\d{4})\s+(\d{1,2})\s+(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    return civilMsStrict(
      Number(m[1]),
      Number(m[2]),
      Number(m[3]),
      Number(m[4] ?? 0),
      Number(m[5] ?? 0),
      Number(m[6] ?? 0),
    );
  }

  return null;
}

function tryTimestampFormats(s: string, offsetMin: number): number | null {
  const local = parseNaiveDateTime(s);
  if (local == null) return null;
  return local - offsetMin * 60_000;
}

/** Python `date.toordinal()` (0001-01-01 = 1). */
function ymdToOrd(year: number, month: number, day: number): number {
  return daysFromCivil(year, month, day) + 719_163;
}

function isoWeek1Monday(year: number): number {
  const firstday = ymdToOrd(year, 1, 1);
  const firstweekday = floorMod(firstday + 6, 7);
  let week1monday = firstday - firstweekday;
  if (firstweekday > 3) week1monday += 7;
  return week1monday;
}

function isoWeekOfYear(year: number, month: number, day: number): number {
  const today = ymdToOrd(year, month, day);
  let week1monday = isoWeek1Monday(year);
  let week = floorDiv(today - week1monday, 7);
  if (week < 0) {
    week1monday = isoWeek1Monday(year - 1);
    week = floorDiv(today - week1monday, 7);
  } else if (week >= 52 && today >= isoWeek1Monday(year + 1)) {
    week = 0;
  }
  return week + 1;
}

/**
 * Unix ms for calendar components. Month 0 → January; day/hour/min/sec overflow
 * via timedelta on a day-1 midnight anchor. Optional offset: components are local.
 */
export function timestampFromComponents(
  year: number | null | undefined,
  month: number | null | undefined,
  day: number | null | undefined,
  hour: number | null | undefined = 0,
  minute: number | null | undefined = 0,
  second: number | null | undefined = 0,
  tzOffsetMinutes?: number | null,
): number | null {
  const yIn = requiredTrunc(year);
  const mIn = requiredTrunc(month);
  const dIn = requiredTrunc(day);
  if (yIn == null || mIn == null || dIn == null) return null;
  const h = optionalTrunc(hour, 0);
  const mi = optionalTrunc(minute, 0);
  const s = optionalTrunc(second, 0);
  const [y, m] = normalizeYearMonth(yIn, mIn);
  const baseSec = daysFromCivil(y, m, 1) * SEC_PER_DAY;
  let utcSec = baseSec + (dIn - 1) * SEC_PER_DAY + h * 3600 + mi * 60 + s;
  if (tzOffsetMinutes != null && Number.isFinite(tzOffsetMinutes)) {
    utcSec -= Math.trunc(tzOffsetMinutes) * 60;
  }
  return utcSec * 1000;
}

/** Parse Pine / Python date strings (month names, ISO, optional GMT/UTC offset). */
export function parseTimestampString(text: string): number | null {
  const s0 = text.trim();
  if (!s0) return null;
  const sNorm = normalizeTimestampText(s0);
  const direct = tryTimestampFormats(sNorm, 0);
  if (direct != null) return direct;
  const stripped = stripTimezone(sNorm);
  const again = normalizeTimestampText(stripped.date);
  if (!again) return null;
  return tryTimestampFormats(again, stripped.offsetMin);
}

/**
 * Pine `timestamp` dispatcher: date string, year/month/day[ /h/mi/s], or timezone-first.
 * Unknown timezone names are UTC (offset 0).
 */
export function timestamp(...args: unknown[]): number | null {
  const n = args.length;
  if (n === 0) return null;

  if (n === 1) {
    const a = args[0];
    if (typeof a === "string") return parseTimestampString(a);
    const c = requiredTrunc(a);
    return c;
  }

  if (typeof args[0] === "string") {
    const stripped = args[0].trim();
    const isNumericStr = stripped !== "" && /^[+-]?\d+(?:\.\d+)?$/.test(stripped);
    if (n >= 4 && !isNumericStr) {
      return timestampFromComponents(
        args[1] as number,
        args[2] as number,
        args[3] as number,
        n > 4 ? (args[4] as number) : 0,
        n > 5 ? (args[5] as number) : 0,
        n > 6 ? (args[6] as number) : 0,
        parseTimezoneOffsetMinutes(args[0]),
      );
    }
    if (n < 4) return parseTimestampString(args[0]);
  }

  if (n >= 3) {
    return timestampFromComponents(
      args[0] as number,
      args[1] as number,
      args[2] as number,
      n > 3 ? (args[3] as number) : 0,
      n > 4 ? (args[4] as number) : 0,
      n > 5 ? (args[5] as number) : 0,
    );
  }
  return null;
}

/** ISO week number (`datetime.isocalendar()[1]`). Non-finite → `null`. */
export function weekOfYear(ms: number): number | null {
  if (!Number.isFinite(ms)) return null;
  const p = utcPartsFromMs(ms);
  return isoWeekOfYear(p.year, p.month, p.dayofmonth);
}

/** Midnight UTC of the calendar day that contains `ms`. Non-finite → `null`. */
export function timeTradingDay(ms: number): number | null {
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / MS_PER_DAY) * MS_PER_DAY;
}
