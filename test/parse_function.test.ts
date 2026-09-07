/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";
import type { FunctionDef, Script } from "../src/ast/nodes.ts";

describe("parse function", () => {
  test("f(x) => x + 1 dumps FunctionDef and unparse re-parses", () => {
    const tree = parse("f(x) => x + 1");
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    const src = unparse(tree);
    expect(src).toContain("f(x) =>");
    expect(dump(parse(src))).toBe(dumped);
  });

  test("UDF return type survives parse → unparse", () => {
    const tree = parse("int g(int n) => n * 2");
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    expect(dumped).toContain('returns=Name(id="int"');
    expect(unparse(tree)).toBe("int g(int n) => n * 2");
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });

  test("typed UDF and void method keep returns on round-trip", () => {
    const src = `//@version=5
indicator("t")
int ilog2(int n) =>
    int p = 0
    p
void noop(float[] re, int N) =>
    0
plot(ilog2(8))
`;
    const tree = parse(src) as Script;
    expect(tree.kind).toBe("Script");
    const funcs = tree.body.filter((s): s is FunctionDef => s.kind === "FunctionDef");
    const byName = Object.fromEntries(funcs.map((f) => [f.name, f]));
    expect(byName.ilog2?.returns).toMatchObject({ kind: "Name", id: "int" });
    expect(byName.noop?.returns).toMatchObject({ kind: "Name", id: "void" });
    const out = unparse(tree);
    expect(out).toContain("int ilog2(");
    expect(out).toContain("void noop(");
    const again = parse(out) as Script;
    const againFn = Object.fromEntries(
      again.body.filter((s): s is FunctionDef => s.kind === "FunctionDef").map((f) => [f.name, f]),
    );
    expect(againFn.ilog2?.returns).toMatchObject({ kind: "Name", id: "int" });
  });

  test("export method prefixes", () => {
    const tree = parse("export method m(int x) => x");
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    expect(unparse(tree)).toBe("export method m(int x) => x");
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });
});
