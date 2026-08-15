/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, unparse, Runtime, JsonBarProvider } from "../src/index.ts";
import type { Script } from "../src/ast/nodes.ts";

const BARS = [100, 110].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1,
  time: Date.UTC(2020, 0, 1) + i * 60_000,
}));

describe("interpret wave7", () => {
  test("timestamp + year(time)", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(timestamp(2020, 1, 1))
plot(year(time), title="y")
plot(weekofyear(time), title="w")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(Date.UTC(2020, 0, 1));
    expect(out.series.y?.[0]).toBe(2020);
    expect(out.series.w?.[0]).toBeGreaterThan(0);
  });

  test("array.from + stdev + lastindexof", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
a = array.from(1.0, 2.0, 3.0, 2.0)
plot(array.stdev(a))
plot(array.lastindexof(a, 2.0), title="li")
plot(array.median(a), title="med")
plot(array.range(a), title="rng")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBeCloseTo(Math.sqrt(0.5));
    expect(out.series.li?.[0]).toBe(3);
    expect(out.series.med?.[0]).toBe(2);
    expect(out.series.rng?.[0]).toBe(2);
  });

  test("matrix.pinv of identity", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
m = matrix.new<float>(2, 2, 0)
matrix.set(m, 0, 0, 1)
matrix.set(m, 1, 1, 1)
p = matrix.pinv(m)
plot(matrix.get(p, 0, 0))
plot(matrix.get(p, 1, 1), title="d")`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBeCloseTo(1);
    expect(out.series.d?.[0]).toBeCloseTo(1);
  });

  test("import stub index_2d_to_1d", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
import User/ArrayExtension/1 as ae
plot(ae.index_2d_to_1d(10, 5, 2, 3))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(13);
  });

  test("import registered library export", () => {
    const rt = new Runtime("TEST");
    rt.registerLibrarySource(
      "User",
      "MathLib",
      1,
      `//@version=5
library("MathLib")
export double(x) =>
    x * 2`,
    );
    const out = rt.run(
      `indicator("t")
import User/MathLib/1 as ml
plot(ml.double(21))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(42);
  });

  test("parse + unparse import", () => {
    const src = `indicator("t")
import User/Foo/1 as foo
plot(1)`;
    const tree = parse(src);
    expect(tree.kind).toBe("Script");
    const body = (tree as Script).body;
    expect(body.some((s) => s.kind === "Import")).toBe(true);
    expect(unparse(tree)).toContain("import User/Foo/1 as foo");
  });

  test("strategy.risk.allow_entry_in blocks short", () => {
    const out = new Runtime("TEST").run(
      `strategy("s")
strategy.risk.allow_entry_in("long")
if bar_index == 0
    strategy.entry("S", strategy.short, qty=1)
plot(strategy.position_size)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot?.[0]).toBe(0);
  });

  test("runProvider JsonBarProvider injected fetch", async () => {
    const provider = new JsonBarProvider({
      fetchBars: () => [{ open: 1, high: 2, low: 0, close: 1.5, volume: 3, time: 1 }],
    });
    const out = await new Runtime("TEST").runProvider(`indicator("t")\nplot(close)`, provider);
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(1.5);
  });
});
