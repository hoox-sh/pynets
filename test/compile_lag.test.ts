/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile lag: mode "compile" must match mode "interpret" for names
 * interpret already implements (strategy fields, host helpers, drawings).
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar, type RuntimeResult } from "../src/index.ts";

const T0 = 1_700_000_000_000;
const MIN = 60_000;

const BARS: OHLCVBar[] = [100, 110, 120].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1,
  time: T0 + i * MIN,
}));

function nums(values: Array<number | null> | undefined): Array<number | null> {
  return (values ?? []).map((v) =>
    typeof v === "number" && Number.isFinite(v) ? v : null,
  );
}

function run(src: string, mode: "interpret" | "compile"): RuntimeResult {
  return new Runtime("TEST").run(src, BARS, { mode });
}

function expectSame(src: string): {
  interpret: RuntimeResult;
  compile: RuntimeResult;
} {
  const interpret = run(src, "interpret");
  const compile = run(src, "compile");
  expect(interpret.error).toBeUndefined();
  expect(compile.error).toBeUndefined();
  expect(compile.mode).toBe("compile");
  const keys = new Set([
    ...Object.keys(interpret.series),
    ...Object.keys(compile.series),
  ]);
  for (const key of keys) {
    expect(nums(compile.series[key])).toEqual(nums(interpret.series[key]));
  }
  expect(nums(compile.plots)).toEqual(nums(interpret.plots));
  return { interpret, compile };
}

function alerts(out: RuntimeResult) {
  return (out.drawings ?? []).filter((d) => d.kind === "alert");
}

describe("compile lag vs interpret", () => {
  test("strategy.cash plots free cash and cash() matches the attribute", () => {
    const src = `strategy("t", initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long, 2)
c = strategy.cash
plot(c, "cash")
plot(strategy.cash(), "call")`;
    const { compile } = expectSame(src);
    const cash = nums(compile.series.cash);
    expect(cash[0]).toBeCloseTo(100_000);
    expect(cash[1]).toBeCloseTo(99_780);
    expect(cash[2]).toBeCloseTo(99_800);
    expect(nums(compile.series.call)).toEqual(cash);
  });

  test("default_qty_type=strategy.cash still sizes cash entries", () => {
    const { compile } = expectSame(
      `strategy("t", default_qty_type=strategy.cash, default_qty_value=500, initial_capital=100000)
if bar_index == 0
    strategy.entry("L", strategy.long)
plot(strategy.position_size, "qty")`,
    );
    expect(nums(compile.series.qty)[0]).toBeCloseTo(0);
    expect(nums(compile.series.qty)[1]).toBeCloseTo(5);
  });

  test("strategy series, trade fields, and qty-type constants", () => {
    expectSame(
      `strategy("t", initial_capital=100000, currency="EUR")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=3)
if bar_index == 2
    strategy.close("L")
plot(strategy.account_currency == "EUR" ? 1 : 0, "ccy")
plot(strategy.position_entry_name == "L" ? 1 : 0, "ename")
plot(strategy.default_entry_qty, "deq")
plot(strategy.default_entry_qty(50), "deq50")
plot(strategy.convert_to_account(close), "cva")
plot(strategy.convert_to_symbol(), "cvs")
plot(strategy.convert_to_account(na), "cvna")
plot(strategy.max_contracts_held_all, "mx")
plot(strategy.max_contracts_held_long, "mxl")
plot(strategy.max_contracts_held_short, "mxs")
plot(strategy.opentrades.capital_held, "held")
plot(strategy.closedtrades.first_index, "fi")
plot(strategy.commission, "comm0")
plot(strategy.oca.none == "none" ? 1 : 0, "oca")
plot(strategy.oca.cancel == "cancel" ? 1 : 0, "ocac")
plot(strategy.oca.reduce == "reduce" ? 1 : 0, "ocar")
plot(strategy.direction.all == "all" ? 1 : 0, "dir")
plot(strategy.direction.long == "long" ? 1 : 0, "dl")
plot(strategy.commission.percent == "percent" ? 1 : 0, "cp")
plot(strategy.commission.cash_per_order == "cash_per_order" ? 1 : 0, "cpo")
plot(strategy.commission.cash_per_contract == "cash_per_contract" ? 1 : 0, "cpc")
plot(strategy.wintrades, "wt")
plot(strategy.losstrades, "lt")
plot(strategy.eventrades, "et")
plot(strategy.grossprofit, "gp")
plot(strategy.grossloss, "gl")
plot(strategy.max_drawdown, "dd")
plot(strategy.max_runup, "ru")
plot(strategy.netprofit_percent, "npp")
plot(strategy.openprofit_percent, "opp")
plot(strategy.percent_profitable, "pp")
plot(strategy.winrate, "wr")
plot(strategy.profitfactor, "pf")
plot(strategy.profit_factor, "pf2")
plot(strategy.avg_trade, "at")
plot(strategy.closedtrades.entry_time(0), "etime")
plot(strategy.closedtrades.exit_time(0), "xtime")
plot(strategy.closedtrades.profit(0), "profit")
plot(strategy.closedtrades.commission(0), "ccomm")
plot(strategy.closedtrades.max_runup(0), "cru")
plot(strategy.closedtrades.max_drawdown(0), "cdd")
plot(str.length(strategy.closedtrades.entry_comment(0)), "ecmt")
plot(str.length(strategy.closedtrades.exit_comment(0)), "xcmt")
plot(strategy.closedtrades.entry_id(0) == "L" ? 1 : 0, "eid")
plot(str.length(strategy.opentrades.entry_comment(0)), "ocmt")
plot(strategy.opentrades.entry_time(0), "otime")
plot(strategy.opentrades.commission(0), "ocomm")
plot(strategy.opentrades.max_runup(0), "oru")`,
    );
  });

  test("timenow is last bar time on every bar", () => {
    const { compile } = expectSame(
      `indicator("t")
plot(timenow, "tn")
plot(timenow(), "tn2")`,
    );
    const last = T0 + 2 * MIN;
    expect(nums(compile.series.tn)).toEqual([last, last, last]);
    expect(nums(compile.series.tn2)).toEqual([last, last, last]);
  });

  test("max_bars_back does not change close", () => {
    const { compile } = expectSame(
      `indicator("t")
max_bars_back(close, 50)
plot(close, "c")
plot(max_bars_back(close, 10), "mb")`,
    );
    expect(nums(compile.series.c)).toEqual([100, 110, 120]);
    expect(nums(compile.series.mb)).toEqual([null, null, null]);
  });

  test("plot.linestyle_* strings", () => {
    expectSame(
      `indicator("t")
plot(plot.linestyle_solid == "linestyle_solid" ? 1 : 0, "s")
plot(plot.linestyle_dashed == "linestyle_dashed" ? 1 : 0, "d")
plot(plot.linestyle_dotted == "linestyle_dotted" ? 1 : 0, "t")`,
    );
  });

  test("alertcondition fires once per bar on the drawing book", () => {
    const src = `indicator("t")
alertcondition(close > 100, "title", "msg")
alertcondition(true, "title", "msg")
alertcondition(true, "always", "fire")
plot(close, "c")`;
    const { interpret, compile } = expectSame(src);
    const a = alerts(interpret);
    const b = alerts(compile);
    expect(b.length).toBe(a.length);
    expect(b.map((e) => e.bar)).toEqual(a.map((e) => e.bar));
    expect(b.map((e) => e.text)).toEqual(a.map((e) => e.text));
    expect(b.map((e) => e.extra)).toEqual(a.map((e) => e.extra));
    expect(b.every((e) => e.extra?.source === "alertcondition")).toBe(true);
    // close > 100 is false on bar 0; alertcondition(true, same title) still fires there.
    expect(b.filter((e) => e.text === "msg").map((e) => e.bar)).toEqual([
      0, 1, 2,
    ]);
    expect(b.filter((e) => e.text === "fire").length).toBe(BARS.length);
  });

  test("alertcondition defaults missing title and message to Alert", () => {
    const src = `indicator("t")
alertcondition(true)
plot(1, "p")`;
    const { compile } = expectSame(src);
    const fired = alerts(compile);
    expect(fired.length).toBe(BARS.length);
    expect(
      fired.every((e) => e.text === "Alert" && e.extra?.title === "Alert"),
    ).toBe(true);
  });

  test("bare random follows math.random na rules without comparing draws", () => {
    const { compile } = expectSame(
      `indicator("t")
plot(na(random()) ? 1 : 0, "na0")
plot(na(math.random()) ? 1 : 0, "na1")
plot(random(0, 0), "z")
plot(na(random(na)) ? 1 : 0, "nana")
plot(na(random(na, 1)) ? 1 : 0, "nana2")`,
    );
    expect(nums(compile.series.na0)).toEqual([0, 0, 0]);
    expect(nums(compile.series.z)).toEqual([0, 0, 0]);
    expect(nums(compile.series.nana)).toEqual([1, 1, 1]);
  });

  test("security_lower_tf aliases request security passthrough", () => {
    const { compile } = expectSame(
      `indicator("t")
plot(security_lower_tf(syminfo.ticker, "", close), "same")
plot(security_lower_tf("OTHER", "1", close), "foreign")
plot(request.security_lower_tf("OTHER", "60", close), "req")`,
    );
    expect(nums(compile.series.same)).toEqual([100, 110, 120]);
    expect(nums(compile.series.foreign)).toEqual([null, null, null]);
    expect(nums(compile.series.req)).toEqual([null, null, null]);
  });

  test("line getters, copy, all, and delete", () => {
    expectSame(
      `indicator("t")
var line ln = line.new(0, 10, 5, 20)
var line gone = line.new(4, 1, 6, 2)
var line cp = line.copy(ln)
if bar_index == 0
    line.set_width(ln, 3)
    line.set_xy1(ln, 8, 9)
    line.set_y2(ln, 7)
    line.set_x1(gone, 3)
    line.delete(gone)
plot(line.get_x1(ln), "x1")
plot(line.get_y1(ln), "y1")
plot(line.get_x2(ln), "x2")
plot(line.get_y2(ln), "y2")
plot(line.get_x1(cp), "cx")
plot(array.size(line.all), "n")
plot(line.get_x1(na), "miss")`,
    );
  });

  test("label and box getters", () => {
    expectSame(
      `indicator("t")
var label lb = label.new(2, 9, "hi")
var box bx = box.new(1, 10, 3, 0)
if bar_index == 0
    label.set_x(lb, 6)
    label.set_tooltip(lb, "tip")
    box.set_bgcolor(bx, color.red)
    box.set_right(bx, 11)
plot(label.get_x(lb), "x")
plot(label.get_y(lb), "y")
plot(str.length(label.get_text(lb)), "tlen")
plot(label.get_text(lb) == "hi" ? 1 : 0, "teq")
plot(label.get_x(na), "labx")
plot(str.length(label.get_text(na)), "lt")
plot(box.get_left(bx), "left")
plot(box.get_right(bx), "right")
plot(box.get_top(bx), "top")
plot(box.get_bottom(bx), "bottom")
plot(box.get_left(na), "bl")
plot(array.size(label.all), "nl")
plot(array.size(box.all), "nb")`,
    );
  });

  test("table cell text, linefill, polyline points, chart.point, line.fill", () => {
    expectSame(
      `indicator("t")
var table tb = table.new(position.top_left, 2, 2)
var line a = line.new(0, 1, 2, 3)
var line b = line.new(0, 4, 5, 6)
var linefill f = linefill.new(a, b, color.red)
var linefill g = line.fill(a, b)
p = chart.point.new(123, 45)
q = chart.point.from_index(2, 9)
r = chart.point.now(close)
s = chart.point.copy(p)
ft = chart.point.from_time(time, close)
var p1 = chart.point.from_index(0, 1)
var p2 = chart.point.from_index(1, 2)
var pts = array.new<float>(0)
array.push(pts, p1)
array.push(pts, p2)
var pl = polyline.new(pts)
if bar_index == 0
    table.cell(tb, 1, 2, "hi")
    table.cell_set_text(tb, 2, 1, "yo")
plot(str.length(table.cell_get_text(tb, 2, 1)), "len")
plot(table.cell_get_text(tb, 2, 1) == "yo" ? 1 : 0, "eq")
plot(str.length(table.cell_get_text(na, 0, 0)), "tt")
plot(line.get_x1(linefill.get_line1(f)), "l1")
plot(line.get_y1(linefill.get_line2(f)), "l2")
plot(line.get_x1(linefill.get_line1(g)), "g1")
plot(array.size(linefill.all), "nf")
plot(array.size(polyline.all), "npl")
plot(array.size(polyline.get_points(pl)), "np")
plot(p.price, "pp")
plot(p.time, "pt")
plot(q.index, "qi")
plot(q.price, "qp")
plot(r.index, "ri")
plot(r.price, "rp")
plot(s.price, "sp")
plot(ft.time, "ftt")
plot(ft.price, "ftp")`,
    );
  });

  test("table.new columns then rows plus style fields match interpret", () => {
    const { interpret, compile } = expectSame(
      `indicator("t")
var table tb = table.new(position.top_right, 3, 2, color.red)
plot(1, "one")`,
    );
    for (const out of [interpret, compile]) {
      const table = (out.drawings ?? []).find((d) => d.kind === "table");
      expect(table?.extra?.columns).toBe(3);
      expect(table?.extra?.rows).toBe(2);
      expect(table?.extra?.position).toBe("top_right");
    }
    const pick = (out: RuntimeResult) =>
      (out.drawings ?? []).find((d) => d.kind === "table")?.extra;
    expect(pick(compile)).toEqual(pick(interpret));
  });
});
