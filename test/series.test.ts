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
});
