/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3].map((close) => ({ close }));

describe("host builtins", () => {
  test("na() is 1 for missing series lookback", () => {
    const out = interpret(`indicator("t")\nplot(na(close[10]))`, BARS);
    expect(out.plots).toEqual([1, 1, 1]);
  });

  test("barstate.isfirst / islast", () => {
    const first = interpret(`indicator("t")\nplot(barstate.isfirst ? 1 : 0)`, BARS);
    expect(first.plots).toEqual([1, 0, 0]);
    const last = interpret(`indicator("t")\nplot(barstate.islast ? 1 : 0)`, BARS);
    expect(last.plots).toEqual([0, 0, 1]);
  });

  test("map.put / map.get", () => {
    const out = interpret(
      `indicator("t")
m = map.new()
map.put(m, "c", close)
plot(map.get(m, "c"))`,
      BARS,
    );
    expect(out.plots).toEqual([1, 2, 3]);
  });

  test("Runtime.run parse error is not thrown and has no stack", () => {
    const out = new Runtime("TEST").run("indicator(\n", BARS);
    expect(out.error).toBeDefined();
    expect(out.error_kind).toBe("parse");
    expect(out.error).not.toContain("    at ");
    expect(out.series).toEqual({});
  });

  test("strategy() commission applies via Runtime broker", () => {
    const out = new Runtime("TEST", { broker: { commission: 0.001 } }).run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=1)
plot(close)`,
      [{ close: 100 }, { close: 101 }],
    );
    expect(out.error).toBeUndefined();
    expect(out.fills?.length).toBeGreaterThan(0);
  });

  test("omitted strategy.entry qty defaults to 1; na qty does not fill", () => {
    const ok = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long)
plot(strategy.position_size)`,
      [{ close: 10 }, { close: 11 }],
    );
    expect(ok.fills?.length).toBe(1);
    expect(ok.plots[1]).toBe(1);

    const naQty = new Runtime("TEST").run(
      `strategy("s")
if bar_index == 0
    strategy.entry("L", strategy.long, qty=na)
plot(strategy.position_size)`,
      [{ close: 10 }, { close: 11 }],
    );
    expect(naQty.fills ?? []).toHaveLength(0);
    expect(naQty.plots[1]).toBe(0);
  });

  test("indicator max_lines_count is honoured", () => {
    const out = new Runtime("TEST").run(
      `indicator("t", max_lines_count=2)
line.new(bar_index, close, bar_index, close)
line.new(bar_index, close, bar_index, close)
line.new(bar_index, close, bar_index, close)
plot(1)`,
      [{ close: 1 }, { close: 2 }],
    );
    expect(out.error).toBeUndefined();
    const lines = (out.drawings ?? []).filter((d) => d.kind === "line" && !d.deleted);
    expect(lines.length).toBeLessThanOrEqual(2);
  });
});
