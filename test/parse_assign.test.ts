/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";
import type { Script } from "../src/ast/nodes.ts";

const ASSIGN_SCRIPT = `indicator("t")
x = close
var y = close
y := y + 1
plot(x)`;

const LENGTH_SCRIPT = `length = 14
plot(close)`;

describe("parse assign", () => {
  test("assignment script produces Assign/ReAssign/Var and round-trips", () => {
    const tree = parse(ASSIGN_SCRIPT);
    expect(tree.kind).toBe("Script");
    const dumped = dump(tree);
    expect(dumped).toContain("Assign");
    expect(dumped).toContain("ReAssign");
    expect(dumped).toContain("Var");
    const src = unparse(tree);
    expect(src).toContain('indicator("t")');
    expect(src).toContain("x = close");
    expect(src).toContain("var y = close");
    expect(src).toContain("y := y + 1");
    expect(src).toContain("plot(x)");
    expect(dump(parse(src))).toBe(dumped);
  });

  test("length = 14 assignment round-trips", () => {
    const tree = parse(LENGTH_SCRIPT);
    const dumped = dump(tree);
    expect(dumped).toContain("Assign");
    const src = unparse(tree);
    expect(src).toContain("length = 14");
    expect(src).toContain("plot(close)");
    expect(dump(parse(src))).toBe(dumped);
  });

  test("x = switch is one Assign with Switch value, not a sibling Switch", () => {
    const src = `x = switch
    close > 0 => 1
    => 0
`;
    const tree = parse(src);
    expect(tree.kind).toBe("Script");
    const dumped = dump(tree);
    expect(dumped).toContain("Assign");
    expect(dumped).toContain("Switch");
    expect(tree).toMatchObject({
      kind: "Script",
      body: [{ kind: "Assign", value: { kind: "Switch" } }],
    });
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });

  test("x := switch is one ReAssign with Switch value", () => {
    const src = `x := switch
    1 => 2
    => 0
`;
    const tree = parse(src);
    const dumped = dump(tree);
    expect(tree).toMatchObject({
      kind: "Script",
      body: [{ kind: "ReAssign", value: { kind: "Switch" } }],
    });
    expect(dump(parse(unparse(tree)))).toBe(dumped);
  });

  test("bare name = is Assign; := and attribute = are ReAssign", () => {
    const tree = parse(`//@version=5
indicator("eq")
x = 1
x := 2
strategy.initial_capital = 50000
plot(x)
`) as Script;
    const stmts = tree.body.filter((s) => s.kind === "Assign" || s.kind === "ReAssign");
    expect(
      stmts.some((s) => s.kind === "Assign" && s.target.kind === "Name" && s.target.id === "x"),
    ).toBe(true);
    expect(
      stmts.some((s) => s.kind === "ReAssign" && s.target.kind === "Name" && s.target.id === "x"),
    ).toBe(true);
    expect(
      stmts.some(
        (s) =>
          s.kind === "ReAssign" &&
          s.target.kind === "Attribute" &&
          s.target.attr === "initial_capital",
      ),
    ).toBe(true);
  });
});
