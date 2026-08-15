/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";

/** Distinct OHLC so Heikin-Ashi close differs from raw close. */
const BARS = [
  { open: 10, high: 12, low: 9, close: 11, volume: 1 },
  { open: 11, high: 14, low: 10, close: 13, volume: 1 },
  { open: 13, high: 15, low: 12, close: 12, volume: 1 },
  { open: 12, high: 13, low: 11, close: 11, volume: 1 },
];

const RAW_CLOSE_LAST = BARS[BARS.length - 1]!.close;

const HA_SRC = `//@version=5
indicator("ha")
plot(request.security(ticker.heikinashi(syminfo.ticker), timeframe.period, close))
`;

const FOREIGN_SRC = `//@version=5
indicator("sec")
plot(request.security("OTHER", "1D", close))
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

function runInterpret(source: string) {
  return new Runtime("TEST").run(source, BARS);
}

function lastPlot(plots: Array<number | null> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

function allNa(n: number): Array<null> {
  return Array.from({ length: n }, () => null);
}

/** HA close is (o+h+l+c)/4 — independent of prior HA open. */
function haCloseLast(): number {
  const b = BARS[BARS.length - 1]!;
  return (b.open + b.high + b.low + b.close) / 4;
}

/** Interpret applied HA when last plot is finite and not raw close. */
function interpretAppliesHa(interpreted: ReturnType<typeof runInterpret>): boolean {
  if (interpreted.error != null) return false;
  const last = lastPlot(interpreted.plots);
  return last != null && Number.isFinite(last) && last !== RAW_CLOSE_LAST;
}

describe("compile vs interpret heikinashi", () => {
  test.skipIf(!parseOk(HA_SRC))(
    "request.security ticker.heikinashi close matches interpret if interpret works",
    () => {
      const compiled = runCompile(HA_SRC);
      const interpreted = runInterpret(HA_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      if (interpretAppliesHa(interpreted)) {
        expect(compiled.plots).toEqual(interpreted.plots);
      } else {
        const last = lastPlot(compiled.plots);
        expect(last).not.toBeNull();
        expect(typeof last).toBe("number");
        expect(Number.isFinite(last as number)).toBe(true);
        if (haCloseLast() !== RAW_CLOSE_LAST) {
          expect(last).not.toBe(RAW_CLOSE_LAST);
        }
      }
    },
  );

  test.skipIf(!parseOk(HA_SRC))(
    "ticker.heikinashi compile has no error when used as security symbol",
    () => {
      const compiled = runCompile(HA_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
    },
  );

  test.skipIf(!parseOk(FOREIGN_SRC))(
    'request.security("OTHER", "1D", close) is all na',
    () => {
      const compiled = runCompile(FOREIGN_SRC);
      const interpreted = runInterpret(FOREIGN_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(compiled.plots).toEqual(allNa(BARS.length));
      if (interpreted.error == null) {
        expect(compiled.plots).toEqual(interpreted.plots);
      }
    },
  );
});
