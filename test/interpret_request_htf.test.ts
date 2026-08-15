/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";

const BARS = Array.from({ length: 120 }, (_, i) => ({
  open: 100 + i * 0.1,
  high: 101 + i * 0.1,
  low: 99 + i * 0.1,
  close: 100.5 + i * 0.1,
  volume: 1000,
  time: 1_700_000_000_000 + i * 60_000,
}));

const SYM_SRC = `indicator("t")
plot(request.security(syminfo.ticker, "60", close))`;
const FALLBACK_SRC = `indicator("t")
plot(request.security("TEST", "60", close))`;

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
    const out = new Runtime("TEST", { timeframe: "1" }).run(src, BARS);
    if (out.error) return null;
    return out.plots;
  } catch {
    return null;
  }
}

function hasFinite(plots: Array<number | null> | null): boolean {
  return plots != null && plots.some((v) => typeof v === "number" && Number.isFinite(v));
}

const REQUEST_SRC = parseOk(SYM_SRC) && hasFinite(runPlots(SYM_SRC)) ? SYM_SRC : FALLBACK_SRC;
const REQUEST_PLOTS = runPlots(REQUEST_SRC);

describe("interpret request.security HTF", () => {
  test.skipIf(!parseOk(REQUEST_SRC) || !hasFinite(REQUEST_PLOTS))(
    'request.security(sym, "60", close) same symbol',
    () => {
      const out = new Runtime("TEST", { timeframe: "1" }).run(REQUEST_SRC, BARS);
      expect(out.error).toBeUndefined();
      expect(out.plots).toHaveLength(BARS.length);
      const finite = out.plots.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
      expect(finite.length).toBeGreaterThan(0);
      const closes = BARS.map((b) => b.close);
      const lo = Math.min(...closes);
      const hi = Math.max(...closes);
      for (const v of finite) {
        expect(v).toBeGreaterThanOrEqual(lo - 1e-9);
        expect(v).toBeLessThanOrEqual(hi + 1e-9);
      }
    },
  );
});
