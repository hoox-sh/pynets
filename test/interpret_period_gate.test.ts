/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Whole-number length-arg gate (Python `_is_period_like`, pynescript
 * core.py ~3427) extended to the period-only / period-first TA forms where
 * Python routes the length arg through that gate. A non-period-like length
 * (fractional, na, non-number) is IGNORED — the call behaves exactly as if
 * the arg were absent (builtin default or na-period path, same call-site
 * state key/reset behavior as the ta.ao / ta.aroon fix in 2bd31ae).
 *
 * Negative cases pin the builtins whose STANDARD (series, length) form Python
 * does NOT gate: lengths coerce via `_expect_period` / `_expect_int`
 * (`_float_to_period_int`: near-int rounds, else floor), so fractional
 * lengths must keep working there.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

// Non-monotonic bars so outputs distinguish different lengths (monotonic
// data pins aroon-style outputs at their rails for every length).
function wigglyBars(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const c = 100 + 10 * Math.sin(i * 1.7) + (i % 5);
    // Volume correlated with bar direction keeps volume-flow builtins
    // (cmf/wvad/mfi) period-sensitive on this data; the close offset within
    // the bar range varies per bar so cmf's money-flow multiplier is not
    // constant (a constant multiplier makes cmf period-insensitive).
    const volume = Math.sin(i * 1.7) > 0 ? 10 : 1;
    return {
      open: c,
      high: c + 1,
      low: c - 1,
      close: c + (i % 4) * 0.25 - 0.375,
      volume,
      time: i * 86_400_000,
    };
  });
}

function plotsOf(body: string, ohlcv: ReturnType<typeof wigglyBars>): Array<number | null> {
  const out = new Runtime("TEST").run(`indicator("t")\n${body}`, ohlcv);
  expect(out.error).toBeUndefined();
  return out.plots;
}

describe("interpret period-like length gate (Python _is_period_like)", () => {
  // na-period forms: gated fractional → treated as absent → na output
  test("ta.atr(7.5) ignored → na like ta.atr(na); ta.atr(7.0) ≡ ta.atr(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.atr(7.5))", b)).toEqual(plotsOf("plot(ta.atr(na))", b));
    expect(plotsOf("plot(ta.atr(7.5))", b)).not.toEqual(plotsOf("plot(ta.atr(7))", b));
    expect(plotsOf("plot(ta.atr(7.0))", b)).toEqual(plotsOf("plot(ta.atr(7))", b));
  });

  test("ta.wpr(7.5) ignored → na like ta.wpr(na); ta.wpr(7.0) ≡ ta.wpr(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.wpr(7.5))", b)).toEqual(plotsOf("plot(ta.wpr(na))", b));
    expect(plotsOf("plot(ta.wpr(7.5))", b)).not.toEqual(plotsOf("plot(ta.wpr(7))", b));
    expect(plotsOf("plot(ta.wpr(7.0))", b)).toEqual(plotsOf("plot(ta.wpr(7))", b));
  });

  test("ta.stoch(7.5) ignored → na like ta.stoch(na); ta.stoch(7.0) ≡ ta.stoch(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.stoch(7.5))", b)).toEqual(plotsOf("plot(ta.stoch(na))", b));
    expect(plotsOf("plot(ta.stoch(7.0))", b)).toEqual(plotsOf("plot(ta.stoch(7))", b));
  });

  test("ta.mfi(7.5) ignored → na like ta.mfi(na); ta.mfi(7.0) ≡ ta.mfi(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.mfi(7.5))", b)).toEqual(plotsOf("plot(ta.mfi(na))", b));
    expect(plotsOf("plot(ta.mfi(7.0))", b)).toEqual(plotsOf("plot(ta.mfi(7))", b));
  });

  // default-fallback forms: gated fractional → treated as absent → default
  test("ta.wvad(7.5) ignored → default 20 like ta.wvad(); ta.wvad(7.0) ≡ ta.wvad(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.wvad(7.5))", b)).toEqual(plotsOf("plot(ta.wvad())", b));
    expect(plotsOf("plot(ta.wvad(7.5))", b)).not.toEqual(plotsOf("plot(ta.wvad(7))", b));
    expect(plotsOf("plot(ta.wvad(7.0))", b)).toEqual(plotsOf("plot(ta.wvad(7))", b));
  });

  test("ta.cmf(7.5) ignored → default 20 like ta.cmf(); ta.cmf(7.0) ≡ ta.cmf(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.cmf(7.5))", b)).toEqual(plotsOf("plot(ta.cmf())", b));
    expect(plotsOf("plot(ta.cmf(7.5))", b)).not.toEqual(plotsOf("plot(ta.cmf(7))", b));
    expect(plotsOf("plot(ta.cmf(7.0))", b)).toEqual(plotsOf("plot(ta.cmf(7))", b));
  });

  test("ta.adx(7.5) ignored → default 14 like ta.adx(); ta.adx(7.0) ≡ ta.adx(7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.adx(7.5))", b)).toEqual(plotsOf("plot(ta.adx())", b));
    expect(plotsOf("plot(ta.adx(7.5))", b)).not.toEqual(plotsOf("plot(ta.adx(7))", b));
    expect(plotsOf("plot(ta.adx(7.0))", b)).toEqual(plotsOf("plot(ta.adx(7))", b));
  });

  test("ta.tsi(7.5, 3) ignores short slot → default 13; whole floats pass", () => {
    const b = wigglyBars(60);
    expect(plotsOf("plot(ta.tsi(7.5, 3))", b)).toEqual(plotsOf("plot(ta.tsi(13, 3))", b));
    expect(plotsOf("plot(ta.tsi(7.5, 3))", b)).not.toEqual(plotsOf("plot(ta.tsi(7, 3))", b));
    expect(plotsOf("plot(ta.tsi(7.0, 34.0))", b)).toEqual(plotsOf("plot(ta.tsi(7, 34))", b));
  });

  test("ta.kc(close, 7.5, 2) ignores length → na like ta.kc(close, na, 2)", () => {
    const b = wigglyBars(40);
    const frac = plotsOf("[m, u, l] = ta.kc(close, 7.5, 2)\nplot(m)", b);
    expect(frac).toEqual(plotsOf("[m, u, l] = ta.kc(close, na, 2)\nplot(m)", b));
    expect(frac.every((v) => v == null)).toBe(true);
    expect(plotsOf("[m, u, l] = ta.kc(close, 7.0, 2)\nplot(m)", b)).toEqual(
      plotsOf("[m, u, l] = ta.kc(close, 7, 2)\nplot(m)", b),
    );
  });
});

describe("interpret non-gated length args keep Python floor coercion (negative cases)", () => {
  // Standard (series, length) forms: Python routes these through
  // `_expect_period` / `_expect_int` → `_float_to_period_int` (floor), NOT
  // through `_is_period_like`. Fractional lengths must remain accepted.
  test("ta.sma(close, 7.5) floors to ta.sma(close, 7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.sma(close, 7.5))", b)).toEqual(plotsOf("plot(ta.sma(close, 7))", b));
    expect(plotsOf("plot(ta.sma(close, 7.5))", b)).not.toEqual(plotsOf("plot(ta.sma(close, 8))", b));
  });

  test("ta.ema(close, 7.5) floors to ta.ema(close, 7)", () => {
    const b = wigglyBars(40);
    expect(plotsOf("plot(ta.ema(close, 7.5))", b)).toEqual(plotsOf("plot(ta.ema(close, 7))", b));
  });

  test("ta.supertrend(2, 7.5) floors atrPeriod to 7", () => {
    const b = wigglyBars(40);
    expect(plotsOf("[st, dir] = ta.supertrend(2, 7.5)\nplot(st)", b)).toEqual(
      plotsOf("[st, dir] = ta.supertrend(2, 7)\nplot(st)", b),
    );
  });

  test("ta.dmi(7.5, 3) floors diLength to 7 (2-arg form is _expect_period, not gated)", () => {
    const b = wigglyBars(60);
    expect(plotsOf("[p, m, a] = ta.dmi(7.5, 3)\nplot(a)", b)).toEqual(
      plotsOf("[p, m, a] = ta.dmi(7, 3)\nplot(a)", b),
    );
  });
});
