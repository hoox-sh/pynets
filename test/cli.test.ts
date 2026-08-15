/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

function cli(...args: string[]): { code: number; stdout: string; stderr: string } {
  const proc = Bun.spawnSync(["bun", "src/cli.ts", "--plain", ...args], {
    cwd: PYNETS,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    code: proc.exitCode ?? 1,
    stdout: new TextDecoder().decode(proc.stdout),
    stderr: new TextDecoder().decode(proc.stderr),
  };
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
    const proc = Bun.spawnSync(["bun", "src/cli.ts", "check", file, "--rich"], {
      cwd: PYNETS,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, FORCE_COLOR: "1", NO_COLOR: "" },
    });
    const stdout = new TextDecoder().decode(proc.stdout);
    expect(proc.exitCode).toBe(0);
    expect(stdout).toContain("check");
    expect(stdout).not.toBe("ok\n");
  });
});
