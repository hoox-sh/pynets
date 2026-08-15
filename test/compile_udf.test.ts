/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const SIMPLE_SRC = `//@version=5
indicator("udf_simple")
foo(x) =>
    x + 1
plot(foo(close))
`;

const LOOKBACK_SRC = `//@version=5
indicator("udf_lookback")
prev(src) =>
    src[1]
plot(prev(close))
`;

const VAR_SRC = `//@version=5
indicator("udf_var")
cnt() =>
    var float n = 0
    n := n + 1
    n
plot(cnt())
`;

const SMA_SRC = `//@version=5
indicator("udf_sma")
sma3(src) =>
    ta.sma(src, 3)
plot(sma3(close))
`;

const NESTED_SRC = `//@version=5
indicator("udf_nested")
add1(x) =>
    x + 1
plot(add1(add1(close)))
`;

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function runInterpret(source: string) {
  return new Runtime("TEST").run(source, BARS);
}

function assertCompileMatchesInterpret(source: string, expected?: Array<number | null>): void {
  const compiled = runCompile(source);
  const interpreted = runInterpret(source);
  expect(compiled.error).toBeUndefined();
  expect(interpreted.error).toBeUndefined();
  expect(compiled.mode).toBe("compile");
  const compiledAllNa = compiled.plots.length === 0 || compiled.plots.every((v) => v == null);
  const interpretHasValues = interpreted.plots.some((v) => v != null);
  if (compiledAllNa && interpretHasValues) {
    throw new Error(
      `compile returned all na while interpret did not: interpret=${JSON.stringify(interpreted.plots)}`,
    );
  }
  if (expected != null) expect(interpreted.plots).toEqual(expected);
  expect(compiled.plots).toEqual(interpreted.plots);
}

describe("compile vs interpret UDF", () => {
  test("simple UDF foo(x) => x + 1 plots match interpret", () => {
    assertCompileMatchesInterpret(SIMPLE_SRC, [2, 3, 4, 5, 6]);
  });

  test("UDF series lookback src[1] first bar is na then previous close", () => {
    assertCompileMatchesInterpret(LOOKBACK_SRC, [null, 1, 2, 3, 4]);
  });

  test("UDF var local counter plots 1,2,3,4,5", () => {
    assertCompileMatchesInterpret(VAR_SRC, [1, 2, 3, 4, 5]);
  });

  test("UDF calling ta.sma on series param matches interpret", () => {
    assertCompileMatchesInterpret(SMA_SRC, [null, null, 2, 3, 4]);
  });

  test("two nested UDFs add1(add1(close)) match interpret", () => {
    assertCompileMatchesInterpret(NESTED_SRC, [3, 4, 5, 6, 7]);
  });
});
