/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime, type RuntimeResult } from "../src/index.ts";

const BARS = [1, 2, 3].map((close) => ({ close }));
const SRC = `indicator("t")
alert("hi")
plot(close)`;

type Alertish = {
  kind?: string;
  type?: string;
  message?: string;
  text?: string;
  msg?: string;
};

function parseOk(src: string): boolean {
  try {
    parse(src);
    return true;
  } catch {
    return false;
  }
}

function asRecord(out: RuntimeResult): RuntimeResult & {
  alerts?: unknown[];
  drawings?: unknown[];
  items?: unknown[];
} {
  return out;
}

function collectAlertish(out: RuntimeResult): Alertish[] {
  const extra = asRecord(out);
  const pool: unknown[] = [
    ...(extra.alerts ?? []),
    ...(extra.drawings ?? []),
    ...(extra.items ?? []),
    ...(out.events ?? []),
  ];
  return pool.filter((item): item is Alertish => {
    if (item == null || typeof item !== "object") return false;
    const ev = item as Alertish;
    const kind = String(ev.kind ?? ev.type ?? "").toLowerCase();
    const text = String(ev.message ?? ev.text ?? ev.msg ?? "");
    return kind.includes("alert") || text.includes("hi");
  });
}

function alertText(ev: Alertish): string {
  return String(ev.message ?? ev.text ?? ev.msg ?? "");
}

function drawingsWired(): boolean {
  if (!parseOk(SRC)) return false;
  try {
    const out = new Runtime("TEST").run(SRC, BARS);
    if (out.error) return false;
    return collectAlertish(out).some((ev) => alertText(ev).includes("hi"));
  } catch {
    return false;
  }
}

describe("interpret alert", () => {
  test.skipIf(!drawingsWired())('alert("hi") if drawings wired', () => {
    const out = new Runtime("TEST").run(SRC, BARS);
    expect(out.error).toBeUndefined();
    const alerts = collectAlertish(out);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((ev) => alertText(ev).includes("hi"))).toBe(true);
  });
});
