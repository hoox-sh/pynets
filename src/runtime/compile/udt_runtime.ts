/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile-path UDT helpers: dict-like instances (`__type__` + fields).
 */
import { UdtInstance, UdtType } from "../udt.ts";

const types = new Map<string, UdtType>();

export function udtRegister(name: string, fields: string[], defaults?: Record<string, unknown>): void {
  types.set(
    name,
    new UdtType(
      name,
      fields.map((f) => ({ name: f, default: defaults?.[f] ?? null })),
    ),
  );
}

export function udtNew(name: string, overrides?: Record<string, unknown>): UdtInstance | Record<string, unknown> {
  let t = types.get(name);
  if (t == null) {
    const fields = overrides != null ? Object.keys(overrides) : [];
    t = new UdtType(name, fields.map((f) => ({ name: f, default: null })));
    types.set(name, t);
  }
  return t.newInstance(overrides);
}

export function udtGet(obj: unknown, field: string): unknown {
  if (obj instanceof UdtInstance) return obj.get(field);
  if (obj != null && typeof obj === "object") {
    const rec = obj as Record<string, unknown>;
    return rec[field] ?? null;
  }
  return null;
}

export function udtSet(obj: unknown, field: string, value: unknown): unknown {
  if (obj instanceof UdtInstance) {
    obj.set(field, value);
    return obj;
  }
  if (obj != null && typeof obj === "object") {
    (obj as Record<string, unknown>)[field] = value;
    return obj;
  }
  return obj ?? null;
}
