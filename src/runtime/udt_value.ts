/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * UDT value duck-typing shared by `PineArray` and `PineMatrix`.
 * Python `_looks_like_udt` / `_udt_field_names` / `_udt_field_key` analog.
 * Accepts native `UdtInstance` and compile-path `{ __type__ }` records.
 */

import { UdtInstance } from "./udt.ts";

/** `na` / non-finite numeric cells sort last. */
export function isSortNa(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "number") return !Number.isFinite(v);
  return false;
}

/** Python `_looks_like_udt` — ObjectInstance or compile-path `{__type__}` dict. */
export function looksLikeUdt(item: unknown): boolean {
  if (item == null || typeof item !== "object") return false;
  if (item instanceof UdtInstance) return true;
  return (
    !Array.isArray(item) &&
    Object.prototype.hasOwnProperty.call(item, "__type__")
  );
}

export function udtFieldNames(item: object): string[] | null {
  if (item instanceof UdtInstance) return item.type.fields.map((f) => f.name);
  const rec = item as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(rec, "__type__")) {
    return Object.keys(rec).filter((k) => k !== "__type__");
  }
  const udt = (
    item as {
      udt?: { fields?: Record<string, unknown> | Array<{ name: string }> };
    }
  ).udt;
  const fields = udt?.fields;
  if (fields == null) return null;
  if (Array.isArray(fields)) return fields.map((f) => f.name);
  return Object.keys(fields);
}

export function readUdtField(item: object, name: string): unknown {
  if (item instanceof UdtInstance) return item.get(name);
  const getField = (item as { get_field?: (n: string) => unknown }).get_field;
  if (typeof getField === "function") {
    try {
      return getField.call(item, name);
    } catch {
      return item;
    }
  }
  return (item as Record<string, unknown>)[name];
}

/** Python `_udt_field_key` — field name or int index; missing field → item. */
export function udtFieldKey(item: unknown, sortField: unknown): unknown {
  if (item == null || sortField == null) return item;
  if (typeof item !== "object") return item;
  if (typeof sortField === "string") {
    const names = udtFieldNames(item);
    if (names != null && !names.includes(sortField)) return item;
    return readUdtField(item, sortField);
  }
  if (typeof sortField === "number" && Number.isFinite(sortField)) {
    const names = udtFieldNames(item);
    if (names == null) return item;
    const idx = Math.trunc(sortField);
    if (idx < 0 || idx >= names.length) return item;
    return readUdtField(item, names[idx]!);
  }
  return item;
}
