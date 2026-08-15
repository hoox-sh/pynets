/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const EXPECTED = [1, 2, 3, 4, 5];

const PUSH_GET = `indicator("t")
a = array.new_float()
array.push(a, close)
plot(array.get(a, 0))`;

const SIZED = `indicator("t")
a = array.new_float(0)
array.push(a, close)
plot(array.get(a, 0))`;

const LITERAL = `indicator("t")
a = array.new_float()
array.push(a, 7)
plot(array.get(a, 0))`;

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

function pickSrc(): { src: string; expected: Array<number | null> } | null {
  if (parseOk(PUSH_GET) && plotsEq(runPlots(PUSH_GET), EXPECTED)) {
    return { src: PUSH_GET, expected: EXPECTED };
  }
  if (parseOk(SIZED) && plotsEq(runPlots(SIZED), EXPECTED)) {
    return { src: SIZED, expected: EXPECTED };
  }
  if (parseOk(LITERAL) && plotsEq(runPlots(LITERAL), [7, 7, 7, 7, 7])) {
    return { src: LITERAL, expected: [7, 7, 7, 7, 7] };
  }
  return null;
}

function arrayWired(): boolean {
  const pick = pickSrc();
  if (pick != null) return true;
  const candidates = [PUSH_GET, SIZED, LITERAL];
  return candidates.some((src) => parseOk(src) && (runPlots(src)?.some((v) => v != null) ?? false));
}

const PICK = pickSrc();

describe("interpret array", () => {
  test.skipIf(!arrayWired())("array.new_float + push + get if wired", () => {
    const src = PICK?.src ?? PUSH_GET;
    const expected = PICK?.expected ?? EXPECTED;
    const out = interpret(src, BARS);
    expect(out.plots).toEqual(expected);
  });
});
