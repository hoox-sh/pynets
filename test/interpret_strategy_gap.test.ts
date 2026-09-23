/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Interpret strategy.* gap fields vs Python Runtime.run (same bars).
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar } from "../src/index.ts";

const PY = "/home/jango/Git/pynescript/.venv/bin/python";

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

const BARS: OHLCVBar[] = [
  { open: 100, high: 100, low: 100, close: 100, volume: 1, time: 1_700_000_000_000 },
  { open: 110, high: 110, low: 110, close: 110, volume: 1, time: 1_700_000_060_000 },
  { open: 120, high: 120, low: 120, close: 120, volume: 1, time: 1_700_000_120_000 },
];

describe("interpret strategy gaps", () => {
  test("plot(strategy.cash) is numeric free cash, not the qty-type string", () => {
    const py = matchPython(
      `strategy("t", initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long, 2)
plot(strategy.cash, "cash")`,
      BARS,
    );
    const cash = nums(py.series.cash);
    expect(typeof cash[0]).toBe("number");
    expect(cash[0]).not.toBeNaN();
    // 2 contracts × 100 entry = 200 held; free cash = 100000 - 200
    expect(cash[0]).toBeCloseTo(99_800);
    expect(cash[1]).toBeCloseTo(99_820);
  });

  test("default_qty_type=strategy.cash still sizes cash entries", () => {
    const py = matchPython(
      `strategy("t", default_qty_type=strategy.cash, default_qty_value=500, initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long)
plot(strategy.position_size, "qty")`,
      BARS,
    );
    // 500 cash / 100 price = 5 contracts
    expect(nums(py.series.qty)[0]).toBeCloseTo(5);
  });

  test("account_currency and max_contracts_held_all after a fill", () => {
    matchPython(
      `strategy("t", initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long, 3)
plot(strategy.account_currency == "USD" ? 1 : 0, "ccy")
plot(strategy.max_contracts_held_all, "max")
plot(strategy.position_entry_name == "L" ? 1 : 0, "ename")`,
      BARS,
    );
  });

  test("closedtrades.entry_time / profit after close", () => {
    const py = matchPython(
      `strategy("t", initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long, 1)
if bar_index == 2
    strategy.close("L")
plot(strategy.closedtrades.entry_time(0), "etime")
plot(strategy.closedtrades.profit(0), "profit")
plot(strategy.closedtrades, "n")`,
      BARS,
    );
    expect(nums(py.series.etime)[2]).toBe(1_700_000_000_000);
    expect(nums(py.series.profit)[2]).toBeCloseTo(20);
    expect(nums(py.series.n)[2]).toBe(1);
  });

  test("oca.none / commission.percent plot as strings (equality vs Python)", () => {
    matchPython(
      `strategy("t")
plot(strategy.oca.none == "none" ? 1 : 0, "oca")
plot(strategy.commission.percent == "percent" ? 1 : 0, "comm")
plot(strategy.direction.all == "all" ? 1 : 0, "dir")`,
      BARS,
    );
  });

  test("strategy.netprofit() call equals strategy.netprofit attribute", () => {
    matchPython(
      `strategy("t", initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long, 1)
if bar_index == 2
    strategy.close("L")
plot(strategy.netprofit, "attr")
plot(strategy.netprofit(), "call")
plot(strategy.equity(), "eq")
plot(strategy.cash(), "cash")`,
      BARS,
    );
  });
});
