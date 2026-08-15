/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `math.*` scalars (Python `NumericBuiltinsMixin` SoT).
 * `null` is `na`. Non-finite in/out is `na`.
 */

export type Cell = number | null;

function finite(value: Cell): number | null {
  return value !== null && Number.isFinite(value) ? value : null;
}

function finiteOut(value: number): Cell {
  return Number.isFinite(value) ? value : null;
}

/** Half away from 0 (Pine `math.round` ties). */
function roundHalfAwayFromZero(x: number): number {
  return x >= 0 ? Math.round(x) : -Math.round(-x);
}

export function mathAbs(x: Cell): Cell {
  const n = finite(x);
  return n === null ? null : Math.abs(n);
}

/** `-1`, `0`, or `1`. */
export function mathSign(x: Cell): Cell {
  const n = finite(x);
  if (n === null) return null;
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

/** `na` if `x < 0`. */
export function mathSqrt(x: Cell): Cell {
  const n = finite(x);
  if (n === null || n < 0) return null;
  return finiteOut(Math.sqrt(n));
}

/** Natural log; `na` if `x <= 0`. */
export function mathLog(x: Cell): Cell {
  const n = finite(x);
  if (n === null || n <= 0) return null;
  return finiteOut(Math.log(n));
}

/** `na` if `x <= 0`. */
export function mathLog10(x: Cell): Cell {
  const n = finite(x);
  if (n === null || n <= 0) return null;
  return finiteOut(Math.log10(n));
}

export function mathExp(x: Cell): Cell {
  const n = finite(x);
  return n === null ? null : finiteOut(Math.exp(n));
}

export function mathPow(base: Cell, exp: Cell): Cell {
  const b = finite(base);
  const e = finite(exp);
  if (b === null || e === null) return null;
  return finiteOut(Math.pow(b, e));
}

/** `na` if any arg is `na` or the list is empty. */
export function mathMax(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let max = -Infinity;
  for (const x of xs) {
    const n = finite(x);
    if (n === null) return null;
    if (n > max) max = n;
  }
  return finiteOut(max);
}

/** `na` if any arg is `na` or the list is empty. */
export function mathMin(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let min = Infinity;
  for (const x of xs) {
    const n = finite(x);
    if (n === null) return null;
    if (n < min) min = n;
  }
  return finiteOut(min);
}

export function mathRound(x: Cell, precision?: Cell): Cell {
  const n = finite(x);
  if (n === null) return null;
  if (precision === undefined) return roundHalfAwayFromZero(n);
  const p = finite(precision);
  if (p === null) return null;
  const factor = 10 ** Math.trunc(p);
  if (!Number.isFinite(factor)) return null;
  return finiteOut(roundHalfAwayFromZero(n * factor) / factor);
}

export function mathFloor(x: Cell): Cell {
  const n = finite(x);
  return n === null ? null : Math.floor(n);
}

export function mathCeil(x: Cell): Cell {
  const n = finite(x);
  return n === null ? null : Math.ceil(n);
}

/** Arithmetic mean; `na` if any arg is `na` or the list is empty. */
export function mathAvg(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let sum = 0;
  for (const x of xs) {
    const n = finite(x);
    if (n === null) return null;
    sum += n;
  }
  return finiteOut(sum / xs.length);
}
