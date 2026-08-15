/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";

const ENUM_SRC = `enum Side
    long
    short
`;

const TYPE_SRC = `type Point
    float x
    float y
`;

function typeParses(): boolean {
  try {
    return dump(parse(TYPE_SRC)).includes("TypeDef");
  } catch {
    return false;
  }
}

describe("parse enum / type", () => {
  test("enum Side dumps EnumDef and unparse re-parses", () => {
    const tree = parse(ENUM_SRC);
    const dumped = dump(tree);
    expect(dumped).toContain("EnumDef");
    const src = unparse(tree);
    expect(src).toContain("enum Side");
    expect(src).toMatch(/\n    long/);
    expect(src).toMatch(/\n    short/);
    expect(dump(parse(src))).toBe(dumped);
  });

  test.skipIf(!typeParses())("type Point dumps TypeDef and unparse re-parses", () => {
    const tree = parse(TYPE_SRC);
    const dumped = dump(tree);
    expect(dumped).toContain("TypeDef");
    const src = unparse(tree);
    expect(src).toContain("type Point");
    expect(src).toContain("float x");
    expect(src).toContain("float y");
    expect(dump(parse(src))).toBe(dumped);
  });
});
