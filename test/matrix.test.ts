/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { PineMatrix } from "../src/runtime/matrix.ts";
import { UdtType } from "../src/runtime/udt.ts";

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

describe("PineMatrix addRow / addCol / remove", () => {
  test("addRow appends, inserts, pads na, truncates", () => {
    const m = fill([
      [1, 2],
      [3, 4],
    ]);
    m.addRow();
    expect(m.rows()).toBe(3);
    expect(m.get(2, 0)).toBeNull();
    expect(m.get(2, 1)).toBeNull();
    m.addRow(0, [9, 8]);
    expect(m.rows()).toBe(4);
    expect(m.get(0, 0)).toBe(9);
    expect(m.get(1, 0)).toBe(1);
    expect(m.get(2, 0)).toBe(3);
    m.addRow(undefined, [7]);
    expect(m.rows()).toBe(5);
    expect(m.get(4, 0)).toBe(7);
    expect(m.get(4, 1)).toBeNull();
    m.addRow(m.rows(), [1, 2, 3]);
    expect(m.columns()).toBe(2);
    expect(m.get(5, 0)).toBe(1);
    expect(m.get(5, 1)).toBe(2);
  });

  test("addRow on 0×0 adopts column count; negative index is a no-op", () => {
    const m = new PineMatrix(0, 0);
    m.addRow(0, [1, 2, 3]);
    expect(m.rows()).toBe(1);
    expect(m.columns()).toBe(3);
    expect(m.get(0, 1)).toBe(2);
    m.addRow(-1, [9, 8, 7]);
    m.addRow(Number.NaN, [9, 8, 7]);
    expect(m.rows()).toBe(1);
    expect(m.get(0, 0)).toBe(1);
  });

  test("addCol appends / inserts; 0×0 becomes N×1", () => {
    const m = fill([
      [1, 2],
      [3, 4],
    ]);
    m.addCol(undefined, [5, 6]);
    expect(m.columns()).toBe(3);
    expect(m.get(0, 2)).toBe(5);
    expect(m.get(1, 2)).toBe(6);
    m.addCol(0, [9, 8]);
    expect(m.columns()).toBe(4);
    expect(m.get(0, 0)).toBe(9);
    expect(m.get(0, 1)).toBe(1);
    const empty = new PineMatrix(0, 0);
    empty.addCol(0, [1, 3]);
    expect(empty.rows()).toBe(2);
    expect(empty.columns()).toBe(1);
    expect(empty.get(0, 0)).toBe(1);
    expect(empty.get(1, 0)).toBe(3);
  });

  test("removeRow / removeCol; OOB is a no-op", () => {
    const m = fill([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    m.removeRow(1);
    expect(m.rows()).toBe(2);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(1, 0)).toBe(7);
    m.removeCol(1);
    expect(m.columns()).toBe(2);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(0, 1)).toBe(3);
    m.removeRow(99);
    m.removeRow(-1);
    m.removeCol(Number.NaN);
    expect(m.rows()).toBe(2);
    expect(m.columns()).toBe(2);
    expect(m.get(0, 0)).toBe(1);
  });
});

describe("PineMatrix reshape / concat / submatrix", () => {
  test("reshape is row-major and returns a new matrix", () => {
    const m = fill([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const r = m.reshape(3, 2);
    expect(r).not.toBeNull();
    expect(r!.rows()).toBe(3);
    expect(r!.columns()).toBe(2);
    expect(r!.get(0, 0)).toBe(1);
    expect(r!.get(0, 1)).toBe(2);
    expect(r!.get(1, 0)).toBe(3);
    expect(r!.get(1, 1)).toBe(4);
    expect(r!.get(2, 0)).toBe(5);
    expect(r!.get(2, 1)).toBe(6);
    expect(m.rows()).toBe(2);
    expect(m.columns()).toBe(3);
    expect(m.get(0, 0)).toBe(1);
    expect(m.reshape(2, 2)).toBeNull();
    expect(m.reshape(-1, 6)).toBeNull();
    expect(m.reshape(Number.NaN, 6)).toBeNull();
    const empty = new PineMatrix(0, 3);
    const z = empty.reshape(0, 0);
    expect(z).not.toBeNull();
    expect(z!.rows()).toBe(0);
    expect(z!.columns()).toBe(0);
  });

  test("concat stacks vertically when columns match", () => {
    const a = fill([
      [1, 2],
      [3, 4],
    ]);
    const b = fill([[5, 6]]);
    const c = a.concat(b);
    expect(c).not.toBeNull();
    expect(c!.rows()).toBe(3);
    expect(c!.columns()).toBe(2);
    expect(c!.get(2, 0)).toBe(5);
    expect(c!.get(2, 1)).toBe(6);
    expect(a.rows()).toBe(2);
    expect(a.concat(new PineMatrix(1, 3, 0))).toBeNull();
  });

  test("submatrix is half-open and returns a copy", () => {
    const m = fill([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    const s = m.submatrix(0, 2, 1, 3);
    expect(s).not.toBeNull();
    expect(s!.rows()).toBe(2);
    expect(s!.columns()).toBe(2);
    expect(s!.get(0, 0)).toBe(2);
    expect(s!.get(0, 1)).toBe(3);
    expect(s!.get(1, 0)).toBe(5);
    expect(s!.get(1, 1)).toBe(6);
    s!.set(0, 0, 99);
    expect(m.get(0, 1)).toBe(2);
    expect(m.submatrix(0, 2, 1, 4)).toBeNull();
    expect(m.submatrix(2, 1, 0, 1)).toBeNull();
    expect(m.submatrix(-1, 1, 0, 1)).toBeNull();
    const empty = m.submatrix(1, 1, 0, 3);
    expect(empty).not.toBeNull();
    expect(empty!.rows()).toBe(0);
    expect(empty!.columns()).toBe(3);
  });
});

describe("PineMatrix sort / reverse / median / mode / extra predicates", () => {
  test("sort rows by column; na last; desc", () => {
    const m = fill([
      [3, 30],
      [1, 10],
      [2, 20],
    ]);
    m.sort(0);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(1, 0)).toBe(2);
    expect(m.get(2, 0)).toBe(3);
    expect(m.get(0, 1)).toBe(10);
    m.sort(0, "desc");
    expect(m.get(0, 0)).toBe(3);
    expect(m.get(1, 0)).toBe(2);
    expect(m.get(2, 0)).toBe(1);
    m.set(1, 0, null);
    m.sort(0);
    expect(m.get(0, 0)).toBe(1);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(2, 0)).toBeNull();
    m.sort(99);
    expect(m.get(0, 0)).toBe(1);
  });

  test("sort / sortIndices by UDT sort_field", () => {
    const T = new UdtType("T", [
      { name: "x", default: 0 },
      { name: "y", default: 0 },
    ]);
    const m = new PineMatrix(3, 1);
    m.set(0, 0, T.newInstance({ x: 3, y: 30 }));
    m.set(1, 0, T.newInstance({ x: 1, y: 10 }));
    m.set(2, 0, T.newInstance({ x: 2, y: 20 }));
    expect(m.sortIndices(0, "asc", 0)).toEqual([1, 2, 0]);
    m.sort(0, "asc", "x");
    expect((m.get(0, 0) as unknown as { get: (n: string) => unknown }).get("x")).toBe(1);
    expect((m.get(2, 0) as unknown as { get: (n: string) => unknown }).get("x")).toBe(3);
  });

  test("reverse flips element order (rows then each row)", () => {
    const m = fill([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    m.reverse();
    expect(m.get(0, 0)).toBe(6);
    expect(m.get(0, 1)).toBe(5);
    expect(m.get(0, 2)).toBe(4);
    expect(m.get(1, 0)).toBe(3);
    expect(m.get(1, 1)).toBe(2);
    expect(m.get(1, 2)).toBe(1);
  });

  test("median / mode skip na; empty → na", () => {
    const m = fill([
      [1, 3],
      [2, 3],
    ]);
    expect(m.median()).toBe(2.5);
    expect(m.mode()).toBe(3);
    m.set(0, 1, null);
    expect(m.median()).toBe(2);
    expect(m.mode()).toBe(1);
    expect(new PineMatrix(0, 0).median()).toBeNull();
    expect(new PineMatrix(2, 2).mode()).toBeNull();
  });

  test("isBinary / isStochastic / isAntidiagonal", () => {
    expect(fill([
      [0, 1],
      [1, 0],
    ]).isBinary()).toBe(true);
    expect(fill([
      [0, 2],
      [1, 0],
    ]).isBinary()).toBe(false);
    expect(new PineMatrix(0, 0).isBinary()).toBe(true);
    const binNa = fill([
      [0, 1],
      [1, 0],
    ]);
    binNa.set(1, 1, null);
    expect(binNa.isBinary()).toBe(false);
    expect(fill([
      [0.5, 0.5],
      [1, 0],
    ]).isStochastic()).toBe(true);
    expect(fill([
      [0.5, 0.4],
      [1, 0],
    ]).isStochastic()).toBe(false);
    expect(new PineMatrix(0, 0).isStochastic()).toBe(true);
    expect(fill([
      [0, 1],
      [1, 0],
    ]).isAntidiagonal()).toBe(true);
    expect(fill([
      [1, 0],
      [0, 1],
    ]).isAntidiagonal()).toBe(false);
    expect(new PineMatrix(0, 0).isAntidiagonal()).toBe(true);
    expect(new PineMatrix(2, 3, 0).isAntidiagonal()).toBe(false);
  });
});

function expectCloseCell(got: number | null, want: number, atol = 1e-8): void {
  expect(got).not.toBeNull();
  expect(Math.abs(got! - want)).toBeLessThan(atol);
}

function expectApaEqualsA(a: PineMatrix, pin: PineMatrix, atol = 1e-8): void {
  const ap = a.mult(pin);
  expect(ap).not.toBeNull();
  const apa = ap!.mult(a);
  expect(apa).not.toBeNull();
  expect(apa!.rows()).toBe(a.rows());
  expect(apa!.columns()).toBe(a.columns());
  for (let i = 0; i < a.rows(); i++) {
    for (let j = 0; j < a.columns(); j++) {
      expectCloseCell(apa!.get(i, j), a.get(i, j) as number, atol);
    }
  }
}

describe("PineMatrix pinv / eigenvalues / eigenvectors", () => {
  test("eye(3).pinv() ≈ I", () => {
    const i = fill([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    const p = i.pinv();
    expect(p).not.toBeNull();
    expect(p!.rows()).toBe(3);
    expect(p!.columns()).toBe(3);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        expectCloseCell(p!.get(r, c), r === c ? 1 : 0);
      }
    }
  });

  test("rectangular pinv is 2×3 and A @ pinv @ A ≈ A", () => {
    const a = fill([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    const p = a.pinv();
    expect(p).not.toBeNull();
    expect(p!.rows()).toBe(2);
    expect(p!.columns()).toBe(3);
    expectApaEqualsA(a, p!);
  });

  test("rank-deficient 2×2 pinv is finite and A @ pinv @ A ≈ A", () => {
    const a = fill([
      [1, 2],
      [2, 4],
    ]);
    const p = a.pinv();
    expect(p).not.toBeNull();
    expect(p!.rows()).toBe(2);
    expect(p!.columns()).toBe(2);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const v = p!.get(i, j);
        expect(v).not.toBeNull();
        expect(Number.isFinite(v as number)).toBe(true);
      }
    }
    expectApaEqualsA(a, p!);
  });

  test("non-finite cell → pinv() is null", () => {
    const m = fill([
      [1, 2],
      [3, 4],
    ]);
    m.set(0, 1, null);
    expect(m.pinv()).toBeNull();
    m.set(0, 1, Number.NaN);
    expect(m.pinv()).toBeNull();
    m.set(0, 1, Infinity);
    expect(m.pinv()).toBeNull();
  });

  test("diagonal 2×2 eigenvalues are {2,3}", () => {
    const m = fill([
      [2, 0],
      [0, 3],
    ]);
    const vals = m.eigenvalues();
    expect(vals).not.toBeNull();
    expect(vals!.length).toBe(2);
    const got = vals!.slice().sort((x, y) => x - y);
    expectCloseCell(got[0]!, 2);
    expectCloseCell(got[1]!, 3);
  });

  test("symmetric 2×2 eigenvalues {3,-1} and Av ≈ λv", () => {
    const m = fill([
      [1, 2],
      [2, 1],
    ]);
    const vals = m.eigenvalues();
    expect(vals).not.toBeNull();
    expect(vals!.length).toBe(2);
    const got = vals!.slice().sort((x, y) => x - y);
    expectCloseCell(got[0]!, -1);
    expectCloseCell(got[1]!, 3);
    const vecs = m.eigenvectors();
    expect(vecs).not.toBeNull();
    expect(vecs!.rows()).toBe(2);
    expect(vecs!.columns()).toBe(2);
    const av = m.mult(vecs!);
    expect(av).not.toBeNull();
    for (let j = 0; j < 2; j++) {
      const lam = vals![j]!;
      for (let i = 0; i < 2; i++) {
        const vij = vecs!.get(i, j);
        expect(vij).not.toBeNull();
        expectCloseCell(av!.get(i, j), lam * (vij as number), 1e-7);
      }
    }
  });

  test("non-square eigenvalues/eigenvectors → null", () => {
    const rect = fill([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(rect.eigenvalues()).toBeNull();
    expect(rect.eigenvectors()).toBeNull();
    expect(new PineMatrix(3, 1, 1).eigenvalues()).toBeNull();
    expect(new PineMatrix(3, 1, 1).eigenvectors()).toBeNull();
  });
});
