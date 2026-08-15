/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const ARRAY_SIZE_SRC = `//@version=5
indicator("array_size")
var a = array.new<float>(0)
if bar_index == 0
    array.push(a, 10)
    array.push(a, 20)
plot(array.size(a))
`;

const ARRAY_GET_SRC = `//@version=5
indicator("array_get")
var a = array.new<float>(2, 5)
plot(array.get(a, 1))
`;

const MAP_SRC = `//@version=5
indicator("map")
var m = map.new<int, float>()
if bar_index == 0
    map.put(m, 1, 9)
plot(map.get(m, 1))
`;

const MATRIX_SRC = `//@version=5
indicator("matrix")
var mx = matrix.new<float>(2, 2, 0)
if bar_index == 0
    matrix.set(mx, 0, 1, 3)
plot(matrix.get(mx, 0, 1))
`;

const ARRAY_AVG_SRC = `//@version=5
indicator("array_avg")
var a = array.new<float>(0)
if bar_index == 0
    array.push(a, 1)
    array.push(a, 3)
plot(array.avg(a))
`;

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function runInterpret(source: string) {
  return new Runtime("TEST").run(source, BARS);
}

function isAllNa(plots: Array<number | null> | undefined): boolean {
  return plots == null || plots.length === 0 || plots.every((v) => v == null);
}

/** Handles naNum'd to null → array/map/matrix ops plot all-na. Fail before equality. */
function assertHandlesSurvived(
  compiled: { plots: Array<number | null>; error?: string; mode?: string },
  interpreted: { plots: Array<number | null>; error?: string },
): void {
  expect(compiled.error).toBeUndefined();
  expect(interpreted.error).toBeUndefined();
  expect(compiled.mode).toBe("compile");
  if (isAllNa(compiled.plots)) {
    throw new Error(
      `compile plots are all na — collection handles were likely naNum'd: interpret=${JSON.stringify(interpreted.plots)} compile=${JSON.stringify(compiled.plots)}`,
    );
  }
}

function assertCompileMatchesInterpret(source: string, expectedLast: number, expectedAll?: Array<number | null>): void {
  const compiled = runCompile(source);
  const interpreted = runInterpret(source);
  assertHandlesSurvived(compiled, interpreted);
  if (expectedAll != null) {
    expect(interpreted.plots).toEqual(expectedAll);
    expect(compiled.plots).toEqual(expectedAll);
  }
  expect(interpreted.plots.at(-1)).toBe(expectedLast);
  expect(compiled.plots.at(-1)).toBe(expectedLast);
  expect(compiled.plots).toEqual(interpreted.plots);
}

describe("compile vs interpret collections", () => {
  test("array.new + push + size last plot is 2 and compile has no error", () => {
    assertCompileMatchesInterpret(ARRAY_SIZE_SRC, 2);
  });

  test("array.get of new<float>(2, 5) plots all 5", () => {
    assertCompileMatchesInterpret(ARRAY_GET_SRC, 5, [5, 5, 5, 5]);
  });

  test("map.put / map.get last is 9", () => {
    assertCompileMatchesInterpret(MAP_SRC, 9);
  });

  test("matrix.set / matrix.get last is 3", () => {
    assertCompileMatchesInterpret(MATRIX_SRC, 3);
  });

  test("array.avg after push 1 and 3 is 2", () => {
    assertCompileMatchesInterpret(ARRAY_AVG_SRC, 2);
  });
});
