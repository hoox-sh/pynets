/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Multi-tick realtime windows vs Python Runtime.run: varip re-init,
 * var/once/TA/broker/container rollback, barstate flags, window resolution.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { Runtime, resolveRealtimeWindow } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

function makeBars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    open: 100,
    high: 101,
    low: 99,
    close: 100 + i,
    volume: 1,
    time: i * 60_000,
  }));
}

type SeriesMap = Record<string, Array<number | null>>;

interface RtOpts {
  realtime_last_bar?: boolean;
  realtime_ticks?: number;
  realtime_bars?: number;
  realtime_from_bar?: number;
}

function tsOpts(o: RtOpts) {
  return {
    realtimeLastBar: o.realtime_last_bar,
    realtimeTicks: o.realtime_ticks,
    realtimeBars: o.realtime_bars,
    realtimeFromBar: o.realtime_from_bar,
  };
}

function script(body: string): string {
  return `indicator("t")\n${body}`;
}

const bars = makeBars(4);

const cases: Array<{ id: string; body: string; opts: RtOpts }> = [
  {
    id: "varip_historical",
    body: `varip n = 0\nn := n + 1\nplot(n, "n")`,
    opts: {},
  },
  {
    id: "varip_ticks3",
    body: `varip n = 0\nn := n + 1\nplot(n, "n")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "varip_window2",
    body: `varip n = 0\nn := n + 1\nplot(n, "n")\nplot(barstate.isrealtime, "rt")`,
    opts: { realtime_bars: 2, realtime_ticks: 2 },
  },
  {
    id: "varip_from_bar1",
    body: `varip n = 0\nn := n + 1\nplot(n, "n")\nplot(barstate.isrealtime, "rt")`,
    opts: { realtime_from_bar: 1, realtime_ticks: 2 },
  },
  {
    id: "var_rollback",
    body: `var m = 0\nm := m + 1\nplot(m, "m")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "once_rollback",
    body: `var m = 0\nonce\n    m := m + 1\nplot(m, "m")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "ta_rollback",
    body: `plot(ta.sma(close, 3), "s")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "flags_ticks3",
    body: `plot(barstate.isnew, "nw")\nplot(barstate.isconfirmed, "cf")\nplot(barstate.isrealtime, "rt")\nplot(barstate.ishistory, "h")\nplot(barstate.islastconfirmedhistory, "lch")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "udf_var_rollback",
    body: `f() =>\n    var x = 0\n    x := x + 1\n    x\nplot(f(), "v")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "array_contents_rollback",
    body: `var a = array.from(0)\narray.push(a, bar_index)\nplot(array.size(a), "n")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "strategy_rt_entry",
    body: `strategy("s")\nif barstate.isrealtime\n    strategy.entry("L", strategy.long)\nplot(strategy.position_size, "pos")`,
    opts: { realtime_last_bar: true, realtime_ticks: 3 },
  },
  {
    id: "single_tick_rt",
    body: `varip n = 0\nn := n + 1\nplot(n, "n")\nplot(barstate.isrealtime, "rt")\nplot(barstate.ishistory, "h")`,
    opts: { realtime_last_bar: true },
  },
];

const py: Record<string, { error: string | null; series: SeriesMap }> = {};

async function pythonRuns(): Promise<
  Record<string, { error: string | null; series: SeriesMap }>
> {
  const jobs = cases.map((c) => ({
    id: c.id,
    src: script(c.body),
    bars,
    opts: c.opts,
  }));
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
        if fv != fv or fv in (float("inf"), float("-inf")):
            return None
        return fv
    return None
out = {}
for job in jobs:
    r = Runtime("TEST").run(job["src"], job["bars"], mode="interpret", **job["opts"])
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
    env: { ...process.env, PYTHONPATH: "/home/jango/Git/pynescript/src" },
  });
  proc.stdin.write(JSON.stringify(jobs));
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
    if (a == null || Math.abs(a - e) > 1e-9) {
      throw new Error(`${label}[${i}] expected ${e}, got ${a}`);
    }
  }
}

describe.skipIf(!pythonAvailable())(
  "realtime ticks vs Python Runtime.run",
  () => {
    beforeAll(async () => {
      Object.assign(py, await pythonRuns());
    });

    for (const c of cases) {
      test(`rt.${c.id}`, () => {
        const out = new Runtime("TEST").run(script(c.body), bars, {
          mode: "interpret",
          ...tsOpts(c.opts),
        });
        expect(out.error, c.id).toBeUndefined();
        const ref = py[c.id]!;
        expect(ref.error, c.id).toBeNull();
        for (const key of Object.keys(ref.series)) {
          expectMatch(out.series[key], ref.series[key]!, `${c.id}.${key}`);
        }
      });
    }
  },
);

describe("realtime tick unit semantics", () => {
  test("alert freq fires per tick like Python", () => {
    const bars3 = makeBars(3);
    const counts: Record<string, number> = {};
    for (const freq of ["all", "once_per_bar", "once_per_bar_close"]) {
      const out = new Runtime("TEST").run(
        script(`alert("tick", alert.freq_${freq})\nplot(close)`),
        bars3,
        { mode: "interpret", realtimeLastBar: true, realtimeTicks: 3 },
      );
      counts[freq] = (out.drawings ?? []).filter(
        (d) => d.kind === "alert",
      ).length;
    }
    // Python: all → 3 history + 3 ticks; once_per_bar → one per bar;
    // once_per_bar_close → final tick of the last bar only counts once.
    expect(counts.all).toBe(5);
    expect(counts.once_per_bar).toBe(3);
    expect(counts.once_per_bar_close).toBe(3);
  });

  test("resolveRealtimeWindow precedence matches Python _resolve_realtime_first", () => {
    expect(resolveRealtimeWindow(4, {})).toEqual({ first: null, ticks: 1 });
    expect(resolveRealtimeWindow(4, { realtimeTicks: 3 })).toEqual({
      first: 3,
      ticks: 3,
    });
    expect(resolveRealtimeWindow(4, { realtimeLastBar: true })).toEqual({
      first: 3,
      ticks: 1,
    });
    expect(resolveRealtimeWindow(4, { realtimeBars: 2 })).toEqual({
      first: 2,
      ticks: 1,
    });
    expect(resolveRealtimeWindow(4, { realtimeBars: 10 })).toEqual({
      first: 0,
      ticks: 1,
    });
    expect(resolveRealtimeWindow(4, { realtimeFromBar: 1 })).toEqual({
      first: 1,
      ticks: 1,
    });
    expect(resolveRealtimeWindow(4, { realtimeFromBar: 9 })).toEqual({
      first: null,
      ticks: 1,
    });
    // from_bar wins over bars/last-bar flags
    expect(
      resolveRealtimeWindow(4, {
        realtimeFromBar: 2,
        realtimeBars: 3,
        realtimeTicks: 2,
      }),
    ).toEqual({
      first: 2,
      ticks: 2,
    });
    expect(resolveRealtimeWindow(0, { realtimeLastBar: true })).toEqual({
      first: null,
      ticks: 1,
    });
  });
});
