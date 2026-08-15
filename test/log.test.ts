/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  LogBook,
  RuntimeError,
  formatLogParts,
  runtimeError,
} from "../src/runtime/log.ts";

describe("LogBook", () => {
  test("info/warning/error then snapshot and clear", () => {
    const book = new LogBook();
    book.info(0, "hello");
    book.warning(1, "careful");
    book.error(2, "boom");

    const snap = book.snapshot();
    expect(snap).toEqual([
      { level: "INFO", bar: 0, message: "hello" },
      { level: "WARNING", bar: 1, message: "careful" },
      { level: "ERROR", bar: 2, message: "boom" },
    ]);
    expect(snap).not.toBe(book.records);

    book.clear();
    expect(book.records).toEqual([]);
    expect(book.snapshot()).toEqual([]);
    expect(snap).toHaveLength(3);
  });
});

describe("runtimeError", () => {
  test("throws RuntimeError with message", () => {
    expect(() => runtimeError("halt")).toThrow(RuntimeError);
    try {
      runtimeError("halt");
    } catch (err) {
      expect(err).toBeInstanceOf(RuntimeError);
      expect(err).toBeInstanceOf(Error);
      expect((err as RuntimeError).name).toBe("RuntimeError");
      expect((err as RuntimeError).message).toBe("halt");
    }
  });
});

describe("formatLogParts", () => {
  test("na → \"na\"", () => {
    expect(formatLogParts([null])).toBe("na");
    expect(formatLogParts([undefined])).toBe("na");
    expect(formatLogParts([Number.NaN])).toBe("na");
    expect(formatLogParts([Number.POSITIVE_INFINITY])).toBe("na");
    expect(formatLogParts(["x={0}", null])).toBe("x=na");
  });
});
