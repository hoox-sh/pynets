/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";

describe("parse function", () => {
  test("f(x) => x + 1 dumps FunctionDef and unparse re-parses", () => {
    const tree = parse("f(x) => x + 1");
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    const src = unparse(tree);
    expect(src).toContain("f(x) =>");
    expect(dump(parse(src))).toBe(dumped);
  });

  test("UDF return type is parsed then dropped", () => {
    const tree = parse("int g(int n) => n * 2");
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    expect(unparse(tree)).toContain("g(int n) => n * 2");
    expect(unparse(tree)).not.toMatch(/^int /);
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });

  test("export method prefixes", () => {
    const tree = parse("export method m(int x) => x");
    const dumped = dump(tree);
    expect(dumped).toContain("FunctionDef");
    expect(unparse(tree)).toBe("export method m(int x) => x");
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });
});
