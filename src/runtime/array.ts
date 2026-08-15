/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine `array.*` value. `null` is `na`. Get is na-safe (OOB / non-finite → na).
 * Set OOB is a no-op. Python `ArrayBuiltinsMixin` remains the source of truth.
 */

export type Cell = number | null;

/** Python `array.set` grows only while index < 1_000_000; same bound here. */
export const MAX_ARRAY_SIZE = 1_000_000;

function resolveIndex(index: number, length: number): number | null {
  if (!Number.isFinite(index)) return null;
  let i = Math.trunc(index);
  if (i < 0) i = length + i;
  if (i < 0 || i >= length) return null;
  return i;
}

function isFiniteCell(v: Cell): v is number {
  return v !== null && Number.isFinite(v);
}

/** Python `bool` on array cells: only `na` and `0` are false (`NaN` is true). */
function pineTruthy(v: Cell): boolean {
  return v !== null && v !== 0;
}

/** Binary-search order: comparable values first, `na` last. */
function keyLt(left: Cell, right: Cell): boolean {
  if (left === null) return false;
  if (right === null) return true;
  return left < right;
}

function keyEq(left: Cell, right: Cell): boolean {
  if (left === null && right === null) return true;
  if (left === null || right === null) return false;
  return left === right;
}

function meanOf(nums: number[]): number {
  let acc = 0;
  for (const v of nums) acc += v;
  return acc / nums.length;
}

export class PineArray {
  private readonly cells: Cell[] = [];

  constructor(size?: number, initial?: Cell) {
    if (size === undefined) return;
    if (!Number.isFinite(size) || size < 0) return;
    const n = Math.min(Math.trunc(size), MAX_ARRAY_SIZE);
    const fill: Cell = initial === undefined ? null : initial;
    for (let i = 0; i < n; i++) this.cells.push(fill);
  }

  size(): number {
    return this.cells.length;
  }

  /** `array.get` — OOB / non-finite index → `na`. Negative counts from the end. */
  get(index: number): Cell {
    const i = resolveIndex(index, this.cells.length);
    return i === null ? null : this.cells[i]!;
  }

  /** `array.set` — OOB / non-finite index is a no-op. */
  set(index: number, value: Cell): void {
    const i = resolveIndex(index, this.cells.length);
    if (i === null) return;
    this.cells[i] = value;
  }

  push(value: Cell): void {
    if (this.cells.length >= MAX_ARRAY_SIZE) return;
    this.cells.push(value);
  }

  /** Last element, or `na` if empty. */
  pop(): Cell {
    if (this.cells.length === 0) return null;
    return this.cells.pop()!;
  }

  unshift(value: Cell): void {
    if (this.cells.length >= MAX_ARRAY_SIZE) return;
    this.cells.unshift(value);
  }

  /** First element, or `na` if empty. */
  shift(): Cell {
    if (this.cells.length === 0) return null;
    return this.cells.shift()!;
  }

  clear(): void {
    this.cells.length = 0;
  }

  includes(value: Cell): boolean {
    return this.cells.includes(value);
  }

  first(): Cell {
    return this.cells.length === 0 ? null : this.cells[0]!;
  }

  last(): Cell {
    return this.cells.length === 0 ? null : this.cells[this.cells.length - 1]!;
  }

  insert(index: number, value: Cell): void {
    if (this.cells.length >= MAX_ARRAY_SIZE) return;
    if (!Number.isFinite(index)) return;
    let i = Math.trunc(index);
    if (i < 0) i = this.cells.length + i;
    if (i < 0) i = 0;
    if (i > this.cells.length) i = this.cells.length;
    this.cells.splice(i, 0, value);
  }

  remove(index: number): Cell {
    const i = resolveIndex(index, this.cells.length);
    if (i === null) return null;
    return this.cells.splice(i, 1)[0]!;
  }

  fill(value: Cell): void {
    for (let i = 0; i < this.cells.length; i++) this.cells[i] = value;
  }

  /** Half-open `[from, to)`. Python clamps `from < 0` to 0; `to < from` → empty. */
  slice(from: number, to?: number): PineArray {
    const n = this.cells.length;
    let start = Number.isFinite(from) ? Math.trunc(from) : 0;
    const end = to === undefined || !Number.isFinite(to) ? n : Math.trunc(to);
    if (start < 0) start = 0;
    const out = new PineArray();
    if (end < start) return out;
    for (const v of this.cells.slice(start, end)) out.push(v);
    return out;
  }

  copy(): PineArray {
    const out = new PineArray();
    for (const v of this.cells) out.push(v);
    return out;
  }

  reverse(): void {
    this.cells.reverse();
  }

  sort(order: "asc" | "desc" = "asc"): void {
    this.cells.sort((a, b) => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return order === "desc" ? b - a : a - b;
    });
  }

  /** `array.indexof` — miss is `-1` (Python `ArrayBuiltinsMixin`). */
  indexof(value: Cell): Cell {
    for (let i = 0; i < this.cells.length; i++) {
      if (Object.is(this.cells[i], value)) return i;
    }
    return -1;
  }

  avg(): Cell {
    const nums = this.finiteAll();
    if (nums === null || nums.length === 0) return null;
    let acc = 0;
    for (const v of nums) acc += v;
    return acc / nums.length;
  }

  min(): Cell {
    const nums = this.finiteAll();
    if (nums === null || nums.length === 0) return null;
    let best = nums[0]!;
    for (const v of nums) if (v < best) best = v;
    return best;
  }

  max(): Cell {
    const nums = this.finiteAll();
    if (nums === null || nums.length === 0) return null;
    let best = nums[0]!;
    for (const v of nums) if (v > best) best = v;
    return best;
  }

  sum(): Cell {
    const nums = this.finiteAll();
    if (nums === null || nums.length === 0) return null;
    let acc = 0;
    for (const v of nums) acc += v;
    return acc;
  }

  /** `na` elements stringify as empty (Python `array.join`). */
  join(sep = ","): string {
    return this.cells.map((v) => (v === null ? "" : String(v))).join(sep);
  }

  /** `array.from(...)` — collect args; capped at `MAX_ARRAY_SIZE`. */
  static from(...values: Cell[]): PineArray {
    const out = new PineArray();
    const n = Math.min(values.length, MAX_ARRAY_SIZE);
    for (let i = 0; i < n; i++) out.push(values[i]!);
    return out;
  }

  /** `array.lastindexof` — miss is `-1`. */
  lastIndexOf(value: Cell): Cell {
    for (let i = this.cells.length - 1; i >= 0; i--) {
      if (Object.is(this.cells[i], value)) return i;
    }
    return -1;
  }

  /** Append `other` onto this (Pine mutates first) and return this. */
  concat(other: PineArray): PineArray {
    for (const v of other.cells) {
      if (this.cells.length >= MAX_ARRAY_SIZE) break;
      this.cells.push(v);
    }
    return this;
  }

  /** Element-wise `abs`; `na` stays `na`. */
  abs(): PineArray | null {
    const out = new PineArray();
    for (const v of this.cells) out.push(v === null ? null : Math.abs(v));
    return out;
  }

  /** All cells truthy (`na` / `0` are false). Empty → true. */
  every(): boolean {
    for (const v of this.cells) {
      if (!pineTruthy(v)) return false;
    }
    return true;
  }

  /** Any cell truthy. Empty → false. */
  some(): boolean | null {
    for (const v of this.cells) {
      if (pineTruthy(v)) return true;
    }
    return false;
  }

  /** `na` / non-finite poisons (same `finiteAll` contract as `avg`). */
  median(): Cell {
    const nums = this.finiteAll();
    if (nums === null || nums.length === 0) return null;
    const sorted = nums.slice().sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    if (sorted.length % 2 === 1) return sorted[mid]!;
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }

  /** `max - min`; `na` / non-finite poisons. */
  range(): Cell {
    const hi = this.max();
    const lo = this.min();
    if (hi === null || lo === null) return null;
    return hi - lo;
  }

  /** Most frequent finite value; ties keep the first-encountered (Python 3.8+ `mode`). */
  mode(): Cell {
    const counts = new Map<number, number>();
    let best: Cell = null;
    let bestC = 0;
    for (const v of this.cells) {
      if (!isFiniteCell(v)) continue;
      const c = (counts.get(v) ?? 0) + 1;
      counts.set(v, c);
      if (c > bestC) {
        bestC = c;
        best = v;
      }
    }
    return best;
  }

  /** Index of `value` in an ascending array (`na` last), or `-1`. */
  binarySearch(value: Cell): number {
    return this.binarySearchBy(value, "any");
  }

  binarySearchLeftmost(value: Cell): number {
    if (value === null || this.cells.some((x) => x === null)) {
      const i = this.indexof(value);
      return typeof i === "number" ? i : -1;
    }
    return this.binarySearchBy(value, "left");
  }

  binarySearchRightmost(value: Cell): number {
    if (value === null || this.cells.some((x) => x === null)) {
      const i = this.lastIndexOf(value);
      return typeof i === "number" ? i : -1;
    }
    return this.binarySearchBy(value, "right");
  }

  /** Default `biased=true` is population (`n`); `false` is sample (`n-1`). Skips `na`. */
  stdev(biased = true): Cell {
    const nums = this.finiteSkip();
    if (nums.length < 2) return null;
    const mean = meanOf(nums);
    let acc = 0;
    for (const x of nums) acc += (x - mean) ** 2;
    const denom = biased ? nums.length : nums.length - 1;
    if (denom <= 0) return null;
    const out = Math.sqrt(acc / denom);
    return Number.isFinite(out) ? out : null;
  }

  variance(biased = true): Cell {
    const nums = this.finiteSkip();
    if (nums.length < 2) return null;
    const mean = meanOf(nums);
    let acc = 0;
    for (const x of nums) acc += (x - mean) ** 2;
    const denom = biased ? nums.length : nums.length - 1;
    if (denom <= 0) return null;
    const out = acc / denom;
    return Number.isFinite(out) ? out : null;
  }

  covariance(other: PineArray, biased = true): Cell {
    const left = this.finiteSkip();
    const right = other.finiteSkip();
    const n = Math.min(left.length, right.length);
    if (n < 2) return null;
    const a = left.slice(0, n);
    const b = right.slice(0, n);
    const mean1 = meanOf(a);
    const mean2 = meanOf(b);
    let num = 0;
    for (let i = 0; i < n; i++) num += (a[i]! - mean1) * (b[i]! - mean2);
    const denom = biased ? n : n - 1;
    if (denom <= 0) return null;
    const out = num / denom;
    return Number.isFinite(out) ? out : null;
  }

  percentileLinearInterpolation(percentage: number): Cell {
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
    const sorted = this.finiteSkip().sort((a, b) => a - b);
    if (sorted.length === 0) return null;
    const n = sorted.length;
    const h = (percentage / 100) * (n - 1);
    const hFloor = Math.trunc(h);
    const hFrac = h - hFloor;
    if (hFloor >= n - 1) return sorted[n - 1]!;
    if (hFloor < 0) return sorted[0]!;
    return sorted[hFloor]! * (1 - hFrac) + sorted[hFloor + 1]! * hFrac;
  }

  percentileNearestRank(percentage: number): Cell {
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return null;
    const sorted = this.finiteSkip().sort((a, b) => a - b);
    if (sorted.length === 0) return null;
    const n = sorted.length;
    const rank = Math.max(1, Math.trunc((percentage / 100) * n + 0.5));
    return sorted[Math.min(rank, n) - 1]!;
  }

  percentrank(value: Cell): Cell {
    if (!isFiniteCell(value)) return null;
    const nums = this.finiteSkip();
    if (nums.length === 0) return null;
    if (nums.length === 1) return 0;
    let count = 0;
    for (const x of nums) if (x <= value) count += 1;
    return ((count - 1) / (nums.length - 1)) * 100;
  }

  /** Z-score with sample stdev; `na` slots stay `na`. <2 finite or zero stdev → `na`. */
  standardize(): PineArray | null {
    const nums = this.finiteSkip();
    if (nums.length < 2) return null;
    const mean = meanOf(nums);
    let acc = 0;
    for (const x of nums) acc += (x - mean) ** 2;
    const stdev = Math.sqrt(acc / (nums.length - 1));
    if (stdev === 0 || !Number.isFinite(stdev)) return null;
    const out = new PineArray();
    for (const v of this.cells) {
      out.push(isFiniteCell(v) ? (v - mean) / stdev : null);
    }
    return out;
  }

  /** Indices that would sort this array; `na` indices last. */
  sortIndices(order: "asc" | "desc" = "asc"): number[] | null {
    const nonNa: { key: number; idx: number }[] = [];
    const naIdx: number[] = [];
    for (let i = 0; i < this.cells.length; i++) {
      const v = this.cells[i]!;
      if (!isFiniteCell(v)) {
        naIdx.push(i);
        continue;
      }
      nonNa.push({ key: v, idx: i });
    }
    const reverse = order === "desc";
    nonNa.sort((a, b) => {
      const cmp = a.key - b.key;
      if (cmp !== 0) return reverse ? -cmp : cmp;
      return a.idx - b.idx;
    });
    return nonNa.map((x) => x.idx).concat(naIdx);
  }

  private binarySearchBy(value: Cell, side: "any" | "left" | "right"): number {
    const seq = this.cells;
    const n = seq.length;
    if (side === "left") {
      let left = 0;
      let right = n;
      while (left < right) {
        const mid = Math.trunc((left + right) / 2);
        if (keyLt(seq[mid]!, value)) left = mid + 1;
        else right = mid;
      }
      if (left < n && keyEq(seq[left]!, value)) return left;
      return -1;
    }
    if (side === "right") {
      let left = 0;
      let right = n;
      while (left < right) {
        const mid = Math.trunc((left + right) / 2);
        if (keyLt(value, seq[mid]!)) right = mid;
        else left = mid + 1;
      }
      if (left > 0 && keyEq(seq[left - 1]!, value)) return left - 1;
      return -1;
    }
    let lo = 0;
    let hi = n - 1;
    while (lo <= hi) {
      const mid = Math.trunc((lo + hi) / 2);
      const midK = seq[mid]!;
      if (keyEq(midK, value)) return mid;
      if (keyLt(midK, value)) lo = mid + 1;
      else hi = mid - 1;
    }
    return -1;
  }

  /** Any `na` / non-finite cell poisons aggregates (matrix `finiteAll` contract). */
  private finiteAll(): number[] | null {
    const out: number[] = [];
    for (const v of this.cells) {
      if (!isFiniteCell(v)) return null;
      out.push(v);
    }
    return out;
  }

  /** Skip `na` / non-finite (Python `_numeric_values` / stdev path). */
  private finiteSkip(): number[] {
    const out: number[] = [];
    for (const v of this.cells) {
      if (isFiniteCell(v)) out.push(v);
    }
    return out;
  }

  toValues(): Cell[] {
    return this.cells.slice();
  }
}
