/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Wave 11 advanced / statistical ta.* surface vs Python Runtime.run.
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
  const proc = Bun.spawn([PY, "-c", code], { stdin: "pipe", stdout: "pipe", stderr: "pipe" });
  proc.stdin.write(payload);
  proc.stdin.end();
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const codeExit = await proc.exited;
  if (codeExit !== 0) {
    throw new Error(stderr || stdout || `python exit ${codeExit}`);
  }
  return JSON.parse(stdout) as Record<string, { error: string | null; series: SeriesMap }>;
}

function expectMatch(actual: Array<number | null> | undefined, expected: Array<number | null>, label: string): void {
  if (actual == null) throw new Error(`${label}: missing series`);
  if (actual.length !== expected.length) {
    throw new Error(`${label}: length ${actual.length} != ${expected.length}`);
  }
  for (let i = 0; i < expected.length; i++) {
    const a = actual[i];
    const e = expected[i] ?? null;
    if (e == null) {
      if (a != null) throw new Error(`${label}[${i}] expected null, got ${a}`);
      continue;
    }
    if (a == null || Math.abs(a - e) > 1e-6) {
      throw new Error(`${label}[${i}] expected ${e}, got ${a}`);
    }
  }
}

function tsSeries(src: string, bars: ReturnType<typeof makeBars>): { error?: string; series: SeriesMap } {
  const out = new Runtime("TEST").run(src, bars, { mode: "interpret" });
  return { error: out.error, series: (out.series ?? {}) as SeriesMap };
}

const bars = makeBars(40);

const cases: Array<{ id: string; body: string }> = [
  { id: "sma_weighted", body: `plot(ta.sma_weighted(close, 10), "lin")\nplot(ta.sma_weighted(close, 10, "quadratic"), "quad")\nplot(ta.sma_weighted(close, 10, "sqrt"), "sqrt")` },
  { id: "apo", body: `plot(ta.apo(close, 5, 10), "v")` },
  { id: "atr_normalized", body: `plot(ta.atr_normalized(high, low, close, 14), "v")` },
  { id: "beta", body: `plot(ta.beta(close, open, 10), "v")` },
  { id: "r_squared", body: `plot(ta.r_squared(close, open, 10), "v")` },
  { id: "comovement", body: `plot(ta.comovement(close, open, 10), "v")` },
  { id: "skewness", body: `plot(ta.skewness(close, 10), "v")` },
  { id: "kurtosis", body: `plot(ta.kurtosis(close, 10), "v")` },
  { id: "vwm", body: `plot(ta.volume_weighted_momentum(close, volume, 10), "v")` },
  { id: "parkinson", body: `plot(ta.parkinson(high, low), "v")` },
  { id: "parkinson_scalar", body: `plot(ta.parkinson(high[0], low[0]), "v")` },
  { id: "garman_klass", body: `plot(ta.garman_klass(high, low, close, open), "v")` },
  { id: "garman_klass_scalar", body: `plot(ta.garman_klass(high[0], low[0], close[0], open[0]), "v")` },
  {
    id: "mean_reversion",
    body: `plot(ta.mean_reversion_score(close, ta.sma(close, 10), ta.stdev(close, 10), 10), "v")`,
  },
  { id: "market_condition", body: `mc = ta.market_condition(close, ta.atr(14), 10, 10)\nplot(mc == "trending_up" ? 1 : mc == "trending_down" ? -1 : mc == "volatile" ? 2 : 0, "v")` },
  { id: "order_flow", body: `plot(ta.order_flow_imbalance(high, low, close, volume, 10), "v")` },
  { id: "liquidity", body: `plot(ta.liquidity_score(volume, ta.atr(14), high - low, 10), "v")` },
  { id: "fear_greed", body: `plot(ta.fear_greed_index(ta.rsi(close, 14), 2, 1, 0.5), "v")` },
  { id: "crowd", body: `plot(ta.crowd_sentiment(0.6, 0.5, 0.7), "v")` },
  { id: "smart_money", body: `plot(ta.smart_money_flow(close - close[1], volume, 5, 3), "v")` },
  {
    id: "trend_confirmation",
    body: `plot(ta.trend_confirmation_score(ta.mom(close, 5), 0.5, 0.8, ta.rsi(close, 14), 0.7, 0.2), "v")`,
  },
  { id: "max_loss", body: `plot(ta.max_loss_level(close, 10000, 2), "v")` },
  { id: "profit_lock", body: `plot(ta.profit_lock_level(close, close + 1, 0.1, 1), "v")` },
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
  for (const key of keys) {
    expectMatch(ts.series[key], ref.series[key]!, `${id}.${key}`);
  }
}

describe.skipIf(!pythonAvailable())("interpret wave11 vs Python Runtime.run", () => {
  beforeAll(async () => {
    const jobs = cases.map((c) => ({ id: c.id, src: script(c.body), bars }));
    Object.assign(py, await pythonRuns(jobs));
  });

  for (const c of cases) {
    test(`ta.${c.id}`, () => {
      check(c.id, c.body);
    });
  }
});

describe("compile wave11 vs interpret", () => {
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
