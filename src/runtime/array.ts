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

  indexof(value: Cell): Cell {
    for (let i = 0; i < this.cells.length; i++) {
      if (Object.is(this.cells[i], value)) return i;
    }
    return null;
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

  /** Any `na` / non-finite cell poisons aggregates (matrix `finiteAll` contract). */
  private finiteAll(): number[] | null {
    const out: number[] = [];
    for (const v of this.cells) {
      if (!isFiniteCell(v)) return null;
      out.push(v);
    }
    return out;
  }

  toValues(): Cell[] {
    return this.cells.slice();
  }
}
