/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { ErrorListener } from "antlr4";

export class PinescriptSyntaxError extends Error {
  override name = "PinescriptSyntaxError";
  lineno: number | null;
  col_offset: number | null;

  constructor(message: string, lineno: number | null = null, col_offset: number | null = null) {
    super(message);
    this.lineno = lineno;
    this.col_offset = col_offset;
  }
}

/** Shared lexer/parser listener. Must extend ErrorListener (ambiguity hooks). */
export class PinescriptErrorListener extends ErrorListener<unknown> {
  static readonly INSTANCE = new PinescriptErrorListener();

  override syntaxError(
    _recognizer: unknown,
    _offendingSymbol: unknown,
    line: number,
    column: number,
    msg: string,
    _e: unknown,
  ): void {
    throw new PinescriptSyntaxError(`${msg} (${line}:${column})`, line, column);
  }
}
