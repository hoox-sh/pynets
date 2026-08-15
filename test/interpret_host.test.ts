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
});
