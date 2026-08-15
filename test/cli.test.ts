/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clampBars, MAX_BARS, parseArgs, resolveUserFile, UsageError } from "../src/cli.ts";

const PYNETS = join(import.meta.dir, "..");

const GOOD = `//@version=5
indicator("cli")
plot(close)
`;

function writePine(source: string): string {
  const dir = mkdtempSync(join(tmpdir(), "pynets-cli-"));
  const file = join(dir, "script.pine");
  writeFileSync(file, source, "utf8");
  return file;
}

function runCli(
  args: string[],
  env?: Record<string, string | undefined>,
): { code: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync(["bun", "src/cli.ts", ...args], {
    cwd: PYNETS,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, ...env },
  });
  return {
    code: proc.exitCode ?? 1,
    stdout: new TextDecoder().decode(proc.stdout),
    stderr: new TextDecoder().decode(proc.stderr),
  };
}

function cli(...args: string[]): { code: number; stdout: string; stderr: string } {
  return runCli(["--plain", ...args]);
}

function hasStack(text: string): boolean {
  return /\n\s+at\s+\S+/.test(text);
}

describe("pynets CLI", () => {
  test("check good script", () => {
    const file = writePine(GOOD);
    const r = cli("check", file);
    expect(r.code).toBe(0);
    expect(r.stdout.trim()).toBe("ok");
    expect(r.stderr).toBe("");
  });

  test("check plot( fails exit 1", () => {
    const file = writePine("plot(");
    const r = cli("check", file);
    expect(r.code).toBe(1);
    expect(r.stderr.length).toBeGreaterThan(0);
    expect(hasStack(r.stderr)).toBe(false);
  });

  test("format emits indicator/plot", () => {
    const file = writePine(GOOD);
    const r = cli("format", file);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("indicator");
    expect(r.stdout).toContain("plot");
  });

  test("run --bars 5 has plots length 5", () => {
    const file = writePine(GOOD);
    const r = cli("run", file, "--bars", "5");
    expect(r.code).toBe(0);
    const payload = JSON.parse(r.stdout) as { plots: unknown[] };
    expect(payload.plots).toHaveLength(5);
  });

  test("help lists commands", () => {
    const r = cli("--help");
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("check");
    expect(r.stdout).toContain("format");
    expect(r.stdout).toContain("run");
    expect(r.stdout).toContain("pynets");
  });

  test("info is JSON on a pipe", () => {
    const r = cli("info");
    expect(r.code).toBe(0);
    const payload = JSON.parse(r.stdout) as { name: string; version: string };
    expect(payload.name).toBe("pynets");
    expect(payload.version).toBe("0.1.0");
  });

  test("dump contains Script / Call", () => {
    const file = writePine(GOOD);
    const r = cli("dump", file);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("Script");
    expect(r.stdout).toContain("Call");
  });

  test("forced rich check is not the bare ok line", () => {
    const file = writePine(GOOD);
    const r = runCli(["check", file, "--rich"], { FORCE_COLOR: "1", NO_COLOR: "" });
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("check");
    expect(r.stdout).not.toBe("ok\n");
  });
});

describe("pynets CLI hardening", () => {
  test("--plain wins over leftover FORCE_COLOR", () => {
    const r = runCli(["info", "--plain"], { FORCE_COLOR: "1", NO_COLOR: "" });
    expect(r.code).toBe(0);
    expect(r.stdout).not.toContain("\x1b");
    const payload = JSON.parse(r.stdout) as { name: string; rich: boolean };
    expect(payload.name).toBe("pynets");
    expect(payload.rich).toBe(false);
  });

  test("--rich after the command is not eaten", () => {
    const file = writePine(GOOD);
    const r = runCli(["dump", file, "--rich"], { FORCE_COLOR: "", NO_COLOR: "" });
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("dump");
    expect(r.stdout).not.toMatch(/^Script\(/);
  });

  test("missing file is exit 2, stderr, no stack", () => {
    const r = cli("check", join(PYNETS, "no-such-pynets-cli-file.pine"));
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("file not found");
    expect(hasStack(r.stderr)).toBe(false);
    expect(r.stdout).toBe("");
  });

  test("missing file argument is usage exit 2", () => {
    const r = cli("check");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("missing file");
  });

  test("unknown command is usage exit 2", () => {
    const r = cli("nope");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("unknown command");
  });

  test("unknown flag is usage exit 2", () => {
    const file = writePine(GOOD);
    const r = cli("check", file, "--nope");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("unknown argument");
  });

  test("--bars NaN is usage exit 2", () => {
    const file = writePine(GOOD);
    const r = cli("run", file, "--bars", "NaN");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("--bars");
  });

  test("--bars 1.5 is usage exit 2", () => {
    const file = writePine(GOOD);
    const r = cli("run", file, "--bars", "1.5");
    expect(r.code).toBe(2);
  });

  test("broker flags reject non-finite values", () => {
    const file = writePine(GOOD);
    const r = cli("run", file, "--commission", "Infinity");
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("--commission");
  });

  test("JSON --plain output is valid JSON without ANSI", () => {
    const file = writePine(GOOD);
    const r = runCli(["run", file, "--bars", "3", "--json", "--plain"], {
      FORCE_COLOR: "1",
      NO_COLOR: "",
    });
    expect(r.code).toBe(0);
    expect(r.stdout).not.toContain("\x1b");
    const payload = JSON.parse(r.stdout) as { plots: unknown[]; count: number };
    expect(payload.plots).toHaveLength(3);
    expect(payload.count).toBe(3);
  });

  test("info does not leak env secrets", () => {
    const r = runCli(["info", "--plain"], {
      AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG",
      HOOX_TOKEN: "secret-token",
      API_KEY: "abc123",
    });
    expect(r.code).toBe(0);
    const payload = JSON.parse(r.stdout) as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ["bun", "docs", "mode", "name", "package", "rich", "runtime", "version"].sort(),
    );
    const blob = JSON.stringify(payload);
    expect(blob).not.toContain("wJalrXUtnFEMI");
    expect(blob).not.toContain("secret-token");
    expect(blob).not.toMatch(/AWS|SECRET|TOKEN|API_KEY/i);
  });

  test("run syntax error is exit 1 JSON with error", () => {
    const file = writePine("plot(");
    const r = cli("run", file, "--bars", "2");
    expect(r.code).toBe(1);
    const payload = JSON.parse(r.stdout) as { error?: string };
    expect(payload.error).toBeDefined();
  });
});

describe("cli parse helpers", () => {
  test("clampBars rejects NaN and caps at MAX_BARS", () => {
    expect(clampBars(20)).toBe(20);
    expect(clampBars(MAX_BARS + 1)).toBe(MAX_BARS);
    expect(clampBars(1_000_000)).toBe(MAX_BARS);
    expect(() => clampBars(Number.NaN)).toThrow(UsageError);
    expect(() => clampBars(Number.POSITIVE_INFINITY)).toThrow(UsageError);
  });

  test("parseArgs clamps --bars and parses broker numbers", () => {
    const got = parseArgs(["bun", "cli.ts", "run", "x.pine", "--bars", "200000", "--commission", "0.001"]);
    expect(got.bars).toBe(MAX_BARS);
    expect(got.commission).toBe(0.001);
    expect(got.mode).toBe("interpret");
    expect(() => parseArgs(["bun", "cli.ts", "run", "x.pine", "--bars", "NaN"])).toThrow(UsageError);
    expect(() => parseArgs(["bun", "cli.ts", "run", "x.pine", "--slippage", "Infinity"])).toThrow(
      UsageError,
    );
  });

  test("parseArgs --mode interpret|compile|auto", () => {
    expect(parseArgs(["bun", "cli.ts", "run", "x.pine"]).mode).toBe("interpret");
    expect(parseArgs(["bun", "cli.ts", "run", "x.pine", "--mode", "compile"]).mode).toBe("compile");
    expect(parseArgs(["bun", "cli.ts", "run", "x.pine", "--mode=auto"]).mode).toBe("auto");
  });

  test("parseArgs rejects invalid --mode and unknown flags", () => {
    expect(() => parseArgs(["bun", "cli.ts", "run", "x.pine", "--mode", "numba"])).toThrow(UsageError);
    expect(() => parseArgs(["bun", "cli.ts", "run", "x.pine", "--mode=jit"])).toThrow(UsageError);
    expect(() => parseArgs(["bun", "cli.ts", "run", "x.pine", "--mode"])).toThrow(UsageError);
    expect(() => parseArgs(["bun", "cli.ts", "run", "x.pine", "--mode", "compile", "--nope"])).toThrow(
      UsageError,
    );
  });

  test("resolveUserFile keeps absolute paths and joins relative to cwd", () => {
    expect(resolveUserFile("/tmp/script.pine")).toBe("/tmp/script.pine");
    expect(resolveUserFile("script.pine")).toBe(join(process.cwd(), "script.pine"));
    expect(() => resolveUserFile("")).toThrow(UsageError);
  });
});
