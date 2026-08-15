/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine `matrix.*` value. `null` is `na`. Get is na-safe (OOB / non-finite → na).
 * Set OOB is a no-op. Python `Matrix` remains the source of truth.
 */

export type Cell = number | null;

/** Python has no matrix-size cap; bound elements like `array.set` (1e6). */
export const MAX_MATRIX_ELEMENTS = 1_000_000;

function resolveIndex(index: number, length: number): number | null {
  if (!Number.isFinite(index)) return null;
  const i = Math.trunc(index);
  if (i < 0 || i >= length) return null;
  return i;
}

function dim(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.trunc(n), MAX_MATRIX_ELEMENTS);
}

export class PineMatrix {
  private readonly cells: Cell[][] = [];
  private readonly nRows: number;
  private readonly nCols: number;

  constructor(rows: number, cols: number, initial?: Cell) {
    let r = dim(rows);
    let c = dim(cols);
    if (r > 0 && c > Math.floor(MAX_MATRIX_ELEMENTS / r)) {
      r = 0;
      c = 0;
    }
    this.nRows = r;
    this.nCols = c;
    const fill: Cell = initial === undefined ? null : initial;
    for (let i = 0; i < this.nRows; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < this.nCols; j++) row.push(fill);
      this.cells.push(row);
    }
  }

  rows(): number {
    return this.nRows;
  }

  columns(): number {
    return this.nCols;
  }

  /** `matrix.get` — OOB / non-finite index → `na`. */
  get(row: number, col: number): Cell {
    const i = resolveIndex(row, this.nRows);
    const j = resolveIndex(col, this.nCols);
    if (i === null || j === null) return null;
    return this.cells[i]![j]!;
  }

  /** `matrix.set` — OOB / non-finite index is a no-op. */
  set(row: number, col: number, value: Cell): void {
    const i = resolveIndex(row, this.nRows);
    const j = resolveIndex(col, this.nCols);
    if (i === null || j === null) return;
    this.cells[i]![j] = value;
  }

  fill(value: Cell): void {
    for (let i = 0; i < this.nRows; i++) {
      const row = this.cells[i]!;
      for (let j = 0; j < this.nCols; j++) row[j] = value;
    }
  }

  transpose(): PineMatrix {
    const t = new PineMatrix(this.nCols, this.nRows);
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) t.set(j, i, this.cells[i]![j]!);
    }
    return t;
  }

  row(i: number): Cell[] {
    const r = resolveIndex(i, this.nRows);
    return r === null ? [] : this.cells[r]!.slice();
  }

  col(j: number): Cell[] {
    const c = resolveIndex(j, this.nCols);
    if (c === null) return [];
    const out: Cell[] = [];
    for (let i = 0; i < this.nRows; i++) out.push(this.cells[i]![c]!);
    return out;
  }

  copy(): PineMatrix {
    const out = new PineMatrix(this.nRows, this.nCols);
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) out.set(i, j, this.cells[i]![j]!);
    }
    return out;
  }

  elementsCount(): number {
    return this.nRows * this.nCols;
  }

  isSquare(): boolean {
    return this.nRows === this.nCols && this.nRows > 0;
  }

  /** `na` if empty or any element is `na`. */
  sum(): Cell {
    const vals = this.finiteAll();
    if (vals === null) return null;
    let acc = 0;
    for (const v of vals) acc += v;
    return acc;
  }

  avg(): Cell {
    const vals = this.finiteAll();
    if (vals === null || vals.length === 0) return null;
    let acc = 0;
    for (const v of vals) acc += v;
    return acc / vals.length;
  }

  min(): Cell {
    const vals = this.finiteAll();
    if (vals === null || vals.length === 0) return null;
    let best = vals[0]!;
    for (const v of vals) if (v < best) best = v;
    return best;
  }

  max(): Cell {
    const vals = this.finiteAll();
    if (vals === null || vals.length === 0) return null;
    let best = vals[0]!;
    for (const v of vals) if (v > best) best = v;
    return best;
  }

  /** Diagonal sum. Non-square or any na on diagonal → `na`. */
  trace(): Cell {
    if (!this.isSquare()) return null;
    let acc = 0;
    for (let i = 0; i < this.nRows; i++) {
      const v = this.cells[i]![i]!;
      if (v === null || !Number.isFinite(v)) return null;
      acc += v;
    }
    return acc;
  }

  /** Gaussian elimination. Non-square or any na → `na`. Singular → `0`. */
  det(): Cell {
    if (!this.isSquare()) return null;
    const n = this.nRows;
    if (n === 0) return null;
    const a: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        const v = this.cells[i]![j]!;
        if (v === null || !Number.isFinite(v)) return null;
        row.push(v);
      }
      a.push(row);
    }
    if (n === 1) return a[0]![0]!;
    if (n === 2) {
      const d = a[0]![0]! * a[1]![1]! - a[0]![1]! * a[1]![0]!;
      return Number.isFinite(d) ? d : null;
    }
    let sign = 1;
    for (let k = 0; k < n; k++) {
      let pivot = k;
      let best = Math.abs(a[k]![k]!);
      for (let i = k + 1; i < n; i++) {
        const mag = Math.abs(a[i]![k]!);
        if (mag > best) {
          best = mag;
          pivot = i;
        }
      }
      if (best === 0) return 0;
      if (pivot !== k) {
        const tmp = a[k]!;
        a[k] = a[pivot]!;
        a[pivot] = tmp;
        sign = -sign;
      }
      const diag = a[k]![k]!;
      for (let i = k + 1; i < n; i++) {
        const f = a[i]![k]! / diag;
        for (let j = k; j < n; j++) a[i]![j]! -= f * a[k]![j]!;
      }
    }
    let det = sign;
    for (let i = 0; i < n; i++) det *= a[i]![i]!;
    return Number.isFinite(det) ? det : null;
  }

  /** Matrix×matrix or scalar×matrix. Incompatible shapes or non-finite grid → `na`. */
  mult(other: PineMatrix | number): PineMatrix | null {
    if (typeof other === "number") {
      if (!Number.isFinite(other)) return null;
      const out = new PineMatrix(this.nRows, this.nCols);
      for (let i = 0; i < this.nRows; i++) {
        for (let j = 0; j < this.nCols; j++) {
          const v = this.cells[i]![j]!;
          if (v === null || !Number.isFinite(v)) {
            out.set(i, j, null);
            continue;
          }
          const p = v * other;
          out.set(i, j, Number.isFinite(p) ? p : null);
        }
      }
      return out;
    }
    if (this.nCols !== other.nRows) return null;
    const a = this.asFiniteGrid();
    const b = other.asFiniteGrid();
    if (a === null || b === null) return null;
    const out = new PineMatrix(this.nRows, other.nCols, 0);
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < other.nCols; j++) {
        let s = 0;
        for (let k = 0; k < this.nCols; k++) s += a[i]![k]! * b[k]![j]!;
        if (!Number.isFinite(s)) return null;
        out.set(i, j, s);
      }
    }
    return out;
  }

  /** Gauss–Jordan inverse. Non-square, singular, or non-finite → `na`. */
  inv(): PineMatrix | null {
    if (this.nRows !== this.nCols) return null;
    const n = this.nRows;
    if (n === 0) return new PineMatrix(0, 0);
    const src = this.asFiniteGrid();
    if (src === null) return null;
    const aug: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row = src[i]!.slice();
      for (let j = 0; j < n; j++) row.push(i === j ? 1 : 0);
      aug.push(row);
    }
    const eps = 1e-12;
    for (let k = 0; k < n; k++) {
      let pivot = k;
      let best = Math.abs(aug[k]![k]!);
      for (let i = k + 1; i < n; i++) {
        const mag = Math.abs(aug[i]![k]!);
        if (mag > best) {
          best = mag;
          pivot = i;
        }
      }
      if (best < eps) return null;
      if (pivot !== k) {
        const tmp = aug[k]!;
        aug[k] = aug[pivot]!;
        aug[pivot] = tmp;
      }
      const diag = aug[k]![k]!;
      for (let j = 0; j < 2 * n; j++) aug[k]![j]! /= diag;
      for (let i = 0; i < n; i++) {
        if (i === k) continue;
        const f = aug[i]![k]!;
        if (f === 0) continue;
        for (let j = 0; j < 2 * n; j++) aug[i]![j]! -= f * aug[k]![j]!;
      }
    }
    const out = new PineMatrix(n, n, 0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = aug[i]![n + j]!;
        if (!Number.isFinite(v)) return null;
        out.set(i, j, v);
      }
    }
    return out;
  }

  /** Integer power of a square matrix. `n=0` → identity; negative → `inv` then `pow`. */
  pow(n: number): PineMatrix | null {
    if (this.nRows !== this.nCols) return null;
    if (!Number.isFinite(n)) return null;
    const e = Math.trunc(n);
    if (e === 0) return PineMatrix.eye(this.nRows);
    if (e < 0) {
      const inverse = this.inv();
      return inverse === null ? null : inverse.pow(-e);
    }
    if (this.asFiniteGrid() === null) return null;
    let result: PineMatrix | null = PineMatrix.eye(this.nRows);
    let base: PineMatrix | null = this.copy();
    let exp = e;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = result.mult(base);
        if (result === null) return null;
      }
      exp = Math.trunc(exp / 2);
      if (exp > 0) {
        base = base.mult(base);
        if (base === null) return null;
      }
    }
    return result;
  }

  /** Kronecker product. Non-finite element → `na`. */
  kron(other: PineMatrix): PineMatrix | null {
    const a = this.asFiniteGrid();
    const b = other.asFiniteGrid();
    if (a === null || b === null) return null;
    const p = other.nRows;
    const q = other.nCols;
    const out = new PineMatrix(this.nRows * p, this.nCols * q, 0);
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const av = a[i]![j]!;
        for (let k = 0; k < p; k++) {
          for (let l = 0; l < q; l++) {
            const v = av * b[k]![l]!;
            out.set(i * p + k, j * q + l, Number.isFinite(v) ? v : null);
          }
        }
      }
    }
    return out;
  }

  /** Python `is_zero`: `na` cells count as zero; any non-zero / non-finite → false. */
  isZero(): boolean {
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v === null) continue;
        if (v !== 0) return false;
      }
    }
    return true;
  }

  /** Python `is_identity`: 0×0 is identity; non-square / non-finite → false. */
  isIdentity(): boolean {
    if (this.nRows !== this.nCols) return false;
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const expected = i === j ? 1 : 0;
        const v = this.cells[i]![j]!;
        if (v === null || v !== expected) return false;
      }
    }
    return true;
  }

  isDiagonal(): boolean {
    if (this.nRows !== this.nCols) return false;
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        if (i === j) continue;
        const v = this.cells[i]![j]!;
        if (v !== null && v !== 0) return false;
      }
    }
    return true;
  }

  isSymmetric(): boolean {
    if (this.nRows !== this.nCols) return false;
    for (let i = 0; i < this.nRows; i++) {
      for (let j = i + 1; j < this.nCols; j++) {
        if (this.cells[i]![j]! !== this.cells[j]![i]!) return false;
      }
    }
    return true;
  }

  isAntisymmetric(): boolean {
    if (this.nRows !== this.nCols) return false;
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const a = this.cells[i]![j]!;
        const b = this.cells[j]![i]!;
        if (i === j) {
          if (a !== null && a !== 0) return false;
          continue;
        }
        if (a !== null && b !== null) {
          if (a !== -b) return false;
        } else if (a !== b) {
          return false;
        }
      }
    }
    return true;
  }

  /** True if upper- or lower-triangular. 0×0 is triangular; non-square → false. */
  isTriangular(): boolean {
    if (this.nRows !== this.nCols) return false;
    let upper = true;
    let lower = true;
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        const nonzero = v !== null && v !== 0;
        if (i > j && nonzero) upper = false;
        if (i < j && nonzero) lower = false;
      }
    }
    return upper || lower;
  }

  /** OOB / non-finite index is a no-op. */
  swapRows(i: number, j: number): void {
    const a = resolveIndex(i, this.nRows);
    const b = resolveIndex(j, this.nRows);
    if (a === null || b === null || a === b) return;
    const tmp = this.cells[a]!;
    this.cells[a] = this.cells[b]!;
    this.cells[b] = tmp;
  }

  /** OOB / non-finite index is a no-op. */
  swapColumns(i: number, j: number): void {
    const a = resolveIndex(i, this.nCols);
    const b = resolveIndex(j, this.nCols);
    if (a === null || b === null || a === b) return;
    for (const row of this.cells) {
      const tmp = row[a]!;
      row[a] = row[b]!;
      row[b] = tmp;
    }
  }

  /** Element-wise `self - other` (Python `Matrix.diff`). Shape mismatch → `na`. */
  diff(other: PineMatrix): PineMatrix | null {
    if (this.nRows !== other.nRows || this.nCols !== other.nCols) return null;
    const out = new PineMatrix(this.nRows, this.nCols);
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const a = this.cells[i]![j]!;
        const b = other.cells[i]![j]!;
        if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b)) {
          out.set(i, j, null);
          continue;
        }
        const d = a - b;
        out.set(i, j, Number.isFinite(d) ? d : null);
      }
    }
    return out;
  }

  /** Gaussian rank. Empty → 0; any `na` / non-finite → `na`. */
  rank(): number | null {
    if (this.nRows === 0 || this.nCols === 0) return 0;
    const src = this.asFiniteGrid();
    if (src === null) return null;
    const m = this.nRows;
    const n = this.nCols;
    const g: number[][] = [];
    for (let i = 0; i < m; i++) g.push(src[i]!.slice());
    const eps = 1e-12;
    let r = 0;
    for (let c = 0; c < n && r < m; c++) {
      let pivot = r;
      let best = Math.abs(g[r]![c]!);
      for (let i = r + 1; i < m; i++) {
        const mag = Math.abs(g[i]![c]!);
        if (mag > best) {
          best = mag;
          pivot = i;
        }
      }
      if (best < eps) continue;
      if (pivot !== r) {
        const tmp = g[r]!;
        g[r] = g[pivot]!;
        g[pivot] = tmp;
      }
      const diag = g[r]![c]!;
      for (let i = r + 1; i < m; i++) {
        const f = g[i]![c]! / diag;
        for (let j = c; j < n; j++) g[i]![j]! -= f * g[r]![j]!;
      }
      r++;
    }
    return r;
  }

  private static eye(n: number): PineMatrix {
    const out = new PineMatrix(n, n, 0);
    for (let i = 0; i < n; i++) out.set(i, i, 1);
    return out;
  }

  private asFiniteGrid(): number[][] | null {
    const out: number[][] = [];
    for (let i = 0; i < this.nRows; i++) {
      const row: number[] = [];
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v === null || !Number.isFinite(v)) return null;
        row.push(v);
      }
      out.push(row);
    }
    return out;
  }

  private finiteAll(): number[] | null {
    const out: number[] = [];
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v === null || !Number.isFinite(v)) return null;
        out.push(v);
      }
    }
    return out;
  }
}
