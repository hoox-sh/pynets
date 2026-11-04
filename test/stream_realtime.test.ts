/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * RuntimeStream realtime last-bar semantics + forming-bar re-ticks.
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

const BARS = [
  { open: 100, high: 101, low: 99, close: 100, volume: 10, time: 1_700_000_000_000 },
  { open: 100, high: 102, low: 99, close: 101, volume: 11, time: 1_700_000_060_000 },
];

const FLAGS = `indicator("t")
plot(barstate.isrealtime, "rt")
plot(barstate.isconfirmed, "cf")
plot(barstate.ishistory, "hist")
plot(barstate.islastconfirmedhistory, "lch")`;

describe("RuntimeStream realtime", () => {
  test("push marks the last bar realtime; close confirms history flags", () => {
    const stream = new Runtime("TEST").stream(FLAGS);
    const out = stream.push(BARS[0]!);
    expect(out?.error).toBeUndefined();
    expect(out?.series.rt).toEqual([1]);
    expect(out?.series.cf).toEqual([1]);
    expect(out?.series.hist).toEqual([0]);
    expect(out?.series.lch).toEqual([0]);

    stream.push(BARS[1]!);
    const closed = stream.close();
    expect(closed.error).toBeUndefined();
    expect(closed.series.rt).toEqual([0, 0]);
    expect(closed.series.cf).toEqual([1, 1]);
    expect(closed.series.hist).toEqual([1, 1]);
    expect(closed.series.lch).toEqual([0, 1]);
  });

  test("updateLastBar replaces the forming bar without advancing barCount", () => {
    const stream = new Runtime("TEST").stream(`indicator("t")\nplot(close)`);
    stream.push(BARS[0]!);
    stream.push(BARS[1]!);
    expect(stream.barCount).toBe(2);
    const out = stream.updateLastBar({ ...BARS[1]!, close: 105, high: 106 });
    expect(out.error).toBeUndefined();
    expect(out.plots).toEqual([100, 105]);
    expect(stream.barCount).toBe(2);
  });

  test("once re-fires correctly when the forming bar is re-ticked", () => {
    const src = `indicator("t")
var n = 0
once
    n := n + 1
plot(n)`;
    const stream = new Runtime("TEST").stream(src);
    stream.push(BARS[0]!);
    const first = stream.push(BARS[1]!);
    expect(first?.plots).toEqual([1, 1]);
    const re = stream.updateLastBar({ ...BARS[1]!, close: 103 });
    expect(re.plots).toEqual([1, 1]);
    expect(stream.barCount).toBe(2);
  });

  test("alert freq once_per_bar_close is gated on the forming bar", () => {
    const src = `indicator("t")
alert("tick", alert.freq_once_per_bar_close)
plot(close)`;
    const stream = new Runtime("TEST").stream(src);
    stream.push(BARS[0]!);
    const out = stream.updateLastBar(BARS[0]!);
    expect(out.error).toBeUndefined();
  });
});
