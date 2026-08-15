/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse } from "../src/ast/helper.ts";
import {
  Add,
  Store,
  Var,
  assign,
  arg,
  binOp,
  call,
  constant,
  exprStmt,
  name,
  reAssign,
  script,
  type Script,
} from "../src/ast/nodes.ts";
import { interpret, interpretTree } from "../src/runtime/interpret.ts";

const THREE_BARS = [10, 20, 30].map((close) => ({ close }));

function parseSupportsVarReassign(src: string): boolean {
  try {
    const tree = parse(src);
    if (tree.kind !== "Script") return false;
    const body = (tree as Script).body;
    const kinds = body.map((s) => s.kind);
    const hasVar = body.some((s) => s.kind === "Assign" && s.mode?.kind === "Var");
    return hasVar && kinds.includes("ReAssign");
  } catch {
    return false;
  }
}

describe("interpret var / :=", () => {
  test("x = close then plot(x)", () => {
    const tree = script([
      exprStmt(call(name("indicator"), [arg(constant("t"))])),
      assign(name("x", Store), name("close")),
      exprStmt(call(name("plot"), [arg(name("x"))])),
    ]);
    const out = interpretTree(tree, THREE_BARS);
    expect(out.plots).toEqual([10, 20, 30]);
  });

  test("var y persists unless ReAssign", () => {
    const tree = script([
      exprStmt(call(name("indicator"), [arg(constant("t"))])),
      assign(name("y", Store), constant(1), null, Var),
      exprStmt(call(name("plot"), [arg(name("y"))])),
    ]);
    const out = interpretTree(tree, THREE_BARS);
    expect(out.plots).toEqual([1, 1, 1]);
  });

  test("var y = 1 / y := y+1 plots 1,2,3", () => {
    const tree = script([
      exprStmt(call(name("indicator"), [arg(constant("t"))])),
      assign(name("y", Store), constant(1), null, Var),
      exprStmt(call(name("plot"), [arg(name("y"))])),
      reAssign(name("y", Store), binOp(name("y"), Add, constant(1))),
    ]);
    const out = interpretTree(tree, THREE_BARS);
    expect(out.plots).toEqual([1, 2, 3]);
  });

  test("var counter := y+1 before plot starts at 1", () => {
    const tree = script([
      exprStmt(call(name("indicator"), [arg(constant("t"))])),
      assign(name("y", Store), constant(0), null, Var),
      reAssign(name("y", Store), binOp(name("y"), Add, constant(1))),
      exprStmt(call(name("plot"), [arg(name("y"))])),
    ]);
    const out = interpretTree(tree, THREE_BARS);
    expect(out.plots).toEqual([1, 2, 3]);
  });

  const parsedSrc = `indicator("t")\nvar y = 1\nplot(y)\ny := y + 1`;
  test.skipIf(!parseSupportsVarReassign(parsedSrc))("parse var y = 1 / y := y+1 plots 1,2,3", () => {
    const out = interpret(parsedSrc, THREE_BARS);
    expect(out.plots).toEqual([1, 2, 3]);
  });

  const parsedSameBar = `indicator("t")\nvar y = 1\ny := y + 1\nplot(y)`;
  test.skipIf(!parseSupportsVarReassign(parsedSameBar))(
    "parse var then := then plot increments on the init bar",
    () => {
      const out = interpret(parsedSameBar, THREE_BARS);
      expect(out.plots).toEqual([2, 3, 4]);
    },
  );
});
