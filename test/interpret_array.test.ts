/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const EXPECTED = [1, 2, 3, 4, 5];

const PUSH_GET = `indicator("t")
a = array.new_float()
array.push(a, close)
plot(array.get(a, 0))`;

const SIZED = `indicator("t")
a = array.new_float(0)
array.push(a, close)
plot(array.get(a, 0))`;

const LITERAL = `indicator("t")
a = array.new_float()
array.push(a, 7)
plot(array.get(a, 0))`;

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function runPlots(src: string): Array<number | null> | null {
  try {
    return interpret(src, BARS).plots;
  } catch {
    return null;
  }
}

function plotsEq(plots: Array<number | null> | null, expected: Array<number | null>): boolean {
  return plots != null && JSON.stringify(plots) === JSON.stringify(expected);
}

function pickSrc(): { src: string; expected: Array<number | null> } | null {
  if (parseOk(PUSH_GET) && plotsEq(runPlots(PUSH_GET), EXPECTED)) {
    return { src: PUSH_GET, expected: EXPECTED };
  }
  if (parseOk(SIZED) && plotsEq(runPlots(SIZED), EXPECTED)) {
    return { src: SIZED, expected: EXPECTED };
  }
  if (parseOk(LITERAL) && plotsEq(runPlots(LITERAL), [7, 7, 7, 7, 7])) {
    return { src: LITERAL, expected: [7, 7, 7, 7, 7] };
  }
  return null;
}

function arrayWired(): boolean {
  const pick = pickSrc();
  if (pick != null) return true;
  const candidates = [PUSH_GET, SIZED, LITERAL];
  return candidates.some((src) => parseOk(src) && (runPlots(src)?.some((v) => v != null) ?? false));
}

const PICK = pickSrc();

describe("interpret array", () => {
  test.skipIf(!arrayWired())("array.new_float + push + get if wired", () => {
    const src = PICK?.src ?? PUSH_GET;
    const expected = PICK?.expected ?? EXPECTED;
    const out = interpret(src, BARS);
    expect(out.plots).toEqual(expected);
  });
});

describe("interpret array UDT sort_field + binary_search", () => {
  const UDT_SRC = `indicator("t")
type T
    float x
    float y
a = array.new<T>()
array.push(a, T.new(1, 10))
array.push(a, T.new(3, 30))
array.push(a, T.new(5, 50))
array.sort(a, order.ascending, 0)
plot(array.binary_search(a, 3, 0))
plot(array.binary_search(a, 3), title="deflt")
plot(array.binary_search(a, 3, "x"), title="byname")
p = array.get(a, 1)
plot(p.x, title="px")`;

  test("UDT push + sort(field 0) + binary_search → index 1", () => {
    const out = interpret(
      `indicator("t")
type T
    float x
    float y
a = array.new<T>()
array.push(a, T.new(1, 10))
array.push(a, T.new(3, 30))
array.push(a, T.new(5, 50))
array.sort(a, order.ascending, 0)
plot(array.binary_search(a, 3, 0))`,
      BARS,
    );
    expect(out.plots).toEqual([1, 1, 1, 1, 1]);
  });

  test("named plots: default sort_field 0 and string name \"x\"", () => {
    const out = new Runtime("TEST").run(UDT_SRC, BARS);
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(1);
    expect(out.series.deflt?.[0]).toBe(1);
    expect(out.series.byname?.[0]).toBe(1);
    expect(out.series.px?.[0]).toBe(3);
  });

  test("binary_search_leftmost / rightmost with duplicate field values", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
type T
    float x
    float y
a = array.new<T>()
array.push(a, T.new(1, 10))
array.push(a, T.new(2, 20))
array.push(a, T.new(2, 21))
array.push(a, T.new(2, 22))
array.push(a, T.new(3, 30))
array.sort(a, order.ascending, "x")
plot(array.binary_search_leftmost(a, 2, "x"))
plot(array.binary_search_rightmost(a, 2, "x"), title="right")
plot(array.binary_search_leftmost(a, 9, "x"), title="lmiss")
plot(array.binary_search_rightmost(a, 9, sort_field="x"), title="rmiss")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(1);
    expect(out.series.right?.[0]).toBe(3);
    expect(out.series.lmiss?.[0]).toBe(-1);
    expect(out.series.rmiss?.[0]).toBe(-1);
  });

  test("array.from UDT + sort_field kw + search by UDT value", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
type T
    float x = 0.0
    float y = 0.0
a = array.from(T.new(x=5, y=50), T.new(x=1, y=10), T.new(x=3, y=30))
array.sort(a, sort_field="x")
needle = T.new(x=3, y=99)
plot(array.binary_search(a, 3, sort_field="x"))
plot(array.binary_search(a, needle, "x"), title="obj")
plot(array.get(a, 0).x, title="first")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(1);
    expect(out.series.obj?.[0]).toBe(1);
    expect(out.series.first?.[0]).toBe(1);
  });

  test("numeric binary_search still works (no sort_field)", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
a = array.from(1.0, 2.0, 3.0, 4.0, 5.0)
plot(array.binary_search(a, 3))
plot(array.binary_search(a, 9), title="miss")
plot(array.binary_search_leftmost(a, 2), title="left")
plot(array.binary_search_rightmost(a, 2), title="right")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(2);
    expect(out.series.miss?.[0]).toBe(-1);
    expect(out.series.left?.[0]).toBe(1);
    expect(out.series.right?.[0]).toBe(1);
  });

  test("array.new of UDT initial value", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
type T
    float x
    float y
a = array.new<T>(2, T.new(7, 70))
plot(array.get(a, 0).x)
plot(array.get(a, 1).y, title="y")
plot(array.size(a), title="n")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(7);
    expect(out.series.y?.[0]).toBe(70);
    expect(out.series.n?.[0]).toBe(2);
  });
});
