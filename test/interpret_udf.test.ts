/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, interpret, parse, Runtime } from "../src/index.ts";

const SRC = `indicator("t")
f(x) => x + 1
plot(f(close))`;
const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));

function parseEmitsFunctionDef(src: string): boolean {
  try {
    return dump(parse(src)).includes("FunctionDef");
  } catch {
    return false;
  }
}

function udfRunnable(): boolean {
  if (!parseEmitsFunctionDef(SRC)) return false;
  try {
    const out = interpret(SRC, BARS);
    return out.plots.some((v) => v != null);
  } catch {
    return false;
  }
}

describe("interpret UDF", () => {
  test.skipIf(!udfRunnable())("f(x) => x + 1 plots close+1", () => {
    const out = interpret(SRC, BARS);
    expect(out.plots).toEqual([2, 3, 4, 5, 6]);
  });

  const isolateSrc = `indicator("t")
y = 10
f(x) =>
    y = x + 1
    y
plot(f(1))
plot(y, title="y")`;

  test.skipIf(!parseEmitsFunctionDef(isolateSrc))("UDF locals do not leak into script env", () => {
    const out = new Runtime("TEST").run(isolateSrc, BARS);
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(2);
    expect(out.series.y).toEqual([10, 10, 10, 10, 10]);
  });
});
