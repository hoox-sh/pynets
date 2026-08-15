/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `color.*` helpers. Transparency is 0–100 (0 = opaque).
 */

export type Color = { r: number; g: number; b: number; a: number };

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function finite(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function pack(r: number, g: number, b: number, a: number): Color {
  return { r: clampByte(r), g: clampByte(g), b: clampByte(b), a: clampByte(a) };
}

/** Parse `#RRGGBB` / `#RRGGBBAA`. Alpha defaults to 255. Invalid / na → `null` (no throw). */
export function parseColor(hex: unknown): Color | null {
  if (typeof hex !== "string") return null;
  const m = HEX.exec(hex.trim());
  if (!m) return null;
  const h = m[1]!;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
  if (![r, g, b, a].every((c) => Number.isFinite(c))) return null;
  return { r, g, b, a };
}

/** `color.new(r, g, b, t?)` — `t` is transparency 0–100 → alpha. */
export function colorNew(
  r: number | null,
  g: number | null,
  b: number | null,
  t?: number | null,
): Color | null {
  if (!finite(r) || !finite(g) || !finite(b)) return null;
  const a = finite(t)
    ? 255 * (1 - Math.max(0, Math.min(100, t)) / 100)
    : 255;
  return pack(r, g, b, a);
}

/** Pack RGB(A) bytes. Alpha defaults to 255. */
export function colorRgb(
  r: number | null,
  g: number | null,
  b: number | null,
  a?: number | null,
): Color | null {
  if (!finite(r) || !finite(g) || !finite(b)) return null;
  return pack(r, g, b, finite(a) ? a : 255);
}
