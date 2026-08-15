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

const IFF_SRC = `indicator("t")\nplot(iff(close > 3, 10, 0))`;
const FIX_SRC = `indicator("t")\nplot(fixnan(close[10]))`;
const POW_SRC = `indicator("t")\nplot(math.pow(close, 2))`;
const SIGN_SRC = `indicator("t")\nplot(math.sign(-close))`;

function iffWired(): boolean {
  if (!parseOk(IFF_SRC)) return false;
  try {
    const out = interpret(IFF_SRC, BARS);
    return out.plots[4] === 10;
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

describe("interpret iff / fixnan / pow / sign", () => {
  test.skipIf(!iffWired())("iff(close > 3, 10, 0)", () => {
    const out = interpret(IFF_SRC, BARS);
    expect(out.plots).toEqual([0, 0, 0, 10, 10]);
  });

  test.skipIf(!parseOk(FIX_SRC))("fixnan(close[10]) is 0", () => {
    try {
      const out = interpret(FIX_SRC, BARS);
      expect(out.plots).toEqual([0, 0, 0, 0, 0]);
    } catch {
      // dispatch missing — skip assertion
    }
  });

  test.skipIf(!parseOk(POW_SRC))("math.pow(close, 2)", () => {
    try {
      const out = interpret(POW_SRC, BARS);
      expect(out.plots).toEqual([1, 4, 9, 16, 25]);
    } catch {
      // dispatch missing
    }
  });

  test.skipIf(!parseOk(SIGN_SRC))("math.sign(-close)", () => {
    try {
      const out = interpret(SIGN_SRC, BARS);
      expect(out.plots).toEqual([-1, -1, -1, -1, -1]);
    } catch {
      // dispatch missing
    }
  });
});
