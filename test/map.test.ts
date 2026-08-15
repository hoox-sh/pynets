/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { PineMap } from "../src/runtime/map.ts";

describe("PineMap", () => {
  test("put / get / contains / size", () => {
    const m = new PineMap();
    m.put("a", 1);
    m.put(2, 3);
    expect(m.get("a")).toBe(1);
    expect(m.get(2)).toBe(3);
    expect(m.contains("a")).toBe(true);
    expect(m.contains("z")).toBe(false);
    expect(m.size()).toBe(2);
  });

  test("remove and clear", () => {
    const m = new PineMap();
    m.put("a", 1);
    expect(m.remove("a")).toBe(1);
    expect(m.get("a")).toBeNull();
    m.put("b", 2);
    m.clear();
    expect(m.size()).toBe(0);
  });

  test("keys / values keep insertion order; copy is shallow-independent", () => {
    const m = new PineMap();
    m.put("z", 1);
    m.put(0, 2);
    m.put("z", 9);
    expect(m.keys()).toEqual(["z", 0]);
    expect(m.values()).toEqual([9, 2]);
    const c = m.copy();
    m.put("z", 1);
    expect(c.get("z")).toBe(9);
    expect(c.keys()).toEqual(["z", 0]);
    expect(c.values()).toEqual([9, 2]);
  });

  test("string vs number keys are distinct; invalid keys no-op", () => {
    const m = new PineMap();
    m.put("1", 10);
    m.put(1, 20);
    expect(m.get("1")).toBe(10);
    expect(m.get(1)).toBe(20);
    expect(m.size()).toBe(2);
    m.put(null, 99);
    m.put(undefined, 99);
    m.put(Number.NaN, 99);
    m.put(Infinity, 99);
    m.put({ a: 1 }, 99);
    m.put(true, 99);
    expect(m.size()).toBe(2);
    expect(m.get(null)).toBeNull();
    expect(m.get(Number.NaN)).toBeNull();
    expect(m.contains(Infinity)).toBe(false);
    expect(m.remove(null)).toBeNull();
    expect(m.remove("missing")).toBeNull();
  });

  test("putAll merges and overwrites", () => {
    const other = new PineMap();
    other.put("a", 1);
    other.put("b", 2);
    const m = new PineMap();
    m.put("a", 999);
    m.put("c", 3);
    m.putAll(other);
    expect(m.size()).toBe(3);
    expect(m.get("a")).toBe(1);
    expect(m.get("b")).toBe(2);
    expect(m.get("c")).toBe(3);
  });

  test("putAll keeps old key order and appends new keys", () => {
    const other = new PineMap();
    other.put("a", 1);
    other.put("d", 4);
    const m = new PineMap();
    m.put("c", 3);
    m.put("a", 999);
    m.putAll(other);
    expect(m.keys()).toEqual(["c", "a", "d"]);
    expect(m.values()).toEqual([3, 1, 4]);
  });

  test("putAll empty other is no-op", () => {
    const m = new PineMap();
    m.put("a", 1);
    m.putAll(new PineMap());
    expect(m.size()).toBe(1);
    expect(m.get("a")).toBe(1);
    expect(m.keys()).toEqual(["a"]);
  });

  test("putAll invalid or null other is no-op", () => {
    const m = new PineMap();
    m.put("a", 1);
    m.putAll(null as unknown as PineMap);
    m.putAll(undefined as unknown as PineMap);
    m.putAll({} as PineMap);
    expect(m.size()).toBe(1);
    expect(m.get("a")).toBe(1);
  });

  test("user keys do not pollute Object.prototype", () => {
    const m = new PineMap();
    m.put("__proto__", 1);
    m.put("constructor", 2);
    m.put("hasOwnProperty", 3);
    expect(m.get("__proto__")).toBe(1);
    expect(m.get("constructor")).toBe(2);
    expect(m.contains("__proto__")).toBe(true);
    expect(({} as { polluted?: number }).polluted).toBeUndefined();
    expect(Object.prototype.hasOwnProperty("polluted")).toBe(false);
    expect((Object.prototype as { __proto__?: unknown })["__proto__"]).not.toBe(1);
    expect(m.remove("__proto__")).toBe(1);
    expect(m.contains("__proto__")).toBe(false);
    expect(m.size()).toBe(2);
  });
});
