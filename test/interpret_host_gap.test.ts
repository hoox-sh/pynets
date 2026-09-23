/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar } from "../src/index.ts";

const PY = "/home/jango/Git/pynescript/.venv/bin/python";

type PyAlert = { message?: string; bar_index?: number; source?: string; title?: string };
type PyOut = {
  plots: Array<number | null>;
  series: Record<string, Array<number | null>>;
  alerts: PyAlert[];
};

function pythonRun(src: string, bars: OHLCVBar[], symbol = "TEST"): PyOut {
  const payload = JSON.stringify({ src, bars, symbol });
  const proc = Bun.spawnSync(
    [
      PY,
      "-c",
      `import json
from pynescript.runtime import Runtime
req = json.loads(${JSON.stringify(payload)})
out = Runtime(req["symbol"]).run(req["src"], req["bars"], mode="interpret")
err = out.get("error")
if err:
    raise SystemExit(str(err))
print(json.dumps({
    "plots": out.get("plots"),
    "series": out.get("series"),
    "alerts": out.get("alerts") or [],
}))`,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (proc.exitCode !== 0) {
    throw new Error(proc.stderr.toString() || proc.stdout.toString());
  }
  return JSON.parse(proc.stdout.toString()) as PyOut;
}

function nums(values: Array<number | null> | undefined): Array<number | null> {
  return (values ?? []).map((v) => (typeof v === "number" ? v : null));
}

function matchPython(src: string, bars: OHLCVBar[], symbol = "TEST"): PyOut {
  const py = pythonRun(src, bars, symbol);
  const out = new Runtime(symbol).run(src, bars, { mode: "interpret" });
  expect(out.error).toBeUndefined();
  expect(nums(out.plots)).toEqual(nums(py.plots));
  for (const [key, series] of Object.entries(py.series)) {
    if (key.endsWith(".open") || key.endsWith(".high") || key.endsWith(".low")) continue;
    expect(nums(out.series[key])).toEqual(nums(series));
  }
  return py;
}

function alertEvents(out: {
  drawings?: Array<{ kind?: string; bar?: number; text?: string; extra?: Record<string, unknown> }>;
}) {
  return (out.drawings ?? []).filter((d) => d.kind === "alert");
}

const T0 = 1_704_067_200_000;
const MIN = 60_000;
const BARS: OHLCVBar[] = [0, 1, 2].map((i) => ({
  time: T0 + i * MIN,
  open: 1,
  high: 3,
  low: 0.5,
  close: i + 1,
  volume: 10,
}));

describe("interpret host gaps", () => {
  test("timenow is last bar time (bare name and call)", () => {
    const src = `//@version=5
indicator("t")
plot(timenow, "tn")
plot(timenow(), "tn2")
plot(last_bar_time, "lbt")`;
    const py = matchPython(src, BARS);
    const last = T0 + 2 * MIN;
    expect(nums(py.series.tn)).toEqual([last, last, last]);
    expect(nums(py.series.tn2)).toEqual([last, last, last]);
  });

  test("max_bars_back does not change close", () => {
    matchPython(
      `//@version=5
indicator("t")
max_bars_back(close, 50)
plot(close, "c")`,
      BARS,
    );
  });

  test("plot.linestyle_* strings match Python", () => {
    matchPython(
      `//@version=5
indicator("t")
plot(plot.linestyle_solid == "linestyle_solid" ? 1 : 0, "s")
plot(plot.linestyle_dashed == "linestyle_dashed" ? 1 : 0, "d")
plot(plot.linestyle_dotted == "linestyle_dotted" ? 1 : 0, "t")`,
      BARS,
    );
  });

  test("alertcondition fires on the same bars as Python", () => {
    const src = `//@version=5
indicator("t")
alertcondition(close > 1, "title", "msg")
plot(close, "c")`;
    const py = matchPython(src, BARS);
    const out = new Runtime("TEST").run(src, BARS, { mode: "interpret" });
    const alerts = alertEvents(out);
    expect(alerts.length).toBe(py.alerts.length);
    expect(alerts.map((a) => a.bar)).toEqual(py.alerts.map((a) => a.bar_index));
    expect(alerts.every((a) => a.text === "msg")).toBe(true);
    expect(alerts.every((a) => a.extra?.source === "alertcondition")).toBe(true);
  });

  test("alertcondition(true) fires once per bar", () => {
    const src = `//@version=5
indicator("t")
alertcondition(true, "always", "fire")
plot(1)`;
    const py = pythonRun(src, BARS);
    const out = new Runtime("TEST").run(src, BARS, { mode: "interpret" });
    expect(out.error).toBeUndefined();
    expect(alertEvents(out).length).toBe(py.alerts.length);
    expect(py.alerts.length).toBe(BARS.length);
  });

  test("bare random matches math.random na / arity rules", () => {
    matchPython(
      `//@version=5
indicator("t")
plot(na(random()) ? 1 : 0, "na0")
plot(random(0, 0), "z")
plot(na(random(na)) ? 1 : 0, "nana")
plot(na(random(na, 1)) ? 1 : 0, "nana2")`,
      BARS,
    );
    const ranged = new Runtime("TEST").run(
      `//@version=5
indicator("t")
plot(random(2, 5))`,
      BARS,
      { mode: "interpret" },
    );
    expect(ranged.error).toBeUndefined();
    for (const v of ranged.plots) {
      expect(typeof v).toBe("number");
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  test("bare security aliases request.security same-symbol passthrough", () => {
    matchPython(
      `//@version=5
indicator("t")
plot(security("TEST", "", close), "s")`,
      BARS,
    );
  });
});
