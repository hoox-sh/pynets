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

const UDT_NEW_SRC = `//@version=5
indicator("udt_new")
type Point
    float x
    float y
var p = Point.new(1, 2)
plot(p.x)
`;

const UDT_ASSIGN_SRC = `//@version=5
indicator("udt_assign")
type Point
    float x = 0
var p = Point.new()
if bar_index == 0
    p.x := 7
plot(p.x)
`;

const LABEL_SRC = `//@version=5
indicator("label")
var lb = label.new(bar_index, close, "hi")
plot(na(lb) ? 0 : 1)
`;

const KWARGS_SRC = `//@version=5
indicator("kwargs")
add(a, b=1) =>
    a + b
plot(add(close, b=2))
`;

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function runInterpret(source: string) {
  return new Runtime("TEST").run(source, BARS);
}

function lastPlot(plots: Array<number | null> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

describe("compile vs interpret UDT / drawings", () => {
  test("UDT Point.new(1, 2) compile last plot is 1", () => {
    const compiled = runCompile(UDT_NEW_SRC);
    const interpreted = runInterpret(UDT_NEW_SRC);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
    const interpretSupportsTypeNew =
      interpreted.error == null && lastPlot(interpreted.plots) === 1;
    if (interpretSupportsTypeNew) {
      expect(compiled.plots).toEqual(interpreted.plots);
    }
  });

  test("UDT field assign p.x := 7 compile last plot is 7", () => {
    const compiled = runCompile(UDT_ASSIGN_SRC);
    const interpreted = runInterpret(UDT_ASSIGN_SRC);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(7);
    if (interpreted.error == null && lastPlot(interpreted.plots) === 7) {
      expect(compiled.plots).toEqual(interpreted.plots);
    }
  });

  test("label.new handle is non-na: compile last plot is 1", () => {
    const compiled = runCompile(LABEL_SRC);
    const interpreted = runInterpret(LABEL_SRC);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
    if (interpreted.error == null && lastPlot(interpreted.plots) === 1) {
      expect(compiled.plots).toEqual(interpreted.plots);
    }
  });

  test("named UDF kwargs add(close, b=2) matches interpret", () => {
    const compiled = runCompile(KWARGS_SRC);
    const interpreted = runInterpret(KWARGS_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(interpreted.plots).toEqual([3, 4, 5, 6]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});
