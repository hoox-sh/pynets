/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Wave 10a ta.* interpret plots vs Python Runtime.run (same bars).
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

function makeBars(n: number) {
  const bars = Array.from({ length: n }, (_, i) => {
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
  bars.push(
    {
      open: 100,
      high: 102.3,
      low: 90,
      close: 102,
      volume: 1500,
      time: n * 86_400_000,
    },
    {
      open: 100,
      high: 110,
      low: 90,
      close: 100.05,
      volume: 1600,
      time: (n + 1) * 86_400_000,
    },
    {
      open: 80,
      high: 80,
      low: 80,
      close: 80,
      volume: 10,
      time: (n + 2) * 86_400_000,
    },
  );
  return bars;
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
import json
from pynescript.runtime import Runtime
jobs = json.loads(${JSON.stringify(payload)})
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
  const proc = Bun.spawn([PY, "-c", code], { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const codeExit = await proc.exited;
  if (codeExit !== 0) {
    throw new Error(stderr || stdout || `python exit ${codeExit}`);
  }
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

function tsSeries(
  src: string,
  bars: ReturnType<typeof makeBars>,
): { error?: string; series: SeriesMap } {
  const out = new Runtime("TEST", { mode: "interpret" }).run(src, bars, {
    mode: "interpret",
  });
  const series = (out.series ?? {}) as SeriesMap;
  return { error: out.error, series };
}

const bars = makeBars(40);

async function parity(id: string, body: string, bare?: string): Promise<void> {
  const src = script(body);
  const py = await pythonRuns([{ id, src, bars }]);
  const ref = py[id];
  if (ref == null) throw new Error(`python missing ${id}`);
  expect(ref.error, id).toBeNull();
  const ts = tsSeries(src, bars);
  expect(ts.error, id).toBeUndefined();
  const keys = Object.keys(ref.series);
  expect(keys.length, id).toBeGreaterThan(0);
  for (const key of keys) {
    expectMatch(ts.series[key], ref.series[key]!, `${id}.${key}`);
  }
  if (bare != null) {
    const bareTs = tsSeries(script(bare), bars);
    expect(bareTs.error, `${id} bare`).toBeUndefined();
    for (const key of keys) {
      expectMatch(bareTs.series[key], ref.series[key]!, `${id}.bare.${key}`);
    }
  }
}

describe.skipIf(!pythonAvailable())(
  "interpret wave10a vs Python Runtime.run",
  () => {
    test("ta.hammer", async () => {
      await parity(
        "hammer",
        `h = ta.hammer(open, high, low, close)
plot(h.is_hammer, "hm")
plot(h.is_doji, "dj")
plot(h.pattern_strength, "hs")`,
        `h = hammer(open, high, low, close)
plot(h.is_hammer, "hm")
plot(h.is_doji, "dj")
plot(h.pattern_strength, "hs")`,
      );
    });

    test("ta.gap_detector", async () => {
      await parity(
        "gap",
        `g = ta.gap_detector(high, low, close[1])
plot(g.gap_size, "gs")
plot(g.gap_type, "gt")
plot(g.gap_percent, "gp")`,
        `g = gap_detector(high, low, close[1])
plot(g.gap_size, "gs")
plot(g.gap_type, "gt")
plot(g.gap_percent, "gp")`,
      );
    });

    test("ta.macd_signal", async () => {
      // close[0]/open[0] are scalars. Passing the PineSeries `close` makes
      // Python float() raise; ta.macd warmup is 0 there and na here, so this
      // test feeds both hosts the same numbers (na stays na).
      await parity(
        "macd",
        `plot(ta.macd_signal(close[0], open[0]), "d")
plot(ta.macd_signal(na, close[0]), "n1")
plot(ta.macd_signal(close[0], na), "n2")
plot(ta.macd_signal(true, 1), "b")
plot(ta.macd_signal(5, false), "bf")`,
        `plot(macd_signal(close[0], open[0]), "d")
plot(macd_signal(na, close[0]), "n1")
plot(macd_signal(close[0], na), "n2")
plot(macd_signal(true, 1), "b")
plot(macd_signal(5, false), "bf")`,
      );
    });

    test("ta.acceleration_factor", async () => {
      await parity(
        "accel",
        `plot(ta.acceleration_factor(close, 5), "af")
plot(ta.acceleration_factor(close, 5.9), "af59")
plot(ta.acceleration_factor(close, 1), "af1")
plot(ta.acceleration_factor(close, true), "afb")`,
        `plot(acceleration_factor(close, 5), "af")
plot(acceleration_factor(close, 5.9), "af59")
plot(acceleration_factor(close, 1), "af1")
plot(acceleration_factor(close, true), "afb")`,
      );
    });

    test("ta.stoch_smooth", async () => {
      await parity(
        "stoch",
        `plot(ta.stoch_smooth(high, low, close, 14, 1, 1), "ss")
plot(ta.stoch_smooth(high, low, close, 14, 3, 3), "wide")
plot(ta.stoch_smooth(high, low, close, 3.9, 1.0, 1.2), "fl")`,
        `plot(stoch_smooth(high, low, close, 14, 1, 1), "ss")
plot(stoch_smooth(high, low, close, 14, 3, 3), "wide")
plot(stoch_smooth(high, low, close, 3.9, 1.0, 1.2), "fl")`,
      );
    });

    test("ta.engulfing", async () => {
      await parity(
        "engulf",
        `e = ta.engulfing(open, high, low, close)
plot(e.is_bullish, "bull")
plot(e.is_bearish, "bear")
plot(e.pattern_strength, "str")`,
        `e = engulfing(open, high, low, close)
plot(e.is_bullish, "bull")
plot(e.is_bearish, "bear")
plot(e.pattern_strength, "str")`,
      );
    });

    test("ta.inside_bar_pattern", async () => {
      await parity(
        "inside",
        `plot(ta.inside_bar_pattern(high, low), "ib")`,
        `plot(inside_bar_pattern(high, low), "ib")`,
      );
    });

    test("ta.double_top_bottom", async () => {
      await parity(
        "double",
        `d = ta.double_top_bottom(high, low, 10)
plot(d.strength, "st")
plot(d.breakout_level, "bl")
plot(d.pattern_type, "pt")`,
        `d = double_top_bottom(high, low, 10)
plot(d.strength, "st")
plot(d.breakout_level, "bl")
plot(d.pattern_type, "pt")`,
      );
    });
  },
);
