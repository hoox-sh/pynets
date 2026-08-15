import { describe, expect, test } from "bun:test";
import { NA, PineSeries } from "../src/index.ts";

describe("PineSeries lookback polarity", () => {
  test("get(0) is current, get(1) is previous, negative/OOB is na", () => {
    const s = new PineSeries();
    s.push(10);
    s.push(20);
    s.push(30);
    expect(s.get(0)).toBe(30);
    expect(s.get(1)).toBe(20);
    expect(s.get(2)).toBe(10);
    expect(s.get(3)).toBe(NA);
    expect(s.get(-1)).toBe(NA);
  });

  test("non-finite / huge offsets are na and never throw", () => {
    const s = new PineSeries();
    s.push(1);
    expect(s.get(Number.NaN)).toBe(NA);
    expect(s.get(Number.POSITIVE_INFINITY)).toBe(NA);
    expect(s.get(Number.NEGATIVE_INFINITY)).toBe(NA);
    expect(s.get(1.9)).toBe(NA);
    expect(s.get(0.9)).toBe(1);
    expect(() => s.get(-1e20)).not.toThrow();
  });
});
