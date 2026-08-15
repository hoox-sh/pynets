/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Resolve `input` / `input.*` defaults (Python `InputBuiltinsMixin` SoT).
 * Interpret should call this from `evalCall`; this module is host-agnostic.
 */

export type InputValue = number | boolean | string | null;

const INPUT_FNS = new Set([
  "input",
  "input.bool",
  "input.int",
  "input.float",
  "input.price",
  "input.string",
  "input.symbol",
  "input.session",
  "input.source",
  "input.time",
  "input.timeframe",
  "input.color",
  "input.enum",
  "input.text_area",
]);

export function isInputBuiltin(fname: string | null | undefined): boolean {
  return fname != null && INPUT_FNS.has(fname);
}

/** Pick `defval` from positional/named args (Pine: first positional or `defval=`). */
export function inputDefval(
  positional: readonly unknown[],
  named: Record<string, unknown> = {},
): unknown {
  if (named.defval !== undefined) return named.defval;
  return positional[0];
}

/**
 * Coerce a Pine `input*` default into a scalar the interpret host can bind.
 * Bools become 1/0; unknown / string (except numeric-looking) become `null`.
 */
export function resolveInputDefault(
  fname: string,
  positional: readonly unknown[],
  named: Record<string, unknown> = {},
): InputValue {
  const raw = inputDefval(positional, named);
  switch (fname) {
    case "input.bool":
      return raw == null ? false : Boolean(raw);
    case "input.int":
    case "input.time":
      return toInt(raw, 0);
    case "input.float":
    case "input.price":
      return toNum(raw, 0);
    case "input.string":
    case "input.symbol":
    case "input.session":
    case "input.source":
    case "input.timeframe":
    case "input.color":
    case "input.enum":
    case "input.text_area":
      return raw == null ? "" : String(raw);
    default:
      return coerceGeneric(raw);
  }
}

/** Cell-shaped value for the interpret host (`number | null`). */
export function inputAsCell(value: InputValue): number | null {
  if (value == null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function coerceGeneric(raw: unknown): InputValue {
  if (raw == null) return null;
  if (typeof raw === "boolean" || typeof raw === "string") return raw;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  return null;
}

function toNum(raw: unknown, fallback: number): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  if (typeof raw === "string" && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function toInt(raw: unknown, fallback: number): number {
  return Math.trunc(toNum(raw, fallback));
}
