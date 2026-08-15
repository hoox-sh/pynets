/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Tiny Pine `map.*` value. Keys are string or number; `null` is `na`.
 */
export type Cell = number | null;
export type MapKey = string | number;

function keyOf(key: unknown): string | null {
  if (typeof key === "string") return `s:${key}`;
  if (typeof key === "number" && Number.isFinite(key)) return `n:${key}`;
  return null;
}

export class PineMap {
  private readonly data = new Map<string, Cell>();
  private readonly order: string[] = [];

  size(): number {
    return this.data.size;
  }

  put(key: unknown, value: Cell): void {
    const k = keyOf(key);
    if (k == null) return;
    if (!this.data.has(k)) this.order.push(k);
    this.data.set(k, value);
  }

  get(key: unknown): Cell {
    const k = keyOf(key);
    if (k == null) return null;
    return this.data.has(k) ? this.data.get(k)! : null;
  }

  contains(key: unknown): boolean {
    const k = keyOf(key);
    return k != null && this.data.has(k);
  }

  remove(key: unknown): Cell {
    const k = keyOf(key);
    if (k == null || !this.data.has(k)) return null;
    const v = this.data.get(k)!;
    this.data.delete(k);
    const i = this.order.indexOf(k);
    if (i >= 0) this.order.splice(i, 1);
    return v;
  }

  clear(): void {
    this.data.clear();
    this.order.length = 0;
  }

  keys(): MapKey[] {
    return this.order.map((k) => (k.startsWith("s:") ? k.slice(2) : Number(k.slice(2))));
  }
}
