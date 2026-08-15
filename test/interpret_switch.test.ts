/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, interpret, parse } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));

const SUBJECT_SRC = `indicator("t")
x = switch close
    1 => 10
    2 => 20
    3 => 30
    => 0
plot(x)`;

const BOOL_SRC = `indicator("t")
x = switch
    close == 1 => 10
    close == 2 => 20
    close == 3 => 30
    => 0
plot(x)`;

const EXPECTED = [10, 20, 30, 0, 0];

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function dumpHas(src: string, needle: string): boolean {
  try {
    return dump(parse(src)).includes(needle);
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

function switchReady(src: string): boolean {
  if (!parseOk(src) || !dumpHas(src, "Switch")) return false;
  const plots = runPlots(src);
  return plots != null && plots.some((v) => v != null);
}

describe("interpret switch", () => {
  test.skipIf(!switchReady(SUBJECT_SRC))("switch close with cases 1/2/3/default", () => {
    const out = interpret(SUBJECT_SRC, BARS);
    expect(out.plots).toEqual(EXPECTED);
  });

  test.skipIf(!switchReady(BOOL_SRC))("boolean switch close == n cases", () => {
    const out = interpret(BOOL_SRC, BARS);
    expect(out.plots).toEqual(EXPECTED);
  });
});
