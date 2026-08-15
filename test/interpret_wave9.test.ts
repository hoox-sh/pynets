/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [{ close: 1 }, { close: 2 }];

describe("interpret wave9", () => {
  test("map.put_all + size", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
a = map.new<float,float>()
b = map.new<float,float>()
map.put(a, 1, 10)
map.put(b, 2, 20)
map.put_all(a, b)
plot(map.size(a))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(2);
  });

  test("ticker.kagi is a value", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
t = ticker.kagi("AAPL")
plot(na(t) ? 0 : 1)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(1);
  });

  test("math.random with one bound is in range", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(math.random(0, 0))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(0);
  });

  test("color.r of named color", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
plot(color.r(color.red))`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.plots[0]).toBe(255);
  });

  test("runtime.error aborts with message", () => {
    const out = new Runtime("TEST").run(
      `indicator("t")
runtime.error("halted")
plot(1)`,
      BARS,
    );
    expect(out.error).toContain("halted");
  });
});
