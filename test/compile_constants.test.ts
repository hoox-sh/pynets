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

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function lastPlot(plots: Array<number | null> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

describe("compile dotted namespace constants", () => {
  test("plot(order.ascending) compile last is 1", () => {
    const src = `//@version=5
indicator("order_asc")
plot(order.ascending)
`;
    const compiled = runCompile(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
  });

  test("plot(order.descending) compile last is -1", () => {
    const src = `//@version=5
indicator("order_desc")
plot(order.descending)
`;
    const compiled = runCompile(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(-1);
  });

  test("array.sort(..., order.ascending) no longer errors", () => {
    const src = `//@version=5
indicator("sort_order")
var a = array.new<float>(0)
if bar_index == 0
    array.push(a, 3)
    array.push(a, 1)
    array.push(a, 2)
    array.sort(a, order.ascending)
plot(array.get(a, 0))
`;
    const compiled = runCompile(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
  });

  test("plot(dayofweek.monday) is 2", () => {
    const src = `//@version=5
indicator("dow")
plot(dayofweek.monday)
`;
    const compiled = runCompile(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(2);
  });

  test("plot(month.january) is 1", () => {
    const src = `//@version=5
indicator("mon")
plot(month.january)
`;
    const compiled = runCompile(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
  });

  test("str.tostring(close, format.mintick) compile has no error", () => {
    const src = `//@version=5
indicator("fmt")
s = str.tostring(close, format.mintick)
plot(str.length(format.mintick))
`;
    const compiled = runCompile(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(7);
  });
});
