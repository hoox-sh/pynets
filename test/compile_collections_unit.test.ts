/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Direct unit tests of compile-path array / map / matrix facades (no Pine).
 */
import { describe, expect, test } from "bun:test";
import { compileArray, compileMap, compileMatrix } from "../src/runtime/compile/collections.ts";
import { UdtType } from "../src/runtime/udt.ts";

describe("compileArray", () => {
  test("new(2, 5) size 2, get(1)===5", () => {
    const a = compileArray.new(2, 5);
    expect(compileArray.size(a)).toBe(2);
    expect(compileArray.get(a, 1)).toBe(5);
  });

  test("push/get keep UDT instances; binary_search sort_field", () => {
    const T = new UdtType("T", [
      { name: "x", default: 0 },
      { name: "y", default: 0 },
    ]);
    const a = compileArray.new();
    compileArray.push(a, T.newInstance({ x: 1, y: 10 }));
    compileArray.push(a, T.newInstance({ x: 3, y: 30 }));
    compileArray.push(a, T.newInstance({ x: 5, y: 50 }));
    compileArray.sort(a, "ascending", 0);
    expect(compileArray.binary_search(a, 3, 0)).toBe(1);
    expect(compileArray.binary_search(a, 3)).toBe(1);
    const got = compileArray.get(a, 1) as { get?: (n: string) => unknown };
    expect(got?.get?.("x")).toBe(3);
  });

  test("push/pop", () => {
    const a = compileArray.new();
    compileArray.push(a, 10);
    compileArray.push(a, 20);
    expect(compileArray.size(a)).toBe(2);
    expect(compileArray.get(a, 0)).toBe(10);
    expect(compileArray.get(a, 1)).toBe(20);
    expect(compileArray.pop(a)).toBe(20);
    expect(compileArray.size(a)).toBe(1);
    expect(compileArray.pop(a)).toBe(10);
    expect(compileArray.pop(a)).toBeNull();
    expect(compileArray.size(a)).toBe(0);
  });
});

describe("compileMap", () => {
  test("put/get/contains/size", () => {
    const m = compileMap.new();
    compileMap.put(m, "a", 1);
    compileMap.put(m, 2, 3);
    expect(compileMap.get(m, "a")).toBe(1);
    expect(compileMap.get(m, 2)).toBe(3);
    expect(compileMap.contains(m, "a")).toBe(true);
    expect(compileMap.contains(m, "z")).toBe(false);
    expect(compileMap.size(m)).toBe(2);
  });
});

describe("compileMatrix", () => {
  test("new 2x2 set/get", () => {
    const m = compileMatrix.new(2, 2, 0);
    compileMatrix.set(m, 0, 1, 99);
    compileMatrix.set(m, 1, 0, 7);
    expect(compileMatrix.get(m, 0, 0)).toBe(0);
    expect(compileMatrix.get(m, 0, 1)).toBe(99);
    expect(compileMatrix.get(m, 1, 0)).toBe(7);
    expect(compileMatrix.get(m, 1, 1)).toBe(0);
  });

  test("set UDT, sort by field 0, get field", () => {
    const T = new UdtType("T", [{ name: "x", default: 0 }]);
    const m = compileMatrix.new(3, 1);
    compileMatrix.set(m, 0, 0, T.newInstance({ x: 3 }));
    compileMatrix.set(m, 1, 0, T.newInstance({ x: 1 }));
    compileMatrix.set(m, 2, 0, T.newInstance({ x: 2 }));
    compileMatrix.sort(m, 0, "ascending", 0);
    const got = compileMatrix.get(m, 0, 0) as { get?: (n: string) => unknown };
    expect(got?.get?.("x")).toBe(1);
    const last = compileMatrix.get(m, 2, 0) as { get?: (n: string) => unknown };
    expect(last?.get?.("x")).toBe(3);
    const idx = compileMatrix.sort_indices(m, 0, "ascending", 0);
    expect(compileArray.get(idx, 0)).toBe(0);
    expect(compileArray.get(idx, 2)).toBe(2);
  });
});
