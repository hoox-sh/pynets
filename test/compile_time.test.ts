/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4].map((close, i) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
  time: Date.UTC(2024, 0, 15, 12, 0, 0) + i * 86_400_000,
}));

const YEAR_SRC = `//@version=5
indicator("year")
plot(year(time))
`;

const MONTH_SRC = `//@version=5
indicator("month")
plot(month(time))
`;

const TIMESTAMP_SRC = `//@version=5
indicator("ts")
plot(timestamp(2024, 1, 15, 0, 0, 0))
`;

const TF_SECONDS_ARG_SRC = `//@version=5
indicator("tf_sec")
plot(timeframe.in_seconds("1"))
`;

const TF_SECONDS_SRC = `//@version=5
indicator("tf_sec")
plot(timeframe.in_seconds())
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

function isFiniteNum(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

const tfSrc = parseOk(TF_SECONDS_ARG_SRC) ? TF_SECONDS_ARG_SRC : TF_SECONDS_SRC;

describe("compile vs interpret time", () => {
  test.skipIf(!parseOk(YEAR_SRC))("plot(year(time)) compile last is 2024 and matches interpret", () => {
    const compiled = runCompile(YEAR_SRC);
    const interpreted = runInterpret(YEAR_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(2024);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test.skipIf(!parseOk(MONTH_SRC))("plot(month(time)) compile last is 1 (January)", () => {
    const compiled = runCompile(MONTH_SRC);
    const interpreted = runInterpret(MONTH_SRC);
    expect(compiled.error).toBeUndefined();
    expect(interpreted.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(lastPlot(compiled.plots)).toBe(1);
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test.skipIf(!parseOk(TIMESTAMP_SRC))(
    "timestamp(2024, 1, 15, 0, 0, 0) compile has no error / finite if interpret finite",
    () => {
      const compiled = runCompile(TIMESTAMP_SRC);
      const interpreted = runInterpret(TIMESTAMP_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      const interpretLast = interpreted.error == null ? lastPlot(interpreted.plots) : null;
      if (isFiniteNum(interpretLast)) {
        expect(isFiniteNum(lastPlot(compiled.plots))).toBe(true);
      }
    },
  );

  test.skipIf(!parseOk(tfSrc))("timeframe.in_seconds compile has no error", () => {
    const compiled = runCompile(tfSrc);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
  });
});
