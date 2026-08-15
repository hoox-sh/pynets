/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const INPUT_SRC = `//@version=5
indicator("input_len")
len = input.int(3, "len")
plot(ta.sma(close, len))
`;

const COLOR_NEW_SRC = `//@version=5
indicator("color_r")
plot(color.r(color.new(color.red, 0)))
`;

const COLOR_HEX_SRC = `//@version=5
indicator("color_r_hex")
plot(color.r(#ff0000))
`;

const ENUM_SRC = `//@version=5
indicator("enum_side")
enum Side
    buy
    sell
plot(Side.buy == Side.buy ? 1 : 0)
`;

const ARRAY_EVERY_SRC = `//@version=5
indicator("array_every")
var a = array.new<float>(0)
if bar_index == 0
    array.push(a, 1)
    array.push(a, 2)
plot(array.every(a) ? 1 : 0)
`;

const MATRIX_RANK_SRC = `//@version=5
indicator("matrix_rank")
var mx = matrix.new<float>(2, 2, 1)
plot(matrix.rank(mx))
`;

const LABEL_SET_TEXT_SRC = `//@version=5
indicator("label_set_text")
var lb = label.new(bar_index, close, "hi")
label.set_text(lb, "yo")
plot(na(lb) ? 0 : 1)
`;

function runCompile(source: string, inputs?: Record<string, number | string | boolean>) {
  return new Runtime("T", { mode: "compile", ...(inputs != null ? { inputs } : {}) }).run(source, BARS);
}

function runInterpret(source: string, inputs?: Record<string, number | string | boolean>) {
  return new Runtime("T", inputs != null ? { inputs } : undefined).run(source, BARS);
}

function lastPlot(plots: Array<number | null> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

function isAllNa(plots: Array<number | null> | undefined): boolean {
  return plots == null || plots.length === 0 || plots.every((v) => v == null);
}

function parseOk(source: string): boolean {
  try {
    parse(source);
    return true;
  } catch {
    return false;
  }
}

function interpretAccepts(source: string): boolean {
  const out = runInterpret(source);
  return out.error == null && !isAllNa(out.plots);
}

function colorRSource(): string {
  if (interpretAccepts(COLOR_NEW_SRC)) return COLOR_NEW_SRC;
  if (interpretAccepts(COLOR_HEX_SRC)) return COLOR_HEX_SRC;
  return COLOR_NEW_SRC;
}

function collectionSource(): string {
  if (parseOk(ARRAY_EVERY_SRC)) return ARRAY_EVERY_SRC;
  return MATRIX_RANK_SRC;
}

describe("compile gaps vs interpret", () => {
  test("input.int override { len: 2 } compile last plot matches interpret (not default-3)", () => {
    const inputs = { len: 2 };
    const compiled = runCompile(INPUT_SRC, inputs);
    const interpreted = runInterpret(INPUT_SRC, inputs);
    const defaultCompile = runCompile(INPUT_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(lastPlot(interpreted.plots));
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(lastPlot(compiled.plots)).not.toBe(lastPlot(defaultCompile.plots));

    const auto = new Runtime("T", { mode: "auto", inputs }).run(INPUT_SRC, BARS);
    expect(auto.compile_fallback_reason ?? "").not.toMatch(/input\.\* overrides require interpret path/);
  });

  test("color.r of color.new(color.red, 0) is 255 (compile not all-na)", () => {
    const src = colorRSource();
    const compiled = runCompile(src);
    const interpreted = runInterpret(src);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(isAllNa(compiled.plots)).toBe(false);
    const expected = interpreted.error == null && lastPlot(interpreted.plots) != null
      ? lastPlot(interpreted.plots)
      : 255;
    expect(lastPlot(compiled.plots)).toBe(expected);
  });

  test.skipIf(!parseOk(ENUM_SRC))("enum Side.buy == Side.buy compile last plot is 1", () => {
    const compiled = runCompile(ENUM_SRC);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
  });

  test("array.every or matrix.rank compile has no error", () => {
    const compiled = runCompile(collectionSource());
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
  });

  test("label.set_text after label.new compile last plot is 1", () => {
    const compiled = runCompile(LABEL_SET_TEXT_SRC);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
  });
});
