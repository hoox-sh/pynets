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

const BARS: OHLCVBar[] = [100, 110].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1,
  time: Date.UTC(2020, 0, 1) + i * 60_000,
}));

describe.skipIf(!pythonAvailable())("interpret drawing gaps", () => {
  test("line.new + set_width + get_x1", () => {
    matchPython(
      `//@version=5
indicator("t")
var line ln = line.new(0, 10, 5, 20)
if bar_index == 0
    line.set_width(ln, 3)
plot(line.get_x1(ln), "x1")
plot(line.get_y1(ln), "y1")
plot(line.get_x2(ln), "x2")
plot(line.get_y2(ln), "y2")`,
      BARS,
    );
  });

  test("box.new + set_bgcolor + get_left", () => {
    matchPython(
      `//@version=5
indicator("t")
var box bx = box.new(1, 10, 3, 0)
if bar_index == 0
    box.set_bgcolor(bx, color.red)
    box.set_right(bx, 11)
plot(box.get_left(bx), "left")
plot(box.get_right(bx), "right")
plot(box.get_top(bx), "top")
plot(box.get_bottom(bx), "bottom")`,
      BARS,
    );
  });

  test("label.new + set_tooltip + get_text", () => {
    matchPython(
      `//@version=5
indicator("t")
var label lb = label.new(2, 9, "hi")
if bar_index == 0
    label.set_tooltip(lb, "tip")
    label.set_x(lb, 6)
plot(label.get_x(lb), "x")
plot(label.get_y(lb), "y")
plot(str.length(label.get_text(lb)), "tlen")
plot(label.get_text(lb) == "hi" ? 1 : 0, "teq")`,
      BARS,
    );
  });

  test("line.all size after two news", () => {
    matchPython(
      `//@version=5
indicator("t")
var line a = line.new(0, 1, 2, 3)
var line b = line.new(0, 4, 5, 6)
plot(array.size(line.all), "n")
plot(array.size(label.all), "nl")
plot(array.size(box.all), "nb")`,
      BARS,
    );
  });

  test("table.cell + cell_set_text + cell_get_text", () => {
    matchPython(
      `//@version=5
indicator("t")
var table t = table.new(position.top_left, 2, 2)
if bar_index == 0
    table.cell(t, 1, 2, "hi")
    table.cell_set_text(t, 2, 1, "yo")
plot(str.length(table.cell_get_text(t, 2, 1)), "len")
plot(table.cell_get_text(t, 2, 1) == "yo" ? 1 : 0, "eq")`,
      BARS,
    );
  });

  test("chart.point.new / from_index / now fields", () => {
    matchPython(
      `//@version=5
indicator("t")
p = chart.point.new(123, 45)
q = chart.point.from_index(2, 9)
r = chart.point.now(close)
s = chart.point.copy(p)
plot(p.price, "pp")
plot(p.time, "pt")
plot(q.index, "qi")
plot(q.price, "qp")
plot(r.index, "ri")
plot(r.price, "rp")
plot(s.price, "sp")`,
      BARS,
    );
  });

  test("line.copy clones coords", () => {
    matchPython(
      `//@version=5
indicator("t")
var line a = line.new(0, 10, 5, 20)
var line c = line.copy(a)
if bar_index == 0
    line.set_x1(a, 99)
plot(line.get_x1(a), "ax")
plot(line.get_x1(c), "cx")
plot(array.size(line.all), "n")`,
      BARS,
    );
  });

  test("line.set_xy1 / set_y2 and delete remaining", () => {
    matchPython(
      `//@version=5
indicator("t")
var line ln = line.new(0, 1, 2, 3)
var line gone = line.new(0, 4, 5, 6)
if bar_index == 0
    line.set_xy1(ln, 8, 9)
    line.set_y2(ln, 7)
    line.delete(gone)
plot(line.get_x1(ln), "x1")
plot(line.get_y1(ln), "y1")
plot(line.get_y2(ln), "y2")
plot(array.size(line.all), "n")`,
      BARS,
    );
  });

  test("linefill.get_line1 and polyline.get_points", () => {
    matchPython(
      `//@version=5
indicator("t")
var line a = line.new(0, 1, 2, 3)
var line b = line.new(0, 4, 5, 6)
var linefill f = linefill.new(a, b, color.red)
var p1 = chart.point.from_index(0, 1)
var p2 = chart.point.from_index(1, 2)
var polyline pl = polyline.new(array.from(p1, p2))
plot(line.get_x1(linefill.get_line1(f)), "l1")
plot(line.get_y1(linefill.get_line2(f)), "l2")
plot(array.size(linefill.all), "nf")
plot(array.size(polyline.get_points(pl)), "np")
plot(array.size(polyline.all), "npl")`,
      BARS,
    );
  });

  test("missing id getters match Python na/zero", () => {
    matchPython(
      `//@version=5
indicator("t")
plot(line.get_x1(na), "lx")
plot(box.get_left(na), "bl")
plot(label.get_x(na), "labx")
plot(label.get_y(na), "laby")
plot(str.length(label.get_text(na)), "lt")
plot(str.length(table.cell_get_text(na, 0, 0)), "tt")`,
      BARS,
    );
  });

  test("chart.point.from_time copies bar clock", () => {
    matchPython(
      `//@version=5
indicator("t")
p = chart.point.from_time(time, close)
q = chart.point.copy(p)
plot(p.time, "pt")
plot(p.price, "pp")
plot(q.price, "qp")`,
      BARS,
    );
  });
});
