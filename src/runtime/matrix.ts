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

function fitsElements(rows: number, cols: number): boolean {
  if (rows <= 0 || cols <= 0) return true;
  return cols <= Math.floor(MAX_MATRIX_ELEMENTS / rows);
}

/** Pad with `na` or truncate so the vector has length *n*. */
function padOrTrunc(values: Cell[] | undefined, n: number): Cell[] {
  const out: Cell[] = [];
  const src = values ?? [];
  for (let i = 0; i < n; i++) out.push(i < src.length ? src[i]! : null);
  return out;
}

export class PineMatrix {
  private readonly cells: Cell[][] = [];
  private nRows: number;
  private nCols: number;

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

  /**
   * Insert a row at *index* (append if omitted / past end).
   * Short rows pad `na`; long rows truncate. 0×0 adopts column count from *values*.
   * Negative / non-finite index or size cap → no-op.
   */
  addRow(index?: number, values?: Cell[]): void {
    const adopt = this.nRows === 0 && this.nCols === 0;
    const cols = adopt ? (values?.length ?? 0) : this.nCols;
    if (!fitsElements(this.nRows + 1, cols)) return;
    if (index !== undefined) {
      if (!Number.isFinite(index)) return;
      if (Math.trunc(index) < 0) return;
    }
    const row = padOrTrunc(values, cols);
    if (adopt) this.nCols = cols;
    const at = index === undefined ? this.nRows : Math.trunc(index);
    if (at >= this.nRows) this.cells.push(row);
    else this.cells.splice(at, 0, row);
    this.nRows += 1;
  }

  /**
   * Insert a column at *index* (append if omitted / past end).
   * Short cols pad `na`; long cols truncate. 0×0 becomes N×1 from *values*.
   */
  addCol(index?: number, values?: Cell[]): void {
    if (this.nRows === 0 && this.nCols === 0) {
      const n = values?.length ?? 0;
      if (!fitsElements(n, n === 0 ? 0 : 1)) return;
      for (const v of values ?? []) this.cells.push([v]);
      this.nRows = n;
      this.nCols = n === 0 ? 0 : 1;
      return;
    }
    if (!fitsElements(this.nRows, this.nCols + 1)) return;
    if (index !== undefined) {
      if (!Number.isFinite(index)) return;
      if (Math.trunc(index) < 0) return;
    }
    const col = padOrTrunc(values, this.nRows);
    const at =
      index === undefined ? this.nCols : Math.min(Math.trunc(index), this.nCols);
    for (let i = 0; i < this.nRows; i++) this.cells[i]!.splice(at, 0, col[i]!);
    this.nCols += 1;
  }

  /** OOB / non-finite index is a no-op. */
  removeRow(index: number): void {
    const i = resolveIndex(index, this.nRows);
    if (i === null) return;
    this.cells.splice(i, 1);
    this.nRows -= 1;
  }

  /** OOB / non-finite index is a no-op. */
  removeCol(index: number): void {
    const i = resolveIndex(index, this.nCols);
    if (i === null) return;
    for (const row of this.cells) row.splice(i, 1);
    this.nCols -= 1;
  }

  /** New matrix, same element count, row-major. Bad size → `na`. */
  reshape(rows: number, cols: number): PineMatrix | null {
    if (!Number.isFinite(rows) || !Number.isFinite(cols)) return null;
    const r = Math.trunc(rows);
    const c = Math.trunc(cols);
    if (r < 0 || c < 0) return null;
    if (r * c !== this.nRows * this.nCols) return null;
    if (!fitsElements(r, c)) return null;
    const flat = this.flatten();
    const out = new PineMatrix(r, c);
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) out.set(i, j, flat[i * c + j]!);
    }
    return out;
  }

  /** Vertical stack when column counts match; else `na`. */
  concat(other: PineMatrix): PineMatrix | null {
    if (this.nCols !== other.nCols) return null;
    const r = this.nRows + other.nRows;
    const c = this.nCols;
    if (!fitsElements(r, c)) return null;
    const out = new PineMatrix(r, c);
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < c; j++) out.set(i, j, this.cells[i]![j]!);
    }
    for (let i = 0; i < other.nRows; i++) {
      for (let j = 0; j < c; j++) out.set(this.nRows + i, j, other.cells[i]![j]!);
    }
    return out;
  }

  /** Half-open `[fromRow, toRow) × [fromCol, toCol)`. Invalid range → `na`. */
  submatrix(fromRow: number, toRow: number, fromCol: number, toCol: number): PineMatrix | null {
    if (
      !Number.isFinite(fromRow) ||
      !Number.isFinite(toRow) ||
      !Number.isFinite(fromCol) ||
      !Number.isFinite(toCol)
    ) {
      return null;
    }
    const r0 = Math.trunc(fromRow);
    const r1 = Math.trunc(toRow);
    const c0 = Math.trunc(fromCol);
    const c1 = Math.trunc(toCol);
    if (!(0 <= r0 && r0 <= r1 && r1 <= this.nRows)) return null;
    if (!(0 <= c0 && c0 <= c1 && c1 <= this.nCols)) return null;
    const out = new PineMatrix(r1 - r0, c1 - c0);
    for (let i = r0; i < r1; i++) {
      for (let j = c0; j < c1; j++) out.set(i - r0, j - c0, this.cells[i]![j]!);
    }
    return out;
  }

  /** Reverse element order: reverse rows, then each row (Python `matrix.reverse`). */
  reverse(): void {
    this.cells.reverse();
    for (const row of this.cells) row.reverse();
  }

  /** Sort rows by *column*. `na` / non-finite keys always last. */
  sort(column = 0, order: "asc" | "desc" = "asc"): void {
    if (this.nRows === 0) return;
    const c = resolveIndex(column, this.nCols);
    if (c === null) return;
    const desc = order === "desc";
    const nonNa: Cell[][] = [];
    const naRows: Cell[][] = [];
    for (const row of this.cells) {
      const v = row[c]!;
      if (v === null || !Number.isFinite(v)) naRows.push(row);
      else nonNa.push(row);
    }
    nonNa.sort((a, b) => {
      const d = (a[c] as number) - (b[c] as number);
      return desc ? -d : d;
    });
    this.cells.length = 0;
    for (const row of nonNa) this.cells.push(row);
    for (const row of naRows) this.cells.push(row);
  }

  /** Median of finite cells (Python skips `na`). Empty → `na`. */
  median(): Cell {
    const vals: number[] = [];
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v !== null && Number.isFinite(v)) vals.push(v);
      }
    }
    if (vals.length === 0) return null;
    vals.sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    if (vals.length % 2 === 1) return vals[mid]!;
    return (vals[mid - 1]! + vals[mid]!) / 2;
  }

  /** Most common finite cell; first-seen wins ties. Empty / all `na` → `na`. */
  mode(): Cell {
    const counts = new Map<number, number>();
    let best: number | null = null;
    let bestCount = 0;
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v === null || !Number.isFinite(v)) continue;
        const n = (counts.get(v) ?? 0) + 1;
        counts.set(v, n);
        if (n > bestCount) {
          best = v;
          bestCount = n;
        }
      }
    }
    return best;
  }

  /** Every cell is 0 or 1. `na` / other values → false. Empty is true. */
  isBinary(): boolean {
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v !== 0 && v !== 1) return false;
      }
    }
    return true;
  }

  /** Each row is non-negative and sums to 1. Empty is true; `na` → false. */
  isStochastic(): boolean {
    for (let i = 0; i < this.nRows; i++) {
      let total = 0;
      for (let j = 0; j < this.nCols; j++) {
        const v = this.cells[i]![j]!;
        if (v === null || !Number.isFinite(v) || v < 0) return false;
        total += v;
      }
      if (Math.abs(total - 1) > 1e-9) return false;
    }
    return true;
  }

  /** Square; off-antidiagonal cells are 0 or `na`. 0×0 is true. */
  isAntidiagonal(): boolean {
    if (this.nRows !== this.nCols) return false;
    const n = this.nRows;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i + j === n - 1) continue;
        const v = this.cells[i]![j]!;
        if (v !== null && v !== 0) return false;
      }
    }
    return true;
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

  private flatten(): Cell[] {
    const out: Cell[] = [];
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) out.push(this.cells[i]![j]!);
    }
    return out;
  }
}
