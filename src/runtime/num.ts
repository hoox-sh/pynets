/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Shared numeric guards. `na` is `null`; non-finite numbers are `na`.
 * Domain modules may alias these under local names (e.g. `finiteCell`).
 */

/** Finite-number type guard. Booleans and numeric strings are not numbers. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Finite number → itself; everything else → `na`. */
export function finiteOrNull(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null;
}

/** Finite number → itself; everything else → `fallback`. */
export function finiteOr(value: unknown, fallback: number): number {
  return isFiniteNumber(value) ? value : fallback;
}
