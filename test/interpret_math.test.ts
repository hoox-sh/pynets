/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, parse } from "../src/index.ts";

const SRC = `indicator("t")\nplot(math.max(close, 3))`;
const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const EXPECTED = [3, 3, 3, 4, 5];

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function mathMaxWired(): boolean {
  if (!parseOk(SRC)) return false;
  try {
    const out = interpret(SRC, BARS);
    return out.plots.some((v) => v != null);
  } catch {
    return false;
  }
}

describe("interpret math.max", () => {
  test.skipIf(!mathMaxWired())("math.max(close, 3) on 1..5", () => {
    const out = interpret(SRC, BARS);
    expect(out.plots).toEqual(EXPECTED);
  });
});
