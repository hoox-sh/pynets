/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine `log.*` buffer (Python `Logger` SoT).
 */

export type LogLevel = "INFO" | "WARNING" | "ERROR";

export interface LogRecord {
  level: LogLevel;
  bar: number;
  message: string;
}

export class LogBook {
  readonly records: LogRecord[] = [];

  info(bar: number, message: string): void {
    this.records.push({ level: "INFO", bar, message });
  }

  warning(bar: number, message: string): void {
    this.records.push({ level: "WARNING", bar, message });
  }

  error(bar: number, message: string): void {
    this.records.push({ level: "ERROR", bar, message });
  }
}

export function formatLogParts(parts: unknown[]): string {
  if (parts.length === 0) return "";
  const first = parts[0];
  if (typeof first === "string" && parts.length > 1 && /\{[0-9]/.test(first)) {
    return first.replace(/\{(\d+)\}/g, (_, i) => pineLogArg(parts[Number(i) + 1]));
  }
  return parts.map(pineLogArg).join(" ");
}

function pineLogArg(value: unknown): string {
  if (value == null) return "na";
  if (typeof value === "number" && !Number.isFinite(value)) return "na";
  return String(value);
}
