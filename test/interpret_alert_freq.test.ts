/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar, type RuntimeResult } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

const BARS: OHLCVBar[] = [1, 2, 3].map((close) => ({ close }));

type PyAlert = {
  message?: string;
  freq?: string;
  bar_index?: number;
  source?: string;
  title?: string;
};

type PyOut = { alerts: PyAlert[]; error?: string };

function pythonRun(
  src: string,
  bars: OHLCVBar[] = BARS,
  symbol = "TEST",
): PyOut {
  const payload = JSON.stringify({ src, bars, symbol });
  const proc = Bun.spawnSync(
    [
      PY,
      "-c",
      `import json
from pynescript.runtime import Runtime
req = json.loads(${JSON.stringify(payload)})
out = Runtime(req["symbol"]).run(req["src"], req["bars"], mode="interpret")
print(json.dumps({
    "alerts": out.get("alerts") or [],
    "error": out.get("error"),
}))`,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (proc.exitCode !== 0) {
    throw new Error(proc.stderr.toString() || proc.stdout.toString());
  }
  return JSON.parse(proc.stdout.toString()) as PyOut;
}

function run(src: string): RuntimeResult {
  return new Runtime("TEST").run(src, BARS, { mode: "interpret" });
}

function alertEvents(out: RuntimeResult) {
  return (out.drawings ?? []).filter((d) => d.kind === "alert");
}

function matchPythonAlerts(src: string): {
  ts: ReturnType<typeof alertEvents>;
  py: PyAlert[];
} {
  const py = pythonRun(src);
  const out = run(src);
  expect(out.error).toBeUndefined();
  expect(py.error ?? undefined).toBeUndefined();
  const ts = alertEvents(out);
  const pyAlerts = py.alerts;
  expect(ts.length).toBe(pyAlerts.length);
  const tsBars: Array<number | null> = ts.map((a) => a.bar);
  const pyBars: Array<number | null> = pyAlerts.map((a) => a.bar_index ?? null);
  expect(tsBars).toEqual(pyBars);
  expect(ts.map((a) => a.text)).toEqual(pyAlerts.map((a) => a.message));
  expect(ts.map((a) => a.extra?.freq)).toEqual(pyAlerts.map((a) => a.freq));
  expect(ts.map((a) => a.extra?.source)).toEqual(pyAlerts.map((a) => a.source));
  return { ts, py: pyAlerts };
}

describe("interpret alert freq", () => {
  test("zero-arg alert() does not throw and does not fire", () => {
    const out = run(`indicator("t")
alert()
plot(close)`);
    expect(out.error).toBeUndefined();
    expect(alertEvents(out)).toEqual([]);
  });

  test('alert("x") fires once per bar even if called twice', () => {
    const out = run(`indicator("t")
alert("x")
alert("x")
plot(close)`);
    expect(out.error).toBeUndefined();
    const alerts = alertEvents(out);
    expect(alerts.length).toBe(BARS.length);
    expect(alerts.map((a) => a.bar)).toEqual([0, 1, 2]);
    expect(alerts.every((a) => a.text === "x")).toBe(true);
    expect(alerts.every((a) => a.extra?.freq === "once_per_bar")).toBe(true);
    expect(alerts.every((a) => a.extra?.source === "alert")).toBe(true);
  });

  test('alert("x", "all") fires every call', () => {
    const out = run(`indicator("t")
alert("x", "all")
alert("x", "all")
plot(close)`);
    expect(out.error).toBeUndefined();
    const alerts = alertEvents(out);
    expect(alerts.length).toBe(BARS.length * 2);
    expect(alerts.map((a) => a.bar)).toEqual([0, 0, 1, 1, 2, 2]);
    expect(alerts.every((a) => a.extra?.freq === "all")).toBe(true);
    expect(alerts.every((a) => a.extra?.source === "alert")).toBe(true);
  });

  test("once_per_bar_close fires once per confirmed historical bar", () => {
    const out = run(`indicator("t")
alert("x", "once_per_bar_close")
alert("x", "once_per_bar_close")
plot(close)`);
    expect(out.error).toBeUndefined();
    const alerts = alertEvents(out);
    expect(alerts.length).toBe(BARS.length);
    expect(alerts.every((a) => a.extra?.freq === "once_per_bar_close")).toBe(
      true,
    );
  });

  test("alertcondition still fires once per bar", () => {
    const out = run(`indicator("t")
alertcondition(true, "always", "fire")
plot(1)`);
    expect(out.error).toBeUndefined();
    const alerts = alertEvents(out);
    expect(alerts.length).toBe(BARS.length);
    expect(alerts.every((a) => a.text === "fire")).toBe(true);
    expect(alerts.every((a) => a.extra?.source === "alertcondition")).toBe(
      true,
    );
    expect(alerts.every((a) => a.extra?.freq === "once_per_bar")).toBe(true);
    expect(alerts.every((a) => a.extra?.title === "always")).toBe(true);
  });
});

describe.skipIf(!pythonAvailable())(
  "interpret alert freq vs Python Runtime.run",
  () => {
    test("default once_per_bar matches Python fire count", () => {
      matchPythonAlerts(`//@version=5
indicator("t")
alert("x")
alert("x")
plot(close)`);
    });

    test("freq all alias strings match Python", () => {
      matchPythonAlerts(`//@version=5
indicator("t")
alert("x", "all")
alert("x", "all")
plot(close)`);
      matchPythonAlerts(`//@version=5
indicator("t")
alert("x", "freq_all")
alert("x", "freq_all")
plot(close)`);
      matchPythonAlerts(`//@version=5
indicator("t")
alert("x", freq="all")
alert("x", freq="all")
plot(close)`);
    }, 20_000);

    test("once_per_bar_close matches Python on confirmed bars", () => {
      matchPythonAlerts(`//@version=5
indicator("t")
alert("x", "once_per_bar_close")
alert("x", "once_per_bar_close")
plot(close)`);
    });

    test("zero-arg alert() matches Python (no fire, no error)", () => {
      matchPythonAlerts(`//@version=5
indicator("t")
alert()
alert("x")
plot(close)`);
    });

    test("alertcondition once_per_bar matches Python", () => {
      const { ts, py } = matchPythonAlerts(`//@version=5
indicator("t")
alertcondition(true, "always", "fire")
plot(1)`);
      expect(py.length).toBe(BARS.length);
      expect(ts.every((a) => a.extra?.source === "alertcondition")).toBe(true);
    });

    test("distinct messages both fire under once_per_bar", () => {
      matchPythonAlerts(`//@version=5
indicator("t")
alert("a")
alert("b")
plot(close)`);
    });
  },
);
