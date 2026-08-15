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

const ISMARKET_SRC = `//@version=5
indicator("ismarket")
plot(session.ismarket ? 1 : 0)
`;

const ISFIRSTBAR_SRC = `//@version=5
indicator("isfirstbar")
plot(session.isfirstbar ? 1 : 0)
`;

const IS_HEIKINASHI_SRC = `//@version=5
indicator("is_ha")
plot(chart.is_heikinashi ? 1 : 0)
`;

const FX_USD_USD_SRC = `//@version=5
indicator("fx_usd")
plot(request.currency_rate("USD", "USD"))
`;

const FX_USD_EUR_SRC = `//@version=5
indicator("fx_eur")
plot(request.currency_rate("USD", "EUR"))
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

describe("compile vs interpret session", () => {
  test.skipIf(!parseOk(ISMARKET_SRC))("plot(session.ismarket ? 1 : 0) all 1s both backends", () => {
    const compiled = runCompile(ISMARKET_SRC);
    const interpreted = runInterpret(ISMARKET_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(interpreted.plots).toEqual([1, 1, 1, 1]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test.skipIf(!parseOk(ISFIRSTBAR_SRC))("plot(session.isfirstbar ? 1 : 0) first 1 rest 0", () => {
    const compiled = runCompile(ISFIRSTBAR_SRC);
    const interpreted = runInterpret(ISFIRSTBAR_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(interpreted.plots).toEqual([1, 0, 0, 0]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test.skipIf(!parseOk(IS_HEIKINASHI_SRC))("plot(chart.is_heikinashi ? 1 : 0) all 0", () => {
    const compiled = runCompile(IS_HEIKINASHI_SRC);
    const interpreted = runInterpret(IS_HEIKINASHI_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(interpreted.plots).toEqual([0, 0, 0, 0]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test.skipIf(!parseOk(FX_USD_USD_SRC) || !parseOk(FX_USD_EUR_SRC))(
    'request.currency_rate("USD", "USD") last 1; request.currency_rate("USD", "EUR") last na',
    () => {
      const usdCompile = runCompile(FX_USD_USD_SRC);
      const usdInterpret = runInterpret(FX_USD_USD_SRC);
      expect(usdCompile.error).toBeUndefined();
      expect(usdInterpret.error).toBeUndefined();
      expect(usdCompile.mode).toBe("compile");
      expect(lastPlot(usdInterpret.plots)).toBe(1);
      expect(lastPlot(usdCompile.plots)).toBe(1);
      expect(usdCompile.plots).toEqual(usdInterpret.plots);

      const eurCompile = runCompile(FX_USD_EUR_SRC);
      const eurInterpret = runInterpret(FX_USD_EUR_SRC);
      expect(eurCompile.error).toBeUndefined();
      expect(eurInterpret.error).toBeUndefined();
      expect(eurCompile.mode).toBe("compile");
      expect(lastPlot(eurInterpret.plots)).toBeNull();
      expect(lastPlot(eurCompile.plots)).toBeNull();
      expect(eurCompile.plots).toEqual(eurInterpret.plots);
    },
  );
});
