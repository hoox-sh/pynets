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

function runInterpret(source: string) {
  return new Runtime("TEST", { mode: "interpret" }).run(source, BARS);
}

/** Run the same script through both backends and assert identical, error-free plots. */
function expectBackendParity(source: string): Array<number | null> {
  const compiled = runCompile(source);
  const interpreted = runInterpret(source);
  expect(compiled.error).toBeUndefined();
  expect(interpreted.error).toBeUndefined();
  expect(compiled.mode).toBe("compile");
  expect(compiled.plots).toEqual(interpreted.plots);
  return compiled.plots!;
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

describe("compile vs interpret dotted constant parity", () => {
  // BARS has 4 entries → every plotted series has 4 samples.
  const ones = [1, 1, 1, 1];
  const zeros = [0, 0, 0, 0];
  const of = (v: number): Array<number> => [v, v, v, v];

  // String-valued namespaces: probe via `X == "literal" ? 1 : 0` so both
  // backends yield plottable numbers (interpret test style).
  function parityForEq(constName: string, literal: string): Array<number | null> {
    return expectBackendParity(`indicator("t")\nplot(${constName} == "${literal}" ? 1 : 0)`);
  }

  test("shape.* (12 members) match interpret", () => {
    const shapes: Array<[string, string]> = [
      ["shape.arrowup", "arrowup"],
      ["shape.arrowdown", "arrowdown"],
      ["shape.circle", "circle"],
      ["shape.cross", "cross"],
      ["shape.diamond", "diamond"],
      ["shape.flag", "flag"],
      ["shape.labelup", "labelup"],
      ["shape.labeldown", "labeldown"],
      ["shape.square", "square"],
      ["shape.triangledown", "triangledown"],
      ["shape.triangleup", "triangleup"],
      ["shape.xcross", "xcross"],
    ];
    for (const [name, lit] of shapes) {
      expect(parityForEq(name, lit)).toEqual(ones);
    }
  });

  test("size.* match interpret (ints + auto string)", () => {
    expect(expectBackendParity(`indicator("t")\nplot(size.tiny)`)).toEqual(of(8));
    expect(expectBackendParity(`indicator("t")\nplot(size.small)`)).toEqual(of(10));
    expect(expectBackendParity(`indicator("t")\nplot(size.normal)`)).toEqual(of(12));
    expect(expectBackendParity(`indicator("t")\nplot(size.large)`)).toEqual(of(16));
    expect(expectBackendParity(`indicator("t")\nplot(size.huge)`)).toEqual(of(20));
    expect(parityForEq("size.auto", "auto")).toEqual(ones);
  });

  test("text.formatting.* match interpret", () => {
    expect(parityForEq("text.formatting.none", "")).toEqual(ones);
    expect(parityForEq("text.formatting.bold", "bold")).toEqual(ones);
    expect(parityForEq("text.formatting.italic", "italic")).toEqual(ones);
    expect(parityForEq("text.formatting.bold_italic", "bold italic")).toEqual(ones);
  });

  test("display.* bitfield (integers per Python SoT): pane + data_window === 3, all === 15", () => {
    expect(expectBackendParity(`indicator("t")\nplot(display.none)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(display.pane)`)).toEqual(ones);
    expect(expectBackendParity(`indicator("t")\nplot(display.data_window)`)).toEqual(of(2));
    expect(expectBackendParity(`indicator("t")\nplot(display.price_scale)`)).toEqual(of(4));
    expect(expectBackendParity(`indicator("t")\nplot(display.status_line)`)).toEqual(of(8));
    expect(expectBackendParity(`indicator("t")\nplot(display.all)`)).toEqual(of(15));
    // Bit arithmetic only works because compile emits integers, not strings.
    expect(expectBackendParity(`indicator("t")\nplot(display.pane + display.data_window)`)).toEqual(of(3));
    expect(expectBackendParity(`indicator("t")\nplot(display.pane | display.status_line == 9 ? 1 : 0)`)).toEqual(ones);
  });

  test("position.* (9 members) match interpret", () => {
    const positions = [
      "position.top_left",
      "position.top_center",
      "position.top_right",
      "position.middle_left",
      "position.middle_center",
      "position.middle_right",
      "position.bottom_left",
      "position.bottom_center",
      "position.bottom_right",
    ];
    for (const name of positions) {
      expect(parityForEq(name, name.slice("position.".length))).toEqual(ones);
    }
  });

  test("hline.style_* match interpret", () => {
    expect(parityForEq("hline.style_solid", "solid")).toEqual(ones);
    expect(parityForEq("hline.style_dashed", "dashed")).toEqual(ones);
    expect(parityForEq("hline.style_dotted", "dotted")).toEqual(ones);
  });

  test("barmerge.* match interpret", () => {
    // Compile emits Python-SoT booleans (base.py: True/False); interpret emits
    // 1/0 — identical when plotted / ternary-tested.
    expect(expectBackendParity(`indicator("t")\nplot(barmerge.gaps_on ? 1 : 0)`)).toEqual(ones);
    expect(expectBackendParity(`indicator("t")\nplot(barmerge.gaps_off ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(barmerge.lookahead_on ? 1 : 0)`)).toEqual(ones);
    expect(expectBackendParity(`indicator("t")\nplot(barmerge.lookahead_off ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(barmerge.gaps_on)`)).toEqual(ones);
    expect(expectBackendParity(`indicator("t")\nplot(barmerge.gaps_off)`)).toEqual(zeros);
  });

  test("math.pi / e / phi / rphi match interpret", () => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const rphi = 2 / (1 + Math.sqrt(5));
    const piPlots = expectBackendParity(`indicator("t")\nplot(math.pi)`);
    expect(piPlots[0]).toBeCloseTo(Math.PI);
    expect(expectBackendParity(`indicator("t")\nplot(math.e)`)[0]).toBeCloseTo(Math.E);
    expect(expectBackendParity(`indicator("t")\nplot(math.phi)`)[0]).toBeCloseTo(phi);
    expect(expectBackendParity(`indicator("t")\nplot(math.rphi)`)[0]).toBeCloseTo(rphi);
  });
});
