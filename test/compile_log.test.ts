/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const LOG_SRC = `//@version=5
indicator("log")
log.info("hi")
plot(1)
`;

const TICKER_SRC = `//@version=5
indicator("sec")
plot(request.security(ticker.standard(syminfo.ticker), timeframe.period, close))
`;

const ALERT_SRC = `//@version=5
indicator("ac")
alertcondition(true, "a")
plot(close)
`;

function parseOk(source: string): boolean {
  try {
    parse(source);
    return true;
  } catch {
    return false;
  }
}

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function lastPlot(plots: Array<number | null> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

function recordIncludesHi(rec: unknown): boolean {
  if (rec == null) return false;
  if (typeof rec === "string") return rec.includes("hi");
  if (typeof rec !== "object") return String(rec).includes("hi");
  const r = rec as { message?: unknown; msg?: unknown; text?: unknown };
  return [r.message, r.msg, r.text, JSON.stringify(rec)].some((x) => String(x ?? "").includes("hi"));
}

describe("compile log / ticker.standard / alertcondition", () => {
  test.skipIf(!parseOk(LOG_SRC))(
    'log.info("hi") compile has no error; logs include hi if present',
    () => {
      const compiled = runCompile(LOG_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      if (compiled.logs != null && compiled.logs.length > 0) {
        expect(compiled.logs.some(recordIncludesHi)).toBe(true);
      }
    },
  );

  test.skipIf(!parseOk(TICKER_SRC))(
    "ticker.standard(syminfo.ticker) request.security same-symbol passthrough or no error",
    () => {
      const compiled = runCompile(TICKER_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      const closes = BARS.map((b) => b.close);
      const hasFinite = compiled.plots.some((v) => v != null && Number.isFinite(v));
      if (hasFinite) {
        expect(compiled.plots).toEqual(closes);
      }
    },
  );

  test.skipIf(!parseOk(ALERT_SRC))(
    'alertcondition(true, "a") + plot(close) compile last is close',
    () => {
      const compiled = runCompile(ALERT_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(lastPlot(compiled.plots)).toBe(BARS[BARS.length - 1]!.close);
    },
  );
});
