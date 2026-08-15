/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { colorNew, colorRgb, parseColor } from "../src/runtime/color.ts";
import {
  strContains,
  strLength,
  strLower,
  strReplace,
  strTostring,
  strTosring,
  strUpper,
} from "../src/runtime/str.ts";

describe("parseColor", () => {
  test("#RRGGBB defaults alpha to 255", () => {
    expect(parseColor("#FF0000")).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(parseColor("#00ff00")).toEqual({ r: 0, g: 255, b: 0, a: 255 });
  });

  test("#RRGGBBAA keeps alpha", () => {
    expect(parseColor("#0000FF80")).toEqual({ r: 0, g: 0, b: 255, a: 128 });
  });

  test("invalid / na → null", () => {
    expect(parseColor(null)).toBeNull();
    expect(parseColor("")).toBeNull();
    expect(parseColor("FF0000")).toBeNull();
    expect(parseColor("#FF00")).toBeNull();
    expect(parseColor("#GG0000")).toBeNull();
  });
});

describe("colorNew / colorRgb", () => {
  test("colorNew maps transp 0–100 to alpha", () => {
    expect(colorNew(255, 0, 0)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(colorNew(255, 0, 0, 0)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    expect(colorNew(255, 0, 0, 100)).toEqual({ r: 255, g: 0, b: 0, a: 0 });
    expect(colorNew(255, 0, 0, 50)).toEqual({ r: 255, g: 0, b: 0, a: 128 });
  });

  test("colorRgb packs bytes", () => {
    expect(colorRgb(1, 2, 3)).toEqual({ r: 1, g: 2, b: 3, a: 255 });
    expect(colorRgb(1, 2, 3, 4)).toEqual({ r: 1, g: 2, b: 3, a: 4 });
  });

  test("na / non-finite channels → null", () => {
    expect(colorNew(null, 0, 0)).toBeNull();
    expect(colorNew(Number.NaN, 0, 0)).toBeNull();
    expect(colorRgb(1, null, 3)).toBeNull();
  });
});

describe("str helpers", () => {
  test("strTostring / strTosring", () => {
    expect(strTostring(123)).toBe("123");
    expect(strTostring("abc")).toBe("abc");
    expect(strTostring(null)).toBe("");
    expect(strTosring(true)).toBe("true");
  });

  test("length / contains / case", () => {
    expect(strLength("hi")).toBe(2);
    expect(strLength(null)).toBeNull();
    expect(strContains("hello world", "wor")).toBe(true);
    expect(strContains("hello world", "foo")).toBe(false);
    expect(strContains(null, "x")).toBeNull();
    expect(strContains("x", null)).toBeNull();
    expect(strUpper("AbC")).toBe("ABC");
    expect(strLower("AbC")).toBe("abc");
    expect(strUpper(null)).toBeNull();
    expect(strLower(null)).toBeNull();
  });

  test("strReplace occurrence 0 = all", () => {
    expect(strReplace("abab", "a", "c")).toBe("cbcb");
    expect(strReplace("abab", "a", "c", 0)).toBe("cbcb");
    expect(strReplace("hello world", "world", "pine")).toBe("hello pine");
    expect(strReplace("abab", "a", "c", 1)).toBe("cbab");
    expect(strReplace("abab", "a", "c", 2)).toBe("abcb");
    expect(strReplace("abab", "a", "c", 3)).toBe("abab");
    expect(strReplace(null, "a", "c")).toBeNull();
    expect(strReplace("ab", null, "c")).toBe("ab");
  });
});
