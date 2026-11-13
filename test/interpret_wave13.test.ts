/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Wave 13 history / sentiment / macro analytics vs Python Runtime.run.
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
    id: "ema_cross",
    body: `e = ta.ema_cross_signal(ta.ema(close, 5), ta.ema(close, 10), 0.1)
plot(e.signal == "buy" ? 1 : e.signal == "sell" ? -1 : 0, "sig")
plot(e.strength, "st")
plot(e.trend_direction, "td")`,
  },
  {
    id: "momentum_filter",
    body: `plot(ta.momentum_filter(ta.mom(close, 5), volume, 10), "v")`,
  },
  {
    id: "volatility_regime",
    body: `r = ta.volatility_regime(ta.atr(14), 10)
plot(r == "low" ? 1 : r == "high" ? 2 : r == "extreme" ? 3 : 0, "v")`,
  },
  {
    id: "economic_impact",
    body: `plot(ta.economic_impact_score(close - close[1], ta.atr(14), volume - 1000), "v")`,
  },
  {
    id: "contrarian",
    body: `x = ta.contrarian_signal(ta.rsi(close, 14), ta.atr(14), 3)
plot(x.strength, "s")
plot(x.confidence, "c")
plot(x.signal == "neutral" ? 0 : 1, "n")`,
  },
  {
    id: "drawdown",
    body: `x = ta.drawdown_recovery_level(close, close - 5, 1, 10)
plot(x.percent_needed, "p")
plot(x.estimated_time, "t")
plot(x.drawdown_percent, "d")`,
  },
  {
    id: "pivot_levels",
    body: `x = ta.pivot_point_levels(high[0], low[0], close[0])
plot(x.pivot, "p")
plot(x.r1, "r1")
plot(x.s1, "s1")
plot(x.r2, "r2")
plot(x.s2, "s2")
plot(x.r3, "r3")
plot(x.s3, "s3")`,
  },
  {
    id: "vol_regime_score",
    body: `a = array.from(2.0, 3.0)
v = array.from(0.02, 0.03)
vix = array.from(15.0, 20.0)
x = ta.volatility_regime_score(a, v, vix, 50)
plot(x.volatility_score, "s")
plot(x.regime == "normal" ? 0 : 1, "r")
plot(x.momentum == "stable" ? 0 : 1, "m")`,
  },
  {
    id: "correlation",
    body: `s1 = array.from(1.0, -1.0)
s2 = array.from(1.0, 1.0)
s3 = array.from(-1.0, 1.0)
x = ta.correlation_filter(s1, s2, s3, 3, 0.7)
plot(x.signal_agreement, "a")
plot(x.divergence_count, "d")
plot(x.is_correlated, "c")`,
  },
  {
    id: "adv_breakout",
    body: `x = ta.advanced_breakout_detector(close, volume, close[10], 10, 0.5)
plot(x.breakout_detected, "b")
plot(x.pullback_probability, "p")
plot(x.breakout_type == "none" ? 0 : 1, "t")`,
  },
  {
    id: "pullback",
    body: `x = ta.pullback_bounce_level(high, low, close, 1, 10)
plot(x.primary_level, "l")
plot(x.bounce_probability, "b")
plot(x.support_strength, "s")`,
  },
  {
    id: "divergence",
    body: `x = ta.divergence_detector(close, ta.rsi(close, 14), 10)
plot(x.is_bullish, "b")
plot(x.is_bearish, "r")
plot(x.strength, "s")`,
  },
  {
    id: "momentum_div",
    body: `price = array.from(100.0, 90.0)
pf = array.from(1.0, 2.0)
ps = array.from(1.0, 2.0)
x = ta.momentum_divergence(price, pf, ps)
plot(x.strength, "s")
plot(x.bars_since, "b")
plot(x.divergence_type == "none" ? 0 : 1, "t")`,
  },
  {
    id: "spread",
    body: `bid = array.from(99.0, 100.0)
ask = array.from(101.0, 102.0)
x = ta.spread_analysis(bid, ask, 2)
plot(x.avg_spread, "a")
plot(x.spread_percent, "p")
plot(x.spread_trend == "stable" ? 0 : 1, "t")`,
  },
  {
    id: "employment",
    body: `cyc = array.from(100.0, 110.0)
def = array.from(100.0, 105.0)
unemp = array.from(0.03, 0.05)
r = ta.employment_cycle_indicator(cyc, def, unemp)
plot(r == "early_cycle" ? 1 : r == "mid_cycle" ? 2 : r == "late_cycle" ? 3 : 4, "v")`,
  },
  {
    id: "gdp",
    body: `breadth = array.from(0.5, 0.6)
vol = array.from(1000.0, 1200.0)
mom = array.from(10.0, 20.0)
plot(ta.gdp_growth_proxy(breadth, vol, mom), "v")`,
  },
  {
    id: "inflation",
    body: `usd = array.from(100.0, 95.0)
comm = array.from(100.0, 110.0)
yields = array.from(1.0, 1.2)
plot(ta.inflation_proxy_indicator(usd, comm, yields), "v")`,
  },
  {
    id: "expected_value",
    body: `a = array.from(0.1, 0.2, 0.3)
b = array.from(0.5, 0.3, 0.2)
plot(ta.expected_value(a, b), "v")`,
  },
  {
    id: "msp",
    body: `x = ta.market_structure_pivot(high, low, close, 5, 5)
plot(x.pivot_price, "p")
plot(x.strength, "s")
plot(x.structure == "neutral" ? 0 : 1, "t")`,
  },
  {
    id: "oez",
    body: `x = ta.optimal_entry_zone(high, low, close, 10)
plot(x.min, "lo")
plot(x.max, "hi")
plot(x.optimal, "o")`,
  },
  {
    id: "mre",
    body: `x = ta.mean_reversion_entry(close, close, close, 10, 1.5)
plot(x.z_score, "z")
plot(x.is_mean_reversion_setup, "s")`,
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
  "interpret wave13 vs Python Runtime.run",
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

describe("compile wave13 vs interpret", () => {
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
