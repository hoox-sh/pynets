/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";
import type { Arg, Call, Constant, Expr, Script } from "../src/ast/nodes.ts";

function scriptCalls(source: string): Call[] {
  const tree = parse(source) as Script;
  expect(tree.kind).toBe("Script");
  return tree.body
    .filter((st): st is Expr => st.kind === "Expr" && st.value.kind === "Call")
    .map((st) => st.value as Call);
}

function namedArg(call: Call, name: string): Arg | undefined {
  return call.args.find((a) => a.name === name);
}

describe("parse call keyword args", () => {
  test('plot(close, title="sum") yields Arg name title and Constant sum', () => {
    const [plot] = scriptCalls('plot(close, title="sum")');
    expect(plot).toBeDefined();
    expect(plot!.func.kind).toBe("Name");
    const title = namedArg(plot!, "title");
    expect(title).toBeDefined();
    expect(title!.name).toBe("title");
    expect(title!.value.kind).toBe("Constant");
    expect((title!.value as Constant).value).toBe("sum");
    const dumped = dump(plot!);
    expect(dumped).toContain('name="title"');
    expect(dumped).toContain('value="sum"');
    expect(unparse(plot!)).toBe('plot(close, title="sum")');
  });

  test('plot(matrix.sum(m), title="sum") keeps the title keyword', () => {
    const [plot] = scriptCalls('plot(matrix.sum(m), title="sum")');
    expect(plot).toBeDefined();
    const title = namedArg(plot!, "title");
    expect(title?.name).toBe("title");
    expect(title?.value.kind).toBe("Constant");
    expect((title!.value as Constant).value).toBe("sum");
    const inner = plot!.args[0];
    expect(inner?.name).toBeNull();
    expect(inner?.value.kind).toBe("Call");
  });

  test("positional args have name null", () => {
    const [plot] = scriptCalls("plot(close)");
    expect(plot!.args).toHaveLength(1);
    expect(plot!.args[0]!.name).toBeNull();
    expect(plot!.args[0]!.value.kind).toBe("Name");
  });
});
