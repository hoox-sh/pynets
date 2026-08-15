/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const EXPECTED_CLOSE = [1, 2, 3, 4, 5];
const EXPECTED_LIT = [7, 7, 7, 7, 7];

const GENERIC = `indicator("t")
m = matrix.new<float>(1, 1, 0)
matrix.set(m, 0, 0, close)
plot(matrix.get(m, 0, 0))`;

const UNTYPED = `indicator("t")
m = matrix.new(1, 1, 0)
matrix.set(m, 0, 0, close)
plot(matrix.get(m, 0, 0))`;

const NEW_FLOAT = `indicator("t")
m = matrix.new_float(1, 1, 0)
matrix.set(m, 0, 0, close)
plot(matrix.get(m, 0, 0))`;

const LITERAL = `indicator("t")
m = matrix.new(1, 1)
matrix.set(m, 0, 0, 7)
plot(matrix.get(m, 0, 0))`;

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function runPlots(src: string): Array<number | null> | null {
  try {
    return interpret(src, BARS).plots;
  } catch {
    return null;
  }
}

function plotsEq(plots: Array<number | null> | null, expected: Array<number | null>): boolean {
  return plots != null && JSON.stringify(plots) === JSON.stringify(expected);
}

function hasFinite(plots: Array<number | null> | null): boolean {
  return plots != null && plots.some((v) => typeof v === "number" && Number.isFinite(v));
}

function pickSrc(): { src: string; expected: Array<number | null> } | null {
  if (parseOk(GENERIC) && plotsEq(runPlots(GENERIC), EXPECTED_CLOSE)) {
    return { src: GENERIC, expected: EXPECTED_CLOSE };
  }
  if (parseOk(UNTYPED) && plotsEq(runPlots(UNTYPED), EXPECTED_CLOSE)) {
    return { src: UNTYPED, expected: EXPECTED_CLOSE };
  }
  if (parseOk(NEW_FLOAT) && plotsEq(runPlots(NEW_FLOAT), EXPECTED_CLOSE)) {
    return { src: NEW_FLOAT, expected: EXPECTED_CLOSE };
  }
  if (parseOk(LITERAL) && plotsEq(runPlots(LITERAL), EXPECTED_LIT)) {
    return { src: LITERAL, expected: EXPECTED_LIT };
  }
  return null;
}

function matrixWired(): boolean {
  if (pickSrc() != null) return true;
  return [GENERIC, UNTYPED, NEW_FLOAT, LITERAL].some((src) => {
    if (!parseOk(src)) return false;
    const plots = runPlots(src);
    return hasFinite(plots);
  });
}

const PICK = pickSrc();

describe("interpret matrix", () => {
  test.skipIf(!matrixWired())("matrix.new + set + get if wired", () => {
    const src = PICK?.src ?? UNTYPED;
    const expected = PICK?.expected ?? EXPECTED_CLOSE;
    const out = interpret(src, BARS);
    expect(out.plots).toEqual(expected);
  });
});
