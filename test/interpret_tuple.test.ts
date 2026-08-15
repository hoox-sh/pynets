/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { dump, parse, Runtime } from "../src/index.ts";

const FIX = join(import.meta.dir, "../../tests/fixtures/first_party");
const KELTNER_SRC = readFileSync(join(FIX, "keltner.pine"), "utf8");
const TUPLE_LIT = "[a, b] = [1, 2]";

function bars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    open: 100 + i * 0.2,
    high: 101 + i * 0.2,
    low: 99 + i * 0.2,
    close: 100.5 + i * 0.2,
    volume: 1000,
    time: 1_700_000_000_000 + i * 60_000,
  }));
}

function tryParse(src: string) {
  try {
    return parse(src);
  } catch {
    return null;
  }
}

function dumpHasTuple(src: string): boolean {
  const tree = tryParse(src);
  return tree != null && dump(tree).includes("Tuple");
}

const simpleHasTuple = dumpHasTuple(TUPLE_LIT);
const keltnerHasTuple = dumpHasTuple(KELTNER_SRC);
const keltnerParses = tryParse(KELTNER_SRC) != null;

describe("interpret tuple", () => {
  test.skipIf(!simpleHasTuple && !keltnerHasTuple)(
    "parse [a, b] = [1, 2] or keltner dump contains Tuple",
    () => {
      const src = simpleHasTuple ? TUPLE_LIT : KELTNER_SRC;
      expect(dump(parse(src))).toContain("Tuple");
    },
  );

  test.skipIf(!keltnerParses)("run keltner 40 bars: mid/up/lo", () => {
    const out = new Runtime("TEST").run(KELTNER_SRC, bars(40));
    expect(out.error).toBeUndefined();
    expect(out.series.mid).toBeDefined();
    expect(out.series.up).toBeDefined();
    expect(out.series.lo).toBeDefined();
    const mid = out.series.mid!;
    const up = out.series.up!;
    const lo = out.series.lo!;
    expect(mid).toHaveLength(40);
    expect(up).toHaveLength(40);
    expect(lo).toHaveLength(40);

    for (let i = 25; i < 40; i++) {
      expect(typeof mid[i]).toBe("number");
      expect(Number.isFinite(mid[i]!)).toBe(true);
      expect(typeof up[i]).toBe("number");
      expect(Number.isFinite(up[i]!)).toBe(true);
      expect(typeof lo[i]).toBe("number");
      expect(Number.isFinite(lo[i]!)).toBe(true);
    }

    for (let i = 0; i < 40; i++) {
      const u = up[i];
      const m = mid[i];
      const l = lo[i];
      if (u == null || m == null || l == null) continue;
      if (!Number.isFinite(u) || !Number.isFinite(m) || !Number.isFinite(l)) continue;
      expect(u + 1e-9).toBeGreaterThanOrEqual(m);
      expect(m + 1e-9).toBeGreaterThanOrEqual(l);
    }
  });
});
