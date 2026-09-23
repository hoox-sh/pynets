/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

type PyOut = { plots: Array<number | null>; series: Record<string, Array<number | null>> };

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
print(json.dumps({"plots": out.get("plots"), "series": out.get("series")}))`,
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

/** Compare titled series (skip plotcandle/plotbar OHLC siblings Python stores beside close). */
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

const T0 = 1_704_067_200_000; // 2024-01-01 00:00 UTC
const HOUR = 3_600_000;

describe.skipIf(!pythonAvailable())("interpret utility gaps", () => {
  test("timeframe.change hourly buckets and daily calendar", () => {
    const bars = [0, 1, 2, 23, 24].map((h) => ({
      time: T0 + h * HOUR,
      open: 10,
      high: 12,
      low: 9,
      close: 11,
    }));
    matchPython(
      `//@version=5
indicator("t")
plot(timeframe.change("60") ? 1 : 0, "h")
plot(timeframe.change("D") ? 1 : 0, "d")
plot(timeframe.change("1D") ? 1 : 0, "d1")
plot(timeframe.change("") ? 1 : 0, "empty")`,
      bars,
    );
  });

  test("timeframe.change week and month calendars", () => {
    const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d, 12);
    const bars = [
      utc(2024, 1, 7), // Sunday
      utc(2024, 1, 8), // Monday — new ISO week
      utc(2024, 1, 9),
      utc(2024, 2, 1),
      utc(2024, 2, 29),
      utc(2024, 3, 1),
    ].map((time) => ({ time, close: 1 }));
    matchPython(
      `//@version=5
indicator("t")
plot(timeframe.change("W") ? 1 : 0, "w")
plot(timeframe.change("M") ? 1 : 0, "m")
plot(timeframe.change("1M") ? 1 : 0, "m1")`,
      bars,
    );
  });

  test("time_close matches Python host (next open, last + 1 day)", () => {
    const bars = [0, 1, 2, 3, 4].map((i) => ({
      time: T0 + i * HOUR,
      close: 1,
    }));
    const py = matchPython(
      `//@version=5
indicator("t")
plot(time, "t")
plot(time_close, "tc")
plot(time_close(), "tc2")`,
      bars,
    );
    expect(nums(py.series.tc)[0]).toBe(T0 + HOUR);
    expect(nums(py.series.tc)[4]).toBe(T0 + 4 * HOUR + 86_400_000);
    expect(nums(py.series.t)[0]).not.toBe(nums(py.series.tc)[0]);
  });

  test("explicit bar.time_close overrides the host close", () => {
    const bars = [0, 1].map((i) => ({
      time: T0 + i * HOUR,
      time_close: T0 + i * HOUR + 123,
      close: 1,
    }));
    const out = new Runtime("TEST").run(
      `//@version=5
indicator("t")
plot(time_close, "tc")
plot(time_close(), "tc2")`,
      bars,
      { mode: "interpret" },
    );
    expect(out.error).toBeUndefined();
    expect(out.series.tc).toEqual([T0 + 123, T0 + HOUR + 123]);
    expect(out.series.tc2).toEqual(out.series.tc);
  });

  test("syminfo.prefix bare and ticker id", () => {
    const bars = [{ time: T0, close: 1 }];
    matchPython(
      `//@version=5
indicator("t")
plot(syminfo.prefix() == "" ? 1 : 0, "call")
plot(syminfo.prefix == "" ? 1 : 0, "attr")
plot(syminfo.prefix("NASDAQ:AAPL") == "NASDAQ" ? 1 : 0, "nas")
plot(syminfo.prefix("AAPL") == "" ? 1 : 0, "bare")`,
      bars,
      "TEST",
    );
    matchPython(
      `//@version=5
indicator("t")
plot(syminfo.prefix() == "NASDAQ" ? 1 : 0, "call")
plot(syminfo.prefix == "NASDAQ" ? 1 : 0, "attr")`,
      bars,
      "NASDAQ:AAPL",
    );
    // Existing interpret contract: ticker and tickerid stay the raw symbol.
    const kept = new Runtime("NASDAQ:AAPL").run(
      `//@version=5
indicator("t")
plot(syminfo.ticker == "NASDAQ:AAPL" ? 1 : 0, "ticker")
plot(syminfo.tickerid == "NASDAQ:AAPL" ? 1 : 0, "tid")`,
      bars,
      { mode: "interpret" },
    );
    expect(kept.series.ticker).toEqual([1]);
    expect(kept.series.tid).toEqual([1]);
  });

  test("bare round_to_mintick matches math.round_to_mintick", () => {
    matchPython(
      `//@version=5
indicator("t")
plot(round_to_mintick(1.26), "bare")
plot(math.round_to_mintick(1.26), "math")`,
      [{ time: T0, close: 1 }],
    );
  });

  test("array.newint constructs like array.new_int", () => {
    matchPython(
      `//@version=5
indicator("t")
a = array.newint(3, 1)
plot(array.get(a, 0), "g0")
plot(array.get(a, 2), "g2")
b = array.newbox(2, 7)
plot(array.get(b, 1), "box")`,
      [{ time: T0, close: 1 }],
    );
  });

  test("plotcandle and plotbar primary series is close", () => {
    const bars = [0, 1, 2].map((i) => ({
      time: T0 + i * HOUR,
      open: 10 + i,
      high: 20 + i,
      low: 5 + i,
      close: 15 + i,
    }));
    const py = matchPython(
      `//@version=5
indicator("t")
plotcandle(open, high, low, close)
plotbar(open, high, low, close)`,
      bars,
    );
    expect(nums(py.series.candles)).toEqual([15, 16, 17]);
    expect(nums(py.series.bars)).toEqual([15, 16, 17]);
    expect(nums(py.plots)).toEqual([15, 16, 17]);
  });
});
