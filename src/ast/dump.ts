/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Python-style `ast.dump` text for ASDL-shaped nodes.
 */
import type { AST } from "./nodes.ts";

function dumpValue(value: unknown, annotate: boolean): string {
  if (value == null) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return `[${value.map((v) => dumpValue(v, annotate)).join(", ")}]`;
  }
  if (typeof value === "object" && value !== null && "kind" in (value as object)) {
    return dump(value as AST, { annotate_fields: annotate });
  }
  return String(value);
}

const SKIP = new Set(["kind", "lineno", "col_offset", "end_lineno", "end_col_offset", "kind_lit"]);

export function dump(
  node: AST,
  options: { annotate_fields?: boolean; include_attributes?: boolean } = {},
): string {
  const annotate = options.annotate_fields !== false;
  const rec = node as unknown as Record<string, unknown>;
  const fields: string[] = [];
  for (const [key, value] of Object.entries(rec)) {
    if (SKIP.has(key)) continue;
    if (key === "annotations" && Array.isArray(value) && value.length === 0) continue;
    if (value === undefined) continue;
    const rendered = dumpValue(value, annotate);
    fields.push(annotate ? `${key}=${rendered}` : rendered);
  }
  if (node.kind === "Constant" && rec.kind_lit) {
    fields.push(annotate ? `kind=${dumpValue(rec.kind_lit, annotate)}` : dumpValue(rec.kind_lit, annotate));
  }
  return `${node.kind}(${fields.join(", ")})`;
}
