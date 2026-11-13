/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile emit for plot.style_* / alert.freq_* dotted constants.
 * Interpret on this HEAD does not have these keys yet — do not compare backends.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import {
  PYNE_ROOT,
  pythonAvailable,
  pythonBin,
} from "./helpers/python_runtime.ts";

const BARS = [1, 2, 3].map((close) => ({ close }));
const ONES = [1, 1, 1];

const PLOT_STYLES: Array<[string, string]> = [
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
];

const ALERT_FREQS: Array<[string, string]> = [
  ["alert.freq_once_per_bar", "once_per_bar"],
  ["alert.freq_once_per_bar_close", "once_per_bar_close"],
  ["alert.freq_all", "all"],
];

function eqSrc(name: string, literal: string): string {
  return `indicator("t")\nplot(${name} == "${literal}" ? 1 : 0)`;
}

function runCompile(src: string) {
  return new Runtime("TEST").run(src, BARS, { mode: "compile" });
}

function compileEq(name: string, literal: string): Array<number | null> {
  const out = runCompile(eqSrc(name, literal));
  expect(out.error).toBeUndefined();
  expect(out.mode).toBe("compile");
  return out.plots!;
}

describe("compile plot.style_* and alert.freq_*", () => {
  test('plot(plot.style_line == "style_line" ? 1 : 0) is 1 on every bar', () => {
    expect(compileEq("plot.style_line", "style_line")).toEqual(ONES);
  });

  test("plot.style_* strings are 1 on every bar", () => {
    for (const [name, lit] of PLOT_STYLES) {
      expect(compileEq(name, lit)).toEqual(ONES);
    }
  });

  test("alert.freq_* strings are 1 on every bar", () => {
    for (const [name, lit] of ALERT_FREQS) {
      expect(compileEq(name, lit)).toEqual(ONES);
    }
  });

  test("unknown plot.* / alert.* members stay na", () => {
    const src = `indicator("t")
plot(na(plot.nope) ? 1 : 0, "p")
plot(na(alert.nope) ? 1 : 0, "a")`;
    const out = runCompile(src);
    expect(out.error).toBeUndefined();
    expect(out.mode).toBe("compile");
    expect(out.series.p).toEqual(ONES);
    expect(out.series.a).toEqual(ONES);
  });
});

describe.skipIf(!pythonAvailable())(
  "compile plot.style_* / alert.freq_* vs Python",
  () => {
    const TOKENS = [...PLOT_STYLES, ...ALERT_FREQS];

    function pythonPlotsBatch(): Array<Array<number | null>> | null {
      const jobs = TOKENS.map(([name, lit]) => eqSrc(name, lit));
      try {
        const proc = Bun.spawnSync(
          [
            pythonBin(),
            "-c",
            `from pynescript.runtime import Runtime
import json
jobs = ${JSON.stringify(jobs)}
bars = ${JSON.stringify(BARS)}
rt = Runtime("TEST")
out = []
for src in jobs:
    r = rt.run(src, bars)
    err = r.get("error") if isinstance(r, dict) else getattr(r, "error", None)
    if err:
        raise SystemExit(str(err))
    out.append(r.get("plots") if isinstance(r, dict) else list(r.plots))
print(json.dumps(out))`,
          ],
          { cwd: PYNE_ROOT, stdout: "pipe", stderr: "pipe" },
        );
        if (proc.exitCode !== 0) return null;
        const parsed = JSON.parse(proc.stdout.toString().trim());
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }

    test("compile plots match Python for each plot.style_* / alert.freq_* token", () => {
      const pyAll = pythonPlotsBatch();
      expect(pyAll).not.toBeNull();
      expect(pyAll!.length).toBe(TOKENS.length);
      for (let i = 0; i < TOKENS.length; i++) {
        const [name, lit] = TOKENS[i]!;
        expect(pyAll![i]).toEqual(ONES);
        expect(compileEq(name, lit)).toEqual(pyAll![i]!);
      }
    });
  },
);
