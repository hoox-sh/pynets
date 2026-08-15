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

function isColor(c: unknown): c is Color {
  if (typeof c !== "object" || c === null) return false;
  const col = c as Color;
  return finite(col.r) && finite(col.g) && finite(col.b) && finite(col.a);
}

function hexByte(n: number): string {
  return clampByte(n).toString(16).toUpperCase().padStart(2, "0");
}

function transpToAlpha(t: number): number {
  return 255 * (1 - Math.max(0, Math.min(100, t)) / 100);
}

function alphaToTransp(a: number): number {
  return Math.max(0, Math.min(100, Math.round((1 - a / 255) * 100)));
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
  const a = finite(t) ? transpToAlpha(t) : 255;
  return pack(r, g, b, a);
}

/** `color.rgb(r, g, b, t?)` — `t` is transparency 0–100 like `color.new`. */
export function colorRgb(
  r: number | null,
  g: number | null,
  b: number | null,
  t?: number | null,
): Color | null {
  return colorNew(r, g, b, t);
}

/**
 * Linear RGB(A) lerp. `value` outside `[bottom, top]` is clamped.
 * Any na / non-finite input → `null`.
 */
export function colorFromGradient(
  value: number | null,
  bottom: number | null,
  top: number | null,
  c1: Color | null,
  c2: Color | null,
): Color | null {
  if (!finite(value) || !finite(bottom) || !finite(top)) return null;
  if (!isColor(c1) || !isColor(c2)) return null;
  const span = top - bottom;
  const ratio = span === 0 ? 0 : Math.max(0, Math.min(1, (value - bottom) / span));
  return pack(
    c1.r + (c2.r - c1.r) * ratio,
    c1.g + (c2.g - c1.g) * ratio,
    c1.b + (c2.b - c1.b) * ratio,
    c1.a + (c2.a - c1.a) * ratio,
  );
}

/** CSS / Pine named colors (`color.red` is opaque `(255, 0, 0)`). */
export const COLOR_BY_NAME: Record<string, Color> = {
  red: { r: 255, g: 0, b: 0, a: 255 },
  green: { r: 0, g: 128, b: 0, a: 255 },
  blue: { r: 0, g: 0, b: 255, a: 255 },
  black: { r: 0, g: 0, b: 0, a: 255 },
  white: { r: 255, g: 255, b: 255, a: 255 },
  gray: { r: 128, g: 128, b: 128, a: 255 },
  grey: { r: 128, g: 128, b: 128, a: 255 },
  silver: { r: 192, g: 192, b: 192, a: 255 },
  yellow: { r: 255, g: 255, b: 0, a: 255 },
  orange: { r: 255, g: 165, b: 0, a: 255 },
  purple: { r: 128, g: 0, b: 128, a: 255 },
  aqua: { r: 0, g: 255, b: 255, a: 255 },
  fuchsia: { r: 255, g: 0, b: 255, a: 255 },
  lime: { r: 0, g: 255, b: 0, a: 255 },
  maroon: { r: 128, g: 0, b: 0, a: 255 },
  navy: { r: 0, g: 0, b: 128, a: 255 },
  olive: { r: 128, g: 128, b: 0, a: 255 },
  teal: { r: 0, g: 128, b: 128, a: 255 },
};

/** Case-insensitive lookup; optional `color.` prefix. Unknown → `null`. */
export function colorByName(name: string): Color | null {
  if (typeof name !== "string") return null;
  let key = name.trim().toLowerCase();
  if (key.startsWith("color.")) key = key.slice("color.".length);
  const found = COLOR_BY_NAME[key];
  return found ? { ...found } : null;
}

/** Coerce Color | `#RRGGBB(AA)` | named (`red` / `color.red`). Unknown / na → `null`. */
export function asColor(c: unknown): Color | null {
  if (isColor(c)) return c;
  if (typeof c !== "string") return null;
  return parseColor(c) ?? colorByName(c);
}

export function colorR(c: unknown): number | null {
  const col = asColor(c);
  return col ? clampByte(col.r) : null;
}

export function colorG(c: unknown): number | null {
  const col = asColor(c);
  return col ? clampByte(col.g) : null;
}

export function colorB(c: unknown): number | null {
  const col = asColor(c);
  return col ? clampByte(col.b) : null;
}

/** Transparency 0–100 derived from alpha (255 → 0, 0 → 100). */
export function colorT(c: unknown): number | null {
  const col = asColor(c);
  return col ? alphaToTransp(col.a) : null;
}

/** `#RRGGBB`, or `#RRGGBBAA` when alpha is not 255. */
export function colorToHex(c: Color): string {
  const rgb = `#${hexByte(c.r)}${hexByte(c.g)}${hexByte(c.b)}`;
  return c.a !== 255 ? `${rgb}${hexByte(c.a)}` : rgb;
}
