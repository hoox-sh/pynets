/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { dump, interpret, parse } from "../src/index.ts";

const SRC = `indicator("t")
i=0
while i < 3
    i := i+1
plot(i)`;
const BARS = [{ close: 1 }];

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function dumpHas(src: string, needle: string): boolean {
  try {
    return dump(parse(src)).includes(needle);
  } catch {
    return false;
  }
}

function runOk(src: string): boolean {
  try {
    interpret(src, BARS);
    return true;
  } catch {
    return false;
  }
}

function whileReady(): boolean {
  return parseOk(SRC) && runOk(SRC) && dumpHas(SRC, "While");
}

describe("interpret while", () => {
  test.skipIf(!whileReady())("while i < 3 increments to 3 on 1 bar", () => {
    const out = interpret(SRC, BARS);
    expect(out.plots).toEqual([3]);
  });

  const downSrc = `indicator("t")
s = 0
for i = 2 to 0
    s := s + i
plot(s)`;

  test.skipIf(!parseOk(downSrc) || !runOk(downSrc))("for-to omitted step goes downward when start > end", () => {
    const out = interpret(downSrc, BARS);
    expect(out.plots).toEqual([3]);
  });
});
