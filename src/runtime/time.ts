/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * UTC calendar parts from bar timestamps (ms). Python `time_parts.utc_parts_from_ms` SoT.
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
