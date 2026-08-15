#!/usr/bin/env bun
/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PyneTS CLI with a Rich-inspired TTY UI (PYNE volt).
 * Pipe / CI stays plain: `check` prints `ok`, `run` prints JSON.
 * Exit: 0 ok, 1 syntax/runtime, 2 usage.
 */
import { readFileSync } from "node:fs";
import { basename, isAbsolute, resolve } from "node:path";
import { dump, parse, unparse, Runtime } from "./index.ts";
import type { BrokerSettings, OHLCVBar, RuntimeFill, RuntimeResult } from "./index.ts";
import {
  Rich,
  VERSION,
  highlightPine,
  sparkline,
  stripFlags,
  useRich,
} from "./cli/rich.ts";

export const MAX_BARS = 100_000;

export class UsageError extends Error {
  readonly exitCode = 2;
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

function fail(ui: Rich, message: string, code = 1): never {
  if (ui.enabled) ui.status("fail", message, true);
  else console.error(message);
  process.exit(code);
}

function failUsage(ui: Rich, message: string): never {
  fail(ui, message, 2);
}

function ioCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && typeof (err as { code: unknown }).code === "string") {
    return (err as { code: string }).code;
  }
  return "";
}

/** Resolve only the path the user typed (cwd-relative or absolute). No search path. */
export function resolveUserFile(file: string): string {
  if (file == null || file === "" || file.includes("\0")) {
    throw new UsageError("error: missing file");
  }
  if (isAbsolute(file)) return file;
  return resolve(process.cwd(), file);
}

function readSource(ui: Rich, file: string): string {
  let path: string;
  try {
    path = resolveUserFile(file);
  } catch (err) {
    failUsage(ui, err instanceof Error ? err.message : String(err));
  }
  try {
    return readFileSync(path, "utf8");
  } catch (err) {
    const code = ioCode(err);
    if (code === "ENOENT") failUsage(ui, `error: file not found: ${file}`);
    if (code === "EISDIR") failUsage(ui, `error: not a file: ${file}`);
    if (code === "EACCES") failUsage(ui, `error: permission denied: ${file}`);
    failUsage(ui, `error: cannot read ${file}`);
  }
}

function syntheticBars(n: number): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  const count = clampBars(n);
  for (let i = 0; i < count; i++) {
    const close = 100 + i;
    bars.push({
      open: close,
      high: close + 0.5,
      low: close - 0.5,
      close,
      volume: 1,
      time: 1_700_000_000_000 + i * 60_000,
    });
  }
  return bars;
}

/** Optional strategy/drawing events attached by the interpret host. */
type RuntimeEvent = {
  bar?: number | null;
  bar_index?: number | null;
  type?: string | null;
  kind?: string | null;
  id?: string | number | null;
};

type DrawingLike = {
  kind?: string | null;
  type?: string | null;
  bar?: number | null;
  bar_index?: number | null;
  text?: string | null;
  message?: string | null;
};

type AlertLike = DrawingLike;

type RuntimeOut = RuntimeResult & {
  events?: RuntimeEvent[];
  drawings?: DrawingLike[];
  fills?: RuntimeFill[];
  alerts?: AlertLike[];
};

const DUMP_RICH_MIN_LINES = 80;

export function clampBars(n: number): number {
  if (!Number.isFinite(n) || Number.isNaN(n) || n < 0) {
    throw new UsageError("error: --bars requires a non-negative integer");
  }
  return Math.min(MAX_BARS, Math.trunc(n));
}

function requireUint(raw: string | undefined, flag: string): number {
  if (raw == null || raw === "" || !/^\d+$/.test(raw)) {
    throw new UsageError(`error: ${flag} requires a non-negative integer`);
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || Number.isNaN(n) || n < 0 || !Number.isSafeInteger(n)) {
    throw new UsageError(`error: ${flag} requires a non-negative integer`);
  }
  return n;
}

function requireNumber(raw: string | undefined, flag: string): number {
  if (raw == null || raw === "" || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)) {
    throw new UsageError(`error: ${flag} requires a finite number`);
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    throw new UsageError(`error: ${flag} requires a finite number`);
  }
  return n;
}

function takeValue(args: string[], i: number, flag: string): { raw: string | undefined; next: number } {
  const a = args[i]!;
  if (a === flag) return { raw: args[i + 1], next: i + 1 };
  return { raw: a.slice(flag.length + 1), next: i };
}

export function parseArgs(argv: string[]): {
  cmd: string;
  file: string | undefined;
  bars: number;
  json: boolean;
  indent: number;
  full: boolean;
  commission: number | undefined;
  slippage: number | undefined;
  pyramiding: number | undefined;
} {
  const args = argv.slice(2);
  const cmd = args[0] ?? "help";

  let file: string | undefined;
  let bars = 20;
  let json = false;
  let indent = 2;
  let full = false;
  let commission: number | undefined;
  let slippage: number | undefined;
  let pyramiding: number | undefined;
  for (let i = 1; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--help" || a === "-h") {
      return { cmd: "help", file: undefined, bars, json, indent, full, commission, slippage, pyramiding };
    }
    if (a === "--json") {
      json = true;
      continue;
    }
    if (a === "--full") {
      full = true;
      continue;
    }
    if (a === "--bars" || a.startsWith("--bars=")) {
      const got = takeValue(args, i, "--bars");
      bars = clampBars(requireUint(got.raw, "--bars"));
      i = got.next;
      continue;
    }
    if (a === "--indent" || a.startsWith("--indent=")) {
      const got = takeValue(args, i, "--indent");
      if (got.raw == null || !/^\d+$/.test(got.raw)) {
        throw new UsageError("error: --indent requires an integer");
      }
      indent = Number(got.raw);
      if (!Number.isFinite(indent) || !Number.isSafeInteger(indent)) {
        throw new UsageError("error: --indent requires an integer");
      }
      i = got.next;
      continue;
    }
    if (a === "--commission" || a.startsWith("--commission=")) {
      const got = takeValue(args, i, "--commission");
      commission = requireNumber(got.raw, "--commission");
      i = got.next;
      continue;
    }
    if (a === "--slippage" || a.startsWith("--slippage=")) {
      const got = takeValue(args, i, "--slippage");
      slippage = requireNumber(got.raw, "--slippage");
      i = got.next;
      continue;
    }
    if (a === "--pyramiding" || a.startsWith("--pyramiding=")) {
      const got = takeValue(args, i, "--pyramiding");
      pyramiding = requireUint(got.raw, "--pyramiding");
      i = got.next;
      continue;
    }
    if (a.startsWith("-") && a !== "-") throw new UsageError(`error: unknown argument: ${a}`);
    if (file != null) throw new UsageError(`error: unexpected argument: ${a}`);
    file = a;
  }
  return { cmd, file, bars, json, indent, full, commission, slippage, pyramiding };
}

function fmtNum(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "na";
  return Number.isInteger(v) ? String(v) : v.toPrecision(6).replace(/\.?0+$/, "");
}

function check(ui: Rich, source: string, label: string): void {
  const t0 = performance.now();
  try {
    parse(source);
  } catch (err) {
    fail(ui, err instanceof Error ? err.message : String(err), 1);
  }
  const ms = performance.now() - t0;
  if (ui.enabled) {
    ui.panel(`check  ${basename(label)}`, [
      `${ui.paint("ok", "✔")} parsed in ${ms.toFixed(1)}ms`,
    ]);
  } else {
    console.log("ok");
  }
}

function format(ui: Rich, source: string): void {
  let text: string;
  try {
    text = unparse(parse(source));
  } catch (err) {
    fail(ui, err instanceof Error ? err.message : String(err), 1);
  }
  if (!text.endsWith("\n")) text += "\n";
  if (ui.enabled) {
    ui.write(highlightPine(text.replace(/\n$/, ""), ui));
    ui.write("");
  } else {
    process.stdout.write(text);
  }
}

function prettyAstDump(text: string, indent: number): string {
  const step = Number.isFinite(indent) ? Math.max(0, Math.min(8, Math.trunc(indent))) : 2;
  if (step === 0) return text;
  let out = "";
  let depth = 0;
  let inStr = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inStr) {
      out += ch;
      if (ch === "\\" && i + 1 < text.length) out += text[++i];
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      out += ch;
      continue;
    }
    if (ch === "(") {
      if (text[i + 1] === ")") {
        out += "()";
        i++;
        continue;
      }
      depth++;
      out += `(\n${" ".repeat(depth * step)}`;
      continue;
    }
    if (ch === ")") {
      depth = Math.max(0, depth - 1);
      out += `\n${" ".repeat(depth * step)})`;
      continue;
    }
    if (ch === ",") {
      out += `,\n${" ".repeat(depth * step)}`;
      if (text[i + 1] === " ") i++;
      continue;
    }
    out += ch;
  }
  return out;
}

function dumpAst(ui: Rich, source: string, indent: number, full: boolean): void {
  let tree;
  try {
    tree = parse(source);
  } catch (err) {
    fail(ui, err instanceof Error ? err.message : String(err), 1);
  }
  const raw = dump(tree, { annotate_fields: true });
  if (!ui.enabled) {
    process.stdout.write(`${raw}\n`);
    return;
  }
  const text = indent > 0 ? prettyAstDump(raw, indent) : raw;
  const lines = text.split("\n");
  const shown = full ? lines : lines.slice(0, DUMP_RICH_MIN_LINES);
  ui.panel("dump", shown);
  if (!full && lines.length > DUMP_RICH_MIN_LINES) {
    ui.status("info", `(truncated — ${lines.length} lines; use --full)`);
  }
}

function writeJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function runJson(out: RuntimeOut): void {
  const payload: {
    plots: typeof out.plots;
    series: typeof out.series;
    count: number;
    script_name: string | null;
    events?: RuntimeEvent[];
    drawings?: DrawingLike[];
    fills?: RuntimeFill[];
    alerts?: AlertLike[];
    error?: string;
  } = {
    plots: out.plots,
    series: out.series,
    count: out.count,
    script_name: out.script_name,
  };
  if (out.events != null) payload.events = out.events;
  if (out.drawings != null) payload.drawings = out.drawings;
  if (out.fills != null) payload.fills = out.fills;
  if (out.alerts != null) payload.alerts = out.alerts;
  if (out.error != null) payload.error = out.error;
  writeJson(payload);
  if (out.error != null) process.exit(1);
}

function plotTitles(out: RuntimeOut): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];
  for (const meta of out.plot_meta ?? []) {
    const title = meta?.title;
    if (!title || seen.has(title)) continue;
    seen.add(title);
    titles.push(title);
  }
  for (const key of Object.keys(out.series ?? {})) {
    if (seen.has(key)) continue;
    seen.add(key);
    titles.push(key);
  }
  return titles;
}

function lastCell(cells: Array<number | null>): number | null {
  if (cells.length === 0) return null;
  const tail = cells[cells.length - 1];
  return tail == null || !Number.isFinite(tail) ? null : tail;
}

function eventBar(ev: RuntimeEvent): string {
  const bar = ev.bar ?? ev.bar_index;
  return bar == null || !Number.isFinite(bar) ? "—" : String(bar);
}

function eventType(ev: RuntimeEvent): string {
  const t = ev.type ?? ev.kind;
  return t == null || t === "" ? "—" : String(t);
}

function eventId(ev: RuntimeEvent): string {
  return ev.id == null || ev.id === "" ? "—" : String(ev.id);
}

function printEvents(ui: Rich, events: RuntimeEvent[] | undefined): void {
  if (events == null || events.length === 0) return;
  ui.write("");
  ui.table(
    ["bar", "type", "id"],
    events.map((ev) => [
      ui.paint("muted", eventBar(ev)),
      ui.paint("fg", eventType(ev)),
      ui.paint("accent", eventId(ev)),
    ]),
  );
}

function drawingKind(d: DrawingLike, fallback = "—"): string {
  const k = d.kind ?? d.type;
  return k == null || k === "" ? fallback : String(k);
}

function drawingBar(d: DrawingLike): string {
  const bar = d.bar ?? d.bar_index;
  return bar == null || !Number.isFinite(bar) ? "—" : String(bar);
}

function drawingText(d: DrawingLike): string {
  const t = d.text ?? d.message;
  return t == null || t === "" ? "—" : String(t);
}

function printDrawings(ui: Rich, drawings: DrawingLike[] | undefined): void {
  if (!Array.isArray(drawings) || drawings.length === 0) return;
  ui.write("");
  ui.table(
    ["kind", "bar", "text"],
    drawings.map((d) => [
      ui.paint("fg", drawingKind(d)),
      ui.paint("muted", drawingBar(d)),
      ui.paint("accent", drawingText(d)),
    ]),
  );
}

function printAlerts(ui: Rich, alerts: AlertLike[] | undefined): void {
  if (!Array.isArray(alerts) || alerts.length === 0) return;
  ui.write("");
  ui.table(
    ["kind", "bar", "text"],
    alerts.map((a) => [
      ui.paint("fg", drawingKind(a, "alert")),
      ui.paint("muted", drawingBar(a)),
      ui.paint("accent", drawingText(a)),
    ]),
  );
}

function runPretty(ui: Rich, label: string, bars: number, out: RuntimeOut, ms: number): void {
  if (out.error) fail(ui, out.error, 1);
  const titles = plotTitles(out);
  const lines = [
    `${ui.paint("muted", "script")}   ${ui.paint("fg", out.script_name ?? basename(label))}`,
    `${ui.paint("muted", "bars")}     ${ui.paint("fg", String(bars))}`,
    `${ui.paint("muted", "mode")}     ${ui.paint("fg", out.mode)}`,
    `${ui.paint("muted", "time")}     ${ui.paint("ok", `${ms.toFixed(1)}ms`)}`,
  ];
  ui.panel(`run  ${basename(label)}`, lines);
  if (titles.length === 0) {
    ui.status("warn", "no plot series");
  } else {
    ui.write("");
    const rows = titles.map((title) => {
      const cells = out.series[title] ?? [];
      return [
        ui.paint("fg", title),
        ui.paint("muted", String(cells.length)),
        ui.paint("accent", fmtNum(lastCell(cells))),
        ui.paint("ok", sparkline(cells)),
      ];
    });
    ui.table(["plot", "n", "last", "spark"], rows);
  }
  printEvents(ui, out.events);
  printDrawings(ui, out.drawings);
  printAlerts(ui, out.alerts);
}

function brokerFromFlags(parsed: {
  commission: number | undefined;
  slippage: number | undefined;
  pyramiding: number | undefined;
}): BrokerSettings {
  const broker: BrokerSettings = {};
  if (parsed.commission != null) broker.commission = parsed.commission;
  if (parsed.slippage != null) broker.slippage = parsed.slippage;
  if (parsed.pyramiding != null) broker.pyramiding = parsed.pyramiding;
  return broker;
}

function run(
  ui: Rich,
  source: string,
  label: string,
  bars: number,
  asJson: boolean,
  broker: BrokerSettings,
): void {
  const t0 = performance.now();
  let out: RuntimeOut;
  try {
    out = new Runtime("AAPL", { broker }).run(source, syntheticBars(bars));
  } catch (err) {
    fail(ui, err instanceof Error ? err.message : String(err), 1);
  }
  const ms = performance.now() - t0;
  if (asJson || !ui.enabled) {
    runJson(out);
    return;
  }
  runPretty(ui, label, bars, out, ms);
}

function infoPayload(ui: Rich): {
  name: string;
  package: string;
  version: string;
  runtime: string;
  bun: string | null;
  mode: string;
  rich: boolean;
  docs: string;
} {
  return {
    name: "pynets",
    package: "@hoox-sh/pynets",
    version: VERSION,
    runtime: "bun",
    bun: typeof Bun !== "undefined" ? Bun.version : null,
    mode: "interpret",
    rich: ui.enabled,
    docs: "https://hoox.sh/pyne",
  };
}

function info(ui: Rich, asJson: boolean): void {
  const payload = infoPayload(ui);
  if (asJson || !ui.enabled) {
    writeJson(payload);
    return;
  }
  ui.banner();
  ui.write("");
  ui.table(
    ["key", "value"],
    [
      ["package", "@hoox-sh/pynets"],
      ["version", VERSION],
      ["runtime", `bun ${payload.bun ?? "?"}`],
      ["engine", "interpret"],
      ["rich", "yes (TTY)"],
      ["docs", payload.docs],
    ],
  );
}

function main(): void {
  const raw = process.argv;
  const ui = new Rich(useRich(raw));
  const argv = stripFlags(raw);
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    failUsage(ui, msg);
  }

  const { cmd, file, bars, json, indent, full } = parsed;
  const broker = brokerFromFlags(parsed);
  if (cmd === "help" || cmd === "-h" || cmd === "--help") {
    ui.help();
    return;
  }
  if (cmd === "info") {
    info(ui, json);
    return;
  }

  const known = cmd === "check" || cmd === "format" || cmd === "run" || cmd === "dump";
  if (!known) {
    failUsage(ui, `error: unknown command: ${cmd}`);
  }

  if (file == null) {
    failUsage(ui, `error: missing file\nusage: pynets ${cmd} <file> [options]`);
  }

  if (cmd === "check") {
    check(ui, readSource(ui, file), file);
    return;
  }
  if (cmd === "format") {
    format(ui, readSource(ui, file));
    return;
  }
  if (cmd === "dump") {
    dumpAst(ui, readSource(ui, file), indent, full);
    return;
  }
  if (cmd === "run") {
    run(ui, readSource(ui, file), file, bars, json, broker);
    return;
  }
  failUsage(ui, `error: unknown command: ${cmd}`);
}

if (import.meta.main) {
  try {
    main();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    process.exit(err instanceof UsageError ? 2 : 1);
  }
}
