/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Canonical TA manifest must stay wired to both backends: every bare
 * `ta.<attr>` auto-call on the whitelist resolves identically.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import {
  EXTRA_TA_NAMES,
  TA_BARE_ATTRS,
  TA_METHODS,
} from "../src/runtime/ta_names.ts";

const BARS = Array.from({ length: 40 }, (_, i) => ({
  open: 100 + i * 0.2,
  high: 101 + i * 0.3,
  low: 99 - i * 0.1,
  close: 100.5 + i * 0.15,
  volume: 1000 + i * 5,
  time: i * 86_400_000,
}));

describe("TA manifest", () => {
  test("basic, extra, and bare names are present", () => {
    expect(TA_METHODS.has("sma")).toBe(true);
    expect(TA_METHODS.has("atr")).toBe(true);
    for (const name of ["kcw", "percentile_linear_interpolation"])
      expect(EXTRA_TA_NAMES.has(name) || EXTRA_TA_NAMES.has(`ta.${name}`)).toBe(
        true,
      );
    expect(TA_METHODS.has("vwap")).toBe(true);
    expect(TA_BARE_ATTRS.has("vwap")).toBe(true);
    expect(TA_BARE_ATTRS.has("rsi")).toBe(false);
  });

  test("every bare attr auto-calls on both backends", () => {
    for (const attr of TA_BARE_ATTRS) {
      const src = `indicator("t")\nplot(ta.${attr})`;
      const compiled = new Runtime("TEST", { mode: "compile" }).run(src, BARS);
      const interpreted = new Runtime("TEST").run(src, BARS);
      expect(compiled.error).toBeUndefined();
      expect(interpreted.error).toBeUndefined();
      expect(compiled.plots).toEqual(interpreted.plots);
    }
  });
});
