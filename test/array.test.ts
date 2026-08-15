/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { PineArray } from "../src/runtime/array.ts";

describe("PineArray push / get / set / pop", () => {
  test("push then get", () => {
    const a = new PineArray();
    expect(a.size()).toBe(0);
    a.push(10);
    a.push(20);
    a.push(30);
    expect(a.size()).toBe(3);
    expect(a.get(0)).toBe(10);
    expect(a.get(1)).toBe(20);
    expect(a.get(2)).toBe(30);
    expect(a.toValues()).toEqual([10, 20, 30]);
  });

  test("set overwrites in-range slots", () => {
    const a = new PineArray();
    a.push(1);
    a.push(2);
    a.set(1, 99);
    expect(a.get(1)).toBe(99);
    expect(a.toValues()).toEqual([1, 99]);
  });

  test("pop removes last and returns it", () => {
    const a = new PineArray();
    a.push(1);
    a.push(2);
    expect(a.pop()).toBe(2);
    expect(a.size()).toBe(1);
    expect(a.get(0)).toBe(1);
    expect(a.pop()).toBe(1);
    expect(a.pop()).toBeNull();
    expect(a.size()).toBe(0);
  });
});

describe("PineArray OOB / na-safe get", () => {
  test("get OOB and non-finite → na", () => {
    const a = new PineArray();
    a.push(10);
    a.push(20);
    expect(a.get(2)).toBeNull();
    expect(a.get(99)).toBeNull();
    expect(a.get(Number.NaN)).toBeNull();
    expect(a.get(Infinity)).toBeNull();
    expect(a.get(-3)).toBeNull();
  });

  test("set OOB is a no-op", () => {
    const a = new PineArray();
    a.push(10);
    a.set(1, 99);
    a.set(-2, 99);
    a.set(Number.NaN, 99);
    a.set(Infinity, 99);
    expect(a.toValues()).toEqual([10]);
    expect(a.size()).toBe(1);
  });

  test("negative in-range indexes from the end", () => {
    const a = new PineArray();
    a.push(10);
    a.push(20);
    a.push(30);
    expect(a.get(-1)).toBe(30);
    expect(a.get(-2)).toBe(20);
    a.set(-1, 7);
    expect(a.get(2)).toBe(7);
  });
});

describe("PineArray constructor / helpers", () => {
  test("sized constructor fills initial / na", () => {
    const empty = new PineArray(3);
    expect(empty.size()).toBe(3);
    expect(empty.toValues()).toEqual([null, null, null]);
    const filled = new PineArray(2, 5);
    expect(filled.toValues()).toEqual([5, 5]);
  });

  test("unshift / shift / clear / includes", () => {
    const a = new PineArray();
    a.push(2);
    a.unshift(1);
    expect(a.toValues()).toEqual([1, 2]);
    expect(a.shift()).toBe(1);
    expect(a.includes(2)).toBe(true);
    expect(a.includes(1)).toBe(false);
    expect(a.includes(null)).toBe(false);
    a.push(null);
    expect(a.includes(null)).toBe(true);
    a.clear();
    expect(a.size()).toBe(0);
    expect(a.shift()).toBeNull();
  });

  test("sum / first / last / indexof / sort", () => {
    const a = new PineArray();
    a.push(3);
    a.push(1);
    a.push(2);
    expect(a.sum()).toBe(6);
    expect(a.first()).toBe(3);
    expect(a.last()).toBe(2);
    expect(a.indexof(1)).toBe(1);
    expect(a.indexof(9)).toBeNull();
    a.sort("asc");
    expect(a.toValues()).toEqual([1, 2, 3]);
    const b = a.copy();
    b.reverse();
    expect(b.toValues()).toEqual([3, 2, 1]);
    expect(a.toValues()).toEqual([1, 2, 3]);
  });
});
