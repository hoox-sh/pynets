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
}
