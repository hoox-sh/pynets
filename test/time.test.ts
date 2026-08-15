/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  parseTimestampString,
  timeTradingDay,
  timestamp,
  timestampFromComponents,
  utcPartsFromMs,
  weekOfYear,
} from "../src/runtime/time.ts";

describe("utcPartsFromMs", () => {
  test("Unix epoch is Thursday → Pine dayofweek 5", () => {
    const p = utcPartsFromMs(0);
    expect(p.year).toBe(1970);
    expect(p.month).toBe(1);
    expect(p.dayofmonth).toBe(1);
    expect(p.hour).toBe(0);
    expect(p.minute).toBe(0);
    expect(p.second).toBe(0);
    expect(p.dayofweek).toBe(5);
  });

  test("known UTC instant", () => {
    const p = utcPartsFromMs(1_700_000_000_000);
    expect(p.year).toBe(2023);
    expect(p.month).toBe(11);
    expect(p.dayofmonth).toBe(14);
  });
});

describe("timestamp", () => {
  test("year, month, day as UTC midnight", () => {
    expect(timestamp(2020, 1, 1)).toBe(Date.UTC(2020, 0, 1));
    expect(timestamp(2020, 1, 1)).toBe(1_577_836_800_000);
  });

  test("month 0 is January (Python _normalize_year_month)", () => {
    expect(timestamp(2020, 0, 1)).toBe(timestamp(2020, 1, 1));
    expect(timestamp(2020, 0, 1)).toBe(1_577_836_800_000);
  });

  test("day 0 rolls back one day", () => {
    expect(timestamp(2020, 1, 0)).toBe(Date.UTC(2019, 11, 31));
    expect(timestamp(2020, 1, 0)).toBe(1_577_750_400_000);
  });

  test("month 13 / day 32 / hour 24 overflow", () => {
    expect(timestamp(2020, 13, 1)).toBe(1_609_459_200_000);
    expect(timestamp(2020, 1, 32)).toBe(1_580_515_200_000);
    expect(timestamp(2020, 1, 1, 24)).toBe(1_577_923_200_000);
  });

  test("date string Dec 01 2021 23:59:59", () => {
    expect(timestamp("Dec 01 2021 23:59:59")).toBe(1_638_403_199_000);
  });

  test("date string with GMT+10 offset", () => {
    expect(timestamp("01 Jan 2000 00:00:00 GMT+10")).toBe(946_648_800_000);
  });

  test("ISO-like date string", () => {
    expect(timestamp("2021-12-01 23:59:59")).toBe(1_638_403_199_000);
  });

  test("timezone-first UTC-5", () => {
    expect(timestamp("UTC-5", 2019, 8, 5, 12, 0)).toBe(1_565_024_400_000);
  });

  test("timezone-first GMT / UTC are offset 0", () => {
    expect(timestamp("GMT", 2019, 8, 5, 12, 0)).toBe(1_565_006_400_000);
    expect(timestamp("UTC", 2019, 8, 5, 12, 0)).toBe(1_565_006_400_000);
  });

  test("unknown timezone is UTC", () => {
    expect(timestamp("NotAZone", 2020, 1, 1)).toBe(timestamp(2020, 1, 1));
  });

  test("na / non-finite → null", () => {
    expect(timestamp(Number.NaN, 1, 1)).toBeNull();
    expect(timestamp(2020, Number.POSITIVE_INFINITY, 1)).toBeNull();
    expect(timestamp(2020, 1, Number.NaN)).toBeNull();
    expect(timestampFromComponents(null, 1, 1)).toBeNull();
    expect(timestampFromComponents(2020, 1, undefined)).toBeNull();
    expect(parseTimestampString("")).toBeNull();
    expect(parseTimestampString("not a date")).toBeNull();
    expect(weekOfYear(Number.NaN)).toBeNull();
    expect(timeTradingDay(Number.NaN)).toBeNull();
    expect(timeTradingDay(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("weekOfYear", () => {
  test("ISO week matches Python isocalendar", () => {
    expect(weekOfYear(Date.UTC(2020, 0, 1))).toBe(1);
    expect(weekOfYear(Date.UTC(2020, 11, 31))).toBe(53);
    expect(weekOfYear(Date.UTC(2021, 0, 1))).toBe(53);
    expect(weekOfYear(Date.UTC(2021, 0, 4))).toBe(1);
  });
});

describe("timeTradingDay", () => {
  test("floors to UTC midnight", () => {
    expect(timeTradingDay(timestamp(2020, 1, 1, 12, 34, 56)!)).toBe(1_577_836_800_000);
    expect(timeTradingDay(1_700_000_000_000)).toBe(1_699_920_000_000);
    expect(timeTradingDay(Date.UTC(2020, 0, 1))).toBe(Date.UTC(2020, 0, 1));
  });
});
