/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `math.*` scalars (Python `NumericBuiltinsMixin` SoT).
 * `null` is `na`. Non-finite in/out is `na`.
 */

import { finiteOrNull } from "./num.ts";

export type Cell = number | null;

/** Half away from 0 (Pine `math.round` ties). */
function roundHalfAwayFromZero(x: number): number {
  return x >= 0 ? Math.round(x) : -Math.round(-x);
}

export function mathAbs(x: Cell): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : Math.abs(n);
}

/** `-1`, `0`, or `1`. */
export function mathSign(x: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null) return null;
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

/** `na` if `x < 0`. */
export function mathSqrt(x: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null || n < 0) return null;
  return finiteOrNull(Math.sqrt(n));
}

/** Natural log, or log base `base` when given; `na` if `x <= 0` (or base <= 0). */
export function mathLog(x: Cell, base?: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null || n <= 0) return null;
  if (base === undefined) return finiteOrNull(Math.log(n));
  const b = finiteOrNull(base);
  if (b === null || b <= 0 || b === 1) return null;
  return finiteOrNull(Math.log(n) / Math.log(b));
}

/** `na` if `x <= 0`. */
export function mathLog10(x: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null || n <= 0) return null;
  return finiteOrNull(Math.log10(n));
}

export function mathExp(x: Cell): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : finiteOrNull(Math.exp(n));
}

export function mathPow(base: Cell, exp: Cell): Cell {
  const b = finiteOrNull(base);
  const e = finiteOrNull(exp);
  if (b === null || e === null) return null;
  // JS `Math.pow` yields NaN for e.g. (-1)**0.5; map that (and Inf) to na.
  return finiteOrNull(Math.pow(b, e));
}

/** `na` if any arg is `na` or the list is empty. */
export function mathMax(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let max = -Infinity;
  for (const x of xs) {
    const n = finiteOrNull(x);
    if (n === null) return null;
    if (n > max) max = n;
  }
  return finiteOrNull(max);
}

/** `na` if any arg is `na` or the list is empty. */
export function mathMin(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let min = Infinity;
  for (const x of xs) {
    const n = finiteOrNull(x);
    if (n === null) return null;
    if (n < min) min = n;
  }
  return finiteOrNull(min);
}

export function mathRound(x: Cell, precision?: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null) return null;
  if (precision === undefined) return roundHalfAwayFromZero(n);
  const p = finiteOrNull(precision);
  if (p === null) return null;
  const factor = 10 ** Math.trunc(p);
  if (!Number.isFinite(factor)) return null;
  return finiteOrNull(roundHalfAwayFromZero(n * factor) / factor);
}

export function mathFloor(x: Cell): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : Math.floor(n);
}

export function mathCeil(x: Cell): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : Math.ceil(n);
}

/** Arithmetic mean; `na` if any arg is `na` or the list is empty. */
export function mathAvg(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let sum = 0;
  for (const x of xs) {
    const n = finiteOrNull(x);
    if (n === null) return null;
    sum += n;
  }
  return finiteOrNull(sum / xs.length);
}

export function mathSum(...xs: Cell[]): Cell {
  if (xs.length === 0) return null;
  let sum = 0;
  for (const x of xs) {
    const n = finiteOrNull(x);
    if (n === null) return null;
    sum += n;
  }
  return finiteOrNull(sum);
}

function trig(x: Cell, fn: (n: number) => number): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : finiteOrNull(fn(n));
}

export function mathSin(x: Cell): Cell {
  return trig(x, Math.sin);
}

export function mathCos(x: Cell): Cell {
  return trig(x, Math.cos);
}

export function mathTan(x: Cell): Cell {
  return trig(x, Math.tan);
}

export function mathAsin(x: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null || n < -1 || n > 1) return null;
  return finiteOrNull(Math.asin(n));
}

export function mathAcos(x: Cell): Cell {
  const n = finiteOrNull(x);
  if (n === null || n < -1 || n > 1) return null;
  return finiteOrNull(Math.acos(n));
}

export function mathAtan(x: Cell): Cell {
  return trig(x, Math.atan);
}

export function mathToDegrees(x: Cell): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : finiteOrNull((n * 180) / Math.PI);
}

export function mathToRadians(x: Cell): Cell {
  const n = finiteOrNull(x);
  return n === null ? null : finiteOrNull((n * Math.PI) / 180);
}

/** `na` in → `na`. Else 1 if finite, 0 otherwise. */
export function mathIsFinite(x: Cell): Cell {
  if (x === null) return null;
  return Number.isFinite(x) ? 1 : 0;
}

/** Default mintick 0.01 when the host does not supply one. */
export function mathRoundToMintick(x: Cell, mintick: Cell = 0.01): Cell {
  const n = finiteOrNull(x);
  const tick = finiteOrNull(mintick);
  if (n === null || tick === null || tick <= 0)
    return n === null ? null : finiteOrNull(Number(n.toFixed(8)));
  return finiteOrNull(Math.round(n / tick) * tick);
}

/** Pine v4 `iff(cond, then, else)`. `na` condition → `na`. */
export function mathIff(cond: Cell, thenV: Cell, elseV: Cell): Cell {
  if (cond === null || !Number.isFinite(cond)) return null;
  return cond ? thenV : elseV;
}

/**
 * Python `_builtin_fixnan`: None / NaN → 0 (not prior-bar carry).
 * Other non-finite (`Inf`) is treated as na → 0.
 */
export function mathFixnan(x: Cell): Cell {
  if (x === null || !Number.isFinite(x)) return 0;
  return x;
}

/**
 * Uniform random. No args → [0, 1). One arg → [0, max]. Two args → [min, max]
 * via `lo + (hi - lo) * u` (Python `random.uniform`). Any na / non-finite → na.
 * `rng` is a [0, 1) source (default `Math.random`).
 */
export function mathRandom(
  a?: Cell,
  b?: Cell,
  rng: () => number = Math.random,
): Cell {
  if (a === undefined && b === undefined) return finiteOrNull(rng());
  if (b === undefined) {
    const hi = finiteOrNull(a as Cell);
    if (hi === null) return null;
    return finiteOrNull(hi * rng());
  }
  const lo = finiteOrNull(a as Cell);
  const hi = finiteOrNull(b);
  if (lo === null || hi === null) return null;
  return finiteOrNull(lo + (hi - lo) * rng());
}
