/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Optional Python Runtime.run probe. CI / clones without PYNE skip cleanly.
 */
import { existsSync } from "node:fs";

export const PYNE_ROOT = process.env.PYNESCRIPT_ROOT ?? "/home/jango/Git/pynescript";

export function pythonBin(): string {
  const venv = `${PYNE_ROOT}/.venv/bin/python`;
  if (existsSync(venv)) return venv;
  return "python3";
}

/** True when `from pynescript.runtime import Runtime` works. */
export function pythonAvailable(): boolean {
  try {
    const proc = Bun.spawnSync([pythonBin(), "-c", "from pynescript.runtime import Runtime"], {
      cwd: PYNE_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    });
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}
