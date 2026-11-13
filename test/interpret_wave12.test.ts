/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Wave 12 risk / sizing / timing analytics vs Python Runtime.run.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

function makeBars(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const c = 100 + 8 * Math.sin(i * 0.37) + (i % 7) * 0.4;
    const o = c - 0.3 + (i % 3) * 0.1;
    const high = Math.max(o, c) + 0.8 + (i % 5) * 0.15;
    const low = Math.min(o, c) - 0.6 - (i % 4) * 0.1;
    return {
      open: o,
      high,
      low,
      close: c,
      volume: 1000 + ((i * 37) % 500),
      time: i * 86_400_000,
    };
  });
}

type SeriesMap = Record<string, Array<number | null>>;

function script(body: string): string {
  return `indicator("t")\n${body}`;
}

async function pythonRuns(
  jobs: Array<{ id: string; src: string; bars: ReturnType<typeof makeBars> }>,
): Promise<Record<string, { error: string | null; series: SeriesMap }>> {
  const payload = JSON.stringify(jobs);
  const code = `
import json, sys
from pynescript.runtime import Runtime
jobs = json.load(sys.stdin)
def cell(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return 1 if v else 0
    if isinstance(v, (int, float)):
        fv = float(v)
        if fv != fv or fv == float("inf") or fv == float("-inf"):
            return None
        return fv
    return None
out = {}
for job in jobs:
    r = Runtime("TEST").run(job["src"], job["bars"], mode="interpret")
    series = r.get("series") or {}
    out[job["id"]] = {
        "error": r.get("error"),
        "series": {k: [cell(v) for v in vals] for k, vals in series.items()},
    }
print(json.dumps(out))
`;
  const proc = Bun.spawn([PY, "-c", code], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  proc.stdin.write(payload);
  proc.stdin.end();
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const codeExit = await proc.exited;
  if (codeExit !== 0)
    throw new Error(stderr || stdout || `python exit ${codeExit}`);
  return JSON.parse(stdout) as Record<
    string,
    { error: string | null; series: SeriesMap }
  >;
}

function expectMatch(
  actual: Array<number | null> | undefined,
  expected: Array<number | null>,
  label: string,
): void {
  if (actual == null) throw new Error(`${label}: missing series`);
  if (actual.length !== expected.length)
    throw new Error(`${label}: length ${actual.length} != ${expected.length}`);
  for (let i = 0; i < expected.length; i++) {
    const a = actual[i];
    const e = expected[i] ?? null;
    if (e == null) {
      if (a != null) throw new Error(`${label}[${i}] expected null, got ${a}`);
      continue;
    }
    if (a == null || Math.abs(a - e) > 1e-6)
      throw new Error(`${label}[${i}] expected ${e}, got ${a}`);
  }
}

function tsSeries(
  src: string,
  bars: ReturnType<typeof makeBars>,
): { error?: string; series: SeriesMap } {
  const out = new Runtime("TEST").run(src, bars, { mode: "interpret" });
  return { error: out.error, series: (out.series ?? {}) as SeriesMap };
}

const bars = makeBars(40);

const cases: Array<{ id: string; body: string }> = [
  {
    id: "position_sizing",
    body: `plot(ta.position_sizing(10000, 2, 100, 95), "v")`,
  },
  { id: "kelly", body: `plot(ta.kelly_criterion(0.6, 2, 1), "v")` },
  { id: "rr_ratio", body: `plot(ta.risk_reward_ratio(100, 95, 110), "v")` },
  {
    id: "rr_asym",
    body: `x = ta.risk_reward_asymmetry(100, 95, 110, 0.6)\nplot(x.ratio, "r")\nplot(x.expected_value, "ev")\nplot(x.kelly_percent, "k")\nplot(x.is_favorable, "f")`,
  },
  {
    id: "trend_strength",
    body: `plot(ta.trend_strength(close, ta.adx(14), ta.rsi(close, 14)), "v")`,
  },
  {
    id: "breakeven",
    body: `x = ta.breakeven_level(100, 10, 5, 0.5, 1)\nplot(x.breakeven_price, "b")\nplot(x.total_cost, "c")\nplot(x.move_required_percent, "m")`,
  },
  {
    id: "pss",
    body: `x = ta.position_sizing_score(2, 0.5, 0.8, 0.3)\nplot(x.score, "s")\nplot(x.position_size_ratio, "r")\nplot(x.kelly_fraction, "k")\nplot(x.correlation_adjustment, "c")`,
  },
  {
    id: "trail_exit",
    body: `x = ta.trailing_exit_level(100, 105, 10, 1, 1.5)\nplot(x.trail_stop, "t")\nplot(x.protected_profit, "p")\nplot(x.risk_reward_current, "r")`,
  },
  {
    id: "mti",
    body: `x = ta.market_timing_index(70, 60, 50, 80)\nplot(x.score, "s")\nplot(x.timing_index, "t")\nplot(x.confidence, "c")\nplot(x.regime == "trending" ? 1 : 0, "r")`,
  },
  {
    id: "ras",
    body: `x = ta.regime_adaptive_signal(0.8, "high", "trending", 10)\nplot(x.strength, "s")\nplot(x.confidence, "c")\nplot(x.regime_fit, "f")\nplot(x.signal == "buy" ? 1 : 0, "b")`,
  },
  {
    id: "strategy_score",
    body: `plot(ta.strategy_score(ta.rsi(close, 14), 0.02, true, 60), "v")`,
  },
];

const py: Record<string, { error: string | null; series: SeriesMap }> = {};

function check(id: string, body: string): void {
  const src = script(body);
  const ts = tsSeries(src, bars);
  const ref = py[id];
  if (ref == null) throw new Error(`python missing ${id}`);
  expect(ref.error, id).toBeNull();
  expect(ts.error, id).toBeUndefined();
  const keys = Object.keys(ref.series);
  expect(keys.length, id).toBeGreaterThan(0);
  for (const key of keys)
    expectMatch(ts.series[key], ref.series[key]!, `${id}.${key}`);
}

describe.skipIf(!pythonAvailable())(
  "interpret wave12 vs Python Runtime.run",
  () => {
    beforeAll(async () => {
      Object.assign(
        py,
        await pythonRuns(
          cases.map((c) => ({ id: c.id, src: script(c.body), bars })),
        ),
      );
    });

    for (const c of cases) {
      test(`ta.${c.id}`, () => check(c.id, c.body));
    }
  },
);

describe("compile wave12 vs interpret", () => {
  for (const c of cases) {
    test(`ta.${c.id}`, () => {
      const src = script(c.body);
      const compiled = new Runtime("TEST").run(src, bars, { mode: "compile" });
      const interpreted = new Runtime("TEST").run(src, bars, {
        mode: "interpret",
      });
      expect(compiled.error, c.id).toBeUndefined();
      expect(interpreted.error, c.id).toBeUndefined();
      expect(compiled.series).toEqual(interpreted.series);
    });
  }
});
