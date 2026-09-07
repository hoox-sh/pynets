/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Interpret-side period-only / period-first TA overload forms that Python
 * (pynescript) dispatches on `_is_period_like` (core.py ~3427) but interpret
 * previously lacked:
 *
 * - ta.cci(length)                      oscillators.py:159-171  (ctx hlc3 tp)
 * - ta.cci(high, low, close, length)    oscillators.py:178-187  (legacy)
 * - ta.vwma(length)                     basic.py:80-88          (ctx close+volume)
 * - ta.vwma(source, volume, length)     basic.py:89-100         (volume-slot swap)
 * - ta.highest/lowest(length)           basic.py:222-246        (ctx high/low)
 * - ta.highestbars/lowestbars(length)   basic.py:248-291        (ctx high/low)
 * - ta.bb(length, mult)                 basic.py:394-401        (ctx close)
 * - ta.pivothigh/pivotlow(left, right)  basic.py:1007-1039      (ctx high/low)
 * - ta.stoch(length, dPeriod?)          oscillators.py:58-78    (ctx ohlc, %K only)
 * - ta.adx(diLength, adxSmoothing)      common.py:709-717       (period = 2nd slot)
 * - ta.adx(high, low, close, length)    common.py:718-726       (legacy)
 *
 * Equivalence cases rely on Python guarantees: the period form defaults the
 * source series to a chart-context series and reuses the same kernel, so
 * `f(len)` ≡ `f(explicit_source, len)` on separate call sites. Gate cases
 * mirror the repo convention (interpret_period_gate.test.ts): a
 * non-period-like period slot is IGNORED — the call behaves as if the arg
 * were absent (na-period path, or the builtin default where Python's
 * dispatch falls back to one).
 */
import { describe, expect, test } from "bun:test";
import { interpret } from "../src/index.ts";

// Non-monotonic fractional closes so window aggregates distinguish lengths
// and so series args (close/high/low) are never "period-like" at Python's
// last-sample check. Volume mixes whole and fractional values.
function bars(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const close = 100 + 10 * Math.sin(i * 1.7) + (i % 5) * 0.5;
    return {
      open: close - 0.25,
      high: close + 1.5,
      low: close - 1.5,
      close,
      volume: 10 + (i % 3) * 2.5,
      time: i * 86_400_000,
    };
  });
}

function plotsOf(body: string, n = 60): Array<number | null> {
  return interpret(`indicator("t")\n${body}`, bars(n)).plots;
}

/** Two plotted series in one script must come out identical per bar. */
function expectEquivalent(body: string, n = 60): void {
  const out = interpret(`indicator("t")\n${body}`, bars(n));
  expect(out.plots[1]).toEqual(out.plots[0]);
}

describe("interpret period-only TA overloads (Python _is_period_like dispatch)", () => {
  // ---- ta.cci -------------------------------------------------------------
  test("ta.cci(len) ≡ ta.cci(hlc3, len) — period form uses context typical price", () => {
    expectEquivalent(`plot(ta.cci(7))\nplot(ta.cci(hlc3, 7))`);
  });

  test("ta.cci(source, len) is CCI over the source alone (Python 2-arg arm)", () => {
    // Python: _cci(series, series, series, period) → tp = series. Distinct
    // from the context-hlc3 period form; the previous context blend into the
    // 2-arg source matched no Python dispatch arm (SoT correction).
    expect(plotsOf(`plot(ta.cci(close, 7))`)).not.toEqual(plotsOf(`plot(ta.cci(hlc3, 7))`));
  });

  test("ta.cci(high, low, close, len) ≡ ta.cci(hlc3, len) — legacy 4-arg form", () => {
    expectEquivalent(`plot(ta.cci(high, low, close, 7))\nplot(ta.cci(hlc3, 7))`);
  });

  test("ta.cci warmup: na until the window fills, finite afterwards", () => {
    const p = plotsOf(`plot(ta.cci(5))`);
    expect(p.slice(0, 4).every((v) => v == null)).toBe(true);
    expect(p.slice(5).some((v) => typeof v === "number" && Number.isFinite(v))).toBe(true);
  });

  test("ta.cci(7.5) gate → na like ta.cci(na); ta.cci(7.0) ≡ ta.cci(7)", () => {
    expect(plotsOf(`plot(ta.cci(7.5))`)).toEqual(plotsOf(`plot(ta.cci(na))`));
    expect(plotsOf(`plot(ta.cci(7.0))`)).toEqual(plotsOf(`plot(ta.cci(7))`));
  });

  // ---- ta.vwma ------------------------------------------------------------
  test("ta.vwma(len) ≡ ta.vwma(close, len) — period form uses context close + volume", () => {
    expectEquivalent(`plot(ta.vwma(7))\nplot(ta.vwma(close, 7))`);
  });

  test("ta.vwma(source, volume, len) 3-arg form consumes the explicit volume series", () => {
    // Explicit chart volume equals the context volume → ≡ the 2-arg form…
    expectEquivalent(`plot(ta.vwma(close, volume, 7))\nplot(ta.vwma(close, 7))`);
    // …while a scaled volume series is actually used (2-arg form differs).
    expect(plotsOf(`plot(ta.vwma(close, volume * 1.5, 7))`)).not.toEqual(
      plotsOf(`plot(ta.vwma(close, 7))`),
    );
  });

  test("ta.vwma warmup and gate", () => {
    const p = plotsOf(`plot(ta.vwma(5))`);
    expect(p.slice(0, 4).every((v) => v == null)).toBe(true);
    expect(p.slice(5).some((v) => typeof v === "number" && Number.isFinite(v))).toBe(true);
    expect(plotsOf(`plot(ta.vwma(7.5))`)).toEqual(plotsOf(`plot(ta.vwma(na))`));
    expect(plotsOf(`plot(ta.vwma(7.0))`)).toEqual(plotsOf(`plot(ta.vwma(7))`));
  });

  // ---- ta.highest / ta.lowest ----------------------------------------------
  test("ta.highest(len) ≡ ta.highest(high, len); ta.lowest(len) ≡ ta.lowest(low, len)", () => {
    expectEquivalent(`plot(ta.highest(5))\nplot(ta.highest(high, 5))`);
    expectEquivalent(`plot(ta.lowest(5))\nplot(ta.lowest(low, 5))`);
  });

  test("ta.highest/lowest default source is high/low, not close", () => {
    expect(plotsOf(`plot(ta.highest(5))`)).not.toEqual(plotsOf(`plot(ta.highest(close, 5))`));
    expect(plotsOf(`plot(ta.lowest(5))`)).not.toEqual(plotsOf(`plot(ta.lowest(close, 5))`));
  });

  test("ta.highest/lowest warmup and gate", () => {
    expect(plotsOf(`plot(ta.highest(5))`).slice(0, 4).every((v) => v == null)).toBe(true);
    expect(plotsOf(`plot(ta.lowest(5))`).slice(0, 4).every((v) => v == null)).toBe(true);
    expect(plotsOf(`plot(ta.highest(7.5))`)).toEqual(plotsOf(`plot(ta.highest(na))`));
    expect(plotsOf(`plot(ta.lowest(7.5))`)).toEqual(plotsOf(`plot(ta.lowest(na))`));
    expect(plotsOf(`plot(ta.highest(7.0))`)).toEqual(plotsOf(`plot(ta.highest(7))`));
  });

  // ---- ta.highestbars / ta.lowestbars --------------------------------------
  test("ta.highestbars(len) ≡ ta.highestbars(high, len); ta.lowestbars(len) ≡ ta.lowestbars(low, len)", () => {
    expectEquivalent(`plot(ta.highestbars(5))\nplot(ta.highestbars(high, 5))`);
    expectEquivalent(`plot(ta.lowestbars(5))\nplot(ta.lowestbars(low, 5))`);
  });

  test("ta.highestbars/lowestbars warmup, offsets and gate", () => {
    expect(plotsOf(`plot(ta.highestbars(5))`).slice(0, 4).every((v) => v == null)).toBe(true);
    expect(plotsOf(`plot(ta.lowestbars(5))`).slice(0, 4).every((v) => v == null)).toBe(true);
    // Offsets are negative TV-style, within [-(n-1), 0] once the window fills.
    const hb = plotsOf(`plot(ta.highestbars(5))`, 6)[4];
    expect(typeof hb).toBe("number");
    expect(hb!).toBeGreaterThanOrEqual(-4);
    expect(hb!).toBeLessThanOrEqual(0);
    expect(plotsOf(`plot(ta.highestbars(7.5))`)).toEqual(plotsOf(`plot(ta.highestbars(na))`));
    expect(plotsOf(`plot(ta.lowestbars(7.5))`)).toEqual(plotsOf(`plot(ta.lowestbars(na))`));
  });

  // ---- ta.bb ---------------------------------------------------------------
  test("ta.bb(len, mult) ≡ ta.bb(close, len, mult) — period-first form uses context close", () => {
    expectEquivalent(
      `[m1, u1, l1] = ta.bb(7, 2)\n[m2, u2, l2] = ta.bb(close, 7, 2)\nplot(m1)\nplot(m2)`,
    );
  });

  test("ta.bb(len, mult) period-first bands: u - l is a positive spread after warmup", () => {
    const out = interpret(`indicator("t")\n[m, u, l] = ta.bb(7, 2)\nplot(u - l)`, bars(60));
    expect(out.plots.slice(7).every((v) => typeof v === "number" && (v as number) > 0)).toBe(true);
  });

  test("ta.bb warmup and period-slot gate", () => {
    expect(
      plotsOf(`[m, u, l] = ta.bb(7, 2)\nplot(m)`)
        .slice(0, 6)
        .every((v) => v == null),
    ).toBe(true);
    // Whole floats pass the slot gate like bare ints (Python _is_period_like).
    expect(plotsOf(`[m1, u1, l1] = ta.bb(7.0, 2)\nplot(m1)`)).toEqual(
      plotsOf(`[m2, u2, l2] = ta.bb(7, 2)\nplot(m2)`),
    );
    // A fractional first slot does NOT dispatch period-first (Python raises);
    // the fallthrough series arm on a scalar constant stays distinct.
    expect(plotsOf(`[m, u, l] = ta.bb(7.5, 2)\nplot(m)`)).not.toEqual(
      plotsOf(`[m, u, l] = ta.bb(7, 2)\nplot(m)`),
    );
  });

  // ---- ta.pivothigh / ta.pivotlow -------------------------------------------
  test("ta.pivothigh(l, r) ≡ ta.pivothigh(high, l, r); ta.pivotlow(l, r) ≡ ta.pivotlow(low, l, r)", () => {
    expectEquivalent(`plot(ta.pivothigh(2, 2))\nplot(ta.pivothigh(high, 2, 2))`);
    expectEquivalent(`plot(ta.pivotlow(2, 2))\nplot(ta.pivotlow(low, 2, 2))`);
  });

  test("ta.pivothigh/pivotlow confirmation lag and gate", () => {
    // right=2 → a pivot needs L+R later bars, so the first bars are always na.
    expect(plotsOf(`plot(ta.pivothigh(2, 2))`).slice(0, 2).every((v) => v == null)).toBe(true);
    expect(plotsOf(`plot(ta.pivotlow(2, 2))`).slice(0, 2).every((v) => v == null)).toBe(true);
    // A non-period-like slot blocks the period-first dispatch (Python
    // raises); the pivot never confirms on the scalar fallthrough → all na.
    expect(plotsOf(`plot(ta.pivothigh(2.5, 2))`).every((v) => v == null)).toBe(true);
    expect(plotsOf(`plot(ta.pivotlow(2, na))`).every((v) => v == null)).toBe(true);
  });

  // ---- ta.stoch -------------------------------------------------------------
  test("ta.stoch(len) ≡ ta.stoch(close, high, low, len) — period form uses context OHLC", () => {
    expectEquivalent(`plot(ta.stoch(7))\nplot(ta.stoch(close, high, low, 7))`);
  });

  test("ta.stoch(kLen, dPeriod) 2-arg form returns %K over kLen (dPeriod ignored)", () => {
    expectEquivalent(`plot(ta.stoch(7, 3))\nplot(ta.stoch(7))`);
    // The FIRST slot is the effective kLength, so slot order matters.
    expect(plotsOf(`plot(ta.stoch(7, 3))`)).not.toEqual(plotsOf(`plot(ta.stoch(3, 7))`));
  });

  test("ta.stoch range, warmup and gate", () => {
    const p = plotsOf(`plot(ta.stoch(5))`);
    expect(p.slice(0, 4).every((v) => v == null)).toBe(true);
    const finite = p.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    expect(finite.length).toBeGreaterThan(0);
    for (const v of finite) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(plotsOf(`plot(ta.stoch(7.5))`)).toEqual(plotsOf(`plot(ta.stoch(na))`));
  });

  // ---- ta.adx ---------------------------------------------------------------
  test("ta.adx(diLen, adxLen) uses the SECOND slot as the ADX period", () => {
    // diLength is accepted but unused (common.py:709-717) → ta.adx(5, 7) ≡ ta.adx(7).
    expectEquivalent(`plot(ta.adx(5, 7))\nplot(ta.adx(7))`);
    expect(plotsOf(`plot(ta.adx(5, 7))`)).not.toEqual(plotsOf(`plot(ta.adx(5))`));
  });

  test("ta.adx(high, low, close, len) legacy 4-arg ≡ ta.adx(len)", () => {
    expectEquivalent(`plot(ta.adx(high, low, close, 7))\nplot(ta.adx(7))`);
  });

  test("ta.adx 2-arg gate: non-period-like slot → as-if-absent default 14", () => {
    expect(plotsOf(`plot(ta.adx(7.5, 3))`)).toEqual(plotsOf(`plot(ta.adx())`));
    expect(plotsOf(`plot(ta.adx(5, 3.5))`)).toEqual(plotsOf(`plot(ta.adx())`));
    expect(plotsOf(`plot(ta.adx(5.0, 7.0))`)).toEqual(plotsOf(`plot(ta.adx(5, 7))`));
  });
});
