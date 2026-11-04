/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Deep-clone runtime values for realtime tick snapshots (Python
 * `_snapshot_realtime_scope` / `_snapshot_ta_state` analog). Containers
 * duck-type `clone()` so this module stays import-free.
 */

/** Deep clone: primitives, arrays, Map/Set, containers (via `clone()`), plain objects. */
export function cloneValue(v: unknown): unknown {
  if (v == null) return v;
  if (typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(cloneValue);
  if (v instanceof Map) {
    const out = new Map<unknown, unknown>();
    for (const [k, x] of v) out.set(k, cloneValue(x));
    return out;
  }
  if (v instanceof Set) return new Set(v);
  const clone = (v as { clone?: () => unknown }).clone;
  if (typeof clone === "function") return clone.call(v);
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v)) out[k] = cloneValue(x);
  return out;
}
