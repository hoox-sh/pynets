/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Precedence-based parenthesization round-trip tests for the unparser,
 * ported from PYNE's pynescript.ast.unparser precedence ladder. Each
 * precedence-mixed tree must satisfy dump(parse(unparse(t))) === dump(t),
 * and trees that already unparse correctly must not gain parens.
 */
import { describe, expect, test } from "bun:test";
import { dump, parse, unparse } from "../src/index.ts";

function evalTree(src: string) {
  return parse(src, "<unknown>", "eval");
}

function roundTrips(src: string): boolean {
  const tree = evalTree(src);
  const out = unparse(tree);
  const reparsed = parse(out, "<unknown>", "eval");
  return dump(reparsed) === dump(tree);
}

describe("unparse precedence round-trips", () => {
  // term over arith — the motivating bug: `1 * (2 + 3)` used to flatten.
  test("1 * (2 + 3) keeps parens", () => {
    const tree = evalTree("1 * (2 + 3)");
    expect(unparse(tree)).toBe("1 * (2 + 3)");
    expect(roundTrips("1 * (2 + 3)")).toBe(true);
  });

  test("1 * 2 + 3 gains no parens", () => {
    expect(unparse(evalTree("1 * 2 + 3"))).toBe("1 * 2 + 3");
    expect(roundTrips("1 * 2 + 3")).toBe(true);
  });

  test("(x & 1) << 2 keeps parens", () => {
    const tree = evalTree("(x & 1) << 2");
    expect(unparse(tree)).toBe("(x & 1) << 2");
    expect(roundTrips("(x & 1) << 2")).toBe(true);
  });

  test("x & 1 << 2 reparses shifted", () => {
    // & binds looser than << in the grammar: x & (1 << 2) needs no parens.
    expect(unparse(evalTree("x & 1 << 2"))).toBe("x & 1 << 2");
    expect(roundTrips("x & 1 << 2")).toBe(true);
  });

  test("a << b == c stays bare (shift binds tighter than ==)", () => {
    const tree = evalTree("a << b == c");
    expect(unparse(tree)).toBe("a << b == c");
    expect(roundTrips("a << b == c")).toBe(true);
  });

  test("a == b & c round-trips the grammar's BitAnd-of-Compare tree", () => {
    const tree = evalTree("a == b & c");
    expect(unparse(tree)).toBe("a == b & c");
    expect(roundTrips("a == b & c")).toBe(true);
  });

  test("a == (b & c) keeps parens on the Compare comparator", () => {
    const tree = evalTree("a == (b & c)");
    expect(unparse(tree)).toBe("a == (b & c)");
    expect(roundTrips("a == (b & c)")).toBe(true);
  });

  test("left-assoc chain: (a - b) - c prints bare and round-trips", () => {
    const tree = evalTree("(a - b) - c");
    expect(unparse(tree)).toBe("a - b - c");
    expect(roundTrips("(a - b) - c")).toBe(true);
    expect(roundTrips("a - b - c")).toBe(true);
  });

  test("a - (b - c) keeps right parens", () => {
    const tree = evalTree("a - (b - c)");
    expect(unparse(tree)).toBe("a - (b - c)");
    expect(roundTrips("a - (b - c)")).toBe(true);
  });

  test("bitwise ladder a | b ^ c & d needs no parens", () => {
    expect(unparse(evalTree("a | b ^ c & d"))).toBe("a | b ^ c & d");
    expect(roundTrips("a | b ^ c & d")).toBe(true);
  });

  test("a + b * c and (a + b) * c", () => {
    expect(unparse(evalTree("a + b * c"))).toBe("a + b * c");
    expect(unparse(evalTree("(a + b) * c"))).toBe("(a + b) * c");
    expect(roundTrips("a + b * c")).toBe(true);
    expect(roundTrips("(a + b) * c")).toBe(true);
  });

  test("a >> b + c stays bare (shift right child at EXPR level)", () => {
    expect(unparse(evalTree("a >> b + c"))).toBe("a >> b + c");
    expect(roundTrips("a >> b + c")).toBe(true);
  });
});

describe("unparse unary precedence", () => {
  test("-(a + b) keeps parens", () => {
    expect(unparse(evalTree("-(a + b)"))).toBe("-(a + b)");
    expect(roundTrips("-(a + b)")).toBe(true);
  });

  test("-(a * b) keeps parens (FACTOR > TERM per Python)", () => {
    expect(unparse(evalTree("-(a * b)"))).toBe("-(a * b)");
    expect(roundTrips("-(a * b)")).toBe(true);
  });

  test("-a * b and a * -b need no parens", () => {
    expect(unparse(evalTree("-a * b"))).toBe("-a * b");
    expect(unparse(evalTree("a * -b"))).toBe("a * -b");
    expect(roundTrips("-a * b")).toBe(true);
    expect(roundTrips("a * -b")).toBe(true);
  });

  test("~(a | b) keeps parens", () => {
    expect(unparse(evalTree("~(a | b)"))).toBe("~(a | b)");
    expect(roundTrips("~(a | b)")).toBe(true);
  });

  test("not not a needs no parens", () => {
    expect(unparse(evalTree("not not a"))).toBe("not not a");
    expect(roundTrips("not not a")).toBe(true);
  });
});

describe("unparse boolean precedence", () => {
  test("not (a and b) keeps parens", () => {
    expect(unparse(evalTree("not (a and b)"))).toBe("not (a and b)");
    expect(roundTrips("not (a and b)")).toBe(true);
  });

  test("not a and b needs no parens", () => {
    expect(unparse(evalTree("not a and b"))).toBe("not a and b");
    expect(roundTrips("not a and b")).toBe(true);
  });

  test("a and b and c chain stays flat", () => {
    expect(unparse(evalTree("a and b and c"))).toBe("a and b and c");
    expect(roundTrips("a and b and c")).toBe(true);
  });

  test("a or (b and c) wraps the nested BoolOp (Python increasing levels)", () => {
    expect(unparse(evalTree("a or b and c"))).toBe("a or (b and c)");
    expect(roundTrips("a or b and c")).toBe(true);
  });

  test("(a and b) or c reparses to the flattened chain", () => {
    // The parser flattens same-op chains, so the tree matches `a and b or c`.
    expect(unparse(evalTree("(a and b) or c"))).toBe("a and b or c");
    expect(roundTrips("(a and b) or c")).toBe(true);
  });
});

describe("unparse conditional precedence", () => {
  test("a ? b : c ? d : e stays right-associative", () => {
    expect(unparse(evalTree("a ? b : c ? d : e"))).toBe("a ? b : c ? d : e");
    expect(roundTrips("a ? b : c ? d : e")).toBe(true);
  });

  test("(a ? b : c) ? d : e keeps parens on the test", () => {
    expect(unparse(evalTree("(a ? b : c) ? d : e"))).toBe("(a ? b : c) ? d : e");
    expect(roundTrips("(a ? b : c) ? d : e")).toBe(true);
  });

  test("a ? b + c : d drops redundant parens but round-trips", () => {
    expect(unparse(evalTree("a ? (b + c) : d"))).toBe("a ? b + c : d");
    expect(roundTrips("a ? b + c : d")).toBe(true);
  });
});

describe("unparse precedence in script statements", () => {
  test("mixed-precedence script round-trips through dump", () => {
    const src = `//@version=5
indicator("t")
a = 1 * (2 + 3)
b = (x & 1) << 2
c = not (p and q) or r
d = -s * (t + u)
e = m < n == o >= p
plot(a + b * c)
`;
    const tree = parse(src);
    const out = unparse(tree);
    expect(dump(parse(out))).toBe(dump(tree));
  });
});
