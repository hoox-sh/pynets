/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { PineMatrix } from "../src/runtime/matrix.ts";

describe("PineMatrix construct / get / set", () => {
  test("sized constructor fills initial / na", () => {
    const empty = new PineMatrix(2, 3);
    expect(empty.rows()).toBe(2);
    expect(empty.columns()).toBe(3);
    expect(empty.get(0, 0)).toBeNull();
    expect(empty.get(1, 2)).toBeNull();
    const filled = new PineMatrix(2, 2, 5);
    expect(filled.get(0, 0)).toBe(5);
    expect(filled.get(0, 1)).toBe(5);
    expect(filled.get(1, 0)).toBe(5);
    expect(filled.get(1, 1)).toBe(5);
  });

  test("set overwrites in-range slots", () => {
    const m = new PineMatrix(2, 2, 0);
    m.set(0, 1, 99);
    m.set(1, 0, 7);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(0, 1)).toBe(99);
    expect(m.get(1, 0)).toBe(7);
    expect(m.get(1, 1)).toBe(0);
  });
});

describe("PineMatrix OOB / na-safe get", () => {
  test("get OOB and non-finite → na", () => {
    const m = new PineMatrix(2, 2, 1);
    expect(m.get(2, 0)).toBeNull();
    expect(m.get(0, 2)).toBeNull();
    expect(m.get(99, 99)).toBeNull();
    expect(m.get(-1, 0)).toBeNull();
    expect(m.get(0, -1)).toBeNull();
    expect(m.get(Number.NaN, 0)).toBeNull();
    expect(m.get(0, Infinity)).toBeNull();
  });

  test("set OOB is a no-op", () => {
    const m = new PineMatrix(1, 1, 10);
    m.set(1, 0, 99);
    m.set(0, 1, 99);
    m.set(-1, 0, 99);
    m.set(0, -1, 99);
    m.set(Number.NaN, 0, 99);
    m.set(0, Infinity, 99);
    expect(m.get(0, 0)).toBe(10);
    expect(m.rows()).toBe(1);
    expect(m.columns()).toBe(1);
  });
});

describe("PineMatrix transpose", () => {
  test("transpose swaps rows and columns", () => {
    const m = new PineMatrix(2, 3, 0);
    m.set(0, 1, 1);
    m.set(1, 2, 2);
    const t = m.transpose();
    expect(t.rows()).toBe(3);
    expect(t.columns()).toBe(2);
    expect(t.get(0, 0)).toBe(0);
    expect(t.get(1, 0)).toBe(1);
    expect(t.get(2, 1)).toBe(2);
    expect(m.rows()).toBe(2);
    expect(m.columns()).toBe(3);
    m.set(0, 1, 7);
    expect(t.get(1, 0)).toBe(1);
  });
});
