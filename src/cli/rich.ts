/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Rich-inspired terminal renderer (PYNE volt palette).
 * Enabled on TTY unless NO_COLOR / --plain; force with --rich or FORCE_COLOR.
 */
const ACCENT = [183, 239, 9] as const;
const FG = [239, 239, 232] as const;
const MUTED = [203, 204, 189] as const;
const FAIL = [231, 0, 11] as const;
const WARN = [235, 169, 65] as const;
const BORDER = [88, 89, 76] as const;

export const VERSION = "0.1.0";

type Rgb = readonly [number, number, number];

function fg(rgb: Rgb, text: string): string {
  return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}\x1b[0m`;
}

function bold(text: string): string {
  return `\x1b[1m${text}\x1b[0m`;
}

export function useRich(argv: string[]): boolean {
  if (argv.includes("--plain")) return false;
  if (argv.includes("--rich") || process.env.FORCE_COLOR) return true;
  if (argv.includes("--no-color") || process.env.NO_COLOR) return false;
  return Boolean(process.stdout.isTTY);
}

export function stripFlags(argv: string[]): string[] {
  const out: string[] = [];
  for (const a of argv) {
    if (a === "--plain" || a === "--no-color" || a === "--rich" || a === "--full") continue;
    out.push(a);
  }
  return out;
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
        "usage: pynets <check|format|run|dump|info> [file] [--bars N] [--commission N] [--slippage N] [--pyramiding N] [--json] [--plain] [--full]",
      );
      this.write("");
      this.write("commands:");
    }
    const cmds: Array<[string, string]> = [
      ["check", "Parse-only validation (CI-friendly exit codes)"],
      ["format", "Parse → unparse (pretty-print on TTY)"],
      ["run", "Interpret on synthetic OHLCV"],
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
      ["--bars N", "Synthetic bar count for run (default 20)"],
      ["--commission N", "Broker commission fraction for run (e.g. 0.001)"],
      ["--slippage N", "Broker slippage in price units for run"],
      ["--pyramiding N", "Broker max same-direction adds for run"],
      ["--json", "Machine-readable run / info output"],
      ["--indent N", "AST dump indent (default 2)"],
      ["--full", "Print the full AST dump (no 80-line cap)"],
      ["--plain", "Disable Rich styling (also NO_COLOR)"],
      ["--rich", "Force Rich styling (also FORCE_COLOR)"],
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
    if (this.enabled) this.write(this.paint("accent", "EXAMPLES"));
    else this.write("examples:");
    const examples: Array<[string, string]> = [
      ["pynets run keltner.pine --bars 40", "3 plots (mid / up / lo) + spark/last"],
      ["pynets run strategy_entry.pine", "strategy events table (bar, type, id)"],
      ["pynets run strat.pine --commission 0.001 --slippage 1 --pyramiding 0", "broker flags on Runtime"],
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
    if (!this.enabled) {
      this.write(title);
      for (const line of lines) this.write(`  ${line}`);
      return;
    }
    const body = lines.map((l) => visibleWidth(l));
    const inner = Math.max(visibleWidth(title) + 2, ...body, 28);
    const top = `${this.paint("muted", "┌─")} ${this.paint("accent", title)} ${this.paint(
      "muted",
      "─".repeat(Math.max(1, inner - visibleWidth(title) - 1)) + "┐",
    )}`;
    this.write(top);
    for (const line of lines) {
      const pad = " ".repeat(Math.max(0, inner - visibleWidth(line)));
      this.write(`${this.paint("muted", "│")} ${line}${pad}${this.paint("muted", "│")}`);
    }
    this.write(this.paint("muted", `└${"─".repeat(inner + 2)}┘`));
  }

  table(headers: string[], rows: string[][]): void {
    const cols = headers.length;
    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => visibleWidth(r[i] ?? ""))),
    );
    if (!this.enabled) {
      this.write(headers.map((h, i) => h.padEnd(widths[i]!)).join("  "));
      for (const row of rows) {
        this.write(row.map((c, i) => padVisible(c, widths[i]!)).join("  "));
      }
      return;
    }
    this.write(
      headers
        .map((h, i) => this.paint("accent", h.padEnd(widths[i]!)))
        .join(this.paint("muted", "  ")),
    );
    this.write(this.paint("muted", widths.map((w) => "─".repeat(w)).join("──")));
    for (const row of rows) {
      this.write(row.map((c, i) => padVisible(c, widths[i]!)).join("  "));
    }
    void cols;
  }
}

export function sparkline(values: Array<number | null>, width = 16): string {
  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const series = Array.isArray(values) ? values : [];
  const nums = series.filter((v): v is number => v != null && Number.isFinite(v));
  if (nums.length === 0) return "·".repeat(Math.min(width, series.length) || 8);
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const span = hi - lo || 1;
  const n = series.length;
  const cols = Math.min(width, Math.max(1, n));
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
  return source.split("\n").map((line) => highlightLine(line, rich)).join("\n");
}

function highlightLine(line: string, rich: Rich): string {
  if (line.trimStart().startsWith("//")) return rich.paint("muted", line);
  let out = "";
  let i = 0;
  while (i < line.length) {
    const ch = line[i]!;
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== q) j++;
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
      while (j < line.length && /[A-Za-z0-9_.]/.test(line[j]!)) j++;
      const word = line.slice(i, j);
      if (PINE_KW.test(word)) out += rich.paint("accent", word);
      else if (PINE_BI.test(word)) out += rich.paint("ok", word);
      else out += rich.paint("fg", word);
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j]!)) j++;
      out += rich.paint("warn", line.slice(i, j));
      i = j;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function visibleWidth(text: string): number {
  return text.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function padVisible(text: string, width: number): string {
  const extra = width - visibleWidth(text);
  return extra > 0 ? text + " ".repeat(extra) : text;
}
