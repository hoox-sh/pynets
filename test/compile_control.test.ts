/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { compileScript } from "../src/runtime/compile/index.ts";
import { Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close, i) => ({
  open: close - 1,
  high: close + 3,
  low: close - 2,
  close,
  volume: 10 + i,
  time: 1_700_000_000_000 + i * 60_000,
}));

const VAR_SRC = `//@version=5
indicator("var")
var float x = 0
x := x + 1
plot(x)
`;

const REASSIGN_SRC = `//@version=5
indicator("reassign")
a = close
a := a + 1
plot(a)
`;

const IF_SRC = `//@version=5
indicator("if")
v = 0
if close > 2
    v := 1
else
    v := 0
plot(v)
`;

const TERNARY_SRC = `//@version=5
indicator("ternary")
plot(close > 2 ? 1 : 0)
`;

const FOR_SRC = `//@version=5
indicator("for")
s = 0.0
for i = 0 to 2
    s := s + i
plot(s)
`;

const WHILE_SRC = `//@version=5
indicator("while")
s = 0.0
i = 0
while i < 3
    s := s + 1
    i := i + 1
plot(s)
`;

const SWITCH_SRC = `//@version=5
indicator("switch")
x = switch close
    1 => 10
    2 => 20
    => 0
plot(x)
`;

const HL_SRC = `//@version=5
indicator("hl")
plot(hl2, title="hl2")
plot(hlc3, title="hlc3")
plot(ohlc4, title="ohlc4")
`;

const MATH_SRC = `//@version=5
indicator("math")
plot(math.abs(close - 4), title="abs")
plot(math.max(close, 3), title="max")
`;

const INPUT_SMA_SRC = `//@version=5
indicator("input")
len = input.int(3)
plot(ta.sma(close, len))
`;

function compileSeries(source: string): Record<string, Array<number | null>> {
  const compiled = compileScript(source);
  const series = compiled.run(
    BARS.map((b) => b.open),
    BARS.map((b) => b.high),
    BARS.map((b) => b.low),
    BARS.map((b) => b.close),
    BARS.map((b) => b.volume),
    BARS.map((b) => b.time),
  );
  if (/return\s*\{\s*\}/.test(compiled.source) || Object.keys(series).length === 0) {
    throw new Error("compile emit is stub (empty return {})");
  }
  return series;
}

function interpretRun(source: string) {
  const out = new Runtime("TEST").run(source, BARS);
  expect(out.error).toBeUndefined();
  return out;
}

function plotOf(series: Record<string, Array<number | null>>, title?: string): Array<number | null> {
  if (title != null) {
    const hit = series[title];
    if (!Array.isArray(hit)) {
      throw new Error(`compile missing plot ${JSON.stringify(title)}; keys=${Object.keys(series).join(",")}`);
    }
    return hit;
  }
  if (Array.isArray(series.plot)) return series.plot;
  const keys = Object.keys(series);
  if (keys.length === 0) throw new Error("compile emit is stub (empty return {})");
  return series[keys[0]!]!;
}

describe("compile control / var / assign", () => {
  test("var float x = 0 / x := x + 1 plots 1,2,3,...", () => {
    const compiled = plotOf(compileSeries(VAR_SRC));
    const interpreted = interpretRun(VAR_SRC).plots;
    expect(interpreted).toEqual([1, 2, 3, 4, 5]);
    expect(compiled).toEqual(interpreted);
  });

  test("a = close / a := a + 1 plots close+1", () => {
    const compiled = plotOf(compileSeries(REASSIGN_SRC));
    const interpreted = interpretRun(REASSIGN_SRC).plots;
    expect(interpreted).toEqual([2, 3, 4, 5, 6]);
    expect(compiled).toEqual(interpreted);
  });

  test("if close > 2 then 1 else 0", () => {
    const compiled = plotOf(compileSeries(IF_SRC));
    const interpreted = interpretRun(IF_SRC).plots;
    expect(interpreted).toEqual([0, 0, 1, 1, 1]);
    expect(compiled).toEqual(interpreted);
  });

  test("ternary plot(close > 2 ? 1 : 0)", () => {
    const compiled = plotOf(compileSeries(TERNARY_SRC));
    const interpreted = interpretRun(TERNARY_SRC).plots;
    expect(interpreted).toEqual([0, 0, 1, 1, 1]);
    expect(compiled).toEqual(interpreted);
  });

  test("for i = 0 to 2 / s += i plots 3 every bar", () => {
    const compiled = plotOf(compileSeries(FOR_SRC));
    const interpreted = interpretRun(FOR_SRC).plots;
    expect(interpreted).toEqual([3, 3, 3, 3, 3]);
    expect(compiled).toEqual(interpreted);
  });

  test("while cap-safe loop adds 3 times", () => {
    const compiled = plotOf(compileSeries(WHILE_SRC));
    const interpreted = interpretRun(WHILE_SRC).plots;
    expect(interpreted).toEqual([3, 3, 3, 3, 3]);
    expect(compiled).toEqual(interpreted);
  });

  test("switch close two cases plus default", () => {
    const compiled = plotOf(compileSeries(SWITCH_SRC));
    const interpreted = interpretRun(SWITCH_SRC).plots;
    expect(interpreted).toEqual([10, 20, 0, 0, 0]);
    expect(compiled).toEqual(interpreted);
  });

  test("hl2 / hlc3 / ohlc4 match interpret", () => {
    const compiled = compileSeries(HL_SRC);
    const interpreted = interpretRun(HL_SRC);
    expect(plotOf(compiled, "hl2")).toEqual(interpreted.series.hl2);
    expect(plotOf(compiled, "hlc3")).toEqual(interpreted.series.hlc3);
    expect(plotOf(compiled, "ohlc4")).toEqual(interpreted.series.ohlc4);
  });

  test("math.abs / math.max compile vs interpret", () => {
    const compiled = compileSeries(MATH_SRC);
    const interpreted = interpretRun(MATH_SRC);
    expect(plotOf(compiled, "abs")).toEqual(interpreted.series.abs);
    expect(plotOf(compiled, "max")).toEqual(interpreted.series.max);
    expect(interpreted.series.abs).toEqual([3, 2, 1, 0, 1]);
    expect(interpreted.series.max).toEqual([3, 3, 3, 4, 5]);
  });

  test("input.int(3) sma length uses default", () => {
    const compiled = plotOf(compileSeries(INPUT_SMA_SRC));
    const interpreted = interpretRun(INPUT_SMA_SRC).plots;
    expect(interpreted).toEqual([null, null, 2, 3, 4]);
    expect(compiled).toEqual(interpreted);
  });
});
