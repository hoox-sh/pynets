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
});
