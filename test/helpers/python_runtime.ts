/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Optional Python Runtime.run probe. CI / clones without PYNE skip cleanly.
 *
 * The probe always imports the **local** PYNE checkout
 * (`$PYNESCRIPT_ROOT/src`), never a `pynescript` release installed in the
 * venv. Bun snapshots the environment for child processes, so instead of
 * mutating `process.env` we return a tiny wrapper script that exports
 * `PYTHONPATH` before exec'ing the interpreter.
 */
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";

export const PYNE_ROOT = process.env.PYNESCRIPT_ROOT ?? "/home/jango/Git/pynescript";

function resolveInterpreter(): string {
  const venv = `${PYNE_ROOT}/.venv/bin/python`;
  if (existsSync(venv)) return venv;
  return "python3";
}

let cachedPython: string | null = null;

/** Interpreter wrapper that resolves `pynescript` to the local source tree. */
export function pythonBin(): string {
  if (cachedPython != null) return cachedPython;
  const interpreter = resolveInterpreter();
  const dir = "/tmp/opencode";
  try {
    mkdirSync(dir, { recursive: true });
    const script = `${dir}/pynets-pyne-python-${process.pid}.sh`;
    writeFileSync(
      script,
      `#!/bin/sh\nexport PYTHONPATH="${PYNE_ROOT}/src\${PYTHONPATH:+:$PYTHONPATH}"\nexec "${interpreter}" "$@"\n`,
      { mode: 0o755 },
    );
    chmodSync(script, 0o755);
    cachedPython = script;
  } catch {
    cachedPython = interpreter;
  }
  return cachedPython;
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
