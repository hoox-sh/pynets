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

const UDT_METHOD_SRC = `//@version=5
indicator("udt_method")
type Point
    float x = 0
method plus(Point this, float a) =>
    this.x + a
var p = Point.new(3)
plot(p.plus(1))
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

function isAllNa(plots: Array<number | null> | undefined): boolean {
  return plots == null || plots.length === 0 || plots.every((v) => v == null);
}

describe("compile vs interpret UDT methods", () => {
  test("UDT method p.plus(1) compile last plot is 4", () => {
    const compiled = runCompile(UDT_METHOD_SRC);
    const interpreted = runInterpret(UDT_METHOD_SRC);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(isAllNa(compiled.plots)).toBe(false);
    expect(lastPlot(compiled.plots)).toBe(4);
    const interpretSupportsMethod =
      interpreted.error == null && lastPlot(interpreted.plots) === 4;
    if (interpretSupportsMethod) {
      expect(compiled.plots).toEqual(interpreted.plots);
    }
  });
});
