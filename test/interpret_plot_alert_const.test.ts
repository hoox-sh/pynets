/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import { MATH_CONSTANTS } from "../src/runtime/interpret.ts";
import {
  PYNE_ROOT,
  pythonAvailable,
  pythonBin,
} from "./helpers/python_runtime.ts";

const BARS = [1, 2, 3].map((close) => ({ close }));

/** Python plotting.py PlotStyle tokens and alerts.py `_alerts_builtin_map`. */
const CASES: ReadonlyArray<readonly [string, string]> = [
  ["plot.style_line", "style_line"],
  ["plot.style_linebr", "style_linebr"],
  ["plot.style_stepline", "style_stepline"],
  ["plot.style_steplinebr", "style_steplinebr"],
  ["plot.style_stepline_diamond", "style_stepline_diamond"],
  ["plot.style_histogram", "style_histogram"],
  ["plot.style_columns", "style_columns"],
  ["plot.style_cross", "style_cross"],
  ["plot.style_area", "style_area"],
  ["plot.style_areabr", "style_areabr"],
  ["plot.style_circles", "style_circles"],
  ["alert.freq_once_per_bar", "once_per_bar"],
  ["alert.freq_once_per_bar_close", "once_per_bar_close"],
  ["alert.freq_all", "all"],
];

function eqSrc(name: string, token: string): string {
  // String unwrap of a plot is na — plot the 1/0 equality instead.
  return `indicator("t")\nplot(${name} == "${token}" ? 1 : 0)`;
}

function allEqSrc(): string {
  const plots = CASES.map(([name, token]) => {
    const title = name.includes("alert.") ? name.slice("alert.".length) : token;
    return `plot(${name} == "${token}" ? 1 : 0, "${title}")`;
  });
  return `indicator("t")\n${plots.join("\n")}`;
}

function interpretRun(src: string) {
  const out = new Runtime("TEST", { mode: "interpret" }).run(src, BARS);
  expect(out.error).toBeUndefined();
  expect(out.mode).toBe("interpret");
  return out;
}

function pythonSeries(src: string): Record<string, number[]> | null {
  try {
    const proc = Bun.spawnSync(
      [
        pythonBin(),
        "-c",
        `from pynescript.runtime import Runtime
import json
src = ${JSON.stringify(src)}
bars = [{"close": 1}, {"close": 2}, {"close": 3}]
out = Runtime("TEST").run(src, bars)
series = out.get("series") if isinstance(out, dict) else out.series
print(json.dumps(series))`,
      ],
      { cwd: PYNE_ROOT, stdout: "pipe", stderr: "pipe" },
    );
    if (proc.exitCode !== 0) return null;
    const parsed = JSON.parse(proc.stdout.toString().trim());
    return parsed != null && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

describe("interpret plot.style_* / alert.freq_* constants", () => {
  test("MATH_CONSTANTS tokens match Python PlotStyle / alerts map", () => {
    for (const [name, token] of CASES) {
      expect(MATH_CONSTANTS[name]).toBe(token);
    }
  });

  test('plot(plot.style_line == "style_line" ? 1 : 0) → 1', () => {
    for (const [name, token] of CASES) {
      expect(interpretRun(eqSrc(name, token)).plots).toEqual([1, 1, 1]);
    }
  });

  test.skipIf(!pythonAvailable())(
    "equality 1/0 matches Python Runtime.run series",
    () => {
      const src = allEqSrc();
      const py = pythonSeries(src);
      expect(py).not.toBeNull();
      const ts = interpretRun(src);
      for (const [name, token] of CASES) {
        const title = name.includes("alert.")
          ? name.slice("alert.".length)
          : token;
        expect(ts.series[title]).toEqual([1, 1, 1]);
        expect(ts.series[title]).toEqual(py![title]);
      }
    },
  );
});
