/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Shared `(source, length)` TA descriptors must stay reachable on both
 * backends and point at real TaEngine methods.
 */
import { describe, expect, test } from "bun:test";
import { Runtime, TaEngine } from "../src/index.ts";
import { TA_METHODS } from "../src/runtime/ta_names.ts";
import {
  TA_CONDITION_CALL_SPECS,
  TA_CONTEXT_CALL_SPECS,
  TA_LEN_EXTRA_SPECS,
  TA_MERGED_KWARG_SPECS,
  TA_OHLCV_SPECS,
  TA_OVERLOAD_SPECS,
  TA_RUNTIME_PAIR_GATE_SPECS,
  TA_SRC_LEN_SPECS,
} from "../src/runtime/ta_specs.ts";

const BARS = Array.from({ length: 40 }, (_, i) => ({
  open: 100 + i * 0.2,
  high: 101 + i * 0.35,
  low: 99 - i * 0.15,
  close: 100.5 + i * 0.25 + Math.sin(i * 0.4),
  volume: 1000 + i * 5,
  time: i * 86_400_000,
}));

describe("TA source/length specs", () => {
  test("names are unique, compile-visible, and backed by TaEngine methods", () => {
    const names = new Set<string>();
    const proto = TaEngine.prototype as unknown as Record<string, unknown>;
    for (const spec of TA_SRC_LEN_SPECS) {
      expect(names.has(spec.name), spec.name).toBe(false);
      names.add(spec.name);
      expect(TA_METHODS.has(spec.name), `${spec.name} in TA_METHODS`).toBe(
        true,
      );
      expect(
        typeof proto[spec.method],
        `${spec.name} -> TaEngine.${spec.method}`,
      ).toBe("function");
    }
  });

  test("omitted length matches for default-1 kernels", () => {
    for (const name of ["change", "mom", "roc", "rising", "falling"]) {
      const src = `indicator("t")\nplot(ta.${name}(close), "v")`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${name} compile`).toBeUndefined();
      expect(interpreted.error, `${name} interpret`).toBeUndefined();
      expect(compiled.plots, `${name} omitted length`).toEqual(
        interpreted.plots,
      );
    }
  });

  test("context-OHLCV descriptors match omitted and explicit args", () => {
    for (const spec of TA_OHLCV_SPECS) {
      const omitted = `indicator("t")\nplot(ta.${spec.name}(), "v")`;
      const explicitArgs = spec.args
        .map((arg) => `${arg.context} + 1`)
        .join(", ");
      const explicit = `indicator("t")\nplot(ta.${spec.name}(${explicitArgs}), "v")`;
      for (const src of [omitted, explicit]) {
        const compiled = new Runtime("TEST", { mode: "compile" }).run(
          src,
          BARS,
        );
        const interpreted = new Runtime("TEST").run(src, BARS);
        expect(compiled.error, `${spec.name} compile`).toBeUndefined();
        expect(interpreted.error, `${spec.name} interpret`).toBeUndefined();
        expect(compiled.plots, `${spec.name} ${src}`).toEqual(
          interpreted.plots,
        );
      }
    }
  });

  test("length+extra descriptors match omitted and explicit args", () => {
    for (const spec of TA_LEN_EXTRA_SPECS) {
      const explicit = [spec.hasSourceArg ? "close" : null, "3", "2"]
        .filter((part) => part != null)
        .join(", ");
      const omitted = spec.hasSourceArg ? "close" : "";
      for (const args of [omitted, explicit]) {
        const src = `indicator("t")\nplot(ta.${spec.name}(${args}), "v")`;
        const compiled = new Runtime("TEST", { mode: "compile" }).run(
          src,
          BARS,
        );
        const interpreted = new Runtime("TEST").run(src, BARS);
        expect(compiled.error, `${spec.name} compile`).toBeUndefined();
        expect(interpreted.error, `${spec.name} interpret`).toBeUndefined();
        expect(compiled.plots, `${spec.name} ${args}`).toEqual(
          interpreted.plots,
        );
      }
    }
  });

  test("fixed-arity context descriptors match omitted and explicit args", () => {
    // rci requires a positive length, so its omitted form errors by design.
    const onlyExplicit = new Set(["rci"]);
    for (const spec of TA_CONTEXT_CALL_SPECS) {
      // Required-argument kernels are covered by the explicit call list below.
      if (spec.args.some((arg) => arg.kind === "required")) continue;
      const numbers = spec.args.filter((arg) => arg.kind === "number");
      const maxIndex = numbers.reduce(
        (max, arg) => Math.max(max, arg.callIndex),
        -1,
      );
      const explicit = Array.from({ length: maxIndex + 1 }, (_, i) =>
        numbers.some((arg) => arg.callIndex === i) ? "3" : "close",
      ).join(", ");
      const forms = onlyExplicit.has(spec.name) ? [explicit] : ["", explicit];
      for (const args of forms) {
        const src = `indicator("t")\nplot(ta.${spec.name}(${args}), "v")`;
        const compiled = new Runtime("TEST", { mode: "compile" }).run(
          src,
          BARS,
        );
        const interpreted = new Runtime("TEST").run(src, BARS);
        expect(compiled.error, `${spec.name} compile`).toBeUndefined();
        expect(interpreted.error, `${spec.name} interpret`).toBeUndefined();
        expect(compiled.plots, `${spec.name} ${args}`).toEqual(
          interpreted.plots,
        );
      }
    }
  });

  test("condition/source descriptors match omitted and explicit args", () => {
    const cases: Array<{ name: string; calls: string[] }> = [
      {
        name: "barssince",
        calls: ["ta.barssince(close > open)", "ta.barssince()"],
      },
      {
        name: "valuewhen",
        calls: [
          "ta.valuewhen(close > open, close, 0)",
          "ta.valuewhen(close > open, close)",
          "ta.valuewhen(close > open)",
        ],
      },
      { name: "cum", calls: ["ta.cum()", "ta.cum(close)"] },
    ];
    for (const spec of TA_CONDITION_CALL_SPECS) {
      const entry = cases.find((c) => c.name === spec.name);
      expect(entry, spec.name).toBeDefined();
      for (const call of entry!.calls) {
        const src = `indicator("t")\nplot(${call}, "v")`;
        const compiled = new Runtime("TEST", { mode: "compile" }).run(
          src,
          BARS,
        );
        const interpreted = new Runtime("TEST").run(src, BARS);
        expect(compiled.error, `${call} compile`).toBeUndefined();
        expect(interpreted.error, `${call} interpret`).toBeUndefined();
        expect(compiled.plots, call).toEqual(interpreted.plots);
      }
    }
  });

  test("overload descriptors match context and explicit forms", () => {
    expect(TA_OVERLOAD_SPECS.length).toBeGreaterThan(0);
    const calls = [
      "ta.willr(3)",
      "ta.willr()",
      "ta.willr(7.5)",
      "ta.willr(high + 1, low + 1, close + 1, 3)",
      "ta.wpr(3)",
      "ta.wpr(high + 1, low + 1, close + 1, 3)",
      "ta.atr(3)",
      "ta.atr()",
      "ta.atr(7.5)",
      "ta.atr(high + 1, low + 1, close + 1, 3)",
      "ta.mfi(3)",
      "ta.mfi()",
      "ta.mfi(7.5)",
      "ta.mfi(close, 3)",
      "ta.mfi(high + 1, low + 1, close + 1, volume + 1, 3)",
      "ta.mfi(high + 1, low + 1, close + 1, volume + 1)",
      "ta.cci(3)",
      "ta.cci()",
      "ta.cci(7.5)",
      "ta.cci(close, 3)",
      "ta.cci(source=close, length=3)",
      "ta.cci(high + 1, low + 1, close + 1, 3)",
      "ta.adx(3)",
      "ta.adx()",
      "ta.adx(7.5)",
      "ta.adx(5, 7)",
      "ta.adx(5, 7.5)",
      "ta.adx(high + 1, low + 1, close + 1, 3)",
      "ta.adx(high + 1, low + 1, close + 1)",
      "ta.stoch(7)",
      "ta.stoch()",
      "ta.stoch(7.5)",
      "ta.stoch(7, 3)",
      "ta.stoch(7, 3.5)",
      "ta.stoch(close, high, low, 7)",
      "ta.stoch(close, high, low)",
      "ta.highestbars(3)",
      "ta.highestbars()",
      "ta.highestbars(7.5)",
      "ta.highestbars(close, 3)",
      "ta.highestbars(source=close, length=3)",
      "ta.lowestbars(3)",
      "ta.lowestbars(close, 3)",
      "ta.vwma(7)",
      "ta.vwma()",
      "ta.vwma(7.5)",
      "ta.vwma(close, 7)",
      "ta.vwma(close, volume, 7)",
      "ta.vwma(close, volume * 1.5, 7)",
      "ta.vwma(close, 7, 3)",
      "ta.vwma(close, volume=volume, length=7)",
      "ta.dmi(3, 4)",
      "ta.dmi()",
      "ta.dmi(3)",
      "ta.dmi(diLength=3, adxSmoothing=4)",
      "ta.kc(close, 3, 2)",
      "ta.kc(close)",
      "ta.kc(close, 7.5, 2)",
      "ta.kc(high + 1, low + 1, close + 1, 3, 2)",
      "ta.kc(high + 1, low + 1, close + 1, 3)",
      "ta.tsi(3, 5)",
      "ta.tsi()",
      "ta.tsi(close, 3, 5)",
      "ta.tsi(close)",
      "ta.tsi(7.5, 3)",
      "ta.tsi(short_length=3, long_length=5)",
      "ta.tsi(close, short=3, long=5)",
      "ta.wvad()",
      "ta.wvad(3)",
      "ta.wvad(7.5)",
      "ta.wvad(high + 1, low + 1, close + 1, volume + 1)",
      "ta.wvad(high + 1, low + 1, close + 1, volume + 1, 3)",
      "ta.cmf()",
      "ta.cmf(3)",
      "ta.cmf(7.5)",
      "ta.cmf(close, high, low, volume)",
      "ta.cmf(close, high, low, volume, 3)",
      "ta.cmf(close + 1, high + 1, low + 1, volume + 1, 3)",
      "ta.klinger(high, low, close, volume, 2, 3)",
      "ta.klinger(high, low, close, volume)",
      "ta.klinger(high, low, close, volume, 2.5, 3)",
      "ta.highest(3)",
      "ta.highest()",
      "ta.highest(7.5)",
      "ta.highest(close, 3)",
      "ta.highest(source=close, length=3)",
      "ta.lowest(3)",
      "ta.lowest()",
      "ta.lowest(7.5)",
      "ta.lowest(close, 3)",
      "ta.vwap()",
      "ta.vwap(close)",
      "ta.alma(3)",
      "ta.alma(close)",
      "ta.alma(close, 3)",
      "ta.kama(3)",
      "ta.kama(close, 3)",
      "ta.sar()",
      "ta.sar(0.02, 0.02, 0.2)",
      "ta.correlation()",
      "ta.correlation(close, open)",
      "ta.correlation(close, open, 3)",
      "ta.rci(close, 3)",
      "ta.atr_stop(1)",
      "ta.atr_stop(close, 2)",
      "ta.crossover(close, open)",
      "ta.crossover(close)",
      "ta.crossunder(close, open)",
      "ta.cross(close, open)",
      "ta.percentile_nearest_rank(close, 3, 50)",
      "ta.percentile_nearest_rank(close, 3)",
      "ta.percentile_linear_interpolation(close, 3, 50)",
      "ta.apo(close, 3, 5)",
      "ta.atr_normalized(high, low, close, 3)",
      "ta.beta(close, open, 3)",
      "ta.r_squared(close, open, 3)",
      "ta.comovement(close, open, 3)",
      "ta.skewness(close, 3)",
      "ta.kurtosis(close, 3)",
      "ta.volume_weighted_momentum(close, volume, 3)",
      "ta.mean_reversion_score(close, ta.sma(close, 3), ta.stdev(close, 3), 3)",
      "ta.market_condition(close, ta.atr(3), 3, 3)",
      "ta.order_flow_imbalance(high, low, close, volume, 3)",
      "ta.liquidity_score(volume, close, close, 3)",
      "ta.fear_greed_index(50, 20, 1, 50)",
      "ta.crowd_sentiment(1, 1, 1)",
      "ta.smart_money_flow(1, volume, 2, 3)",
      "ta.max_loss_level(100, 1000, 2)",
      "ta.profit_lock_level(100, 110, 2, 1)",
      "ta.hammer(open, high, low, close)",
      "ta.gap_detector(high, low, close)",
      "ta.macd_signal(close, open)",
      "ta.double_top_bottom(high, low, 3)",
      "ta.inside_bar_pattern(high, low)",
      "ta.acceleration_factor(close, 3)",
      "ta.stoch_smooth(high, low, close, 3, 3, 3)",
    ];
    for (const call of calls) {
      const src = `indicator("t")\nplot(${call}, "v")`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${call} compile`).toBeUndefined();
      expect(interpreted.error, `${call} interpret`).toBeUndefined();
      expect(compiled.plots, call).toEqual(interpreted.plots);
    }
  });

  test("merged-kwarg descriptors keep legacy positional+kwarg order", () => {
    const proto = TaEngine.prototype as unknown as Record<string, unknown>;
    for (const spec of TA_MERGED_KWARG_SPECS) {
      expect(
        typeof proto[spec.method],
        `${spec.name} -> TaEngine.${spec.method}`,
      ).toBe("function");
    }
    const scalarCalls = [
      "ta.ao()",
      "ta.ao(3)",
      "ta.ao(3, 5)",
      "ta.ao(7.5)",
      "ta.ao(slow=10)",
      "ta.ao(len=8)",
      "ta.ao(fast=3, slow=5)",
    ];
    for (const call of scalarCalls) {
      const src = `indicator("t")\nplot(${call}, "v")`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${call} compile`).toBeUndefined();
      expect(interpreted.error, `${call} interpret`).toBeUndefined();
      expect(compiled.plots, call).toEqual(interpreted.plots);
    }
    const tupleCalls = [
      "ta.aroon()",
      "ta.aroon(3)",
      "ta.aroon(7.5)",
      "ta.aroon(length=5)",
      "ta.aroon(3, length=5)",
    ];
    for (const call of tupleCalls) {
      const src = `indicator("t")\n[d,u] = ${call}\nplot(d)\nplot(u)`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${call} compile`).toBeUndefined();
      expect(interpreted.error, `${call} interpret`).toBeUndefined();
      expect(Object.values(compiled.series), call).toEqual(
        Object.values(interpreted.series),
      );
    }
  });

  test("required-argument descriptors keep interpret errors", () => {
    const cases: Array<[string, string]> = [
      [
        "ta.apo()",
        "ta.apo() requires 3 arguments: series, fast_period, slow_period",
      ],
      [
        "ta.skewness(close)",
        "ta.skewness() requires 2 arguments: series, period",
      ],
      [
        "ta.hammer(open, high, low)",
        "ta.hammer() requires 4 arguments: open, high, low, close",
      ],
    ];
    for (const [call, message] of cases) {
      const interpreted = new Runtime("TEST").run(
        `indicator("t")\nplot(${call}, "v")`,
        BARS,
      );
      expect(interpreted.error ?? "", call).toContain(message);
    }
  });

  test("tuple context descriptors match across backends", () => {
    const calls = [
      "ta.macd(close, 3, 5, 2)",
      "ta.macd(3, 5, 2)",
      "ta.macd()",
      "ta.zigzag(close, 3)",
      "ta.zigzag(close)",
      "ta.zigzag()",
    ];
    for (const call of calls) {
      const src = `indicator("t")\n[a,b,c] = ${call}\nplot(a)\nplot(b)\nplot(c)`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${call} compile`).toBeUndefined();
      expect(interpreted.error, `${call} interpret`).toBeUndefined();
      expect(Object.values(compiled.series), call).toEqual(
        Object.values(interpreted.series),
      );
    }
  });

  test("pivot pair-gate descriptors fall through on non-period slots", () => {
    const proto = TaEngine.prototype as unknown as Record<string, unknown>;
    for (const spec of TA_RUNTIME_PAIR_GATE_SPECS) {
      expect(
        typeof proto[spec.method],
        `${spec.name} -> TaEngine.${spec.method}`,
      ).toBe("function");
    }
    const calls = [
      "ta.pivothigh(3, 2)",
      "ta.pivothigh(7.5, 2)",
      "ta.pivothigh(3, 2.5)",
      "ta.pivothigh(3)",
      "ta.pivothigh(close)",
      "ta.pivothigh(close, 3, 2)",
      "ta.pivothigh(3, 2, source=close)",
      "ta.pivotlow(3, 2)",
      "ta.pivotlow(7.5, 2)",
      "ta.pivotlow(close)",
      "ta.pivotlow(close, 3, 2)",
      "ta.pivotlow(3, 2, source=close)",
    ];
    for (const call of calls) {
      const src = `indicator("t")\nplot(${call}, "v")`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${call} compile`).toBeUndefined();
      expect(interpreted.error, `${call} interpret`).toBeUndefined();
      expect(compiled.plots, call).toEqual(interpreted.plots);
    }
  });

  test("bb runtime period-first matches the series form", () => {
    const calls = [
      "ta.bb(3, 2)",
      "ta.bb(close, 3, 2)",
      "ta.bb(3)",
      "ta.bb(7.5, 2)",
      "ta.bb(close, 3)",
    ];
    for (const call of calls) {
      const src = `indicator("t")\n[m,u,l] = ${call}\nplot(m)\nplot(u)\nplot(l)`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${call} compile`).toBeUndefined();
      expect(interpreted.error, `${call} interpret`).toBeUndefined();
      expect(Object.values(compiled.series), call).toEqual(
        Object.values(interpreted.series),
      );
    }
  });

  test("every descriptor matches interpret and compile", () => {
    for (const spec of TA_SRC_LEN_SPECS) {
      const src = `indicator("t")\nplot(ta.${spec.name}(close, 3), "v")`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error, `${spec.name} compile`).toBeUndefined();
      expect(interpreted.error, `${spec.name} interpret`).toBeUndefined();
      expect(compiled.plots, `${spec.name} plots`).toEqual(interpreted.plots);
    }
  });
});
