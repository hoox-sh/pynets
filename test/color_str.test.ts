/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { colorNew, colorRgb, parseColor } from "../src/runtime/color.ts";
import {
  strContains,
  strEndsWith,
  strFormat,
  strJoin,
  strLength,
  strLower,
  strMatch,
  strPos,
  strRepeat,
  strReplace,
  strReplaceAll,
  strSplit,
  strStartsWith,
  strSubstring,
  strToNumber,
  strTostring,
  strTosring,
  strTrim,
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

  test("invalid / na → null, never throws", () => {
    expect(parseColor(null)).toBeNull();
    expect(parseColor(undefined)).toBeNull();
    expect(parseColor("")).toBeNull();
    expect(parseColor("FF0000")).toBeNull();
    expect(parseColor("#FF00")).toBeNull();
    expect(parseColor("#GG0000")).toBeNull();
    expect(parseColor("#FF0000GG")).toBeNull();
    expect(parseColor("not-a-color")).toBeNull();
    expect(parseColor(123 as unknown as string)).toBeNull();
    expect(parseColor({} as unknown as string)).toBeNull();
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

  test("strReplace occurrence is 0-based first-match (Python / Pine)", () => {
    expect(strReplace("abab", "a", "c")).toBe("cbab");
    expect(strReplace("abab", "a", "c", 0)).toBe("cbab");
    expect(strReplace("hello world", "world", "pine")).toBe("hello pine");
    expect(strReplace("abab", "a", "c", 1)).toBe("abcb");
    expect(strReplace("abab", "a", "c", 2)).toBe("abab");
    expect(strReplace("abab", "a", "c", -1)).toBe("abab");
    expect(strReplace(null, "a", "c")).toBeNull();
    expect(strReplace("ab", null, "c")).toBe("cab");
    expect(strReplace("ab", "a", null)).toBe("b");
    expect(strReplace("aa", "", "x")).toBe("xaa");
    expect(strReplace("aa", "a", "x", Number.NaN)).toBe("xa");
    expect(strReplace("ababab", "ab", "X", 1)).toBe("abXab");
    expect(strReplace("ababab", "ab", "X", 2)).toBe("ababX");
    expect(strReplaceAll("ababab", "ab", "X")).toBe("XXX");
    expect(strReplaceAll("ab", null, "c")).toBe("ab");
  });

  test("startsWith / endsWith", () => {
    expect(strStartsWith("hello", "he")).toBe(true);
    expect(strStartsWith("hello", "lo")).toBe(false);
    expect(strStartsWith(null, "he")).toBeNull();
    expect(strStartsWith("hello", null)).toBeNull();
    expect(strEndsWith("hello world", "world")).toBe(true);
    expect(strEndsWith("hello world", "hello")).toBe(false);
    expect(strEndsWith(null, "lo")).toBeNull();
    expect(strEndsWith("hello", null)).toBeNull();
  });

  test("substring end is exclusive", () => {
    expect(strSubstring("hello", 1)).toBe("ello");
    expect(strSubstring("hello", 1, 3)).toBe("el");
    expect(strSubstring("hello", 0, 5)).toBe("hello");
    expect(strSubstring(null, 0)).toBeNull();
    expect(strSubstring("hello", null)).toBeNull();
    expect(strSubstring("hello", 1, null)).toBeNull();
  });

  test("repeat / replaceAll / trim", () => {
    expect(strRepeat("a", 5)).toBe("aaaaa");
    expect(strRepeat("ab", 3)).toBe("ababab");
    expect(strRepeat("a", 0)).toBe("");
    expect(strRepeat("a", -1)).toBe("");
    expect(strRepeat(null, 2)).toBeNull();
    expect(strRepeat("a", null)).toBeNull();
    expect(strRepeat("a", 1_000_001)).toBeNull();
    expect(strReplaceAll("abab", "a", "c")).toBe("cbcb");
    expect(strReplaceAll(null, "a", "c")).toBeNull();
    expect(strTrim("  hello  ")).toBe("hello");
    expect(strTrim(null)).toBeNull();
  });

  test("split / tonumber / pos", () => {
    expect(strSplit("a,b,c", ",")).toEqual(["a", "b", "c"]);
    expect(strSplit("a b c")).toEqual(["a", "b", "c"]);
    expect(strSplit("ab", "")).toEqual(["a", "b"]);
    expect(strSplit(null, ",")).toEqual([""]);
    expect(strSplit(null)).toEqual([]);
    expect(strToNumber("123.45")).toBe(123.45);
    expect(strToNumber("  12  ")).toBe(12);
    expect(strToNumber("xyz")).toBeNull();
    expect(strToNumber("")).toBeNull();
    expect(strToNumber(null)).toBeNull();
    expect(strPos("abc", "b")).toBe(1);
    expect(strPos("abc", "z")).toBe(-1);
    expect(strPos(null, "a")).toBeNull();
    expect(strPos("a", null)).toBeNull();
  });

  test("match / format / join", () => {
    expect(strMatch("It's time to sell some NASDAQ:AAPL!", "[\\w]+:[\\w]+")).toBe(
      "NASDAQ:AAPL",
    );
    expect(strMatch("abc", "ZZZ")).toBeNull();
    expect(strMatch(null, "a")).toBeNull();
    expect(strMatch("a", null)).toBeNull();
    expect(strMatch("a", "(")).toBeNull();
    expect(strFormat("{0}", 42)).toBe("42");
    expect(strFormat("plain")).toBe("plain");
    expect(strFormat(null)).toBe("NaN");
    expect(strFormat("Price: {0}, Volume: {1}", 1.5, 100)).toBe(
      "Price: 1.5, Volume: 100",
    );
    expect(strFormat("{0,number,#.##}", 1.2345)).toBe("1.23");
    expect(strFormat("{0}", null)).toBe("NaN");
    expect(strJoin(["a", "b"], ",")).toBe("a,b");
    expect(strJoin(["a", null, "b"], ",")).toBe("a,,b");
    expect(strJoin(["a", "b"], null)).toBe("ab");
    expect(strJoin(null, ",")).toBeNull();
  });
});
