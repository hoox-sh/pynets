/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";
import type { Assign, Script } from "../src/ast/nodes.ts";

const BITWISE_SCRIPT = `//@version=5
indicator("t")
r = 0
x = 3
r := (r << 1) | (x & 1)
x := x >> 1
y = ~x ^ 1
plot(r)
`;

describe("parse bitwise / shift", () => {
  test("test_bitwise_ops_shift_and_or round-trips", () => {
    const tree = parse(BITWISE_SCRIPT);
    const dumped = dump(tree);
    expect(dumped).toContain("LShift");
    expect(dumped).toContain("BitOr");
    expect(dumped).toContain("BitAnd");
    expect(dumped).toContain("RShift");
    expect(dumped).toContain("Invert");
    expect(dumped).toContain("BitXor");
    const src = unparse(tree);
    expect(src).toContain("<<");
    expect(src).toContain("|");
    expect(src).toContain("&");
    expect(src).toContain(">>");
    expect(src).toContain("~");
    expect(src).toContain("^");
    expect(dump(parse(src))).toBe(dumped);
  });

  test("eval-mode bitwise expressions parse as BinOp", () => {
    expect(parse("3 << 1", "<unknown>", "eval")).toMatchObject({
      kind: "Expression",
      body: { kind: "BinOp", op: { kind: "LShift" } },
    });
    expect(parse("7 & 3", "<unknown>", "eval")).toMatchObject({
      kind: "Expression",
      body: { kind: "BinOp", op: { kind: "BitAnd" } },
    });
    expect(unparse(parse("1 ^ 3", "<unknown>", "eval"))).toBe("1 ^ 3");
  });
});

describe("parse type Qualify / Specialize", () => {
  test("series float and const int are Qualify on the type", () => {
    const tree = parse(`series float x = close
const int n = 1
`) as Script;
    const stmts = tree.body.filter((s): s is Assign => s.kind === "Assign");
    expect(stmts[0]?.type).toMatchObject({
      kind: "Qualify",
      qualifier: { kind: "Series" },
      value: { kind: "Name", id: "float" },
    });
    expect(stmts[1]?.type).toMatchObject({
      kind: "Qualify",
      qualifier: { kind: "Const" },
      value: { kind: "Name", id: "int" },
    });
    const src = unparse(tree);
    expect(src).toContain("series float x = close");
    expect(src).toContain("const int n = 1");
    expect(dump(parse(src))).toBe(dump(tree));
  });

  test("template specialize on types and calls", () => {
    const typeTree = parse("array<float> xs = na") as Script;
    expect(typeTree.body[0]).toMatchObject({
      kind: "Assign",
      type: {
        kind: "Specialize",
        value: { kind: "Name", id: "array" },
        args: { kind: "Name", id: "float" },
      },
    });
    expect(unparse(typeTree)).toContain("array<float> xs = na");
    expect(dump(parse(unparse(typeTree)))).toBe(dump(typeTree));

    const callTree = parse("plot(array.new<float>(2, 0))");
    expect(dump(callTree)).toContain("Specialize");
    expect(unparse(callTree)).toContain("array.new<float>");
    expect(dump(parse(unparse(callTree)))).toBe(dump(callTree));
  });
});
