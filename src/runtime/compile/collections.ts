/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile-path array / map / matrix facades. Wraps PineArray / PineMap / PineMatrix.
 */
import { PineArray } from "../array.ts";
import { PineMap } from "../map.ts";
import { PineMatrix } from "../matrix.ts";
import { naNum } from "./helpers.ts";

function n(v: unknown, fallback = 0): number {
  const x = naNum(v);
  return x == null ? fallback : x;
}

function cell(v: unknown): number | null {
  if (v != null && typeof v === "object") return null;
  return naNum(v);
}

/** Keep UDT/string/bool slots; only coerce non-finite numbers to `na`. */
function store(v: unknown): unknown {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  return v;
}

function parseSortArgs(order?: unknown, sortField?: unknown): { order: "asc" | "desc"; field: unknown } {
  if (sortField !== undefined && sortField !== null) {
    return { order: sortOrder(order), field: sortField };
  }
  if (order == null) return { order: "asc", field: null };
  if (typeof order === "string") {
    const low = order.toLowerCase();
    if (low === "ascending" || low === "descending" || low === "asc" || low === "desc" || low.includes("desc") || low.includes("asc")) {
      return { order: sortOrder(order), field: null };
    }
    return { order: "asc", field: order };
  }
  if (typeof order === "number" && Number.isFinite(order)) {
    if (order === 1 || order === -1) return { order: sortOrder(order), field: null };
    return { order: "asc", field: order };
  }
  return { order: sortOrder(order), field: null };
}

function asArray(id: unknown): PineArray | null {
  return id instanceof PineArray ? id : null;
}

function asMap(id: unknown): PineMap | null {
  return id instanceof PineMap ? id : null;
}

function asMatrix(id: unknown): PineMatrix | null {
  return id instanceof PineMatrix ? id : null;
}

function sortOrder(order: unknown): "asc" | "desc" {
  if (typeof order === "number") return order < 0 ? "desc" : "asc";
  return String(order ?? "asc").toLowerCase().includes("desc") ? "desc" : "asc";
}

function wrapCells(cells: ReadonlyArray<unknown> | null | undefined): PineArray | null {
  if (cells == null) return null;
  const out = new PineArray();
  for (const v of cells) out.push(store(v));
  return out;
}

function storedArrayValues(id: unknown): unknown[] | undefined {
  const a = asArray(id);
  if (a == null) return undefined;
  return a.toValues().map(store);
}

export const compileArray = {
  new(size?: unknown, initial?: unknown): PineArray {
    return new PineArray(n(size, 0), store(initial));
  },
  get(id: unknown, index?: unknown): unknown {
    return asArray(id)?.get(n(index, 0)) ?? null;
  },
  set(id: unknown, index?: unknown, value?: unknown): unknown {
    asArray(id)?.set(n(index, 0), store(value));
    return id ?? null;
  },
  push(id: unknown, value?: unknown): unknown {
    asArray(id)?.push(store(value));
    return id ?? null;
  },
  pop(id: unknown): unknown {
    return asArray(id)?.pop() ?? null;
  },
  unshift(id: unknown, value?: unknown): unknown {
    asArray(id)?.unshift(store(value));
    return id ?? null;
  },
  shift(id: unknown): unknown {
    return asArray(id)?.shift() ?? null;
  },
  size(id: unknown): number {
    return asArray(id)?.size() ?? 0;
  },
  includes(id: unknown, value?: unknown): boolean {
    return asArray(id)?.includes(store(value)) ?? false;
  },
  first(id: unknown): unknown {
    return asArray(id)?.first() ?? null;
  },
  last(id: unknown): unknown {
    return asArray(id)?.last() ?? null;
  },
  insert(id: unknown, index?: unknown, value?: unknown): unknown {
    asArray(id)?.insert(n(index, 0), store(value));
    return id ?? null;
  },
  remove(id: unknown, index?: unknown): unknown {
    return asArray(id)?.remove(n(index, 0)) ?? null;
  },
  clear(id: unknown): unknown {
    asArray(id)?.clear();
    return id ?? null;
  },
  fill(id: unknown, value?: unknown): unknown {
    asArray(id)?.fill(store(value));
    return id ?? null;
  },
  copy(id: unknown): PineArray | null {
    return asArray(id)?.copy() ?? null;
  },
  reverse(id: unknown): unknown {
    asArray(id)?.reverse();
    return id ?? null;
  },
  sort(id: unknown, order?: unknown, sortField?: unknown): unknown {
    const parsed = parseSortArgs(order, sortField);
    asArray(id)?.sort(parsed.order, parsed.field);
    return id ?? null;
  },
  concat(id: unknown, other?: unknown): PineArray | null {
    const a = asArray(id);
    const b = asArray(other);
    if (a == null) return b?.copy() ?? null;
    if (b == null) return a;
    return a.concat(b);
  },
  slice(id: unknown, from?: unknown, to?: unknown): PineArray | null {
    return asArray(id)?.slice(n(from, 0), to == null ? undefined : n(to, 0)) ?? null;
  },
  indexof(id: unknown, value?: unknown): number | null {
    return asArray(id)?.indexof(store(value)) ?? null;
  },
  lastindexof(id: unknown, value?: unknown): number | null {
    return asArray(id)?.lastIndexOf(store(value)) ?? null;
  },
  avg(id: unknown): number | null {
    return asArray(id)?.avg() ?? null;
  },
  min(id: unknown): number | null {
    return asArray(id)?.min() ?? null;
  },
  max(id: unknown): number | null {
    return asArray(id)?.max() ?? null;
  },
  sum(id: unknown): number | null {
    return asArray(id)?.sum() ?? null;
  },
  stdev(id: unknown, biased?: unknown): number | null {
    return asArray(id)?.stdev(biased !== false && biased !== 0) ?? null;
  },
  variance(id: unknown, biased?: unknown): number | null {
    return asArray(id)?.variance(biased !== false && biased !== 0) ?? null;
  },
  join(id: unknown, sep?: unknown): string {
    return asArray(id)?.join(sep == null ? "," : String(sep)) ?? "";
  },
  every(id: unknown): boolean {
    return asArray(id)?.every() ?? false;
  },
  some(id: unknown): boolean {
    return asArray(id)?.some() ?? false;
  },
  abs(id: unknown): PineArray | null {
    return asArray(id)?.abs() ?? null;
  },
  range(id: unknown): number | null {
    return asArray(id)?.range() ?? null;
  },
  percentile_nearest(id: unknown, percentage?: unknown): number | null {
    const a = asArray(id);
    const p = naNum(percentage);
    return a != null && p != null ? a.percentileNearestRank(p) : null;
  },
  percentileNearestRank(id: unknown, percentage?: unknown): number | null {
    return compileArray.percentile_nearest(id, percentage);
  },
  percentile_linear(id: unknown, percentage?: unknown): number | null {
    const a = asArray(id);
    const p = naNum(percentage);
    return a != null && p != null ? a.percentileLinearInterpolation(p) : null;
  },
  percentileLinearInterpolation(id: unknown, percentage?: unknown): number | null {
    return compileArray.percentile_linear(id, percentage);
  },
  percentrank(id: unknown, value?: unknown): number | null {
    return asArray(id)?.percentrank(cell(value)) ?? null;
  },
  binary_search(id: unknown, value?: unknown, sortField?: unknown): number | null {
    return asArray(id)?.binarySearch(store(value), sortField) ?? null;
  },
  binary_search_leftmost(id: unknown, value?: unknown, sortField?: unknown): number | null {
    return asArray(id)?.binarySearchLeftmost(store(value), sortField) ?? null;
  },
  binary_search_rightmost(id: unknown, value?: unknown, sortField?: unknown): number | null {
    return asArray(id)?.binarySearchRightmost(store(value), sortField) ?? null;
  },
  sort_indices(id: unknown, order?: unknown, sortField?: unknown): PineArray | null {
    const parsed = parseSortArgs(order, sortField);
    const idx = asArray(id)?.sortIndices(parsed.order, parsed.field);
    return wrapCells(idx);
  },
};

export const compileMap = {
  new(): PineMap {
    return new PineMap();
  },
  put(id: unknown, key?: unknown, value?: unknown): unknown {
    asMap(id)?.put(key, cell(value));
    return id ?? null;
  },
  get(id: unknown, key?: unknown): number | null {
    return asMap(id)?.get(key) ?? null;
  },
  contains(id: unknown, key?: unknown): boolean {
    return asMap(id)?.contains(key) ?? false;
  },
  remove(id: unknown, key?: unknown): number | null {
    return asMap(id)?.remove(key) ?? null;
  },
  clear(id: unknown): unknown {
    asMap(id)?.clear();
    return id ?? null;
  },
  size(id: unknown): number {
    return asMap(id)?.size() ?? 0;
  },
  keys(id: unknown): unknown[] {
    return asMap(id)?.keys() ?? [];
  },
  values(id: unknown): Array<number | null> {
    return asMap(id)?.values() ?? [];
  },
  copy(id: unknown): PineMap | null {
    return asMap(id)?.copy() ?? null;
  },
  put_all(id: unknown, other?: unknown): unknown {
    const m = asMap(id);
    const o = asMap(other);
    if (m != null && o != null) m.putAll(o);
    return id ?? null;
  },
};

export const compileMatrix = {
  new(rows?: unknown, cols?: unknown, initial?: unknown): PineMatrix {
    return new PineMatrix(n(rows, 0), n(cols, 0), store(initial));
  },
  get(id: unknown, row?: unknown, col?: unknown): unknown {
    return asMatrix(id)?.get(n(row, 0), n(col, 0)) ?? null;
  },
  set(id: unknown, row?: unknown, col?: unknown, value?: unknown): unknown {
    asMatrix(id)?.set(n(row, 0), n(col, 0), store(value));
    return id ?? null;
  },
  rows(id: unknown): number {
    return asMatrix(id)?.rows() ?? 0;
  },
  columns(id: unknown): number {
    return asMatrix(id)?.columns() ?? 0;
  },
  fill(id: unknown, value?: unknown): unknown {
    asMatrix(id)?.fill(store(value));
    return id ?? null;
  },
  add_row(id: unknown, index?: unknown, array?: unknown): unknown {
    const idx = naNum(index);
    asMatrix(id)?.addRow(idx ?? undefined, storedArrayValues(array));
    return id ?? null;
  },
  add_col(id: unknown, index?: unknown, array?: unknown): unknown {
    const idx = naNum(index);
    asMatrix(id)?.addCol(idx ?? undefined, storedArrayValues(array));
    return id ?? null;
  },
  transpose(id: unknown): PineMatrix | null {
    return asMatrix(id)?.transpose() ?? null;
  },
  copy(id: unknown): PineMatrix | null {
    return asMatrix(id)?.copy() ?? null;
  },
  row(id: unknown, index?: unknown): PineArray | null {
    const m = asMatrix(id);
    return m == null ? null : wrapCells(m.row(n(index, 0)));
  },
  col(id: unknown, index?: unknown): PineArray | null {
    const m = asMatrix(id);
    return m == null ? null : wrapCells(m.col(n(index, 0)));
  },
  sum(id: unknown): number | null {
    return asMatrix(id)?.sum() ?? null;
  },
  avg(id: unknown): number | null {
    return asMatrix(id)?.avg() ?? null;
  },
  min(id: unknown): number | null {
    return asMatrix(id)?.min() ?? null;
  },
  max(id: unknown): number | null {
    return asMatrix(id)?.max() ?? null;
  },
  det(id: unknown): number | null {
    return asMatrix(id)?.det() ?? null;
  },
  mult(id: unknown, other?: unknown): PineMatrix | null {
    const m = asMatrix(id);
    if (m == null) return null;
    const o = asMatrix(other);
    if (o != null) return m.mult(o);
    const s = naNum(other);
    return s == null ? null : m.mult(s);
  },
  inv(id: unknown): PineMatrix | null {
    return asMatrix(id)?.inv() ?? null;
  },
  pinv(id: unknown): PineMatrix | null {
    return asMatrix(id)?.pinv() ?? null;
  },
  kron(id: unknown, other?: unknown): PineMatrix | null {
    const m = asMatrix(id);
    const o = asMatrix(other);
    return m != null && o != null ? m.kron(o) : null;
  },
  rank(id: unknown): number | null {
    return asMatrix(id)?.rank() ?? null;
  },
  add(id: unknown, other?: unknown): PineMatrix | null {
    const m = asMatrix(id);
    if (m == null) return null;
    const o = asMatrix(other);
    if (o != null) {
      const neg = o.mult(-1);
      return neg == null ? null : m.diff(neg);
    }
    const s = naNum(other);
    if (s == null) return null;
    return m.diff(new PineMatrix(m.rows(), m.columns(), -s));
  },
  diff(id: unknown, other?: unknown): PineMatrix | null {
    const m = asMatrix(id);
    const o = asMatrix(other);
    return m != null && o != null ? m.diff(o) : null;
  },
  reshape(id: unknown, rows?: unknown, cols?: unknown): PineMatrix | null {
    return asMatrix(id)?.reshape(n(rows, 0), n(cols, 0)) ?? null;
  },
  reverse(id: unknown): unknown {
    asMatrix(id)?.reverse();
    return id ?? null;
  },
  sort(id: unknown, column?: unknown, order?: unknown, sortField?: unknown): unknown {
    asMatrix(id)?.sort(n(column, 0), sortOrder(order), sortField);
    return id ?? null;
  },
  sort_indices(id: unknown, column?: unknown, order?: unknown, sortField?: unknown): PineArray | null {
    const m = asMatrix(id);
    if (m == null) return null;
    return wrapCells(m.sortIndices(n(column, 0), sortOrder(order), sortField));
  },
  eigenvalues(id: unknown): PineArray | null {
    return wrapCells(asMatrix(id)?.eigenvalues());
  },
  eigenvectors(id: unknown): PineMatrix | null {
    return asMatrix(id)?.eigenvectors() ?? null;
  },
};
