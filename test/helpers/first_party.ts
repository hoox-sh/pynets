/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * First-party Pine fixtures live in PYNE (`tests/fixtures/first_party`).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function firstPartyDir(): string | null {
  const envRoot = process.env.PYNESCRIPT_ROOT;
  const candidates = [
    envRoot ? join(envRoot, "tests/fixtures/first_party") : "",
    join(import.meta.dir, "../../../pynescript/tests/fixtures/first_party"),
    join(import.meta.dir, "../../../pyne/tests/fixtures/first_party"),
    join(import.meta.dir, "../../../tests/fixtures/first_party"),
  ].filter(Boolean);
  for (const dir of candidates) {
    if (existsSync(join(dir, "plot_close.pine"))) return dir;
  }
  return null;
}

export function readFirstParty(name: string): string | null {
  const dir = firstPartyDir();
  if (dir == null) return null;
  const path = join(dir, name);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function firstPartyBars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    open: 100 + i * 0.2,
    high: 101 + i * 0.2,
    low: 99 + i * 0.2,
    close: 100.5 + i * 0.2,
    volume: 1000,
    time: 1_700_000_000_000 + i * 60_000,
  }));
}
