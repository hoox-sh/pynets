/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * RuntimeStream (incremental RuntimeSession) must match the full-run path for
 * every prefix, including the forming-bar re-tick and close confirmation.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = Array.from({ length: 8 }, (_, i) => ({
  open: 100 + i * 0.6,
  high: 102 + i * 1.1,
  low: 99 - i * 0.4,
  close: 101 + i + (i % 3 === 0 ? 0.3 : -0.2),
  volume: 1000 + i * 9,
  time: 1_700_000_000_000 + i * 60_000,
}));

const SCRIPTS: Array<{ id: string; src: string }> = [
  { id: "sma", src: `indicator("t")\nplot(ta.sma(close, 3), "s")` },
  {
    id: "atr_rsi",
    src: `indicator("t")\nplot(ta.atr(3), "a")\nplot(ta.rsi(close, 3), "r")`,
  },
  {
    id: "var",
    src: `indicator("t")\nvar n = 0\nn := n + 1\nplot(n, "n")`,
  },
  {
    id: "varip",
    src: `indicator("t")\nvarip n = 0\nn := n + 1\nplot(n, "n")`,
  },
  {
    id: "once",
    src: `indicator("t")\nvar n = 0\nonce\n    n := n + 1\nplot(n, "n")`,
  },
  {
    id: "array",
    src: `indicator("t")\nvar a = array.new_float(0)\narray.push(a, close)\nplot(array.size(a), "n")`,
  },
  {
    id: "udf",
    src: `indicator("t")\nf(x) =>\n    var y = 0\n    y := y + x\n    y\nplot(f(close), "v")`,
  },
  {
    id: "strategy",
    src: `strategy("s")\nif barstate.isrealtime\n    strategy.entry("L", strategy.long)\nplot(strategy.position_size, "pos")`,
  },
  {
    id: "draw",
    src: `indicator("t")\nline.new(bar_index, close, bar_index + 1, close + 1)\nplot(close, "c")`,
  },
  {
    id: "log",
    src: `indicator("t")\nlog.info("c={0}", close)\nplot(close, "c")`,
  },
  {
    id: "alert",
    src: `indicator("t")\nalertcondition(close > open, "up")\nplot(close, "c")`,
  },
  {
    id: "barstate",
    src: `indicator("t")\nplot(barstate.isrealtime, "rt")\nplot(barstate.isconfirmed, "cf")\nplot(barstate.islast, "last")`,
  },
  {
    id: "matrix",
    src: `indicator("t")\nm = matrix.new(1, 1, 0)\nmatrix.set(m, 0, 0, close)\nplot(matrix.get(m, 0, 0), "m")`,
  },
  {
    id: "map",
    src: `indicator("t")\nm = map.new()\nmap.put(m, "c", close)\nplot(map.get(m, "c"), "m")`,
  },
  {
    id: "request",
    src: `indicator("t")\nplot(request.security(syminfo.ticker, timeframe.period, close), "r")`,
  },
  {
    id: "draw_delete",
    src: `indicator("t")\nvar line ln = line.new(0, 1, 2, 3)\nvar line gone = line.new(0, 4, 5, 6)\nif bar_index == 0\n    line.delete(gone)\nplot(line.get_x1(ln), "x1")\nplot(array.size(line.all), "n")`,
  },
];

function compare(
  id: string,
  actual: ReturnType<Runtime["run"]>,
  expected: ReturnType<Runtime["run"]>,
) {
  expect(actual.error, `${id} error`).toBeUndefined();
  expect(expected.error, `${id} expected error`).toBeUndefined();
  expect(actual.series, `${id} series`).toEqual(expected.series);
  expect(actual.plots, `${id} plots`).toEqual(expected.plots);
  expect(actual.plot_meta, `${id} plot_meta`).toEqual(expected.plot_meta);
  expect(actual.count, `${id} count`).toBe(expected.count);
  expect(actual.script_name, `${id} script_name`).toBe(expected.script_name);
  expect(actual.script_type, `${id} script_type`).toBe(expected.script_type);
  expect(actual.events, `${id} events`).toEqual(expected.events);
  expect(actual.fills, `${id} fills`).toEqual(expected.fills);
  expect(actual.drawings, `${id} drawings`).toEqual(expected.drawings);
  expect(actual.logs, `${id} logs`).toEqual(expected.logs);
  expect(actual.strategy, `${id} strategy`).toEqual(expected.strategy);
}

describe("RuntimeSession edge cases", () => {
  test("parse error is returned, not thrown", () => {
    const stream = new Runtime("TEST").stream("not a pine script");
    const out = stream.push(BARS[0]!);
    expect(out?.error_kind).toBe("parse");
    expect(stream.barCount).toBe(0);
    expect(stream.close().error_kind).toBe("parse");
  });

  test("maxBars stops the session", () => {
    const stream = new Runtime("TEST", { maxBars: 1 }).stream(
      `indicator("t")\nplot(close)`,
    );
    expect(stream.push(BARS[0]!)?.error).toBeUndefined();
    const out = stream.push(BARS[1]!);
    expect(out?.error).toContain("maxBars");
    expect(stream.push(BARS[2]!)).toBeUndefined();
  });

  test("compile-mode stream keeps the prefix replay path", () => {
    const src = `indicator("t")\nplot(close)`;
    const stream = new Runtime("TEST", { mode: "compile" }).stream(src);
    const out = stream.push(BARS[0]!);
    expect(out?.error).toBeUndefined();
    expect(out?.plots).toEqual([BARS[0]!.close]);
    expect(stream.barCount).toBe(1);
    expect(stream.close().plots).toEqual([BARS[0]!.close]);
  });
});

describe("RuntimeSession prefix parity", () => {
  for (const script of SCRIPTS) {
    test(`${script.id}: every push matches full run`, () => {
      const stream = new Runtime("TEST").stream(script.src);
      for (let i = 0; i < BARS.length; i++) {
        const actual = stream.push(BARS[i]!);
        expect(actual, `${script.id} push ${i}`).toBeDefined();
        const expected = new Runtime("TEST").run(
          script.src,
          BARS.slice(0, i + 1),
          { realtimeLastBar: true },
        );
        compare(`${script.id}@${i}`, actual!, expected);
        expect(stream.barCount).toBe(i + 1);
      }
      const closed = stream.close();
      const expectedClosed = new Runtime("TEST").run(script.src, BARS, {
        realtimeLastBar: false,
      });
      compare(`${script.id}@close`, closed, expectedClosed);
    });

    test(`${script.id}: updateLastBar matches full run`, () => {
      const stream = new Runtime("TEST").stream(script.src);
      for (const bar of BARS) stream.push(bar);
      const revised = { ...BARS[BARS.length - 1]!, close: 222, high: 223 };
      const actual = stream.updateLastBar(revised);
      const expected = new Runtime("TEST").run(
        script.src,
        [...BARS.slice(0, -1), revised],
        { realtimeLastBar: true },
      );
      compare(`${script.id}@retick`, actual, expected);
      expect(stream.barCount).toBe(BARS.length);
    });
  }
});
