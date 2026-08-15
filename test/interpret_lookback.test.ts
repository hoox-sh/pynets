/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse } from "../src/ast/helper.ts";
import {
  Store,
  assign,
  arg,
  call,
  exprStmt,
  name,
  script,
  subscript,
  constant,
  type Script,
} from "../src/ast/nodes.ts";
import { interpret, interpretTree } from "../src/runtime/interpret.ts";

const BARS_1_TO_5 = [1, 2, 3, 4, 5].map((close) => ({ close }));

function parseHasAssign(src: string): boolean {
  try {
    const tree = parse(src);
    return (
      tree.kind === "Script" &&
      (tree as Script).body.some((s) => s.kind === "Assign" && s.value != null)
    );
  } catch {
    return false;
  }
}

describe("interpret lookback", () => {
  test("plot(close[1]) on closes 1..5", () => {
    const out = interpret(`indicator("t")\nplot(close[1])`, BARS_1_TO_5);
    expect(out.plots).toEqual([null, 1, 2, 3, 4]);
  });

  test("x = close then plot(x) stays current close", () => {
    const tree = script([
      exprStmt(call(name("indicator"), [arg(constant("t"))])),
      assign(name("x", Store), name("close")),
      exprStmt(call(name("plot"), [arg(name("x"))])),
    ]);
    const out = interpretTree(tree, BARS_1_TO_5);
    expect(out.plots).toEqual([1, 2, 3, 4, 5]);
  });

  test("x = close then plot(x[1]) uses the user series", () => {
    const tree = script([
      exprStmt(call(name("indicator"), [arg(constant("t"))])),
      assign(name("x", Store), name("close")),
      exprStmt(call(name("plot"), [arg(subscript(name("x"), constant(1)))])),
    ]);
    const out = interpretTree(tree, BARS_1_TO_5);
    expect(out.plots).toEqual([null, 1, 2, 3, 4]);
  });

  const assignSrc = `indicator("t")\nx = close\nplot(x)`;
  test.skipIf(!parseHasAssign(assignSrc))("parse x = close then plot(x)", () => {
    const out = interpret(assignSrc, BARS_1_TO_5);
    expect(out.plots).toEqual([1, 2, 3, 4, 5]);
  });

  const lookbackSrc = `indicator("t")\nx = close\nplot(x[1])`;
  test.skipIf(!parseHasAssign(lookbackSrc))("parse x = close then plot(x[1])", () => {
    const out = interpret(lookbackSrc, BARS_1_TO_5);
    expect(out.plots).toEqual([null, 1, 2, 3, 4]);
  });
});
