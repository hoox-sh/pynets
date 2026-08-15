/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { DrawingBook } from "../src/runtime/drawings.ts";

describe("DrawingBook", () => {
  test("ids increment", () => {
    const book = new DrawingBook();
    expect(book.lineNew(0)).toBe(0);
    expect(book.labelNew(1, "hi")).toBe(1);
    expect(book.boxNew(2)).toBe(2);
    expect(book.lineNew(3, { color: "red" })).toBe(3);
    expect(book.items).toEqual([
      { kind: "line", bar: 0 },
      { kind: "label", bar: 1, text: "hi" },
      { kind: "box", bar: 2 },
      { kind: "line", bar: 3, extra: { color: "red" } },
    ]);
  });

  test("alert recorded", () => {
    const book = new DrawingBook();
    book.lineNew(0);
    book.alert(4, "cross");
    expect(book.items).toHaveLength(2);
    expect(book.items[1]).toEqual({ kind: "alert", bar: 4, text: "cross" });
    expect(book.labelNew(5)).toBe(1);
  });
});
