/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine `matrix.*` value. `null` is `na`. Get is na-safe (OOB / non-finite → na).
 * Set OOB is a no-op. Slots may hold numbers, na, or UDT instances.
 * Python `Matrix` remains the source of truth.
 */

import { UdtInstance } from "./udt.ts";

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
function padOrTrunc(values: unknown[] | undefined, n: number): unknown[] {
  const out: unknown[] = [];
  const src = values ?? [];
  for (let i = 0; i < n; i++) out.push(i < src.length ? src[i]! : null);
  return out;
}

function looksLikeUdt(item: unknown): boolean {
  if (item == null || typeof item !== "object") return false;
  if (item instanceof UdtInstance) return true;
  return !Array.isArray(item) && Object.prototype.hasOwnProperty.call(item, "__type__");
}

function udtFieldNames(item: object): string[] | null {
  if (item instanceof UdtInstance) return item.type.fields.map((f) => f.name);
  const rec = item as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(rec, "__type__")) {
    return Object.keys(rec).filter((k) => k !== "__type__");
  }
  return null;
}

function readUdtField(item: object, name: string): unknown {
  if (item instanceof UdtInstance) return item.get(name);
  return (item as Record<string, unknown>)[name];
}

function udtFieldKey(item: unknown, sortField: unknown): unknown {
  if (item == null || sortField == null || typeof item !== "object") return item;
  if (typeof sortField === "string") return readUdtField(item, sortField);
  if (typeof sortField === "number" && Number.isFinite(sortField)) {
    const names = udtFieldNames(item);
    if (names == null) return item;
    const idx = Math.trunc(sortField);
    if (idx < 0 || idx >= names.length) return item;
    return readUdtField(item, names[idx]!);
  }
  return item;
}

function cellSortValue(cell: unknown, sortField: unknown): unknown {
  return sortField != null ? udtFieldKey(cell, sortField) : cell;
}

function isSortNa(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "number") return !Number.isFinite(v);
  return false;
}

function asFiniteNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function defaultMatrixSortField(rows: readonly unknown[][], column: number): unknown {
  for (const row of rows) {
    const cell = row[column];
    if (cell == null) continue;
    if (looksLikeUdt(cell)) return 0;
    break;
  }
  return null;
}

function compareSortKeys(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (typeof a === "number" && typeof b === "number") {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  const sa = `${String(Object.prototype.toString.call(a))}${String(a)}`;
  const sb = `${String(Object.prototype.toString.call(b))}${String(b)}`;
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
}

function cloneGrid(src: number[][]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < src.length; i++) out.push(src[i]!.slice());
  return out;
}

function eigen2x2(a: number, b: number, c: number, d: number): [number, number] {
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;
  if (disc >= 0) {
    const s = Math.sqrt(disc);
    return [(tr + s) / 2, (tr - s) / 2];
  }
  const re = tr / 2;
  return [re, re];
}

function wilkinsonShift(a: number, b: number, c: number, d: number): number {
  if ((a - d) * (a - d) + 4 * b * c < 0) return d;
  const [l1, l2] = eigen2x2(a, b, c, d);
  return Math.abs(l1 - d) < Math.abs(l2 - d) ? l1 : l2;
}

/** One-sided Jacobi SVD: A (m×n) = U (m×n) Σ Vᵀ (n×n). */
function jacobiSvd(A: number[][]): { u: number[][]; s: number[]; v: number[][] } | null {
  const m = A.length;
  const n = A[0]!.length;
  const w = cloneGrid(A);
  const v: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) row.push(i === j ? 1 : 0);
    v.push(row);
  }
  for (let sweep = 0; sweep < 50; sweep++) {
    let rotated = false;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        let alpha = 0;
        let beta = 0;
        let gamma = 0;
        for (let i = 0; i < m; i++) {
          const ap = w[i]![p]!;
          const aq = w[i]![q]!;
          alpha += ap * ap;
          beta += aq * aq;
          gamma += ap * aq;
        }
        if (!Number.isFinite(alpha) || !Number.isFinite(beta) || !Number.isFinite(gamma)) {
          return null;
        }
        const thresh = 1e-15 * Math.sqrt(Math.max(alpha * beta, 0));
        if (Math.abs(gamma) <= thresh) continue;
        rotated = true;
        const zeta = (beta - alpha) / (2 * gamma);
        const t = (zeta >= 0 ? 1 : -1) / (Math.abs(zeta) + Math.hypot(1, zeta));
        const cs = 1 / Math.sqrt(1 + t * t);
        const sn = cs * t;
        for (let i = 0; i < m; i++) {
          const ap = w[i]![p]!;
          const aq = w[i]![q]!;
          w[i]![p] = cs * ap - sn * aq;
          w[i]![q] = sn * ap + cs * aq;
        }
        for (let i = 0; i < n; i++) {
          const vp = v[i]![p]!;
          const vq = v[i]![q]!;
          v[i]![p] = cs * vp - sn * vq;
          v[i]![q] = sn * vp + cs * vq;
        }
      }
    }
    if (!rotated) break;
  }
  const s: number[] = [];
  const u: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) row.push(0);
    u.push(row);
  }
  for (let j = 0; j < n; j++) {
    let nrm = 0;
    for (let i = 0; i < m; i++) nrm += w[i]![j]! * w[i]![j]!;
    nrm = Math.sqrt(nrm);
    if (!Number.isFinite(nrm)) return null;
    s.push(nrm);
    if (nrm > 0) {
      for (let i = 0; i < m; i++) u[i]![j] = w[i]![j]! / nrm;
    }
  }
  return { u, s, v };
}

/** In-place Householder reduction to upper Hessenberg. */
function toHessenberg(H: number[][]): void {
  const n = H.length;
  for (let k = 0; k < n - 2; k++) {
    let tail = 0;
    for (let i = k + 2; i < n; i++) tail += H[i]![k]! * H[i]![k]!;
    if (tail < 1e-30) continue;
    let norm = tail + H[k + 1]![k]! * H[k + 1]![k]!;
    norm = Math.sqrt(norm);
    if (norm < 1e-30) continue;
    const x0 = H[k + 1]![k]!;
    const sigma = (x0 >= 0 ? 1 : -1) * norm;
    const hv: number[] = [x0 + sigma];
    for (let i = k + 2; i < n; i++) hv.push(H[i]![k]!);
    let vnorm = 0;
    for (const t of hv) vnorm += t * t;
    vnorm = Math.sqrt(vnorm);
    if (vnorm < 1e-30) continue;
    for (let i = 0; i < hv.length; i++) hv[i]! /= vnorm;
    for (let j = k; j < n; j++) {
      let dot = 0;
      for (let i = 0; i < hv.length; i++) dot += hv[i]! * H[k + 1 + i]![j]!;
      dot *= 2;
      for (let i = 0; i < hv.length; i++) H[k + 1 + i]![j]! -= dot * hv[i]!;
    }
    for (let i = 0; i < n; i++) {
      let dot = 0;
      for (let j = 0; j < hv.length; j++) dot += H[i]![k + 1 + j]! * hv[j]!;
      dot *= 2;
      for (let j = 0; j < hv.length; j++) H[i]![k + 1 + j]! -= dot * hv[j]!;
    }
    H[k + 1]![k] = -sigma;
    for (let i = k + 2; i < n; i++) H[i]![k] = 0;
  }
}

/** Explicit shifted QR sweep on the leading m×m block. */
function qrSweep(H: number[][], m: number, mu: number): void {
  const cs: { c: number; s: number }[] = [];
  for (let i = 0; i < m; i++) H[i]![i]! -= mu;
  for (let k = 0; k < m - 1; k++) {
    const a = H[k]![k]!;
    const b = H[k + 1]![k]!;
    const r = Math.hypot(a, b);
    const c = r > 0 ? a / r : 1;
    const s = r > 0 ? b / r : 0;
    cs.push({ c, s });
    for (let j = k; j < m; j++) {
      const t0 = c * H[k]![j]! + s * H[k + 1]![j]!;
      const t1 = -s * H[k]![j]! + c * H[k + 1]![j]!;
      H[k]![j] = t0;
      H[k + 1]![j] = t1;
    }
  }
  for (let k = 0; k < m - 1; k++) {
    const { c, s } = cs[k]!;
    for (let i = 0; i <= k + 1 && i < m; i++) {
      const t0 = c * H[i]![k]! + s * H[i]![k + 1]!;
      const t1 = -s * H[i]![k]! + c * H[i]![k + 1]!;
      H[i]![k] = t0;
      H[i]![k + 1] = t1;
    }
  }
  for (let i = 0; i < m; i++) H[i]![i]! += mu;
}

/** Real parts of eigenvalues via Hessenberg + Wilkinson QR. */
function realEigenvalues(A: number[][]): number[] | null {
  const n = A.length;
  if (n === 0) return [];
  if (n === 1) {
    const v = A[0]![0]!;
    return Number.isFinite(v) ? [v] : null;
  }
  if (n === 2) {
    const vals = eigen2x2(A[0]![0]!, A[0]![1]!, A[1]![0]!, A[1]![1]!);
    if (!Number.isFinite(vals[0]) || !Number.isFinite(vals[1])) return null;
    return [vals[0], vals[1]];
  }
  const H = cloneGrid(A);
  toHessenberg(H);
  const evals: number[] = [];
  let m = n;
  const maxIter = 40 * n * n;
  let iter = 0;
  while (m > 0) {
    if (++iter > maxIter) return null;
    if (m === 1) {
      const v = H[0]![0]!;
      if (!Number.isFinite(v)) return null;
      evals.push(v);
      break;
    }
    if (m === 2) {
      const vals = eigen2x2(H[0]![0]!, H[0]![1]!, H[1]![0]!, H[1]![1]!);
      if (!Number.isFinite(vals[0]) || !Number.isFinite(vals[1])) return null;
      evals.push(vals[0], vals[1]);
      break;
    }
    const scale = Math.abs(H[m - 1]![m - 1]!) + Math.abs(H[m - 2]![m - 2]!);
    if (Math.abs(H[m - 1]![m - 2]!) <= 1e-14 * Math.max(1, scale)) {
      const v = H[m - 1]![m - 1]!;
      if (!Number.isFinite(v)) return null;
      evals.push(v);
      m--;
      continue;
    }
    const scale2 = Math.abs(H[m - 2]![m - 2]!) + Math.abs(H[m - 3]![m - 3]!);
    if (Math.abs(H[m - 2]![m - 3]!) <= 1e-14 * Math.max(1, scale2)) {
      const vals = eigen2x2(
        H[m - 2]![m - 2]!,
        H[m - 2]![m - 1]!,
        H[m - 1]![m - 2]!,
        H[m - 1]![m - 1]!,
      );
      if (!Number.isFinite(vals[0]) || !Number.isFinite(vals[1])) return null;
      evals.push(vals[0], vals[1]);
      m -= 2;
      continue;
    }
    let mu = wilkinsonShift(
      H[m - 2]![m - 2]!,
      H[m - 2]![m - 1]!,
      H[m - 1]![m - 2]!,
      H[m - 1]![m - 1]!,
    );
    if (iter % 10 === 0) {
      mu += Math.abs(H[m - 1]![m - 2]!) + Math.abs(H[m - 2]![m - 3]!);
    }
    if (!Number.isFinite(mu)) return null;
    qrSweep(H, m, mu);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < i - 1; j++) H[i]![j] = 0;
    }
  }
  return evals;
}

/** Unit nullspace vector of a square matrix, or `null` if none / non-finite. */
function nullspaceUnit(M: number[][]): number[] | null {
  const n = M.length;
  if (n === 0) return [];
  const a = cloneGrid(M);
  let scale = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = a[i]![j]!;
      if (!Number.isFinite(v)) return null;
      if (Math.abs(v) > scale) scale = Math.abs(v);
    }
  }
  const eps = Math.max(1e-14, 1e-12 * scale);
  const pivotColOfRow: number[] = new Array(n).fill(-1);
  const colIsPivot: boolean[] = new Array(n).fill(false);
  let rank = 0;
  for (let c = 0; c < n && rank < n; c++) {
    let piv = rank;
    let best = Math.abs(a[rank]![c]!);
    for (let i = rank + 1; i < n; i++) {
      const mag = Math.abs(a[i]![c]!);
      if (mag > best) {
        best = mag;
        piv = i;
      }
    }
    if (best < eps) continue;
    if (piv !== rank) {
      const tmp = a[rank]!;
      a[rank] = a[piv]!;
      a[piv] = tmp;
    }
    const diag = a[rank]![c]!;
    for (let j = c; j < n; j++) a[rank]![j]! /= diag;
    for (let i = 0; i < n; i++) {
      if (i === rank) continue;
      const f = a[i]![c]!;
      if (f === 0) continue;
      for (let j = c; j < n; j++) a[i]![j]! -= f * a[rank]![j]!;
    }
    pivotColOfRow[rank] = c;
    colIsPivot[c] = true;
    rank++;
  }
  let free = -1;
  for (let c = 0; c < n; c++) {
    if (!colIsPivot[c]) {
      free = c;
      break;
    }
  }
  if (free < 0) return null;
  const vec: number[] = new Array(n).fill(0);
  vec[free] = 1;
  for (let r = n - 1; r >= 0; r--) {
    const c = pivotColOfRow[r]!;
    if (c < 0) continue;
    let s = 0;
    for (let j = 0; j < n; j++) {
      if (j === c) continue;
      s += a[r]![j]! * vec[j]!;
    }
    vec[c] = -s;
  }
  let nrm = 0;
  for (const x of vec) {
    if (!Number.isFinite(x)) return null;
    nrm += x * x;
  }
  nrm = Math.sqrt(nrm);
  if (!(nrm > eps)) return null;
  for (let i = 0; i < n; i++) vec[i]! /= nrm;
  return vec;
}

export class PineMatrix {
  private readonly cells: unknown[][] = [];
  private nRows: number;
  private nCols: number;

  constructor(rows: number, cols: number, initial?: unknown) {
    let r = dim(rows);
    let c = dim(cols);
    if (r > 0 && c > Math.floor(MAX_MATRIX_ELEMENTS / r)) {
      r = 0;
      c = 0;
    }
    this.nRows = r;
    this.nCols = c;
    const fill = initial === undefined ? null : initial;
    for (let i = 0; i < this.nRows; i++) {
      const row: unknown[] = [];
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
    return this.cells[i]![j] as Cell;
  }

  /** `matrix.set` — OOB / non-finite index is a no-op. */
  set(row: number, col: number, value: unknown): void {
    const i = resolveIndex(row, this.nRows);
    const j = resolveIndex(col, this.nCols);
    if (i === null || j === null) return;
    this.cells[i]![j] = value;
  }

  fill(value: unknown): void {
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
    return r === null ? [] : (this.cells[r]!.slice() as Cell[]);
  }

  col(j: number): Cell[] {
    const c = resolveIndex(j, this.nCols);
    if (c === null) return [];
    const out: Cell[] = [];
    for (let i = 0; i < this.nRows; i++) out.push(this.cells[i]![c] as Cell);
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
      const v = asFiniteNumber(this.cells[i]![i]);
      if (v === null) return null;
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
        const v = asFiniteNumber(this.cells[i]![j]);
        if (v === null) return null;
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
          const v = asFiniteNumber(this.cells[i]![j]);
          if (v === null) {
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
  addRow(index?: number, values?: unknown[]): void {
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
  addCol(index?: number, values?: unknown[]): void {
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

  /** Sort rows by *column*. `na` last. Optional *sortField* keys UDT cells. */
  sort(column = 0, order: "asc" | "desc" = "asc", sortField?: unknown): void {
    if (this.nRows === 0) return;
    const c = resolveIndex(column, this.nCols);
    if (c === null) return;
    const desc = order === "desc";
    const field = sortField ?? defaultMatrixSortField(this.cells, c);
    const nonNa: unknown[][] = [];
    const naRows: unknown[][] = [];
    for (const row of this.cells) {
      const v = cellSortValue(row[c], field);
      if (isSortNa(v)) naRows.push(row);
      else nonNa.push(row);
    }
    nonNa.sort((a, b) => {
      const ka = cellSortValue(a[c], field);
      const kb = cellSortValue(b[c], field);
      const cmp = compareSortKeys(ka, kb);
      return desc ? -cmp : cmp;
    });
    this.cells.length = 0;
    for (const row of nonNa) this.cells.push(row);
    for (const row of naRows) this.cells.push(row);
  }

  /** Row indices that would sort by *column*; `na` indices last. */
  sortIndices(column = 0, order: "asc" | "desc" = "asc", sortField?: unknown): number[] {
    if (this.nRows === 0) return [];
    const c = resolveIndex(column, this.nCols);
    if (c === null) return [];
    const desc = order === "desc";
    const field = sortField ?? defaultMatrixSortField(this.cells, c);
    const nonNa: { key: unknown; idx: number }[] = [];
    const naIdx: number[] = [];
    for (let i = 0; i < this.nRows; i++) {
      const v = cellSortValue(this.cells[i]![c], field);
      if (isSortNa(v)) naIdx.push(i);
      else nonNa.push({ key: v, idx: i });
    }
    nonNa.sort((a, b) => {
      const cmp = compareSortKeys(a.key, b.key);
      if (cmp !== 0) return desc ? -cmp : cmp;
      return a.idx - b.idx;
    });
    return nonNa.map((x) => x.idx).concat(naIdx);
  }

  /** Median of finite cells (Python skips `na`). Empty → `na`. */
  median(): Cell {
    const vals: number[] = [];
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) {
        const v = asFiniteNumber(this.cells[i]![j]);
        if (v !== null) vals.push(v);
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
        const v = asFiniteNumber(this.cells[i]![j]);
        if (v === null) continue;
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
        const v = asFiniteNumber(this.cells[i]![j]);
        if (v === null || v < 0) return false;
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
        const a = asFiniteNumber(this.cells[i]![j]);
        const b = asFiniteNumber(other.cells[i]![j]);
        if (a === null || b === null) {
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

  /** Moore–Penrose pseudoinverse via one-sided Jacobi SVD. Empty-shape → transpose-empty; non-finite → `na`. */
  pinv(): PineMatrix | null {
    if (this.nRows === 0 || this.nCols === 0) return new PineMatrix(this.nCols, this.nRows);
    const src = this.asFiniteGrid();
    if (src === null) return null;
    const svd = jacobiSvd(src);
    if (svd === null) return null;
    const { u, s, v } = svd;
    const m = this.nRows;
    const n = this.nCols;
    let maxS = 0;
    for (const si of s) {
      if (!Number.isFinite(si)) return null;
      if (si > maxS) maxS = si;
    }
    const cutoff = 1e-12 * maxS * Math.max(m, n);
    const sinv: number[] = [];
    for (const si of s) sinv.push(si > cutoff ? 1 / si : 0);
    const out = new PineMatrix(n, m, 0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        let acc = 0;
        for (let k = 0; k < n; k++) acc += v[i]![k]! * sinv[k]! * u[j]![k]!;
        if (!Number.isFinite(acc)) return null;
        out.set(i, j, acc);
      }
    }
    return out;
  }

  /** Real parts of eigenvalues. Non-square / non-finite → `na`; 0×0 → `[]`. */
  eigenvalues(): number[] | null {
    if (this.nRows !== this.nCols) return null;
    if (this.nRows === 0) return [];
    const src = this.asFiniteGrid();
    if (src === null) return null;
    return realEigenvalues(src);
  }

  /** Eigenvectors as unit columns. Non-square / non-finite / zero column → `na`. */
  eigenvectors(): PineMatrix | null {
    if (this.nRows !== this.nCols) return null;
    if (this.nRows === 0) return new PineMatrix(0, 0);
    const src = this.asFiniteGrid();
    if (src === null) return null;
    const vals = realEigenvalues(src);
    if (vals === null) return null;
    const n = this.nRows;
    const out = new PineMatrix(n, n, 0);
    for (let j = 0; j < n; j++) {
      const lam = vals[j]!;
      const shifted: number[][] = [];
      for (let i = 0; i < n; i++) {
        const row = src[i]!.slice();
        row[i]! -= lam;
        shifted.push(row);
      }
      const vec = nullspaceUnit(shifted);
      if (vec === null) return null;
      for (let i = 0; i < n; i++) {
        const v = vec[i]!;
        if (!Number.isFinite(v)) return null;
        out.set(i, j, v);
      }
    }
    return out;
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
        const v = asFiniteNumber(this.cells[i]![j]);
        if (v === null) return null;
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
        const v = asFiniteNumber(this.cells[i]![j]);
        if (v === null) return null;
        out.push(v);
      }
    }
    return out;
  }

  private flatten(): Cell[] {
    const out: Cell[] = [];
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nCols; j++) out.push(this.cells[i]![j] as Cell);
    }
    return out;
  }
}
