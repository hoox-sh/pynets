/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * na-safe arithmetic / compare / history for the JS compile backend.
 * Python analog: pynescript.compiler.numba_builtins (object-mode subset).
 */
export const NA = null;

export function isNaCell(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "number") return !Number.isFinite(v);
  return false;
}

export function naNum(v: unknown): number | null {
  if (isNaCell(v)) return NA;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v;
  return NA;
}

/** Store cell or object handle. Objects (array/map/matrix/UDT) stay intact. */
export function hold(v: unknown): unknown {
  if (v != null && typeof v === "object") return v;
  return naNum(v);
}

export function pineEq(a: unknown, b: unknown): boolean {
  const an = isNaCell(a);
  const bn = isNaCell(b);
  if (an && bn) return true;
  if (an || bn) return false;
  return a === b;
}

export function pineNe(a: unknown, b: unknown): boolean {
  const an = isNaCell(a);
  const bn = isNaCell(b);
  if (an || bn) return false;
  return a !== b;
}

export function pineLt(a: unknown, b: unknown): boolean {
  if (isNaCell(a) || isNaCell(b)) return false;
  return (a as number) < (b as number);
}

export function pineLtE(a: unknown, b: unknown): boolean {
  if (isNaCell(a) || isNaCell(b)) return false;
  return (a as number) <= (b as number);
}

export function pineGt(a: unknown, b: unknown): boolean {
  if (isNaCell(a) || isNaCell(b)) return false;
  return (a as number) > (b as number);
}

export function pineGtE(a: unknown, b: unknown): boolean {
  if (isNaCell(a) || isNaCell(b)) return false;
  return (a as number) >= (b as number);
}

function bin(a: unknown, b: unknown, op: (x: number, y: number) => number): number | null {
  const x = naNum(a);
  const y = naNum(b);
  if (x == null || y == null) return NA;
  const r = op(x, y);
  return Number.isFinite(r) ? r : NA;
}

export function safeAdd(a: unknown, b: unknown): number | null {
  return bin(a, b, (x, y) => x + y);
}

export function safeSub(a: unknown, b: unknown): number | null {
  return bin(a, b, (x, y) => x - y);
}

export function safeMul(a: unknown, b: unknown): number | null {
  return bin(a, b, (x, y) => x * y);
}

export function safeDiv(a: unknown, b: unknown): number | null {
  return bin(a, b, (x, y) => x / y);
}

export function safeMod(a: unknown, b: unknown): number | null {
  return bin(a, b, (x, y) => x % y);
}

export function safeNeg(a: unknown): number | null {
  const x = naNum(a);
  if (x == null) return NA;
  const r = -x;
  return Number.isFinite(r) ? r : NA;
}

export function nz(v: unknown, fallback: unknown = 0): number | null {
  if (isNaCell(v)) {
    const f = naNum(fallback);
    return f == null ? 0 : f;
  }
  return naNum(v);
}

/** History: arr[bar - offset]. OOB / negative offset → na. [0] is current. */
export function histGet(arr: Array<number | null>, bar: number, offset: unknown): number | null {
  const off = naNum(offset);
  if (off == null || off < 0 || !Number.isFinite(off)) return NA;
  const i = bar - Math.trunc(off);
  if (i < 0 || i >= arr.length) return NA;
  return naNum(arr[i]);
}

export function histStore(arr: Array<number | null>, bar: number, value: unknown): void {
  if (bar < 0 || bar >= arr.length) return;
  arr[bar] = naNum(value);
}

export function defaultVolume(n: number): Array<number | null> {
  return Array.from({ length: n }, () => 1);
}

export function defaultTime(n: number): Array<number | null> {
  return Array.from({ length: n }, (_, i) => i * 60_000);
}

export function toFloatArr(
  xs: ArrayLike<number | null | undefined> | null | undefined,
  n: number,
  missing: number | null,
): Array<number | null> {
  const out: Array<number | null> = new Array(n);
  for (let i = 0; i < n; i++) {
    const v = xs != null && i < xs.length ? xs[i] : missing;
    out[i] = naNum(v ?? missing);
  }
  return out;
}
