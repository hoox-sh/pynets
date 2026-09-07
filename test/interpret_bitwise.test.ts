/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret } from "../src/index.ts";

const BARS = [{ close: 1 }];

function plotOf(src: string): number | null {
  return interpret(`indicator("t")\n${src}`, BARS).plots[0] ?? null;
}

describe("interpret bitwise / shift", () => {
  test("plot((3 << 1) | 1) → 7", () => {
    expect(plotOf("plot((3 << 1) | 1)")).toBe(7);
  });

  test("plot(8 >> 2) → 2", () => {
    expect(plotOf("plot(8 >> 2)")).toBe(2);
  });

  test("plot(7 & 3) → 3", () => {
    expect(plotOf("plot(7 & 3)")).toBe(3);
  });

  test("plot(1 ^ 3) → 2", () => {
    expect(plotOf("plot(1 ^ 3)")).toBe(2);
  });

  test("plot(~0) matches Python (~0 == -1)", () => {
    expect(plotOf("plot(~0)")).toBe(-1);
  });

  test("na operand yields na", () => {
    expect(plotOf("plot(na & 1)")).toBe(null);
    expect(plotOf("plot(1 | na)")).toBe(null);
    expect(plotOf("plot(~na)")).toBe(null);
  });

  test("AugAssign x += 1", () => {
    expect(plotOf("x = 1\nx += 2\nplot(x)")).toBe(3);
  });
});
