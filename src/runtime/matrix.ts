/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine `matrix.*` value. `null` is `na`. Get is na-safe (OOB / non-finite → na).
 * Set OOB is a no-op. Python `Matrix` remains the source of truth.
 */

export type Cell = number | null;

function resolveIndex(index: number, length: number): number | null {
  if (!Number.isFinite(index)) return null;
  const i = Math.trunc(index);
  if (i < 0 || i >= length) return null;
  return i;
}

function dim(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.trunc(n);
}

export class PineMatrix {
  private readonly cells: Cell[][] = [];
  private readonly nRows: number;
  private readonly nCols: number;

  constructor(rows: number, cols: number, initial?: Cell) {
    this.nRows = dim(rows);
    this.nCols = dim(cols);
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

  /** Gaussian elimination. Non-square or any na → `na`. */
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
