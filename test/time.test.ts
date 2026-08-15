/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { utcPartsFromMs } from "../src/runtime/time.ts";

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
