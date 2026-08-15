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
 *
 * Pine/Python: occurrence is 0-based and default 0 replaces the *first* match;
 * `str.replace_all` replaces every match. This helper keeps the interpret
 * contract: `0` / omitted = replace all (interpret passes `occ ?? 0`);
 * `n > 0` replaces the n-th match (1-based).
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
  if (occ <= 0) return replaceAll(src, tgt, rep);
  let start = 0;
  for (let n = 1; n <= occ; n++) {
    const idx = src.indexOf(tgt, start);
    if (idx < 0) return src;
    if (n === occ) return src.slice(0, idx) + rep + src.slice(idx + tgt.length);
    start = idx + tgt.length;
  }
  return src;
}

function asInt(x: unknown): number | null {
  if (x == null) return null;
  if (typeof x === "boolean") return x ? 1 : 0;
  if (typeof x === "number") return Number.isFinite(x) ? Math.trunc(x) : null;
  if (typeof x === "string") {
    const n = Number(x.trim());
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  return null;
}

/** Python default `{num:g}` — 6 significant digits. */
function formatG(n: number): string {
  if (n === 0) return "0";
  const s = n.toPrecision(6);
  if (/[eE]/.test(s)) return s.replace(/\.?0+([eE])/, "$1");
  return String(Number(s));
}

/** `str.startswith(source, str)` — either arg na → na. */
export function strStartsWith(s: unknown, prefix: unknown): boolean | null {
  const hay = asStr(s);
  const pre = asStr(prefix);
  if (hay == null || pre == null) return null;
  return hay.startsWith(pre);
}

/** `str.endswith(source, str)` — either arg na → na. */
export function strEndsWith(s: unknown, suffix: unknown): boolean | null {
  const hay = asStr(s);
  const suf = asStr(suffix);
  if (hay == null || suf == null) return null;
  return hay.endsWith(suf);
}

/**
 * `str.substring(source, begin_pos, end_pos?)`.
 * End is exclusive (Python slice). Any na argument → na.
 */
export function strSubstring(
  s: unknown,
  begin: unknown,
  end?: unknown,
): string | null {
  if (s == null) return null;
  const value = asStr(s) ?? "";
  if (begin == null) return null;
  const startI = asInt(begin);
  if (startI == null) return null;
  if (end === undefined) return value.slice(startI);
  if (end == null) return null;
  const endI = asInt(end);
  if (endI == null) return null;
  return value.slice(startI, endI);
}

/** Cap `str.repeat` output so a huge count cannot throw / OOM. */
const MAX_REPEAT_CHARS = 1_000_000;

/** `str.repeat(source, num)` — either arg na → na; negative n → `""`. */
export function strRepeat(s: unknown, n: unknown): string | null {
  if (s == null || n == null) return null;
  const value = asStr(s) ?? "";
  let count = asInt(n);
  if (count == null) return null;
  if (count < 0) count = 0;
  if (value.length > 0 && count > Math.floor(MAX_REPEAT_CHARS / value.length)) return null;
  return value.repeat(count);
}

/** `str.trim(string)` — strip whitespace; na → na. */
export function strTrim(s: unknown): string | null {
  const v = asStr(s);
  return v == null ? null : v.trim();
}

/**
 * `str.split(source, separator?)` → array of substrings.
 * na source → `""` then split (Python never returns na). Empty sep → characters.
 * Omitted / na separator → whitespace split.
 */
export function strSplit(s: unknown, separator?: unknown): string[] | null {
  const value = s == null ? "" : (asStr(s) ?? "");
  if (separator === undefined || separator == null) {
    const t = value.trim();
    return t === "" ? [] : t.split(/\s+/);
  }
  const sep = asStr(separator) ?? "";
  if (sep === "") return [...value];
  return value.split(sep);
}

/** `str.tonumber(string)` — unparseable / empty / na → na. */
export function strToNumber(s: unknown): number | null {
  if (s == null) return null;
  if (typeof s === "boolean") return s ? 1 : 0;
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  const value = (asStr(s) ?? "").trim();
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * `str.pos(source, str)` → first index, or `-1` if missing.
 * Either arg na → na.
 */
export function strPos(s: unknown, substr: unknown): number | null {
  const hay = asStr(s);
  const needle = asStr(substr);
  if (hay == null || needle == null) return null;
  return hay.indexOf(needle);
}

/**
 * `str.match(source, regex)` → first matching substring, or na.
 * Either arg na / invalid regex / no match → na.
 */
export function strMatch(s: unknown, regex: unknown): string | null {
  const source = asStr(s);
  const pattern = asStr(regex);
  if (source == null || pattern == null) return null;
  try {
    const m = source.match(new RegExp(pattern));
    return m == null ? null : m[0]!;
  } catch {
    return null;
  }
}

/**
 * `str.format(fmt, ...)` — Java MessageFormat-ish `{0}` / `{1,number,#.##}`.
 * na format → `"NaN"`; missing index → `""`; na arg → `"NaN"`.
 */
export function strFormat(fmt: unknown, ...args: unknown[]): string {
  if (fmt == null) return "NaN";
  const value = typeof fmt === "string" ? fmt : String(fmt);
  return value.replace(/\{([^{}]+)\}/g, (full, body: string) => {
    const parts = body.split(",").map((p) => p.trim());
    const idx = Number.parseInt(parts[0] ?? "", 10);
    if (!Number.isFinite(idx)) return full;
    if (idx < 0 || idx >= args.length) return "";
    const arg = args[idx];
    if (arg == null) return "NaN";
    const kind = (parts[1] ?? "").toLowerCase();
    const pattern = parts[2] ?? "";
    if (kind === "" || kind === "string") return String(arg);
    if (kind === "number") {
      const num = typeof arg === "number" ? arg : Number(arg);
      if (!Number.isFinite(num)) return String(arg);
      if (pattern) {
        if (pattern.includes(".")) {
          const decimals = pattern.split(".", 2)[1]!.length;
          return num.toFixed(decimals);
        }
        return String(Math.trunc(num));
      }
      return formatG(num);
    }
    if (kind === "integer") {
      const num = typeof arg === "number" ? arg : Number(arg);
      if (!Number.isFinite(num)) return String(arg);
      return String(Math.trunc(num));
    }
    return String(arg);
  });
}

/**
 * `str.join(array, separator)` — stringify items.
 * na array → na; na separator → `""`; na elements → empty.
 */
export function strJoin(parts: unknown, sep: unknown): string | null {
  if (parts == null) return null;
  if (!Array.isArray(parts)) return null;
  const separator = sep == null ? "" : (asStr(sep) ?? "");
  return parts.map((item) => (item == null ? "" : String(item))).join(separator);
}

function replaceAll(src: string, tgt: string, rep: string): string {
  if (tgt === "") return src;
  return src.split(tgt).join(rep);
}

/** `str.replace_all(source, target, replacement)`. `na` source → `na`. */
export function strReplaceAll(
  s: unknown,
  target: unknown,
  replacement: unknown,
): string | null {
  if (s == null) return null;
  const src = asStr(s) ?? "";
  const tgt = asStr(target) ?? "";
  const rep = asStr(replacement) ?? "";
  return replaceAll(src, tgt, rep);
}
