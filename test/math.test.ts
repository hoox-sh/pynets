/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  mathAbs,
  mathAcos,
  mathAsin,
  mathAtan,
  mathAvg,
  mathCeil,
  mathCos,
  mathExp,
  mathFixnan,
  mathFloor,
  mathIff,
  mathIsFinite,
  mathLog,
  mathLog10,
  mathMax,
  mathMin,
  mathPow,
  mathRound,
  mathSign,
  mathSin,
  mathSqrt,
  mathSum,
  mathTan,
  mathToDegrees,
  mathToRadians,
} from "../src/runtime/math.ts";

describe("math.abs", () => {
  test("numeric", () => {
    expect(mathAbs(5)).toBe(5);
    expect(mathAbs(-5)).toBe(5);
    expect(mathAbs(0)).toBe(0);
  });

  test("na in → na", () => {
    expect(mathAbs(null)).toBeNull();
  });
});

describe("math.sign", () => {
  test("returns -1, 0, 1", () => {
    expect(mathSign(10)).toBe(1);
    expect(mathSign(-10)).toBe(-1);
    expect(mathSign(0)).toBe(0);
  });

  test("na in → na", () => {
    expect(mathSign(null)).toBeNull();
  });
});

describe("math.sqrt", () => {
  test("numeric", () => {
    expect(mathSqrt(4)).toBe(2);
    expect(mathSqrt(0)).toBe(0);
    expect(mathSqrt(2)).toBeCloseTo(Math.sqrt(2));
  });

  test("na if x<0 or na", () => {
    expect(mathSqrt(-1)).toBeNull();
    expect(mathSqrt(null)).toBeNull();
  });
});

describe("math.log", () => {
  test("natural log", () => {
    expect(mathLog(Math.E)).toBeCloseTo(1);
    expect(mathLog(1)).toBeCloseTo(0);
  });

  test("na if x<=0 or na", () => {
    expect(mathLog(0)).toBeNull();
    expect(mathLog(-1)).toBeNull();
    expect(mathLog(null)).toBeNull();
  });
});

describe("math.log10", () => {
  test("numeric", () => {
    expect(mathLog10(100)).toBeCloseTo(2);
    expect(mathLog10(1)).toBeCloseTo(0);
  });

  test("na if x<=0 or na", () => {
    expect(mathLog10(0)).toBeNull();
    expect(mathLog10(-10)).toBeNull();
    expect(mathLog10(null)).toBeNull();
  });
});

describe("math.exp", () => {
  test("numeric", () => {
    expect(mathExp(0)).toBe(1);
    expect(mathExp(1)).toBeCloseTo(Math.E);
  });

  test("na in → na", () => {
    expect(mathExp(null)).toBeNull();
  });
});

describe("math.pow", () => {
  test("numeric", () => {
    expect(mathPow(2, 3)).toBe(8);
    expect(mathPow(4, 0.5)).toBe(2);
  });

  test("any na → na", () => {
    expect(mathPow(null, 2)).toBeNull();
    expect(mathPow(2, null)).toBeNull();
    expect(mathPow(null, null)).toBeNull();
  });

  test("non-finite in/out is na (no Math.pow surprises)", () => {
    expect(mathPow(Number.NaN, 2)).toBeNull();
    expect(mathPow(2, Number.POSITIVE_INFINITY)).toBeNull();
    expect(mathPow(-1, 0.5)).toBeNull();
    expect(mathPow(0, -1)).toBeNull();
  });
});

describe("math.max", () => {
  test("numeric", () => {
    expect(mathMax(1, 2, 3)).toBe(3);
    expect(mathMax(-1, -2, -3)).toBe(-1);
    expect(mathMax(1.5, 2.5, 3.5)).toBe(3.5);
    expect(mathMax(7)).toBe(7);
  });

  test("any na or empty → na", () => {
    expect(mathMax()).toBeNull();
    expect(mathMax(null)).toBeNull();
    expect(mathMax(1, null, 3)).toBeNull();
    expect(mathMax(null, 2)).toBeNull();
  });
});

describe("math.min", () => {
  test("numeric", () => {
    expect(mathMin(1, 2, 3)).toBe(1);
    expect(mathMin(-1, -2, -3)).toBe(-3);
    expect(mathMin(1.5, 2.5, 3.5)).toBe(1.5);
    expect(mathMin(7)).toBe(7);
  });

  test("any na or empty → na", () => {
    expect(mathMin()).toBeNull();
    expect(mathMin(null)).toBeNull();
    expect(mathMin(1, null, 3)).toBeNull();
    expect(mathMin(null, 2)).toBeNull();
  });
});

describe("math.round", () => {
  test("numeric", () => {
    expect(mathRound(1.5)).toBe(2);
    expect(mathRound(1.4)).toBe(1);
    expect(mathRound(-1.5)).toBe(-2);
    expect(mathRound(1.55, 1)).toBeCloseTo(1.6);
  });

  test("na in → na", () => {
    expect(mathRound(null)).toBeNull();
    expect(mathRound(1.5, null)).toBeNull();
  });
});

describe("math.floor", () => {
  test("numeric", () => {
    expect(mathFloor(1.9)).toBe(1);
    expect(mathFloor(-1.9)).toBe(-2);
  });

  test("na in → na", () => {
    expect(mathFloor(null)).toBeNull();
  });
});

describe("math.ceil", () => {
  test("numeric", () => {
    expect(mathCeil(1.1)).toBe(2);
    expect(mathCeil(-1.9)).toBe(-1);
  });

  test("na in → na", () => {
    expect(mathCeil(null)).toBeNull();
  });
});

describe("math.trig / sum / isfinite", () => {
  test("sin/cos/atan", () => {
    expect(mathSin(0)).toBe(0);
    expect(mathCos(0)).toBe(1);
    expect(mathTan(0)).toBe(0);
    expect(mathAtan(0)).toBe(0);
    expect(mathAsin(0)).toBe(0);
    expect(mathAcos(1)).toBe(0);
    expect(mathAsin(2)).toBeNull();
  });

  test("degree conversion + sum + isfinite", () => {
    expect(mathToDegrees(Math.PI)).toBeCloseTo(180);
    expect(mathToRadians(180)).toBeCloseTo(Math.PI);
    expect(mathSum(1, 2, 3)).toBe(6);
    expect(mathSum(1, null)).toBeNull();
    expect(mathIsFinite(1)).toBe(1);
    expect(mathIsFinite(null)).toBeNull();
  });
});

describe("math.iff / math.fixnan", () => {
  test("iff: na cond → na; 0 is false; nonzero is true", () => {
    expect(mathIff(null, 10, 0)).toBeNull();
    expect(mathIff(Number.NaN, 10, 0)).toBeNull();
    expect(mathIff(1, 10, 0)).toBe(10);
    expect(mathIff(0, 10, 0)).toBe(0);
    expect(mathIff(1, null, 0)).toBeNull();
  });

  test("fixnan: na / non-finite → 0; finite passes through", () => {
    expect(mathFixnan(null)).toBe(0);
    expect(mathFixnan(Number.NaN)).toBe(0);
    expect(mathFixnan(Number.POSITIVE_INFINITY)).toBe(0);
    expect(mathFixnan(7)).toBe(7);
    expect(mathFixnan(-1.5)).toBe(-1.5);
  });
});

describe("math non-finite in → na", () => {
  test("trig / log / exp / sign", () => {
    expect(mathSign(Number.NaN)).toBeNull();
    expect(mathExp(Number.POSITIVE_INFINITY)).toBeNull();
    expect(mathLog(Number.NaN)).toBeNull();
    expect(mathLog(8, 2)).toBeCloseTo(3);
    expect(mathLog(8, 1)).toBeNull();
    expect(mathLog(8, null)).toBeNull();
    expect(mathSin(null)).toBeNull();
    expect(mathTan(Number.NaN)).toBeNull();
  });
});

describe("math.avg", () => {
  test("numeric", () => {
    expect(mathAvg(1, 2, 3)).toBe(2);
    expect(mathAvg(10, 20, 30)).toBe(20);
    expect(mathAvg(4)).toBe(4);
  });

  test("any na or empty → na", () => {
    expect(mathAvg()).toBeNull();
    expect(mathAvg(null)).toBeNull();
    expect(mathAvg(1, null, 3)).toBeNull();
  });
});
