/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  mathAbs,
  mathAvg,
  mathCeil,
  mathExp,
  mathFloor,
  mathLog,
  mathLog10,
  mathMax,
  mathMin,
  mathPow,
  mathRound,
  mathSign,
  mathSqrt,
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
