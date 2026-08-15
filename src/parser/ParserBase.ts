/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Port of src/pynescript/ast/grammar/antlr4/resource/PinescriptParserBase.py
 */
import { Parser, type TokenStream } from "antlr4";

export default class PinescriptParserBase extends Parser {
  constructor(input: TokenStream) {
    super(input);
  }

  isEqualToCurrentTokenText(tokenText: string): boolean {
    return this.getCurrentToken().text === tokenText;
  }

  isNotEqualToCurrentTokenText(tokenText: string): boolean {
    return !this.isEqualToCurrentTokenText(tokenText);
  }
}
