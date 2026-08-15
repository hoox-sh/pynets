/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `str.*` helpers. `null` is na.
 */

function asStr(x: unknown): string | null {
  if (x == null) return null;
  return typeof x === "string" ? x : String(x);
}

/** `str.tostring(x)` — na becomes `""`. */
export function strTostring(x: unknown): string {
  return asStr(x) ?? "";
}

export const strTosring = strTostring;

export function strLength(s: unknown): number | null {
  const v = asStr(s);
  return v == null ? null : v.length;
}

export function strContains(s: unknown, sub: unknown): boolean | null {
  const hay = asStr(s);
  const needle = asStr(sub);
  if (hay == null || needle == null) return null;
  return hay.includes(needle);
}

export function strUpper(s: unknown): string | null {
  const v = asStr(s);
  return v == null ? null : v.toUpperCase();
}

export function strLower(s: unknown): string | null {
  const v = asStr(s);
  return v == null ? null : v.toLowerCase();
}

/**
 * `str.replace(s, target, replacement, occurrence?)`.
 * `occurrence` 0 / omitted = replace all; n > 0 replaces the n-th match (1-based).
 */
export function strReplace(
  s: unknown,
  target: unknown,
  replacement: unknown,
  occurrence?: number | null,
): string | null {
  if (s == null) return null;
  const src = asStr(s) ?? "";
  const tgt = asStr(target) ?? "";
  const rep = asStr(replacement) ?? "";
  const occ =
    typeof occurrence === "number" && Number.isFinite(occurrence)
      ? Math.trunc(occurrence)
      : 0;
  if (tgt === "") return src;
  if (occ <= 0) return src.split(tgt).join(rep);
  let start = 0;
  for (let n = 1; n <= occ; n++) {
    const idx = src.indexOf(tgt, start);
    if (idx < 0) return src;
    if (n === occ) return src.slice(0, idx) + rep + src.slice(idx + tgt.length);
    start = idx + tgt.length;
  }
  return src;
}
