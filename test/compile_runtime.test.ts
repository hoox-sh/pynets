/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { createCompileHelpers } from "../src/runtime/compile/runtime.ts";

describe("createCompileHelpers", () => {
  const h = createCompileHelpers();

  test("iff: na cond → null; 0/false → b; else a", () => {
    expect(h.iff(null, 10, 0)).toBeNull();
    expect(h.iff(0, 10, 20)).toBe(20);
    expect(h.iff(false, 10, 20)).toBe(20);
    expect(h.iff(1, 10, 20)).toBe(10);
    expect(h.iff(true, 10, 20)).toBe(10);
  });

  test("fixnan: na → 0; finite passes through", () => {
    expect(h.fixnan(null)).toBe(0);
    expect(h.fixnan(7)).toBe(7);
  });

  test("abs(null) is na", () => {
    expect(h.abs(null)).toBeNull();
    expect(h.abs(-4)).toBe(4);
  });

  test("pow is na-safe", () => {
    expect(h.pow(2, 3)).toBe(8);
    expect(h.pow(null, 2)).toBeNull();
    expect(h.pow(2, null)).toBeNull();
  });

  test("avg is varargs and na-safe", () => {
    expect(h.avg(1, 2, 3)).toBe(2);
    expect(h.avg(1, null, 3)).toBeNull();
    expect(h.avg()).toBeNull();
  });
});
