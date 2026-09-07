/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [{ close: 1 }, { close: 2 }, { close: 3 }];

function both(source: string) {
  return {
    compiled: new Runtime("TEST", { mode: "compile" }).run(source, BARS),
    interpreted: new Runtime("TEST").run(source, BARS),
  };
}

describe("compile vs interpret bitwise / AugAssign", () => {
  test("plot((3 << 1) | 1) is 7", () => {
    const { compiled, interpreted } = both(`indicator("t")\nplot((3 << 1) | 1)`);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.plots).toEqual([7, 7, 7]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("plot(8 >> 2) is 2; 7 & 3 is 3; 1 ^ 3 is 2", () => {
    const a = both(`indicator("t")\nplot(8 >> 2)`);
    const b = both(`indicator("t")\nplot(7 & 3)`);
    const c = both(`indicator("t")\nplot(1 ^ 3)`);
    expect(a.compiled.plots).toEqual(a.interpreted.plots);
    expect(b.compiled.plots).toEqual(b.interpreted.plots);
    expect(c.compiled.plots).toEqual(c.interpreted.plots);
    expect(a.compiled.plots.at(-1)).toBe(2);
    expect(b.compiled.plots.at(-1)).toBe(3);
    expect(c.compiled.plots.at(-1)).toBe(2);
  });

  test("x += 1 AugAssign matches interpret", () => {
    const { compiled, interpreted } = both(`indicator("t")
x = 0
x += 1
plot(x)`);
    expect(compiled.error).toBeUndefined();
    expect(compiled.plots).toEqual(interpreted.plots);
    expect(compiled.plots).toEqual([1, 1, 1]);
  });

  test("UDT attribute AugAssign stores raw rhs (obj.x += 1 → 1, not 6)", () => {
    const src = `//@version=5
indicator("t")
type S
    float x = 0
o = S.new()
o.x = 5
o.x += 1
plot(o.x)`;
    const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
    const interpreted = new Runtime("TEST").run(src, BARS);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    // Quirk preserved from Python visit_AugAssign / interpret evalAugAssign:
    // the old field value is discarded and the raw rhs is stored.
    expect(compiled.plots).toEqual([1, 1, 1]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});
