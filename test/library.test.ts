/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * In-process Pine library registry tests.
 */
import { describe, expect, test } from "bun:test";
import {
  LibraryModule,
  LibraryRegistry,
  STUB_KNOWN_EXPORTS,
  applyStubExport,
  createStubModule,
  index_1d_to_2d,
  index_2d_to_1d,
} from "../src/runtime/library.ts";

describe("LibraryRegistry", () => {
  test("register by title, lookup by name", () => {
    const registry = new LibraryRegistry();
    const mod = new LibraryModule("TradingConstants");
    registry.register(mod);
    expect(registry.lookup({ name: "TradingConstants" })).toBe(mod);
    expect(registry.lookup({ name: "Missing" })).toBeNull();
  });

  test("register with namespace+version, lookup by path", () => {
    const registry = new LibraryRegistry();
    const mod = new LibraryModule("Fib", { namespace: "Alice", version: 3 });
    registry.register(mod);
    expect(registry.lookup({ namespace: "Alice", name: "Fib", version: 3 })).toBe(mod);
    expect(registry.lookup({ name: "Fib" })).toBe(mod);
    expect(registry.lookup({ namespace: "Alice", name: "Other", version: 3 })).toBeNull();
  });

  test("path miss falls back to title", () => {
    const registry = new LibraryRegistry();
    const local = new LibraryModule("Point");
    registry.register(local);
    expect(registry.lookup({ namespace: "user", name: "Point", version: 1 })).toBe(local);
    expect(registry.lookup({ name: "Point" })).toBe(local);
  });

  test("registerSource / getSource", () => {
    const registry = new LibraryRegistry();
    const src = 'library("Fib")\nexport const float R382 = 0.382\n';
    registry.registerSource("Alice", "Fib", 3, src);
    expect(registry.getSource("Alice", "Fib", 3)).toBe(src);
    expect(registry.getSource("Alice", "Fib", 2)).toBeNull();
    expect(registry.getSource("Bob", "Fib", 3)).toBeNull();
  });

  test("replace on re-register", () => {
    const registry = new LibraryRegistry();
    const first = new LibraryModule("MathHelpers", { namespace: "user", version: 1 });
    first.exports.set("double", 1);
    registry.register(first);
    const second = new LibraryModule("MathHelpers", { namespace: "user", version: 1 });
    second.exports.set("double", 2);
    registry.register(second);
    expect(registry.lookup({ name: "MathHelpers" })).toBe(second);
    expect(registry.lookup({ namespace: "user", name: "MathHelpers", version: 1 })).toBe(second);
    expect(registry.lookup({ name: "MathHelpers" })?.get("double")).toBe(2);
    registry.clear();
    expect(registry.lookup({ name: "MathHelpers" })).toBeNull();
    expect(registry.getSource("Alice", "Fib", 3)).toBeNull();
  });
});

describe("LibraryModule", () => {
  test("get missing export → undefined; has() false", () => {
    const mod = new LibraryModule("Empty");
    expect(mod.get("missing")).toBeUndefined();
    expect(mod.has("missing")).toBe(false);
    expect(mod.has("index_2d_to_1d")).toBe(false);
    mod.exports.set("UNIT", 1);
    expect(mod.get("UNIT")).toBe(1);
    expect(mod.has("UNIT")).toBe(true);
  });

  test("setExport + get + kindOf", () => {
    const mod = new LibraryModule("Consts");
    mod.setExport("PI", 3.14);
    expect(mod.get("PI")).toBe(3.14);
    expect(mod.has("PI")).toBe(true);
    expect(mod.kindOf("PI")).toBe("const");
    expect(mod.kindOf("missing")).toBeUndefined();
  });

  test("exportType/exportEnum/exportFn set kinds", () => {
    const mod = new LibraryModule("Typed");
    const typeVal = { name: "Point" };
    const enumVal = { Long: "Side.Long", Short: "Side.Short" };
    const fnVal = (x: unknown) => x;
    mod.exportType("Point", typeVal);
    mod.exportEnum("Side", enumVal);
    mod.exportFn("identity", fnVal);
    expect(mod.get("Point")).toBe(typeVal);
    expect(mod.get("Side")).toBe(enumVal);
    expect(mod.get("identity")).toBe(fnVal);
    expect(mod.kindOf("Point")).toBe("type");
    expect(mod.kindOf("Side")).toBe("enum");
    expect(mod.kindOf("identity")).toBe("fn");
  });

  test("allExports snapshot is a copy", () => {
    const mod = new LibraryModule("Snap");
    mod.setExport("UNIT", 1);
    const snap = mod.allExports();
    expect(snap).toEqual({ UNIT: 1 });
    snap.UNIT = 99;
    snap.NEW = 2;
    expect(mod.get("UNIT")).toBe(1);
    expect(mod.has("NEW")).toBe(false);
    expect(mod.allExports()).toEqual({ UNIT: 1 });
  });
});

describe("stub polyfills", () => {
  test("index_2d_to_1d(10, 5, 2, 3) === 13", () => {
    expect(index_2d_to_1d(10, 5, 2, 3)).toBe(13);
    expect(applyStubExport("index_2d_to_1d", [10, 5, 2, 3])).toBe(13);
    expect(STUB_KNOWN_EXPORTS.index_2d_to_1d(10, 5, 2, 3)).toBe(13);
  });

  test("index_1d_to_2d(10, 5, 13) === [2, 3]", () => {
    expect(index_1d_to_2d(10, 5, 13)).toEqual([2, 3]);
    expect(applyStubExport("index_1d_to_2d", [10, 5, 13])).toEqual([2, 3]);
    expect(STUB_KNOWN_EXPORTS.index_1d_to_2d(10, 5, 13)).toEqual([2, 3]);
  });

  test("aliases dim_x/dim_y/ix/iy", () => {
    expect(
      applyStubExport("index_2d_to_1d", [], { dim_x: 10, dim_y: 5, ix: 2, iy: 3 }),
    ).toBe(13);
    expect(index_2d_to_1d({ dim_x: 10, dim_y: 5, ix: 2, iy: 3 })).toBe(13);
    expect(applyStubExport("index_1d_to_2d", [], { dim_x: 10, dim_y: 5, i: 13 })).toEqual([
      2, 3,
    ]);
    expect(
      applyStubExport("index_2d_to_1d", [10], {
        dimension_y: 5,
        index_x: 2,
        index_y: 3,
      }),
    ).toBe(13);
  });

  test("incomplete / non-numeric args → null", () => {
    expect(index_2d_to_1d(10, 5, 2)).toBeNull();
    expect(index_2d_to_1d()).toBeNull();
    expect(index_2d_to_1d(10, 5, 2, "x")).toBeNull();
    expect(index_2d_to_1d(10, null, 2, 3)).toBeNull();
    expect(index_2d_to_1d(10, Number.NaN, 2, 3)).toBeNull();
    expect(index_1d_to_2d(10, 5)).toBeNull();
    expect(index_1d_to_2d(10, 0, 13)).toBeNull();
    expect(index_1d_to_2d(10, null, 13)).toBeNull();
    expect(index_1d_to_2d(10, "y", 13)).toBeNull();
    expect(applyStubExport("index_2d_to_1d", [10, 5])).toBeNull();
  });
});

describe("createStubModule", () => {
  test('stub module get("index_2d_to_1d") is callable', () => {
    const stub = createStubModule("ArrayExtension");
    const fn = stub.get("index_2d_to_1d");
    expect(typeof fn).toBe("function");
    expect((fn as (...a: unknown[]) => unknown)(10, 5, 2, 3)).toBe(13);
    expect(stub.has("index_2d_to_1d")).toBe(true);
    expect(stub.has("index_1d_to_2d")).toBe(true);
    const inv = stub.get("index_1d_to_2d") as (...a: unknown[]) => unknown;
    expect(inv(10, 5, 13)).toEqual([2, 3]);
    expect(stub.get("missing")).toBeUndefined();
    expect(stub.has("missing")).toBe(false);
    expect(stub.kindOf("index_2d_to_1d")).toBe("fn");
    expect(stub.kindOf("index_1d_to_2d")).toBe("fn");
    expect(stub.kindOf("missing")).toBeUndefined();
  });
});
