/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * In-process Pine library registry for export/import resolution.
 */

export type StubKwargs = Record<string, unknown>;
export type StubExportFn = (...args: unknown[]) => unknown;

export type LibraryLookup = {
  namespace?: string | null;
  name: string;
  version?: number | null;
};

export type LibraryModuleInit = {
  namespace?: string | null;
  version?: number | null;
  exports?: Map<string, unknown> | Record<string, unknown>;
};

function isPlainObject(value: unknown): value is StubKwargs {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Best-effort int for stub polyfills; null / non-numeric → null. */
function coerceStubInt(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.trunc(value);
  }
  if (typeof value === "bigint") {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (!/^[+-]?\d+$/.test(t)) return null;
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
  }
  return null;
}

/** Merge positional + keyword args into a dense list using `order` names. */
function mergeStubArgs(args: unknown[], kwargs: StubKwargs, order: string[]): unknown[] {
  const merged: unknown[] = args.slice();
  for (const [key, val] of Object.entries(kwargs)) {
    const idx = order.indexOf(key);
    if (idx < 0) continue;
    while (merged.length <= idx) merged.push(null);
    if (idx < args.length && args[idx] != null) continue;
    merged[idx] = val;
  }
  return merged;
}

function parseStubCall(
  callArgs: unknown[],
  kwargs?: StubKwargs,
): { args: unknown[]; kwargs: StubKwargs } {
  if (kwargs !== undefined) return { args: callArgs, kwargs };
  if (callArgs.length === 0) return { args: [], kwargs: {} };
  if (callArgs.length === 1 && isPlainObject(callArgs[0])) {
    return { args: [], kwargs: callArgs[0] };
  }
  if (
    Array.isArray(callArgs[0]) &&
    (callArgs.length === 1 || callArgs.length === 2) &&
    (callArgs[1] === undefined || isPlainObject(callArgs[1]))
  ) {
    return { args: callArgs[0], kwargs: callArgs[1] ?? {} };
  }
  const last = callArgs[callArgs.length - 1];
  if (callArgs.length > 1 && isPlainObject(last)) {
    return { args: callArgs.slice(0, -1), kwargs: last };
  }
  return { args: callArgs, kwargs: {} };
}

function stubIndex2dTo1d(args: unknown[], kwargs: StubKwargs): number | null {
  const order = ["dimension_x", "dimension_y", "index_x", "index_y"];
  const alias: Record<string, string> = {
    dim_x: "dimension_x",
    dim_y: "dimension_y",
    ix: "index_x",
    iy: "index_y",
  };
  const norm: StubKwargs = {};
  for (const [k, v] of Object.entries(kwargs)) norm[alias[k] ?? k] = v;
  const vals = mergeStubArgs(args, norm, order);
  if (vals.length < 4) return null;
  const dy = coerceStubInt(vals[1]);
  const ix = coerceStubInt(vals[2]);
  const iy = coerceStubInt(vals[3]);
  if (dy == null || ix == null || iy == null) return null;
  return ix * dy + iy;
}

function stubIndex1dTo2d(args: unknown[], kwargs: StubKwargs): [number, number] | null {
  const order = ["dimension_x", "dimension_y", "index"];
  const alias: Record<string, string> = {
    dim_x: "dimension_x",
    dim_y: "dimension_y",
    i: "index",
  };
  const norm: StubKwargs = {};
  for (const [k, v] of Object.entries(kwargs)) norm[alias[k] ?? k] = v;
  const vals = mergeStubArgs(args, norm, order);
  if (vals.length < 3) return null;
  const dy = coerceStubInt(vals[1]);
  const idx = coerceStubInt(vals[2]);
  if (dy == null || idx == null || dy === 0) return null;
  const ix = Math.floor(idx / dy);
  const iy = ((idx % dy) + dy) % dy;
  return [ix, iy];
}

/** Row-major flatten: `index_x * dimension_y + index_y`. */
export function index_2d_to_1d(...args: unknown[]): number | null {
  const parsed = parseStubCall(args);
  return stubIndex2dTo1d(parsed.args, parsed.kwargs);
}

/** Inverse of `index_2d_to_1d` → `[index_x, index_y]`. */
export function index_1d_to_2d(...args: unknown[]): [number, number] | null {
  const parsed = parseStubCall(args);
  return stubIndex1dTo2d(parsed.args, parsed.kwargs);
}

/** Known export polyfills for unresolved remote libraries (import stubs). */
export const STUB_KNOWN_EXPORTS: Record<string, StubExportFn> = {
  index_2d_to_1d,
  index_1d_to_2d,
};

/** Call a known stub by export name with positional + named args. */
export function applyStubExport(
  name: string,
  args: unknown[] = [],
  kwargs: StubKwargs = {},
): unknown {
  if (name === "index_2d_to_1d") return stubIndex2dTo1d(args, kwargs);
  if (name === "index_1d_to_2d") return stubIndex1dTo2d(args, kwargs);
  const fn = STUB_KNOWN_EXPORTS[name];
  if (fn == null) return undefined;
  return fn(args, kwargs);
}

function toExportMap(exports?: Map<string, unknown> | Record<string, unknown>): Map<string, unknown> {
  if (exports == null) return new Map();
  if (exports instanceof Map) return exports;
  return new Map(Object.entries(exports));
}

/** A loaded library: title/path identity plus exported callables and values. */
export class LibraryModule {
  title: string;
  namespace: string | null;
  version: number | null;
  exports: Map<string, unknown>;
  private readonly resolveStubs: boolean;

  constructor(title: string, init?: LibraryModuleInit & { resolveStubs?: boolean }) {
    this.title = title;
    this.namespace = init?.namespace ?? null;
    this.version = init?.version ?? null;
    this.exports = toExportMap(init?.exports);
    this.resolveStubs = init?.resolveStubs === true;
  }

  get(name: string): unknown {
    if (this.exports.has(name)) return this.exports.get(name);
    if (this.resolveStubs && Object.hasOwn(STUB_KNOWN_EXPORTS, name)) {
      return STUB_KNOWN_EXPORTS[name];
    }
    return undefined;
  }

  has(name: string): boolean {
    if (this.exports.has(name)) return true;
    return this.resolveStubs && Object.hasOwn(STUB_KNOWN_EXPORTS, name);
  }
}

/** Stub module whose known ArrayExtension helpers resolve via `STUB_KNOWN_EXPORTS`. */
export function createStubModule(title: string): LibraryModule {
  return new LibraryModule(title, { resolveStubs: true });
}

function pathKey(namespace: string, name: string, version: number): string {
  return `${namespace}\0${name}\0${Math.trunc(version)}`;
}

/** Maps library identity (path and/or title) → `LibraryModule`. */
export class LibraryRegistry {
  private readonly byPath = new Map<string, LibraryModule>();
  private readonly byTitle = new Map<string, LibraryModule>();
  private readonly sources = new Map<string, string>();

  /** Register or replace a loaded library (by title and path when known). */
  register(module: LibraryModule): void {
    this.byTitle.set(module.title, module);
    if (module.namespace != null && module.version != null) {
      this.byPath.set(pathKey(module.namespace, module.title, module.version), module);
    }
  }

  /** Store Pine source for lazy load on `import namespace/name/version`. */
  registerSource(namespace: string, name: string, version: number, source: string): void {
    this.sources.set(pathKey(namespace, name, Math.trunc(version)), source);
  }

  /** Return registered source text, or `null` if unknown. */
  getSource(namespace: string, name: string, version: number): string | null {
    return this.sources.get(pathKey(namespace, name, Math.trunc(version))) ?? null;
  }

  /** Resolve by `(namespace, name, version)` path first, then by title. */
  lookup(query: LibraryLookup): LibraryModule | null {
    const { namespace, name, version } = query;
    if (namespace != null && version != null) {
      const mod = this.byPath.get(pathKey(namespace, name, version));
      if (mod != null) return mod;
    }
    return this.byTitle.get(name) ?? null;
  }

  /** Drop all path, title, and source entries (tests). */
  clear(): void {
    this.byPath.clear();
    this.byTitle.clear();
    this.sources.clear();
  }
}
