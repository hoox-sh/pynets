/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  highlightPine,
  Rich,
  skipAnsi,
  sparkline,
  stripFlags,
  termColumns,
  useRich,
} from "../src/cli/rich.ts";

function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "");
}

describe("useRich / stripFlags", () => {
  test("--plain wins over FORCE_COLOR leftover", () => {
    const prevForce = process.env.FORCE_COLOR;
    const prevNo = process.env.NO_COLOR;
    process.env.FORCE_COLOR = "1";
    delete process.env.NO_COLOR;
    try {
      expect(useRich(["bun", "cli.ts", "check", "a.pine", "--plain"])).toBe(false);
      expect(useRich(["bun", "cli.ts", "--plain", "info"])).toBe(false);
    } finally {
      if (prevForce == null) delete process.env.FORCE_COLOR;
      else process.env.FORCE_COLOR = prevForce;
      if (prevNo == null) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prevNo;
    }
  });

  test("--rich after the command forces color", () => {
    const prevForce = process.env.FORCE_COLOR;
    const prevNo = process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    process.env.NO_COLOR = "1";
    try {
      expect(useRich(["bun", "cli.ts", "dump", "a.pine", "--rich"])).toBe(true);
    } finally {
      if (prevForce == null) delete process.env.FORCE_COLOR;
      else process.env.FORCE_COLOR = prevForce;
      if (prevNo == null) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prevNo;
    }
  });

  test("stripFlags keeps the command and file, drops color flags only", () => {
    expect(stripFlags(["bun", "cli.ts", "dump", "a.pine", "--rich", "--full"])).toEqual([
      "bun",
      "cli.ts",
      "dump",
      "a.pine",
      "--full",
    ]);
  });

  test("FORCE_COLOR=0 does not force rich", () => {
    const prevForce = process.env.FORCE_COLOR;
    const prevNo = process.env.NO_COLOR;
    process.env.FORCE_COLOR = "0";
    delete process.env.NO_COLOR;
    try {
      expect(useRich(["bun", "cli.ts", "info"])).toBe(Boolean(process.stdout.isTTY));
    } finally {
      if (prevForce == null) delete process.env.FORCE_COLOR;
      else process.env.FORCE_COLOR = prevForce;
      if (prevNo == null) delete process.env.NO_COLOR;
      else process.env.NO_COLOR = prevNo;
    }
  });
});

describe("highlightPine tokenizer", () => {
  test("does not recode digits inside ANSI", () => {
    const ui = new Rich(true);
    const src = "\x1b[31mplot\x1b[0m(close)";
    const out = highlightPine(src, ui);
    expect(out.includes("\x1b[31m")).toBe(true);
    expect(out).not.toMatch(/\x1b\[38;2;[0-9;]+m31/);
    expect(stripAnsi(out)).toBe("plot(close)");
  });

  test("does not eat extra dots as one number", () => {
    const ui = new Rich(true);
    const out = highlightPine("1.2.3", ui);
    expect(stripAnsi(out)).toBe("1.2.3");
    expect(skipAnsi("\x1b[31m", 0)).toBe(5);
    expect(stripAnsi(highlightPine("ta.sma.1", ui))).toBe("ta.sma.1");
  });

  test("scientific numbers stay one token; keywords still paint", () => {
    const ui = new Rich(true);
    const out = highlightPine("plot(1e-5)", ui);
    expect(stripAnsi(out)).toBe("plot(1e-5)");
    expect(out).toContain("plot");
  });

  test("plain rich is a no-op", () => {
    const ui = new Rich(false);
    expect(highlightPine("plot(close)", ui)).toBe("plot(close)");
  });
});

describe("sparkline / width / empty plots", () => {
  test("width 0 is empty", () => {
    expect(sparkline([1, 2, 3], 0)).toBe("");
    expect(sparkline([], 0)).toBe("");
    expect(sparkline([null, null], 0)).toBe("");
  });

  test("empty / all-na plots are placeholders", () => {
    expect(sparkline([])).toMatch(/^·+$/);
    expect(sparkline([null, Number.NaN, Number.POSITIVE_INFINITY])).toMatch(/^·+$/);
  });

  test("finite series uses block chars", () => {
    const s = sparkline([1, 2, 3, 4], 4);
    expect(s.length).toBe(4);
    expect(s).not.toContain("·");
  });

  test("termColumns treats 0 / missing as 80", () => {
    expect(termColumns({ columns: 0 })).toBe(80);
    expect(termColumns({})).toBe(80);
    expect(termColumns({ columns: 40 })).toBe(40);
  });
});
