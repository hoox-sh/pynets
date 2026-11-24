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
  TA_OHLCV_SPECS,
  TA_OVERLOAD_SPECS,
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
    for (const spec of TA_CONTEXT_CALL_SPECS) {
      const numbers = spec.args.filter((arg) => arg.kind === "number").length;
      const explicit = Array.from({ length: numbers }, () => "3").join(", ");
      for (const args of ["", explicit]) {
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
