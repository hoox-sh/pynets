/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Rich-inspired terminal renderer (PYNE volt palette).
 * Enabled on TTY unless NO_COLOR / --plain; force with --rich or FORCE_COLOR.
 * `--plain` always wins over leftover FORCE_COLOR.
 */
const ACCENT = [183, 239, 9] as const;
const FG = [239, 239, 232] as const;
const MUTED = [203, 204, 189] as const;
const FAIL = [231, 0, 11] as const;
const WARN = [235, 169, 65] as const;

export const VERSION = "0.2.0";

type Rgb = readonly [number, number, number];

const ANSI_CSI = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

function fg(rgb: Rgb, text: string): string {
  return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}\x1b[0m`;
}

function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`;
}

function envOn(name: string): boolean {
  const v = process.env[name];
  return v != null && v !== "" && v !== "0";
}

function hasFlag(argv: string[], flag: string): boolean {
  for (const a of argv) {
    if (a === flag) return true;
  }
  return false;
}

/** `--plain` / `--no-color` beat leftover FORCE_COLOR. `--rich` after the command is enough. */
export function useRich(argv: string[]): boolean {
  if (hasFlag(argv, "--plain") || hasFlag(argv, "--no-color")) return false;
  if (hasFlag(argv, "--rich")) return true;
  if (envOn("NO_COLOR")) return false;
  if (envOn("FORCE_COLOR")) return true;
  return Boolean(process.stdout.isTTY);
}

/** Strip color-mode flags so they can sit after the command (bun will not see them first). */
export function stripFlags(argv: string[]): string[] {
  const out: string[] = [];
  for (const a of argv) {
    if (a === "--plain" || a === "--no-color" || a === "--rich") continue;
    out.push(a);
  }
  return out;
}

export function termColumns(stream: { columns?: number } = process.stdout): number {
  const c = stream.columns;
  if (typeof c !== "number" || !Number.isFinite(c) || c < 1) return 80;
  return Math.trunc(c);
}

export class Rich {
  constructor(readonly enabled: boolean) {}

  paint(kind: "accent" | "ok" | "fail" | "warn" | "muted" | "fg", text: string): string {
    if (!this.enabled) return text;
    const map: Record<string, Rgb> = {
      accent: ACCENT,
      ok: ACCENT,
      fail: FAIL,
      warn: WARN,
      muted: MUTED,
      fg: FG,
    };
    const painted = fg(map[kind] ?? FG, text);
    return kind === "accent" || kind === "ok" || kind === "fail" ? bold(painted) : painted;
  }

  write(text: string, err = false): void {
    const stream = err ? process.stderr : process.stdout;
    stream.write(text.endsWith("\n") ? text : `${text}\n`);
  }

  status(kind: "ok" | "fail" | "warn" | "info", msg: string, err = false): void {
    if (!this.enabled) {
      const prefix = { ok: "OK", fail: "FAIL", warn: "WARN", info: "INFO" }[kind];
      this.write(`${prefix}: ${msg}`, err);
      return;
    }
    const mark = { ok: "✔", fail: "✘", warn: "!", info: "◆" }[kind];
    const style = { ok: "ok", fail: "fail", warn: "warn", info: "accent" }[kind] as
      | "ok"
      | "fail"
      | "warn"
      | "accent";
    this.write(`${this.paint(style, mark)} ${this.paint("fg", msg)}`, err);
  }

  banner(): void {
    if (!this.enabled) {
      this.write(`PYNE pynets v${VERSION}`);
      this.write("TypeScript Pine toolchain — parse · format · run");
      return;
    }
    this.write(
      `${this.paint("accent", "◆ PYNE")} ${this.paint("fg", "pynets")} ${this.paint("muted", `v${VERSION}`)}`,
    );
    this.write(this.paint("muted", "TypeScript Pine toolchain — parse · format · run"));
  }

  help(): void {
    this.banner();
    this.write("");
    if (this.enabled) {
      this.write(this.paint("accent", "USAGE"));
      this.write(`  ${this.paint("fg", "pynets")} ${this.paint("muted", "<command> [file] [options]")}`);
      this.write("");
      this.write(this.paint("accent", "COMMANDS"));
    } else {
      this.write(
        "usage: pynets <check|format|run|dump|info> [file] [--bars N] [--mode interpret|compile|auto] [--commission N] [--slippage N] [--pyramiding N] [--json] [--plain] [--rich] [--full]",
      );
      this.write("");
      this.write("commands:");
    }
    const cmds: Array<[string, string]> = [
      ["check", "Parse-only validation (CI-friendly exit codes)"],
      ["format", "Parse → unparse (pretty-print on TTY)"],
      ["run", "Run on synthetic OHLCV (interpret or compile JS emit)"],
      ["dump", "Dump the ASDL-shaped AST"],
      ["info", "Version and runtime extras"],
    ];
    for (const [name, desc] of cmds) {
      if (this.enabled) {
        this.write(`  ${this.paint("ok", name.padEnd(10))} ${this.paint("muted", desc)}`);
      } else {
        this.write(`  ${name.padEnd(10)} ${desc}`);
      }
    }
    this.write("");
    if (this.enabled) this.write(this.paint("accent", "OPTIONS"));
    else this.write("options:");
    const opts: Array<[string, string]> = [
      ["--bars N", "Synthetic bar count for run (default 20, max 100000)"],
      ["--mode MODE", "run engine: interpret | compile | auto (JS emit; default interpret)"],
      ["--commission N", "Broker commission fraction for run (e.g. 0.001)"],
      ["--slippage N", "Broker slippage in price units for run"],
      ["--pyramiding N", "Broker max same-direction adds for run"],
      ["--json", "Machine-readable run / info output"],
      ["--indent N", "AST dump indent (default 2)"],
      ["--full", "Print the full AST dump (no 80-line cap)"],
      ["--plain", "Disable Rich styling (wins over FORCE_COLOR)"],
      ["--rich", "Force Rich styling (put after the command)"],
      ["-h, --help", "Show this help"],
    ];
    const optPad = 16;
    for (const [name, desc] of opts) {
      if (this.enabled) {
        this.write(`  ${this.paint("fg", name.padEnd(optPad))} ${this.paint("muted", desc)}`);
      } else {
        this.write(`  ${name.padEnd(optPad)} ${desc}`);
      }
    }
    this.write("");
    this.write(this.enabled ? this.paint("muted", "exit 0 ok · 1 syntax/runtime · 2 usage") : "exit: 0 ok, 1 syntax/runtime, 2 usage");
    this.write("");
    if (this.enabled) this.write(this.paint("accent", "EXAMPLES"));
    else this.write("examples:");
    const examples: Array<[string, string]> = [
      ["pynets run keltner.pine --bars 40", "3 plots (mid / up / lo) + spark/last"],
      ["pynets run strategy_entry.pine", "strategy events table (bar, type, id)"],
      ["pynets run strat.pine --commission 0.001 --slippage 1 --pyramiding 0", "broker flags on Runtime"],
      ["pynets dump script.pine --rich --full", "--rich after the command (bun will not eat it)"],
    ];
    for (const [cmd, desc] of examples) {
      if (this.enabled) {
        this.write(`  ${this.paint("fg", cmd)}`);
        this.write(`    ${this.paint("muted", desc)}`);
      } else {
        this.write(`  ${cmd}`);
        this.write(`    ${desc}`);
      }
    }
  }

  panel(title: string, lines: string[]): void {
    const safeLines = Array.isArray(lines) ? lines : [];
    if (!this.enabled) {
      this.write(title);
      for (const line of safeLines) this.write(`  ${line}`);
      return;
    }
    const body = safeLines.map((l) => visibleWidth(l ?? ""));
    const cols = termColumns();
    const maxInner = Math.max(4, cols - 2);
    const natural = Math.max(visibleWidth(title) + 2, 0, ...body);
    const inner = Math.min(maxInner, Math.max(natural, Math.min(28, maxInner)));
    const dash = Math.max(1, inner - visibleWidth(title) - 1);
    const top = `${this.paint("muted", "┌─")} ${this.paint("accent", title)} ${this.paint(
      "muted",
      "─".repeat(dash) + "┐",
    )}`;
    this.write(top);
    for (const line of safeLines) {
      const pad = " ".repeat(Math.max(0, inner - visibleWidth(line ?? "")));
      this.write(`${this.paint("muted", "│")} ${line ?? ""}${pad}${this.paint("muted", "│")}`);
    }
    this.write(this.paint("muted", `└${"─".repeat(inner + 2)}┘`));
  }

  table(headers: string[], rows: string[][]): void {
    const heads = Array.isArray(headers) ? headers : [];
    const body = Array.isArray(rows) ? rows : [];
    const widths = heads.map((h, i) =>
      Math.max(visibleWidth(h ?? ""), ...body.map((r) => visibleWidth((r && r[i]) || ""))),
    );
    if (!this.enabled) {
      this.write(heads.map((h, i) => (h ?? "").padEnd(widths[i] ?? 0)).join("  "));
      for (const row of body) {
        this.write((row ?? []).map((c, i) => padVisible(c ?? "", widths[i] ?? 0)).join("  "));
      }
      return;
    }
    this.write(
      heads
        .map((h, i) => this.paint("accent", (h ?? "").padEnd(widths[i] ?? 0)))
        .join(this.paint("muted", "  ")),
    );
    this.write(this.paint("muted", widths.map((w) => "─".repeat(w)).join("──")));
    for (const row of body) {
      this.write((row ?? []).map((c, i) => padVisible(c ?? "", widths[i] ?? 0)).join("  "));
    }
  }
}

function saneSparkWidth(width: number): number {
  if (!Number.isFinite(width) || width < 0) return 16;
  return Math.min(256, Math.trunc(width));
}

export function sparkline(values: Array<number | null>, width = 16): string {
  const w = saneSparkWidth(width);
  if (w === 0) return "";
  const series = Array.isArray(values) ? values : [];
  const nums = series.filter((v): v is number => v != null && Number.isFinite(v));
  if (nums.length === 0) {
    const n = series.length;
    return "·".repeat(n === 0 ? Math.min(w, 8) : Math.min(w, n));
  }
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const span = hi - lo || 1;
  const n = series.length;
  const cols = Math.min(w, Math.max(1, n));
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  let out = "";
  for (let c = 0; c < cols; c++) {
    const i = cols === 1 ? n - 1 : Math.round((c * (n - 1)) / (cols - 1));
    const v = series[i];
    if (v == null || !Number.isFinite(v)) {
      out += "·";
      continue;
    }
    const idx = Math.min(blocks.length - 1, Math.floor(((v - lo) / span) * (blocks.length - 1)));
    out += blocks[idx];
  }
  return out;
}

const PINE_KW =
  /^(indicator|strategy|library|plot|input|var|varip|if|else|for|to|in|while|switch|export|import|true|false|na|and|or|not)$/;
const PINE_BI = /^(open|high|low|close|volume|time|bar_index|ta|sma|ema|rsi)$/;

export function highlightPine(source: string, rich: Rich): string {
  if (!rich.enabled) return source;
  return String(source ?? "")
    .split("\n")
    .map((line) => highlightLine(line, rich))
    .join("\n");
}

function highlightLine(line: string, rich: Rich): string {
  if (line.trimStart().startsWith("//")) return rich.paint("muted", line);
  let out = "";
  let i = 0;
  while (i < line.length) {
    const ch = line[i]!;
    if (ch === "\x1b") {
      const j = skipAnsi(line, i);
      out += line.slice(i, j);
      i = j;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== q) {
        if (line[j] === "\\") j += 2;
        else j++;
      }
      if (j < line.length) j++;
      out += rich.paint("warn", line.slice(i, j));
      i = j;
      continue;
    }
    if (ch === "/" && line[i + 1] === "/") {
      out += rich.paint("muted", line.slice(i));
      break;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j]!)) j++;
      while (line[j] === "." && /[A-Za-z_]/.test(line[j + 1] ?? "")) {
        j++;
        while (j < line.length && /[A-Za-z0-9_]/.test(line[j]!)) j++;
      }
      const word = line.slice(i, j);
      if (PINE_KW.test(word)) out += rich.paint("accent", word);
      else if (PINE_BI.test(word) || PINE_BI.test(word.split(".").pop() ?? "")) out += rich.paint("ok", word);
      else out += rich.paint("fg", word);
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      const j = scanNumber(line, i);
      out += rich.paint("warn", line.slice(i, j));
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Skip one CSI / simple ESC sequence so highlighters do not recode its digits. */
export function skipAnsi(text: string, from: number): number {
  if (text[from] !== "\x1b") return from + 1;
  let j = from + 1;
  if (text[j] === "[") {
    j++;
    while (j < text.length && /[0-9;:?]/.test(text[j]!)) j++;
    if (j < text.length && /[A-Za-z]/.test(text[j]!)) j++;
    return j;
  }
  if (j < text.length) return j + 1;
  return j;
}

function scanNumber(line: string, i: number): number {
  let j = i;
  while (j < line.length && /[0-9]/.test(line[j]!)) j++;
  if (line[j] === "." && /[0-9]/.test(line[j + 1] ?? "")) {
    j++;
    while (j < line.length && /[0-9]/.test(line[j]!)) j++;
  }
  if (line[j] === "e" || line[j] === "E") {
    let k = j + 1;
    if (line[k] === "+" || line[k] === "-") k++;
    if (/[0-9]/.test(line[k] ?? "")) {
      j = k;
      while (j < line.length && /[0-9]/.test(line[j]!)) j++;
    }
  }
  return j;
}

export function visibleWidth(text: string): number {
  return String(text ?? "").replace(ANSI_CSI, "").length;
}

function padVisible(text: string, width: number): string {
  const extra = width - visibleWidth(text);
  return extra > 0 ? text + " ".repeat(extra) : text;
}
