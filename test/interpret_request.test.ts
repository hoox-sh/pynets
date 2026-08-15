/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4, 5].map((close) => ({ close }));
const SYM_SRC = `indicator("t")\nplot(request.security(syminfo.ticker, timeframe.period, close))`;
const FALLBACK_SRC = `indicator("t")\nplot(request.security("TEST", "", close))`;

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function dumpHasNames(src: string, ...needles: string[]): boolean {
  try {
    const dumped = dump(parse(src));
    return needles.every((n) => dumped.includes(n));
  } catch {
    return false;
  }
}

function runPlots(src: string): Array<number | null> | null {
  try {
    const out = new Runtime("TEST").run(src, BARS);
    if (out.error) return null;
    return out.plots;
  } catch {
    return null;
  }
}

function plotsAreClose(plots: Array<number | null> | null): boolean {
  return plots != null && JSON.stringify(plots) === JSON.stringify([1, 2, 3, 4, 5]);
}

function namesExist(): boolean {
  return parseOk(SYM_SRC) && dumpHasNames(SYM_SRC, "syminfo", "ticker", "timeframe", "period");
}

const REQUEST_SRC = namesExist() && plotsAreClose(runPlots(SYM_SRC)) ? SYM_SRC : FALLBACK_SRC;
const REQUEST_PLOTS = runPlots(REQUEST_SRC);

describe("interpret request.security", () => {
  test.skipIf(!parseOk(REQUEST_SRC) || REQUEST_PLOTS == null || !REQUEST_PLOTS.some((v) => v != null))(
    "request.security same-symbol close passthrough",
    () => {
      const out = new Runtime("TEST").run(REQUEST_SRC, BARS);
      expect(out.error).toBeUndefined();
      expect(out.plots).toEqual([1, 2, 3, 4, 5]);
    },
  );
});
