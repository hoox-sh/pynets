/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Interpret plots for ta.* gaps vs Python Runtime.run (same bars).
 */
import { describe, expect, test } from "bun:test";
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
  const out = new Runtime("TEST").run(src, bars);
  const series = (out.series ?? {}) as SeriesMap;
  return { error: out.error, series };
}

const bars40 = makeBars(40);
const bars60 = makeBars(60);

const cases: Array<{ id: string; body: string; bare?: string; bars?: ReturnType<typeof makeBars> }> = [
  { id: "uo", body: `plot(ta.uo(7, 14, 28), "v")`, bare: `plot(uo(7, 14, 28), "v")` },
  { id: "dpo", body: `plot(ta.dpo(20), "v")`, bare: `plot(dpo(20), "v")` },
  { id: "kst", body: `plot(ta.kst(10, 15, 20, 30), "v")`, bare: `plot(kst(10, 15, 20, 30), "v")` },
  {
    id: "donchian",
    body: `dc = ta.donchian(20)
plot(dc.high, "high")
plot(dc.low, "low")
plot(dc.mid, "mid")`,
    bare: `dc = donchian(20)
plot(dc.high, "high")
plot(dc.low, "low")
plot(dc.mid, "mid")`,
  },
  {
    id: "stochrsi",
    body: `s = ta.stochrsi(14, 14)
plot(s.stochrsi, "stochrsi")
plot(s.signal, "signal")`,
    bare: `s = stochrsi(14, 14)
plot(s.stochrsi, "stochrsi")
plot(s.signal, "signal")`,
  },
  { id: "rci", body: `plot(ta.rci(close, 9), "v")`, bare: `plot(rci(close, 9), "v")` },
  {
    id: "ichimoku",
    bars: bars60,
    body: `i = ta.ichimoku(9, 26)
plot(i.tenkan_sen, "tenkan")
plot(i.kijun_sen, "kijun")
plot(i.senkou_span_a, "a")
plot(i.senkou_span_b, "b")`,
    bare: `i = ichimoku(9, 26)
plot(i.tenkan_sen, "tenkan")
plot(i.kijun_sen, "kijun")
plot(i.senkou_span_a, "a")
plot(i.senkou_span_b, "b")`,
  },
  { id: "bb_pct", body: `plot(ta.bb_pct(20, 2), "v")`, bare: `plot(bb_pct(20, 2), "v")` },
  { id: "emv", body: `plot(ta.emv(14), "v")`, bare: `plot(emv(14), "v")` },
  {
    id: "fractal",
    body: `f = ta.fractal(2)
plot(f.is_high_fractal, "hi")
plot(f.is_low_fractal, "lo")`,
    bare: `f = fractal(2)
plot(f.is_high_fractal, "hi")
plot(f.is_low_fractal, "lo")`,
  },
  {
    id: "atr_stop",
    body: `atr = ta.atr(14)
stops = ta.atr_stop(atr, 2.0)
plot(stops.long_stop, "ls")
plot(stops.short_stop, "ss")`,
    bare: `atr = ta.atr(14)
stops = atr_stop(atr, 2.0)
plot(stops.long_stop, "ls")
plot(stops.short_stop, "ss")`,
  },
  {
    id: "zigzag",
    body: `[h, l, d] = ta.zigzag(close, 5)
plot(h, "h")
plot(l, "l")
plot(d, "d")`,
    bare: `[h, l, d] = zigzag(close, 5)
plot(h, "h")
plot(l, "l")
plot(d, "d")`,
  },
  {
    id: "zigzag_tight",
    body: `[h, l, d] = ta.zigzag(close, 1)
plot(h, "h")
plot(l, "l")
plot(d, "d")`,
  },
];

describe.skipIf(!pythonAvailable())("interpret ta gap vs Python Runtime.run", () => {
  test("plotted series match", async () => {
    const jobs = cases.map((c) => ({
      id: c.id,
      src: script(c.body),
      bars: c.bars ?? bars40,
    }));
    const py = await pythonRuns(jobs);
    for (const c of cases) {
      const bars = c.bars ?? bars40;
      const ts = tsSeries(script(c.body), bars);
      const ref = py[c.id];
      if (ref == null) throw new Error(`python missing ${c.id}`);
      expect(ref.error, c.id).toBeNull();
      expect(ts.error, c.id).toBeUndefined();
      const keys = Object.keys(ref.series);
      expect(keys.length, c.id).toBeGreaterThan(0);
      for (const key of keys) {
        expectMatch(ts.series[key], ref.series[key]!, `${c.id}.${key}`);
      }
      if (c.bare) {
        const bare = tsSeries(script(c.bare), bars);
        expect(bare.error, `${c.id} bare`).toBeUndefined();
        for (const key of keys) {
          expectMatch(bare.series[key], ref.series[key]!, `${c.id}.bare.${key}`);
        }
      }
    }
  });

  test("ta.rci length < 2 is a runtime error", async () => {
    const src = script(`plot(ta.rci(close, 1), "v")`);
    const py = await pythonRuns([{ id: "rci1", src, bars: bars40 }]);
    const ts = tsSeries(src, bars40);
    expect(py.rci1?.error ?? "").toContain("ta.rci length must be at least 2");
    expect(ts.error ?? "").toContain("ta.rci length must be at least 2");
  });
});
