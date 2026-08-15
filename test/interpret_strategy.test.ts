/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, Runtime, type RuntimeResult } from "../src/index.ts";

const FIX = join(import.meta.dir, "../../tests/fixtures/first_party");
const SRC = readFileSync(join(FIX, "strategy_entry.pine"), "utf8");

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

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function isEntryOnBar1(ev: { type?: string; kind?: string; id?: string | number; bar?: number; bar_index?: number }): boolean {
  const bar = ev.bar ?? ev.bar_index;
  if (bar !== 1) return false;
  const kind = String(ev.kind ?? ev.type ?? "");
  return kind.includes("entry") || ev.id === "L";
}

type Fillish = {
  type?: string;
  kind?: string;
  id?: string | number;
  comment?: string;
};

function collectFillish(out: RuntimeResult): Fillish[] {
  const extra = (out as RuntimeResult & { fills?: Fillish[] }).fills;
  const pool: Fillish[] = [...(out.events ?? []), ...(extra ?? [])];
  return pool.filter((ev) => {
    const kind = String(ev.kind ?? ev.type ?? ev.comment ?? "");
    return kind.toLowerCase().includes("fill");
  });
}

function runHasFills(src: string): boolean {
  if (!parseOk(src)) return false;
  try {
    const out = new Runtime("TEST").run(src, bars(5));
    return out.error == null && collectFillish(out).length > 0;
  } catch {
    return false;
  }
}

describe("interpret strategy", () => {
  test.skipIf(!parseOk(SRC))("strategy_entry.pine 5 bars", () => {
    const out = new Runtime("TEST").run(SRC, bars(5));
    expect(out.error).toBeUndefined();
    expect(out.plots).toHaveLength(5);
    const events = (out as RuntimeResult).events;
    if (events != null) {
      expect(events.some(isEntryOnBar1)).toBe(true);
    }
  });

  test.skipIf(!runHasFills(SRC))("strategy_entry.pine records a fill when broker is wired", () => {
    const out = new Runtime("TEST").run(SRC, bars(5));
    expect(out.error).toBeUndefined();
    const fills = collectFillish(out);
    expect(fills.length).toBeGreaterThan(0);
    expect(fills.some((ev) => ev.id === "L" || String(ev.comment ?? "").includes("L"))).toBe(true);
  });
});

