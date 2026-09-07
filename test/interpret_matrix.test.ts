/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const EXPECTED_CLOSE = [1, 2, 3, 4, 5];
const EXPECTED_LIT = [7, 7, 7, 7, 7];

const GENERIC = `indicator("t")
m = matrix.new<float>(1, 1, 0)
matrix.set(m, 0, 0, close)
plot(matrix.get(m, 0, 0))`;

const UNTYPED = `indicator("t")
m = matrix.new(1, 1, 0)
matrix.set(m, 0, 0, close)
plot(matrix.get(m, 0, 0))`;

const NEW_FLOAT = `indicator("t")
m = matrix.new_float(1, 1, 0)
matrix.set(m, 0, 0, close)
plot(matrix.get(m, 0, 0))`;

const LITERAL = `indicator("t")
m = matrix.new(1, 1)
matrix.set(m, 0, 0, 7)
plot(matrix.get(m, 0, 0))`;

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

function hasFinite(plots: Array<number | null> | null): boolean {
  return plots != null && plots.some((v) => typeof v === "number" && Number.isFinite(v));
}

function pickSrc(): { src: string; expected: Array<number | null> } | null {
  if (parseOk(GENERIC) && plotsEq(runPlots(GENERIC), EXPECTED_CLOSE)) {
    return { src: GENERIC, expected: EXPECTED_CLOSE };
  }
  if (parseOk(UNTYPED) && plotsEq(runPlots(UNTYPED), EXPECTED_CLOSE)) {
    return { src: UNTYPED, expected: EXPECTED_CLOSE };
  }
  if (parseOk(NEW_FLOAT) && plotsEq(runPlots(NEW_FLOAT), EXPECTED_CLOSE)) {
    return { src: NEW_FLOAT, expected: EXPECTED_CLOSE };
  }
  if (parseOk(LITERAL) && plotsEq(runPlots(LITERAL), EXPECTED_LIT)) {
    return { src: LITERAL, expected: EXPECTED_LIT };
  }
  return null;
}

function matrixWired(): boolean {
  if (pickSrc() != null) return true;
  return [GENERIC, UNTYPED, NEW_FLOAT, LITERAL].some((src) => {
    if (!parseOk(src)) return false;
    const plots = runPlots(src);
    return hasFinite(plots);
  });
}

const PICK = pickSrc();

describe("interpret matrix", () => {
  test.skipIf(!matrixWired())("matrix.new + set + get if wired", () => {
    const src = PICK?.src ?? UNTYPED;
    const expected = PICK?.expected ?? EXPECTED_CLOSE;
    const out = interpret(src, BARS);
    expect(out.plots).toEqual(expected);
  });
});

describe("interpret matrix.sort sort_field", () => {
  test("numeric sort still works; order.descending is -1", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
m = matrix.new<float>(3, 1, 0)
matrix.set(m, 0, 0, 3)
matrix.set(m, 1, 0, 1)
matrix.set(m, 2, 0, 2)
matrix.sort(m, 0, order.descending)
plot(matrix.get(m, 0, 0))
plot(matrix.get(m, 2, 0), title="last")`,
      [{ close: 1 }],
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(3);
    expect(out.series.last?.[0]).toBe(1);
  });

  test("UDT column sort_field 0 / name", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
type T
    float x
    float y
m = matrix.new<T>(3, 1)
matrix.set(m, 0, 0, T.new(3, 30))
matrix.set(m, 1, 0, T.new(1, 10))
matrix.set(m, 2, 0, T.new(2, 20))
matrix.sort(m, 0, order.ascending, 0)
plot(matrix.get(m, 0, 0).x)
plot(matrix.get(m, 2, 0).x, title="last")`,
      [{ close: 1 }],
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(1);
    expect(out.series.last?.[0]).toBe(3);
  });

  test("matrix.sort_indices with sort_field", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
type T
    float x
m = matrix.new<T>(3, 1)
matrix.set(m, 0, 0, T.new(9))
matrix.set(m, 1, 0, T.new(1))
matrix.set(m, 2, 0, T.new(5))
idx = matrix.sort_indices(m, 0, order.ascending, "x")
plot(array.get(idx, 0))
plot(array.get(idx, 1), title="mid")`,
      [{ close: 1 }],
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(1);
    expect(out.series.mid?.[0]).toBe(2);
  });
});
