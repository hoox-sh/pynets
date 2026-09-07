/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function runInterpret(source: string) {
  return new Runtime("TEST", { mode: "interpret" }).run(source, BARS);
}

/** Run the same script through both backends and assert identical, error-free plots. */
function expectBackendParity(source: string): Array<number | null> {
  const compiled = runCompile(source);
  const interpreted = runInterpret(source);
  expect(compiled.error).toBeUndefined();
  expect(interpreted.error).toBeUndefined();
  expect(compiled.mode).toBe("compile");
  expect(compiled.plots).toEqual(interpreted.plots);
  return compiled.plots!;
}

// Python SoT: pynescript/ast/evaluator/base.py "Chart timeframe defaults
// (daily)" + runtime/host.py Timeframe. Compile's static table and interpret's
// no-timeframe fallback both mirror that table (daily-chart assumption), so
// every member is pinned via backend parity in the default (no configured
// timeframe) state.
describe("compile timeframe.* static defaults (Python daily-chart table)", () => {
  const zeros = [0, 0, 0, 0];
  const ones = [1, 1, 1, 1];
  const of = (v: number): Array<number> => [v, v, v, v];

  test("period defaults to 'D' and matches interpret", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.period == "D" ? 1 : 0)`)).toEqual(ones);
  });

  test("main_period defaults to 'D' and matches interpret", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.main_period == "D" ? 1 : 0)`)).toEqual(ones);
  });

  test("multiplier defaults to 1 and matches interpret", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.multiplier)`)).toEqual(of(1));
  });

  test("false flags match interpret: isintraday / isweekly / ismonthly", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isintraday ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isweekly ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.ismonthly ? 1 : 0)`)).toEqual(zeros);
  });

  test("false flags match interpret: isseconds / isinseconds / isminutes / ishours", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isseconds ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isinseconds ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isminutes ? 1 : 0)`)).toEqual(zeros);
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.ishours ? 1 : 0)`)).toEqual(zeros);
  });

  test("isdaily defaults to true and matches interpret", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isdaily ? 1 : 0)`)).toEqual(ones);
  });

  test("isdwm defaults to true and matches interpret", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.isdwm ? 1 : 0)`)).toEqual(ones);
  });

  test("unknown timeframe member is na on both backends", () => {
    const compiled = runCompile(`indicator("t")\nplot(timeframe.no_such_member)`);
    const interpreted = runInterpret(`indicator("t")\nplot(timeframe.no_such_member)`);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.plots).toEqual([null, null, null, null]);
    expect(compiled.plots).toEqual(interpreted.plots);
  });
});

// Python SoT: pynescript/ast/evaluator/builtins/timeframe.py:177-218 —
// `timeframe_in_seconds` maps None / "" to "D" before parsing (lines 189-190),
// so the no-timeframe case is daily (86400); a configured tf like "5" is its
// own duration (300, lines 201-202). Interpret now maps na / "" / no-arg
// through the same "D" default (and "D" itself parses to 86400), so every
// case is pinned via backend parity.
describe("timeframe.in_seconds (Python no-timeframe → daily) — interpret/compile parity", () => {
  const daily = [86_400, 86_400, 86_400, 86_400];

  test("no-arg call returns daily 86400 on both backends", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.in_seconds())`)).toEqual(daily);
  });

  test("explicit na arg defaults to daily 86400 on both backends", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.in_seconds(na))`)).toEqual(daily);
  });

  test("empty-string arg defaults to daily 86400 on both backends", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.in_seconds(""))`)).toEqual(daily);
  });

  test("explicit 'D' parses to 86400 on both backends", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.in_seconds("D"))`)).toEqual(daily);
  });

  test("configured timeframe keeps its own duration ('5' → 300) on both backends", () => {
    expect(expectBackendParity(`indicator("t")\nplot(timeframe.in_seconds("5"))`)).toEqual([
      300, 300, 300, 300,
    ]);
  });
});
