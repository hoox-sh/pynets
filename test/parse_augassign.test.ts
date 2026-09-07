/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";
import type { AugAssign, Script } from "../src/ast/nodes.ts";

describe("parse AugAssign", () => {
  test("x += 1 is AugAssign and round-trips", () => {
    const tree = parse("x += 1") as Script;
    expect(tree).toMatchObject({
      kind: "Script",
      body: [{ kind: "AugAssign", op: { kind: "Add" } }],
    });
    const stmt = tree.body[0] as AugAssign;
    expect(stmt.target).toMatchObject({ kind: "Name", id: "x" });
    expect(stmt.value).toMatchObject({ kind: "Constant", value: 1 });
    expect(unparse(tree)).toBe("x += 1");
    expect(dump(parse(unparse(tree)))).toBe(dump(tree));
  });

  test("compound augassign ops parse", () => {
    const ops: Array<[string, string]> = [
      ["x -= 1", "Sub"],
      ["x *= 2", "Mult"],
      ["x /= 2", "Div"],
      ["x %= 2", "Mod"],
    ];
    for (const [src, kind] of ops) {
      const tree = parse(src) as Script;
      expect(tree.body[0]).toMatchObject({ kind: "AugAssign", op: { kind } });
      expect(unparse(tree)).toBe(src);
      expect(dump(parse(unparse(tree)))).toBe(dump(tree));
    }
  });
});
