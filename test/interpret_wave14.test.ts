/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Wave 14 list-return + capstone synthesis vs Python Runtime.run.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

function makeBars(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const c = 100 + 8 * Math.sin(i * 0.37) + (i % 7) * 0.4;
    const o = c - 0.3 + (i % 3) * 0.1;
    return {
      open: o,
      high: Math.max(o, c) + 0.8 + (i % 5) * 0.15,
      low: Math.min(o, c) - 0.6 - (i % 4) * 0.1,
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
  const proc = Bun.spawn([PY, "-c", code], { stdin: "pipe", stdout: "pipe", stderr: "pipe" });
  proc.stdin.write(payload);
  proc.stdin.end();
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const codeExit = await proc.exited;
  if (codeExit !== 0) throw new Error(stderr || stdout || `python exit ${codeExit}`);
  return JSON.parse(stdout) as Record<string, { error: string | null; series: SeriesMap }>;
}

function expectMatch(actual: Array<number | null> | undefined, expected: Array<number | null>, label: string): void {
  if (actual == null) throw new Error(`${label}: missing series`);
  if (actual.length !== expected.length) throw new Error(`${label}: length ${actual.length} != ${expected.length}`);
  for (let i = 0; i < expected.length; i++) {
    const a = actual[i];
    const e = expected[i] ?? null;
    if (e == null) {
      if (a != null) throw new Error(`${label}[${i}] expected null, got ${a}`);
      continue;
    }
    if (a == null || Math.abs(a - e) > 1e-6) throw new Error(`${label}[${i}] expected ${e}, got ${a}`);
  }
}

function tsSeries(src: string, bars: ReturnType<typeof makeBars>): { error?: string; series: SeriesMap } {
  const out = new Runtime("TEST").run(src, bars, { mode: "interpret" });
  return { error: out.error, series: (out.series ?? {}) as SeriesMap };
}

const bars = makeBars(40);

const cases: Array<{ id: string; body: string }> = [
  {
    id: "gamma_scalar",
    body: `g = ta.gamma_levels(0.02, close[0], 10)
plot(array.get(g, 0), "hi")
plot(array.get(g, 1), "lo")`,
  },
  {
    id: "gamma_series",
    body: `g = ta.gamma_levels(0.02, close, 10)
plot(array.get(g, 0), "hi")
plot(array.get(g, 1), "lo")`,
  },
  {
    id: "synthesizer",
    body: `t = array.from(0.5, 0.6)
m = array.from(0.4, 0.5)
v = array.from(0.3, 0.4)
vol = array.from(0.5, 0.6)
x = ta.intelligent_strategy_synthesizer(t, m, v, vol, "trending_up", "balanced")
plot(x.composite_signal, "c")
plot(x.confidence_level, "f")
plot(x.risk_level, "r")
plot(x.expected_return, "e")
plot(x.regime_alignment, "a")
plot(x.stop_loss_priority, "sl")
plot(x.take_profit_priority, "tp")
plot(x.strategy_recommendation == "conservative_long" ? 1 : 0, "rec")
plot(x.holding_period == "swing" ? 1 : 0, "hold")`,
  },
  {
    id: "synthesizer_aggressive",
    body: `t = array.from(-0.8, -0.9)
m = array.from(-0.7, -0.8)
v = array.from(0.9, 0.95)
vol = array.from(0.8, 0.9)
x = ta.intelligent_strategy_synthesizer(t, m, v, vol, "volatile", "aggressive")
plot(x.composite_signal, "c")
plot(x.confidence_level, "f")
plot(x.risk_level, "r")
plot(x.regime_alignment, "a")
plot(x.strategy_recommendation == "aggressive_short" ? 1 : 0, "rec")
plot(x.holding_period == "scalp" ? 1 : 0, "hold")`,
  },
  {
    id: "signal_confluence",
    body: `b = ta.breakout_detection(close, close + 1, close - 1)
x = ta.signal_confluence(b)
plot(x.signal_count, "n")
plot(x.confluence_level, "c")
plot(x.primary_signal == "buy" ? 1 : 0, "b")`,
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
  for (const key of keys) expectMatch(ts.series[key], ref.series[key]!, `${id}.${key}`);
}

describe.skipIf(!pythonAvailable())("interpret wave14 vs Python Runtime.run", () => {
  beforeAll(async () => {
    Object.assign(py, await pythonRuns(cases.map((c) => ({ id: c.id, src: script(c.body), bars }))));
  });

  for (const c of cases) {
    test(`ta.${c.id}`, () => check(c.id, c.body));
  }
});

describe("compile wave14 vs interpret", () => {
  for (const c of cases) {
    test(`ta.${c.id}`, () => {
      const src = script(c.body);
      const compiled = new Runtime("TEST").run(src, bars, { mode: "compile" });
      const interpreted = new Runtime("TEST").run(src, bars, { mode: "interpret" });
      expect(compiled.error, c.id).toBeUndefined();
      expect(interpreted.error, c.id).toBeUndefined();
      expect(compiled.series).toEqual(interpreted.series);
    });
  }
});
