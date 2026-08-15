/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine `array.*` value. `null` is `na`. Get is na-safe (OOB / non-finite → na).
 * Set OOB is a no-op. Python `ArrayBuiltinsMixin` remains the source of truth.
 */

export type Cell = number | null;

function resolveIndex(index: number, length: number): number | null {
  if (!Number.isFinite(index)) return null;
  let i = Math.trunc(index);
  if (i < 0) i = length + i;
  if (i < 0 || i >= length) return null;
  return i;
}

export class PineArray {
  private readonly cells: Cell[] = [];

  constructor(size?: number, initial?: Cell) {
    if (size === undefined) return;
    if (!Number.isFinite(size) || size < 0) return;
    const n = Math.trunc(size);
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
    this.cells.push(value);
  }

  /** Last element, or `na` if empty. */
  pop(): Cell {
    if (this.cells.length === 0) return null;
    return this.cells.pop()!;
  }

  unshift(value: Cell): void {
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

  toValues(): Cell[] {
    return this.cells.slice();
  }
}
