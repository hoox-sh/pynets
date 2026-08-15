/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Locks the JS compile helper contract (Python object-mode analog:
 * pynescript.compiler.numba_builtins — na_num / numba_pine_eq / ne / nz).
 */
import { describe, expect, test } from "bun:test";
import {
  NA,
  defaultTime,
  defaultVolume,
  histGet,
  histStore,
  hold,
  isNaCell,
  naNum,
  nz,
  pineEq,
  pineGt,
  pineGtE,
  pineLt,
  pineLtE,
  pineNe,
  safeAdd,
  safeDiv,
  safeMod,
  safeMul,
  safeNeg,
  safeSub,
  toFloatArr,
} from "../src/runtime/compile/helpers.ts";

describe("naNum", () => {
  test("null / NaN / Infinity → null", () => {
    expect(naNum(null)).toBeNull();
    expect(naNum(undefined)).toBeNull();
    expect(naNum(Number.NaN)).toBeNull();
    expect(naNum(Number.POSITIVE_INFINITY)).toBeNull();
    expect(naNum(Number.NEGATIVE_INFINITY)).toBeNull();
  });

  test("finite number stays", () => {
    expect(naNum(0)).toBe(0);
    expect(naNum(1.5)).toBe(1.5);
    expect(naNum(-3)).toBe(-3);
  });

  test("true → 1, false → 0", () => {
    expect(naNum(true)).toBe(1);
    expect(naNum(false)).toBe(0);
  });

  test("non-numeric junk → null", () => {
    expect(naNum("1")).toBeNull();
    expect(naNum({})).toBeNull();
  });
});

describe("isNaCell", () => {
  test("null / NaN / Infinity are na", () => {
    expect(isNaCell(null)).toBe(true);
    expect(isNaCell(undefined)).toBe(true);
    expect(isNaCell(Number.NaN)).toBe(true);
    expect(isNaCell(Number.POSITIVE_INFINITY)).toBe(true);
  });

  test("finite / bool / other are not na", () => {
    expect(isNaCell(0)).toBe(false);
    expect(isNaCell(true)).toBe(false);
    expect(isNaCell("x")).toBe(false);
  });
});

describe("pineEq", () => {
  test("na==na is true", () => {
    expect(pineEq(null, null)).toBe(true);
    expect(pineEq(Number.NaN, Number.NaN)).toBe(true);
    expect(pineEq(null, Number.NaN)).toBe(true);
    expect(pineEq(Number.POSITIVE_INFINITY, null)).toBe(true);
  });

  test("na==0 is false", () => {
    expect(pineEq(null, 0)).toBe(false);
    expect(pineEq(0, null)).toBe(false);
    expect(pineEq(Number.NaN, 0)).toBe(false);
  });

  test("1==1 is true", () => {
    expect(pineEq(1, 1)).toBe(true);
    expect(pineEq(1, 2)).toBe(false);
  });
});

describe("pineNe", () => {
  test("any na compare is false (Python numba_pine_ne)", () => {
    expect(pineNe(null, null)).toBe(false);
    expect(pineNe(Number.NaN, Number.NaN)).toBe(false);
    expect(pineNe(null, 0)).toBe(false);
    expect(pineNe(0, null)).toBe(false);
    expect(pineNe(Number.NaN, 1)).toBe(false);
    expect(pineNe(1, Number.POSITIVE_INFINITY)).toBe(false);
  });

  test("finite inequality", () => {
    expect(pineNe(1, 2)).toBe(true);
    expect(pineNe(1, 1)).toBe(false);
  });
});

describe("pineLt / pineGt / pineLtE / pineGtE", () => {
  test("na involved → false", () => {
    expect(pineLt(null, 1)).toBe(false);
    expect(pineLt(1, null)).toBe(false);
    expect(pineLt(null, null)).toBe(false);
    expect(pineLt(Number.NaN, 1)).toBe(false);
    expect(pineGt(null, 1)).toBe(false);
    expect(pineGt(1, null)).toBe(false);
    expect(pineGt(null, null)).toBe(false);
    expect(pineLtE(null, 1)).toBe(false);
    expect(pineGtE(1, null)).toBe(false);
  });

  test("finite compare", () => {
    expect(pineLt(1, 2)).toBe(true);
    expect(pineLt(2, 1)).toBe(false);
    expect(pineLt(1, 1)).toBe(false);
    expect(pineGt(2, 1)).toBe(true);
    expect(pineGt(1, 2)).toBe(false);
    expect(pineLtE(1, 1)).toBe(true);
    expect(pineGtE(1, 1)).toBe(true);
  });
});

describe("safe arithmetic", () => {
  test("safeDiv(1, 0) → null (non-finite out is na)", () => {
    expect(safeDiv(1, 0)).toBeNull();
    expect(safeDiv(-1, 0)).toBeNull();
  });

  test("safeAdd(null, 1) → null", () => {
    expect(safeAdd(null, 1)).toBeNull();
    expect(safeAdd(1, null)).toBeNull();
    expect(safeAdd(Number.NaN, 1)).toBeNull();
  });

  test("finite ops and other na / non-finite outs", () => {
    expect(safeAdd(1, 2)).toBe(3);
    expect(safeSub(5, 2)).toBe(3);
    expect(safeSub(null, 1)).toBeNull();
    expect(safeMul(3, 4)).toBe(12);
    expect(safeMul(null, 4)).toBeNull();
    expect(safeDiv(6, 3)).toBe(2);
    expect(safeMod(5, 2)).toBe(1);
    expect(safeMod(1, 0)).toBeNull();
    expect(safeNeg(4)).toBe(-4);
    expect(safeNeg(null)).toBeNull();
  });
});

describe("nz", () => {
  test("nz(null) → 0; nz(null, 5) → 5", () => {
    expect(nz(null)).toBe(0);
    expect(nz(null, 5)).toBe(5);
  });

  test("finite / NaN replacement", () => {
    expect(nz(3)).toBe(3);
    expect(nz(Number.NaN)).toBe(0);
    expect(nz(Number.NaN, 9)).toBe(9);
    expect(nz(null, null)).toBe(0);
  });
});

describe("histGet / histStore", () => {
  test("[0] current, [1] previous, OOB / negative → null", () => {
    const arr: Array<number | null> = [10, 20, 30];
    expect(histGet(arr, 2, 0)).toBe(30);
    expect(histGet(arr, 2, 1)).toBe(20);
    expect(histGet(arr, 2, 2)).toBe(10);
    expect(histGet(arr, 2, 3)).toBeNull();
    expect(histGet(arr, 2, -1)).toBeNull();
    expect(histGet(arr, 0, 1)).toBeNull();
  });

  test("na / non-finite offset → null", () => {
    const arr: Array<number | null> = [1, 2, 3];
    expect(histGet(arr, 2, null)).toBeNull();
    expect(histGet(arr, 2, Number.NaN)).toBeNull();
    expect(histGet(arr, 2, Number.POSITIVE_INFINITY)).toBeNull();
  });

  test("histStore writes naNum at bar", () => {
    const arr: Array<number | null> = [null, null, null];
    histStore(arr, 1, 7);
    expect(arr[1]).toBe(7);
    histStore(arr, 1, Number.NaN);
    expect(arr[1]).toBeNull();
    histStore(arr, -1, 9);
    histStore(arr, 99, 9);
    expect(arr).toEqual([null, null, null]);
  });
});

describe("defaultVolume / defaultTime", () => {
  test("defaultVolume(n) is n ones", () => {
    expect(defaultVolume(0)).toEqual([]);
    expect(defaultVolume(3)).toEqual([1, 1, 1]);
  });

  test("defaultTime is i * 60000", () => {
    expect(defaultTime(0)).toEqual([]);
    expect(defaultTime(4)).toEqual([0, 60_000, 120_000, 180_000]);
  });
});

describe("toFloatArr", () => {
  test("pads / truncates to n", () => {
    expect(toFloatArr([1, 2, 3], 5, 0)).toEqual([1, 2, 3, 0, 0]);
    expect(toFloatArr([1, 2, 3, 4, 5], 3, 0)).toEqual([1, 2, 3]);
  });

  test("null source fills missing; non-finite cells → na", () => {
    expect(toFloatArr(null, 3, 0)).toEqual([0, 0, 0]);
    expect(toFloatArr([1, Number.NaN], 3, 8)).toEqual([1, null, 8]);
    expect(toFloatArr([1], 2, null)).toEqual([1, null]);
  });
});

describe("hold", () => {
  test("keeps objects and naNums scalars", () => {
    const obj = { a: 1 };
    expect(hold(obj)).toBe(obj);
    expect(hold(null)).toBe(null);
    expect(hold(Number.NaN)).toBe(null);
    expect(hold(3)).toBe(3);
  });
});

describe("NA sentinel", () => {
  test("NA is null", () => {
    expect(NA).toBeNull();
  });
});
