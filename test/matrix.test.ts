/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { PineMatrix } from "../src/runtime/matrix.ts";

describe("PineMatrix construct / get / set", () => {
  test("sized constructor fills initial / na", () => {
    const empty = new PineMatrix(2, 3);
    expect(empty.rows()).toBe(2);
    expect(empty.columns()).toBe(3);
    expect(empty.get(0, 0)).toBeNull();
    expect(empty.get(1, 2)).toBeNull();
    const filled = new PineMatrix(2, 2, 5);
    expect(filled.get(0, 0)).toBe(5);
    expect(filled.get(0, 1)).toBe(5);
    expect(filled.get(1, 0)).toBe(5);
    expect(filled.get(1, 1)).toBe(5);
  });

  test("set overwrites in-range slots", () => {
    const m = new PineMatrix(2, 2, 0);
    m.set(0, 1, 99);
    m.set(1, 0, 7);
    expect(m.get(0, 0)).toBe(0);
    expect(m.get(0, 1)).toBe(99);
    expect(m.get(1, 0)).toBe(7);
    expect(m.get(1, 1)).toBe(0);
  });
});

describe("PineMatrix OOB / na-safe get", () => {
  test("get OOB and non-finite → na", () => {
    const m = new PineMatrix(2, 2, 1);
    expect(m.get(2, 0)).toBeNull();
    expect(m.get(0, 2)).toBeNull();
    expect(m.get(99, 99)).toBeNull();
    expect(m.get(-1, 0)).toBeNull();
    expect(m.get(0, -1)).toBeNull();
    expect(m.get(Number.NaN, 0)).toBeNull();
    expect(m.get(0, Infinity)).toBeNull();
  });

  test("set OOB is a no-op", () => {
    const m = new PineMatrix(1, 1, 10);
    m.set(1, 0, 99);
    m.set(0, 1, 99);
    m.set(-1, 0, 99);
    m.set(0, -1, 99);
    m.set(Number.NaN, 0, 99);
    m.set(0, Infinity, 99);
    expect(m.get(0, 0)).toBe(10);
    expect(m.rows()).toBe(1);
    expect(m.columns()).toBe(1);
  });
});

describe("PineMatrix aggregates / det", () => {
  test("sum avg min max trace det", () => {
    const m = new PineMatrix(2, 2, 0);
    m.set(0, 0, 1);
    m.set(0, 1, 2);
    m.set(1, 0, 3);
    m.set(1, 1, 4);
    expect(m.sum()).toBe(10);
    expect(m.avg()).toBe(2.5);
    expect(m.min()).toBe(1);
    expect(m.max()).toBe(4);
    expect(m.trace()).toBe(5);
    expect(m.det()).toBeCloseTo(-2);
    expect(m.elementsCount()).toBe(4);
    expect(m.isSquare()).toBe(true);
    const c = m.copy();
    m.set(0, 0, 99);
    expect(c.get(0, 0)).toBe(1);
  });

  test("na element poisons sum/avg/min/max; non-square det is na", () => {
    const m = new PineMatrix(2, 2, 1);
    m.set(0, 1, null);
    expect(m.sum()).toBeNull();
    expect(m.avg()).toBeNull();
    expect(m.min()).toBeNull();
    expect(m.max()).toBeNull();
    const rect = new PineMatrix(2, 3, 1);
    expect(rect.det()).toBeNull();
    expect(rect.isSquare()).toBe(false);
    expect(rect.trace()).toBeNull();
  });

  test("det 1x1, known 2x2, singular, na cell", () => {
    const one = new PineMatrix(1, 1, 7);
    expect(one.det()).toBe(7);
    const zero1 = new PineMatrix(1, 1, 0);
    expect(zero1.det()).toBe(0);
    const m = new PineMatrix(2, 2, 0);
    m.set(0, 0, 1);
    m.set(0, 1, 2);
    m.set(1, 0, 3);
    m.set(1, 1, 4);
    expect(m.det()).toBe(-2);
    const singular = new PineMatrix(2, 2, 0);
    singular.set(0, 0, 1);
    singular.set(0, 1, 2);
    singular.set(1, 0, 2);
    singular.set(1, 1, 4);
    expect(singular.det()).toBe(0);
    const poisoned = m.copy();
    poisoned.set(1, 1, null);
    expect(poisoned.det()).toBeNull();
    poisoned.set(1, 1, Number.NaN);
    expect(poisoned.det()).toBeNull();
  });

  test("det 3x3 identity and known integer matrix", () => {
    const id = new PineMatrix(3, 3, 0);
    id.set(0, 0, 1);
    id.set(1, 1, 1);
    id.set(2, 2, 1);
    expect(id.det()).toBeCloseTo(1);
    expect(id.trace()).toBe(3);
    const m = new PineMatrix(3, 3, 0);
    m.set(0, 0, 6);
    m.set(0, 1, 1);
    m.set(0, 2, 1);
    m.set(1, 0, 4);
    m.set(1, 1, -2);
    m.set(1, 2, 5);
    m.set(2, 0, 2);
    m.set(2, 1, 8);
    m.set(2, 2, 7);
    expect(m.det()).toBeCloseTo(-306);
  });

  test("empty / invalid constructor dims do not throw", () => {
    const empty = new PineMatrix(0, 0);
    expect(empty.det()).toBeNull();
    expect(empty.isSquare()).toBe(false);
    expect(empty.sum()).toBe(0);
    expect(empty.avg()).toBeNull();
    expect(new PineMatrix(-1, 2).rows()).toBe(0);
    expect(new PineMatrix(2, Number.NaN).columns()).toBe(0);
    expect(new PineMatrix(Infinity, Infinity).elementsCount()).toBe(0);
  });

  test("row / col OOB → empty; get/set never throw", () => {
    const m = new PineMatrix(2, 2, 1);
    expect(m.row(-1)).toEqual([]);
    expect(m.col(99)).toEqual([]);
    expect(m.get(Number.NaN, 0)).toBeNull();
    m.set(Number.NaN, 0, 9);
    m.set(0, Infinity, 9);
    expect(m.get(0, 0)).toBe(1);
  });
});

describe("PineMatrix extras (copy/mult/inv/pow/predicates)", () => {
  test("mult / inv / pow / kron stay na-safe", () => {
    const m = new PineMatrix(2, 2, 0);
    m.set(0, 0, 1);
    m.set(0, 1, 2);
    m.set(1, 0, 3);
    m.set(1, 1, 4);
    const scaled = m.mult(2);
    expect(scaled?.get(0, 1)).toBe(4);
    const id = m.mult(m.inv()!);
    expect(id?.get(0, 0)).toBeCloseTo(1);
    expect(id?.get(1, 1)).toBeCloseTo(1);
    expect(id?.get(0, 1)).toBeCloseTo(0);
    expect(m.pow(0)?.isIdentity()).toBe(true);
    expect(m.pow(1)?.get(1, 0)).toBe(3);
    const singular = new PineMatrix(2, 2, 1);
    expect(singular.inv()).toBeNull();
    expect(singular.det()).toBe(0);
    const rect = new PineMatrix(2, 3, 1);
    expect(rect.inv()).toBeNull();
    expect(rect.pow(2)).toBeNull();
    const poisoned = m.copy();
    poisoned.set(0, 0, null);
    expect(poisoned.mult(m)).toBeNull();
    expect(poisoned.kron(m)).toBeNull();
    const k = new PineMatrix(1, 2, 0);
    k.set(0, 0, 1);
    k.set(0, 1, 2);
    const kron = k.kron(k);
    expect(kron?.rows()).toBe(1);
    expect(kron?.columns()).toBe(4);
    expect(kron?.get(0, 3)).toBe(4);
  });

  test("diff / rank / swap OOB is a no-op", () => {
    const a = new PineMatrix(2, 2, 1);
    const b = new PineMatrix(2, 2, 1);
    b.set(0, 0, 0);
    const d = a.diff(b);
    expect(d?.get(0, 0)).toBe(1);
    expect(d?.get(0, 1)).toBe(0);
    expect(a.diff(new PineMatrix(1, 2, 0))).toBeNull();
    expect(a.rank()).toBe(1);
    const id = new PineMatrix(2, 2, 0);
    id.set(0, 0, 1);
    id.set(1, 1, 1);
    expect(id.rank()).toBe(2);
    const poisoned = a.copy();
    poisoned.set(1, 1, null);
    expect(poisoned.rank()).toBeNull();
    a.swapRows(99, 0);
    a.swapColumns(Number.NaN, 0);
    expect(a.get(0, 0)).toBe(1);
  });
});

describe("PineMatrix transpose", () => {
  test("transpose swaps rows and columns", () => {
    const m = new PineMatrix(2, 3, 0);
    m.set(0, 1, 1);
    m.set(1, 2, 2);
    const t = m.transpose();
    expect(t.rows()).toBe(3);
    expect(t.columns()).toBe(2);
    expect(t.get(0, 0)).toBe(0);
    expect(t.get(1, 0)).toBe(1);
    expect(t.get(2, 1)).toBe(2);
    expect(m.rows()).toBe(2);
    expect(m.columns()).toBe(3);
    m.set(0, 1, 7);
    expect(t.get(1, 0)).toBe(1);
  });
});

function fill(rows: number[][]): PineMatrix {
  const m = new PineMatrix(rows.length, rows[0]!.length, 0);
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i]!.length; j++) m.set(i, j, rows[i]![j]!);
  }
  return m;
}

describe("PineMatrix inv / mult", () => {
  test("2×2 inv × original is identity", () => {
    const m = fill([
      [1, 2],
      [3, 4],
    ]);
    const inv = m.inv();
    expect(inv).not.toBeNull();
    expect(inv!.get(0, 0)).toBeCloseTo(-2);
    expect(inv!.get(0, 1)).toBeCloseTo(1);
    expect(inv!.get(1, 0)).toBeCloseTo(1.5);
    expect(inv!.get(1, 1)).toBeCloseTo(-0.5);
    const product = m.mult(inv!);
    expect(product).not.toBeNull();
    expect(product!.get(0, 0)).toBeCloseTo(1);
    expect(product!.get(0, 1)).toBeCloseTo(0);
    expect(product!.get(1, 0)).toBeCloseTo(0);
    expect(product!.get(1, 1)).toBeCloseTo(1);
  });

  test("singular inv → null", () => {
    const singular = fill([
      [1, 2],
      [2, 4],
    ]);
    expect(singular.inv()).toBeNull();
    expect(singular.det()).toBeCloseTo(0);
  });

  test("non-square inv → null", () => {
    expect(new PineMatrix(2, 3, 1).inv()).toBeNull();
  });

  test("incompatible mult → null; scalar mult scales cells", () => {
    const a = fill([
      [1, 2],
      [3, 4],
    ]);
    const b = new PineMatrix(3, 2, 1);
    expect(a.mult(b)).toBeNull();
    const scaled = a.mult(2);
    expect(scaled).not.toBeNull();
    expect(scaled!.get(0, 0)).toBe(2);
    expect(scaled!.get(0, 1)).toBe(4);
    expect(scaled!.get(1, 0)).toBe(6);
    expect(scaled!.get(1, 1)).toBe(8);
    expect(a.get(0, 0)).toBe(1);
  });

  test("na / non-finite poisons matrix×matrix; scalar keeps na cells", () => {
    const a = fill([
      [1, 2],
      [3, 4],
    ]);
    a.set(0, 1, null);
    expect(a.mult(a)).toBeNull();
    const scaled = a.mult(2);
    expect(scaled).not.toBeNull();
    expect(scaled!.get(0, 0)).toBe(2);
    expect(scaled!.get(0, 1)).toBeNull();
    expect(a.mult(Number.NaN)).toBeNull();
  });
});

describe("PineMatrix predicates", () => {
  test("identity / diagonal / symmetric on I", () => {
    const i = fill([
      [1, 0],
      [0, 1],
    ]);
    expect(i.isIdentity()).toBe(true);
    expect(i.isDiagonal()).toBe(true);
    expect(i.isSymmetric()).toBe(true);
    expect(i.isTriangular()).toBe(true);
    expect(i.isZero()).toBe(false);
    expect(i.isAntisymmetric()).toBe(false);
  });

  test("empty 0×0 follows Python (vacuous true); non-square is false", () => {
    const empty = new PineMatrix(0, 0);
    expect(empty.isZero()).toBe(true);
    expect(empty.isIdentity()).toBe(true);
    expect(empty.isDiagonal()).toBe(true);
    expect(empty.isSymmetric()).toBe(true);
    expect(empty.isAntisymmetric()).toBe(true);
    expect(empty.isTriangular()).toBe(true);
    const rect = new PineMatrix(2, 3, 0);
    expect(rect.isZero()).toBe(true);
    expect(rect.isIdentity()).toBe(false);
    expect(rect.isDiagonal()).toBe(false);
    expect(rect.isSymmetric()).toBe(false);
    expect(rect.isAntisymmetric()).toBe(false);
    expect(rect.isTriangular()).toBe(false);
  });

  test("na / non-finite: isZero treats na as 0; identity rejects na", () => {
    const z = new PineMatrix(2, 2, null);
    expect(z.isZero()).toBe(true);
    expect(z.isIdentity()).toBe(false);
    const nanOff = fill([
      [1, Number.NaN],
      [0, 1],
    ]);
    expect(nanOff.isIdentity()).toBe(false);
    expect(nanOff.isZero()).toBe(false);
    expect(nanOff.isDiagonal()).toBe(false);
    expect(nanOff.isSymmetric()).toBe(false);
  });

  test("antisymmetric and triangular", () => {
    const skew = fill([
      [0, 2],
      [-2, 0],
    ]);
    expect(skew.isAntisymmetric()).toBe(true);
    expect(skew.isSymmetric()).toBe(false);
    const upper = fill([
      [1, 2],
      [0, 3],
    ]);
    expect(upper.isTriangular()).toBe(true);
    expect(upper.isDiagonal()).toBe(false);
    const dense = fill([
      [1, 2],
      [3, 4],
    ]);
    expect(dense.isTriangular()).toBe(false);
  });
});

describe("PineMatrix pow / kron / rank / diff / swap", () => {
  test("pow: 0 → I, 2 → square, negative → inv then pow", () => {
    const m = fill([
      [1, 1],
      [0, 1],
    ]);
    const p0 = m.pow(0);
    expect(p0).not.toBeNull();
    expect(p0!.isIdentity()).toBe(true);
    const p2 = m.pow(2);
    expect(p2).not.toBeNull();
    expect(p2!.get(0, 0)).toBe(1);
    expect(p2!.get(0, 1)).toBe(2);
    expect(p2!.get(1, 0)).toBe(0);
    expect(p2!.get(1, 1)).toBe(1);
    const p3 = m.pow(3);
    expect(p3!.get(0, 1)).toBe(3);
    const inv = m.pow(-1);
    expect(inv).not.toBeNull();
    expect(inv!.get(0, 0)).toBeCloseTo(1);
    expect(inv!.get(0, 1)).toBeCloseTo(-1);
    expect(inv!.get(1, 1)).toBeCloseTo(1);
    expect(new PineMatrix(2, 3, 1).pow(2)).toBeNull();
    expect(fill([
      [1, 2],
      [2, 4],
    ]).pow(-1)).toBeNull();
  });

  test("kronecker product", () => {
    const a = fill([
      [1, 2],
      [3, 4],
    ]);
    const b = fill([
      [0, 5],
      [6, 7],
    ]);
    const k = a.kron(b);
    expect(k).not.toBeNull();
    expect(k!.rows()).toBe(4);
    expect(k!.columns()).toBe(4);
    expect(k!.get(0, 0)).toBe(0);
    expect(k!.get(0, 1)).toBe(5);
    expect(k!.get(0, 2)).toBe(0);
    expect(k!.get(0, 3)).toBe(10);
    expect(k!.get(1, 0)).toBe(6);
    expect(k!.get(1, 1)).toBe(7);
    expect(k!.get(1, 2)).toBe(12);
    expect(k!.get(1, 3)).toBe(14);
    expect(k!.get(2, 0)).toBe(0);
    expect(k!.get(2, 3)).toBe(20);
    expect(k!.get(3, 0)).toBe(18);
    expect(k!.get(3, 3)).toBe(28);
    a.set(0, 0, null);
    expect(a.kron(b)).toBeNull();
  });

  test("rank: full / deficient / empty / na", () => {
    expect(fill([
      [1, 0],
      [0, 1],
    ]).rank()).toBe(2);
    expect(fill([
      [1, 2],
      [2, 4],
    ]).rank()).toBe(1);
    expect(new PineMatrix(2, 2, 0).rank()).toBe(0);
    expect(new PineMatrix(0, 0).rank()).toBe(0);
    const na = fill([
      [1, 2],
      [3, 4],
    ]);
    na.set(1, 1, null);
    expect(na.rank()).toBeNull();
  });

  test("diff is element-wise subtraction; shape mismatch → null", () => {
    const a = fill([
      [5, 4],
      [3, 2],
    ]);
    const b = fill([
      [1, 1],
      [1, 0],
    ]);
    b.set(1, 1, null);
    const d = a.diff(b);
    expect(d).not.toBeNull();
    expect(d!.get(0, 0)).toBe(4);
    expect(d!.get(0, 1)).toBe(3);
    expect(d!.get(1, 0)).toBe(2);
    expect(d!.get(1, 1)).toBeNull();
    expect(a.diff(new PineMatrix(2, 3, 0))).toBeNull();
  });

  test("swapRows / swapColumns; OOB is a no-op", () => {
    const m = fill([
      [1, 2],
      [3, 4],
    ]);
    m.swapRows(0, 1);
    expect(m.get(0, 0)).toBe(3);
    expect(m.get(0, 1)).toBe(4);
    expect(m.get(1, 0)).toBe(1);
    expect(m.get(1, 1)).toBe(2);
    m.swapColumns(0, 1);
    expect(m.get(0, 0)).toBe(4);
    expect(m.get(0, 1)).toBe(3);
    expect(m.get(1, 0)).toBe(2);
    expect(m.get(1, 1)).toBe(1);
    m.swapRows(-1, 0);
    m.swapRows(0, 9);
    m.swapColumns(Number.NaN, 0);
    m.swapColumns(0, 2);
    expect(m.get(0, 0)).toBe(4);
    expect(m.get(1, 1)).toBe(1);
  });
});
