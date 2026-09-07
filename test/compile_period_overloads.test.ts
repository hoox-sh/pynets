/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile-backend parity for the period-only / period-first TA overload forms
 * wired interpret-side in d8c328a (see test/interpret_period_overloads.test.ts
 * for the Python dispatch semantics). Every case runs the SAME series through
 * BOTH backends and requires equal plots; equivalence cases additionally pin
 * the compile-side dispatch shape (period form ≡ explicit-source form on
 * separate call sites, gate behavior on non-period-like slots).
 *
 * Quirk pins: stoch dPeriod ignored, adx second-slot period, highest/lowest
 * high/low defaults, cci 2-arg source-only.
 *
 * Note: RuntimeResult.plots is the FIRST plot's series only; all plotted
 * series live in `.series` (keyed by title, which differs between backends —
 * compare Object.values by index).
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

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

type RunResult = ReturnType<Runtime["run"]>;

function both(body: string, n = 60) {
  const src = `indicator("t")\n${body}`;
  return {
    compiled: new Runtime("TEST", { mode: "compile" }).run(src, bars(n)),
    interpreted: new Runtime("TEST").run(src, bars(n)),
  };
}

function seriesOf(r: RunResult): Array<Array<number | null>> {
  return Object.values(r.series);
}

/** Compile output must equal interpret output on the same series (all plots). */
function expectParity(body: string, n = 60): void {
  const { compiled, interpreted } = both(body, n);
  expect(compiled.error).toBeUndefined();
  expect(seriesOf(compiled)).toEqual(seriesOf(interpreted));
  expect(compiled.plots).toEqual(interpreted.plots);
}

/** Two plotted series in one COMPILED script must come out identical per bar. */
function expectCompiledEquivalent(body: string, n = 60): void {
  const { compiled } = both(body, n);
  expect(compiled.error).toBeUndefined();
  const s = seriesOf(compiled);
  expect(s[1]).toEqual(s[0]);
}

/** Compile-side series #i of a two-plot script (for not.toEqual pins). */
function compiledSeries(i: 0 | 1, body: string, n = 60): Array<number | null> {
  const { compiled } = both(body, n);
  expect(compiled.error).toBeUndefined();
  return seriesOf(compiled)[i]!;
}

describe("compile period-only TA overloads (parity with interpret _is_period_like dispatch)", () => {
  // ---- ta.cci -------------------------------------------------------------
  test("ta.cci(len) ≡ ta.cci(hlc3, len) — period form uses context typical price", () => {
    const body = `plot(ta.cci(7))\nplot(ta.cci(hlc3, 7))`;
    expectCompiledEquivalent(body);
    expectParity(body);
  });

  test("ta.cci(source, len) is CCI over the source alone (2-arg arm, no h/l blend)", () => {
    expectParity(`plot(ta.cci(close, 7))`);
    const a = compiledSeries(0, `plot(ta.cci(close, 7))\nplot(ta.cci(hlc3, 7))`);
    const b = compiledSeries(1, `plot(ta.cci(close, 7))\nplot(ta.cci(hlc3, 7))`);
    expect(a).not.toEqual(b);
  });

  test("ta.cci(high, low, close, len) ≡ ta.cci(hlc3, len) — legacy 4-arg form", () => {
    const body = `plot(ta.cci(high, low, close, 7))\nplot(ta.cci(hlc3, 7))`;
    expectCompiledEquivalent(body);
    expectParity(body);
  });

  test("ta.cci warmup and gate: 7.5 → na like cci(na); 7.0 ≡ 7", () => {
    const [p] = seriesOf(both(`plot(ta.cci(5))`).compiled);
    expect(p!.slice(0, 4).every((v) => v == null)).toBe(true);
    expect(p!.slice(5).some((v) => typeof v === "number" && Number.isFinite(v))).toBe(true);
    const gate = `plot(ta.cci(7.5))\nplot(ta.cci(na))`;
    expectCompiledEquivalent(gate);
    expectParity(gate);
    const whole = `plot(ta.cci(7.0))\nplot(ta.cci(7))`;
    expectCompiledEquivalent(whole);
    expectParity(whole);
  });

  // ---- ta.vwma ------------------------------------------------------------
  test("ta.vwma(len) ≡ ta.vwma(close, len) — period form uses context close + volume", () => {
    const body = `plot(ta.vwma(7))\nplot(ta.vwma(close, 7))`;
    expectCompiledEquivalent(body);
    expectParity(body);
  });

  test("ta.vwma(source, volume, len) 3-arg form consumes the explicit volume series", () => {
    const eq = `plot(ta.vwma(close, volume, 7))\nplot(ta.vwma(close, 7))`;
    expectCompiledEquivalent(eq);
    expectParity(eq);
    // A scaled volume series is actually used (2-arg form differs).
    const scaled = `plot(ta.vwma(close, volume * 1.5, 7))\nplot(ta.vwma(close, 7))`;
    expectParity(scaled);
    expect(compiledSeries(0, scaled)).not.toEqual(compiledSeries(1, scaled));
  });

  test("ta.vwma warmup and gate", () => {
    const [p] = seriesOf(both(`plot(ta.vwma(5))`).compiled);
    expect(p!.slice(0, 4).every((v) => v == null)).toBe(true);
    expect(p!.slice(5).some((v) => typeof v === "number" && Number.isFinite(v))).toBe(true);
    const gate = `plot(ta.vwma(7.5))\nplot(ta.vwma(na))`;
    expectCompiledEquivalent(gate);
    expectParity(gate);
    const whole = `plot(ta.vwma(7.0))\nplot(ta.vwma(7))`;
    expectCompiledEquivalent(whole);
    expectParity(whole);
  });

  // ---- ta.highest / ta.lowest ----------------------------------------------
  test("ta.highest(len) ≡ ta.highest(high, len); ta.lowest(len) ≡ ta.lowest(low, len)", () => {
    const hi = `plot(ta.highest(5))\nplot(ta.highest(high, 5))`;
    const lo = `plot(ta.lowest(5))\nplot(ta.lowest(low, 5))`;
    expectCompiledEquivalent(hi);
    expectCompiledEquivalent(lo);
    expectParity(hi);
    expectParity(lo);
  });

  test("ta.highest/lowest default source is high/low, not close", () => {
    const hi = `plot(ta.highest(5))\nplot(ta.highest(close, 5))`;
    const lo = `plot(ta.lowest(5))\nplot(ta.lowest(close, 5))`;
    expectParity(hi);
    expectParity(lo);
    expect(compiledSeries(0, hi)).not.toEqual(compiledSeries(1, hi));
    expect(compiledSeries(0, lo)).not.toEqual(compiledSeries(1, lo));
  });

  test("ta.highest/lowest warmup and gate", () => {
    const [hi, lo] = seriesOf(both(`plot(ta.highest(5))\nplot(ta.lowest(5))`).compiled);
    expect(hi!.slice(0, 4).every((v) => v == null)).toBe(true);
    expect(lo!.slice(0, 4).every((v) => v == null)).toBe(true);
    for (const [fn, def] of [["highest", "highest"], ["lowest", "lowest"]] as const) {
      const gate = `plot(ta.${fn}(7.5))\nplot(ta.${def}(na))`;
      expectCompiledEquivalent(gate);
      expectParity(gate);
      const whole = `plot(ta.${fn}(7.0))\nplot(ta.${fn}(7))`;
      expectCompiledEquivalent(whole);
      expectParity(whole);
    }
  });

  // ---- ta.highestbars / ta.lowestbars --------------------------------------
  test("ta.highestbars(len) ≡ ta.highestbars(high, len); ta.lowestbars(len) ≡ ta.lowestbars(low, len)", () => {
    const hi = `plot(ta.highestbars(5))\nplot(ta.highestbars(high, 5))`;
    const lo = `plot(ta.lowestbars(5))\nplot(ta.lowestbars(low, 5))`;
    expectCompiledEquivalent(hi);
    expectCompiledEquivalent(lo);
    expectParity(hi);
    expectParity(lo);
  });

  test("ta.highestbars/lowestbars warmup, offsets and gate", () => {
    const [hb, lb] = seriesOf(both(`plot(ta.highestbars(5))\nplot(ta.lowestbars(5))`, 6).compiled);
    expect(hb!.slice(0, 4).every((v) => v == null)).toBe(true);
    expect(lb!.slice(0, 4).every((v) => v == null)).toBe(true);
    // Offsets are negative TV-style, within [-(n-1), 0] once the window fills.
    expect(typeof hb![4]).toBe("number");
    expect(hb![4]!).toBeGreaterThanOrEqual(-4);
    expect(hb![4]!).toBeLessThanOrEqual(0);
    for (const fn of ["highestbars", "lowestbars"] as const) {
      const gate = `plot(ta.${fn}(7.5))\nplot(ta.${fn}(na))`;
      expectCompiledEquivalent(gate);
      expectParity(gate);
    }
  });

  // ---- ta.bb ---------------------------------------------------------------
  test("ta.bb(len, mult) ≡ ta.bb(close, len, mult) — period-first form uses context close", () => {
    const body = `[m1, u1, l1] = ta.bb(7, 2)\n[m2, u2, l2] = ta.bb(close, 7, 2)\nplot(m1)\nplot(m2)`;
    expectCompiledEquivalent(body);
    expectParity(body);
  });

  test("ta.bb(len, mult) period-first bands: u - l is a positive spread after warmup", () => {
    const [p] = seriesOf(both(`[m, u, l] = ta.bb(7, 2)\nplot(u - l)`).compiled);
    expect(p!.slice(7).every((v) => typeof v === "number" && (v as number) > 0)).toBe(true);
  });

  test("ta.bb warmup and period-slot gate", () => {
    const [p] = seriesOf(both(`[m, u, l] = ta.bb(7, 2)\nplot(m)`).compiled);
    expect(p!.slice(0, 6).every((v) => v == null)).toBe(true);
    // Whole floats pass the slot gate like bare ints (Python _is_period_like).
    const whole = `[m1, u1, l1] = ta.bb(7.0, 2)\n[m2, u2, l2] = ta.bb(7, 2)\nplot(m1)\nplot(m2)`;
    expectCompiledEquivalent(whole);
    expectParity(whole);
    // A fractional first slot does NOT dispatch period-first; the fallthrough
    // series arm on a scalar constant stays distinct.
    const frac = `[m1, u1, l1] = ta.bb(7.5, 2)\n[m2, u2, l2] = ta.bb(7, 2)\nplot(m1)\nplot(m2)`;
    expectParity(frac);
    expect(compiledSeries(0, frac)).not.toEqual(compiledSeries(1, frac));
  });

  // ---- ta.pivothigh / ta.pivotlow -------------------------------------------
  test("ta.pivothigh(l, r) ≡ ta.pivothigh(high, l, r); ta.pivotlow(l, r) ≡ ta.pivotlow(low, l, r)", () => {
    const hi = `plot(ta.pivothigh(2, 2))\nplot(ta.pivothigh(high, 2, 2))`;
    const lo = `plot(ta.pivotlow(2, 2))\nplot(ta.pivotlow(low, 2, 2))`;
    expectCompiledEquivalent(hi);
    expectCompiledEquivalent(lo);
    expectParity(hi);
    expectParity(lo);
  });

  test("ta.pivothigh/pivotlow confirmation lag and gate", () => {
    const [ph, pl] = seriesOf(both(`plot(ta.pivothigh(2, 2))\nplot(ta.pivotlow(2, 2))`).compiled);
    expect(ph!.slice(0, 2).every((v) => v == null)).toBe(true);
    expect(pl!.slice(0, 2).every((v) => v == null)).toBe(true);
    // A non-period-like slot blocks the period-first dispatch; the pivot
    // never confirms on the scalar fallthrough → all na.
    for (const body of [`plot(ta.pivothigh(2.5, 2))`, `plot(ta.pivotlow(2, na))`]) {
      expectParity(body);
      const [p] = seriesOf(both(body).compiled);
      expect(p!.every((v) => v == null)).toBe(true);
    }
  });

  // ---- ta.stoch -------------------------------------------------------------
  test("ta.stoch(len) ≡ ta.stoch(close, high, low, len) — period form uses context OHLC", () => {
    const body = `plot(ta.stoch(7))\nplot(ta.stoch(close, high, low, 7))`;
    expectCompiledEquivalent(body);
    expectParity(body);
  });

  test("ta.stoch(kLen, dPeriod) 2-arg form returns %K over kLen (dPeriod ignored)", () => {
    const eq = `plot(ta.stoch(7, 3))\nplot(ta.stoch(7))`;
    expectCompiledEquivalent(eq);
    expectParity(eq);
    // The FIRST slot is the effective kLength, so slot order matters.
    const order = `plot(ta.stoch(7, 3))\nplot(ta.stoch(3, 7))`;
    expectParity(order);
    expect(compiledSeries(0, order)).not.toEqual(compiledSeries(1, order));
  });

  test("ta.stoch range, warmup and gate", () => {
    const [p] = seriesOf(both(`plot(ta.stoch(5))`).compiled);
    expect(p!.slice(0, 4).every((v) => v == null)).toBe(true);
    const finite = p!.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    expect(finite.length).toBeGreaterThan(0);
    for (const v of finite) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    const gate = `plot(ta.stoch(7.5))\nplot(ta.stoch(na))`;
    expectCompiledEquivalent(gate);
    expectParity(gate);
  });

  // ---- ta.adx ---------------------------------------------------------------
  test("ta.adx(diLen, adxLen) uses the SECOND slot as the ADX period", () => {
    // diLength is accepted but unused (common.py:709-717) → ta.adx(5, 7) ≡ ta.adx(7).
    const eq = `plot(ta.adx(5, 7))\nplot(ta.adx(7))`;
    expectCompiledEquivalent(eq);
    expectParity(eq);
    const diff = `plot(ta.adx(5, 7))\nplot(ta.adx(5))`;
    expectParity(diff);
    expect(compiledSeries(0, diff)).not.toEqual(compiledSeries(1, diff));
  });

  test("ta.adx(high, low, close, len) legacy 4-arg ≡ ta.adx(len)", () => {
    const body = `plot(ta.adx(high, low, close, 7))\nplot(ta.adx(7))`;
    expectCompiledEquivalent(body);
    expectParity(body);
  });

  test("ta.adx 2-arg gate: non-period-like slot → as-if-absent default 14", () => {
    for (const [a, b] of [
      ["ta.adx(7.5, 3)", "ta.adx()"],
      ["ta.adx(5, 3.5)", "ta.adx()"],
      ["ta.adx(5.0, 7.0)", "ta.adx(5, 7)"],
    ] as const) {
      const body = `plot(${a})\nplot(${b})`;
      expectCompiledEquivalent(body);
      expectParity(body);
    }
  });
});
