/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Interpret plots for wave10b ta.* vs Python Runtime.run (same bars).
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
  const out = new Runtime("TEST").run(src, bars, { mode: "interpret" });
  const series = (out.series ?? {}) as SeriesMap;
  return { error: out.error, series };
}

const bars = makeBars(40);

const cases: Array<{ id: string; body: string; bare: string }> = [
  {
    id: "voi",
    body: `b = volume
s = volume * 0.4
plot(ta.voi(b, s), "v")`,
    bare: `b = volume
s = volume * 0.4
plot(voi(b, s), "v")`,
  },
  {
    id: "bid_ask",
    body: `b = volume
a = volume * 0.4
bp = close
ap = open
x = ta.bid_ask_imbalance(b, a, bp, ap)
plot(x.imbalance_ratio, "ir")
plot(x.spread, "sp")`,
    bare: `b = volume
a = volume * 0.4
bp = close
ap = open
x = bid_ask_imbalance(b, a, bp, ap)
plot(x.imbalance_ratio, "ir")
plot(x.spread, "sp")`,
  },
  {
    id: "rsi_oo",
    body: `rsi = ta.rsi(close, 14)
s = ta.rsi_oversold_overbought(rsi, 40, 60)
plot(s.is_oversold, "os")
plot(s.is_overbought, "ob")
plot(s.rsi, "rsi")`,
    bare: `rsi = ta.rsi(close, 14)
s = rsi_oversold_overbought(rsi, 40, 60)
plot(s.is_oversold, "os")
plot(s.is_overbought, "ob")
plot(s.rsi, "rsi")`,
  },
  {
    id: "rsi_div",
    body: `r = array.from(30.0, 40.0, 35.0, 50.0, 45.0, 60.0, 55.0)
plot(ta.rsi_divergence(r, 3), "v")`,
    bare: `r = array.from(30.0, 40.0, 35.0, 50.0, 45.0, 60.0, 55.0)
plot(rsi_divergence(r, 3), "v")`,
  },
  {
    id: "cum_delta",
    body: `plot(ta.cumulative_delta(close, volume, 5), "v")`,
    bare: `plot(cumulative_delta(close, volume, 5), "v")`,
  },
  {
    id: "vol_mom",
    body: `plot(ta.volume_momentum(volume, 5), "v")`,
    bare: `plot(volume_momentum(volume, 5), "v")`,
  },
  {
    id: "vph",
    // Snapshot so Python sees numbers. Raw close/volume is a PineSeries and stays 0.
    body: `p = close
v = volume
plot(ta.volume_profile_high(p, v), "bar")
a = array.from(101.0, 102.0, 103.0)
b = array.from(10.0, 50.0, 20.0)
plot(ta.volume_profile_high(a, b), "arr")`,
    bare: `p = close
v = volume
plot(volume_profile_high(p, v), "bar")
a = array.from(101.0, 102.0, 103.0)
b = array.from(10.0, 50.0, 20.0)
plot(volume_profile_high(a, b), "arr")`,
  },
  {
    id: "vpl",
    body: `plot(ta.volume_profile_low(close, volume, 10, 4), "v")`,
    bare: `plot(volume_profile_low(close, volume, 10, 4), "v")`,
  },
  {
    id: "thrust",
    body: `sm = volume * 0.1
x = sm[1]
plot(ta.volume_thrust(close, volume, sm, 0.3), "v")`,
    bare: `sm = volume * 0.1
x = sm[1]
plot(volume_thrust(close, volume, sm, 0.3), "v")`,
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
  for (const key of keys) {
    const series = ref.series[key] ?? [];
    expect(
      series.some((v) => v != null),
      `${id}.${key} all na`,
    ).toBe(true);
    expectMatch(ts.series[key], series, `${id}.${key}`);
  }
}

describe.skipIf(!pythonAvailable())(
  "interpret wave10b vs Python Runtime.run",
  () => {
    beforeAll(async () => {
      const jobs = cases.flatMap((c) => [
        { id: c.id, src: script(c.body), bars },
        { id: `${c.id}_bare`, src: script(c.bare), bars },
      ]);
      const out = await pythonRuns(jobs);
      Object.assign(py, out);
    });

    test("ta.voi", () => {
      check("voi", cases[0]!.body);
      check("voi_bare", cases[0]!.bare);
    });

    test("ta.bid_ask_imbalance", () => {
      check("bid_ask", cases[1]!.body);
      check("bid_ask_bare", cases[1]!.bare);
    });

    test("ta.rsi_oversold_overbought", () => {
      check("rsi_oo", cases[2]!.body);
      check("rsi_oo_bare", cases[2]!.bare);
    });

    test("ta.rsi_divergence", () => {
      check("rsi_div", cases[3]!.body);
      check("rsi_div_bare", cases[3]!.bare);
    });

    test("ta.cumulative_delta", () => {
      check("cum_delta", cases[4]!.body);
      check("cum_delta_bare", cases[4]!.bare);
    });

    test("ta.volume_momentum", () => {
      check("vol_mom", cases[5]!.body);
      check("vol_mom_bare", cases[5]!.bare);
    });

    test("ta.volume_profile_high", () => {
      check("vph", cases[6]!.body);
      check("vph_bare", cases[6]!.bare);
    });

    test("ta.volume_profile_low", () => {
      check("vpl", cases[7]!.body);
      check("vpl_bare", cases[7]!.bare);
    });

    test("ta.volume_thrust", () => {
      check("thrust", cases[8]!.body);
      check("thrust_bare", cases[8]!.bare);
    });
  },
);
