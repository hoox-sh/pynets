/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Port of src/pynescript/ast/grammar/antlr4/resource/PinescriptLexerBase.py
 *
 * Token type ids live as statics on the generated PinescriptLexer subclass.
 * Read them via `this.constructor` — `this.AND` is not populated on TS instances.
 */
import { CommonToken, Lexer, Token, type CharStream } from "antlr4";

const STRING_COLLAPSE_NL = /(\r?\n)+/g;
const STRING_STRIP_WRAP_INDENT = /(\r?\n)(\s)+/g;

type LexerCtor = typeof Lexer & {
  AND: number;
  COLON: number;
  COLONEQUAL: number;
  COMMA: number;
  EQEQUAL: number;
  EQUAL: number;
  GREATER: number;
  GREATEREQUAL: number;
  LESS: number;
  LESSEQUAL: number;
  MINEQUAL: number;
  MINUS: number;
  NOTEQUAL: number;
  OR: number;
  PERCENT: number;
  PERCENTEQUAL: number;
  PLUS: number;
  PLUSEQUAL: number;
  QUESTION: number;
  SLASH: number;
  SLASHEQUAL: number;
  STAR: number;
  STAREQUAL: number;
  AMP: number;
  PIPE: number;
  CARET: number;
  LSHIFT: number;
  RSHIFT: number;
  TILDE: number;
  LPAR: number;
  LSQB: number;
  RPAR: number;
  RSQB: number;
  NEWLINE: number;
  STRING: number;
  ERROR_TOKEN: number;
  WS: number;
  COMMENT: number;
  INDENT: number;
  DEDENT: number;
  symbolicNames: Array<string | null>;
};

function tokenType(tok: Token | null | undefined): number {
  return tok == null ? Token.INVALID_TYPE : tok.type;
}

export default class PinescriptLexerBase extends Lexer {
  static _operator_types: ReadonlySet<number> | null = null;

  private _operators: ReadonlySet<number>;
  private _tabLength = 4;
  private _indentLength = 4;
  private _currentToken: CommonToken | null = null;
  private _followingToken: CommonToken | null = null;
  private _pendingTokens: CommonToken[] = [];
  private _pendingHead = 0;
  private _lastPendingTokenType = 0;
  private _lastPendingTokenTypeFromDefaultChannel = 0;
  private _numOpens = 0;
  private _indentLengthStack: number[] = [];
  private _inputStarted = false;

  constructor(input: CharStream) {
    super(input);
    const cls = this.constructor as LexerCtor;
    let ops = (cls as unknown as typeof PinescriptLexerBase)._operator_types;
    if (ops == null) {
      ops = new Set([
        cls.AND,
        cls.COLON,
        cls.COLONEQUAL,
        cls.COMMA,
        cls.EQEQUAL,
        cls.EQUAL,
        cls.GREATER,
        cls.GREATEREQUAL,
        cls.LESS,
        cls.LESSEQUAL,
        cls.MINEQUAL,
        cls.MINUS,
        cls.NOTEQUAL,
        cls.OR,
        cls.PERCENT,
        cls.PERCENTEQUAL,
        cls.PLUS,
        cls.PLUSEQUAL,
        cls.QUESTION,
        cls.SLASH,
        cls.SLASHEQUAL,
        cls.STAR,
        cls.STAREQUAL,
        cls.AMP,
        cls.PIPE,
        cls.CARET,
        cls.LSHIFT,
        cls.RSHIFT,
        cls.TILDE,
      ]);
      (cls as unknown as typeof PinescriptLexerBase)._operator_types = ops;
    }
    this._operators = ops;
  }

  private get C(): LexerCtor {
    return this.constructor as LexerCtor;
  }

  private _resetInternalStates(): void {
    this._currentToken = null;
    this._followingToken = null;
    this._pendingTokens = [];
    this._pendingHead = 0;
    this._lastPendingTokenType = 0;
    this._lastPendingTokenTypeFromDefaultChannel = 0;
    this._numOpens = 0;
    this._indentLengthStack = [];
    this._inputStarted = false;
  }

  override nextToken(): Token {
    this._checkNextToken();
    return this._popPendingToken();
  }

  private _checkNextToken(): void {
    if (this._lastPendingTokenType === Token.EOF) return;

    this._setNextInternalTokens();
    if (!this._inputStarted) this._handleStartOfInputIfNecessary();

    const tok = this._currentToken!;
    const tokType = tok.type;
    const C = this.C;
    if (tokType === C.LPAR || tokType === C.LSQB) {
      this._numOpens += 1;
      this._addPendingToken(tok);
    } else if (tokType === C.RPAR || tokType === C.RSQB) {
      this._numOpens -= 1;
      this._addPendingToken(tok);
    } else if (tokType === C.NEWLINE) {
      this._handleNEWLINEToken();
    } else if (tokType === C.STRING) {
      this._handleSTRINGToken();
    } else if (tokType === C.ERROR_TOKEN) {
      const message = "token recognition error at: '" + tok.text + "'";
      this._reportLexerError(message, tok);
      this._addPendingToken(tok);
    } else if (tokType === Token.EOF) {
      this._handleEOFToken();
    } else {
      this._addPendingToken(tok);
    }
  }

  private _setNextInternalTokens(): void {
    this._currentToken =
      this._followingToken == null
        ? (super.nextToken() as CommonToken)
        : this._followingToken;
    this._followingToken =
      this._currentToken.type === Token.EOF
        ? this._currentToken
        : (super.nextToken() as CommonToken);
  }

  private _handleStartOfInputIfNecessary(): void {
    if (this._inputStarted) return;
    this._inputStarted = true;
    this._indentLengthStack.push(0);
    while (this._currentToken!.type !== Token.EOF) {
      if (this._currentToken!.channel === Token.DEFAULT_CHANNEL) {
        if (this._currentToken!.type === this.C.NEWLINE) {
          this._hideAndAddPendingToken(this._currentToken!);
        } else {
          this._checkLeadingIndentIfAny();
          return;
        }
      } else {
        this._addPendingToken(this._currentToken!);
      }
      this._setNextInternalTokens();
    }
  }

  private _checkLeadingIndentIfAny(): void {
    if (this._lastPendingTokenType === this.C.WS) {
      const prev = this._pendingTokens[this._pendingTokens.length - 1]!;
      if (this._getIndentationLength(prev.text ?? "") !== 0) {
        const message = "first statement indented";
        this._reportLexerError(message, this._currentToken!);
        this._createAndAddPendingToken(
          this.C.INDENT,
          Token.DEFAULT_CHANNEL,
          message,
          this._currentToken!,
        );
      }
    }
  }

  private _getIndentationLength(text: string): number {
    let length = 0;
    const tab = this._tabLength;
    for (const ch of text) {
      if (ch === " ") length += 1;
      else if (ch === "\t") length += tab;
      else if (ch === "\f") length = 0;
    }
    return length;
  }

  private _createAndAddPendingToken(
    type: number,
    channel: number,
    text: string | null,
    baseToken: CommonToken,
  ): void {
    const token = baseToken.clone() as CommonToken;
    token.type = type;
    token.channel = channel;
    token.stop = baseToken.start - 1;
    const names = this.C.symbolicNames ?? this.getSymbolicNames();
    token.text = text == null ? "<" + String(names?.[type] ?? type) + ">" : text;
    this._addPendingToken(token);
  }

  private _addPendingToken(token: CommonToken): void {
    this._lastPendingTokenType = token.type;
    if (token.channel === Token.DEFAULT_CHANNEL) {
      this._lastPendingTokenTypeFromDefaultChannel = this._lastPendingTokenType;
    }
    this._pendingTokens.push(token);
  }

  private _hideAndAddPendingToken(token: CommonToken): void {
    token.channel = Token.HIDDEN_CHANNEL;
    this._addPendingToken(token);
  }

  private _popPendingToken(): CommonToken {
    const tok = this._pendingTokens[this._pendingHead]!;
    this._pendingHead += 1;
    if (this._pendingHead > 32 && this._pendingHead * 2 > this._pendingTokens.length) {
      this._pendingTokens = this._pendingTokens.slice(this._pendingHead);
      this._pendingHead = 0;
    }
    return tok;
  }

  private _handleNEWLINEToken(): void {
    if (this._numOpens > 0 || this._operators.has(this._lastPendingTokenTypeFromDefaultChannel)) {
      this._hideAndAddPendingToken(this._currentToken!);
      return;
    }

    const nlToken = this._currentToken!;
    let followingType = tokenType(this._followingToken);
    let isLookingAhead = followingType === this.C.WS;

    if (isLookingAhead) {
      this._setNextInternalTokens();
      followingType = tokenType(this._followingToken);
    }

    if (followingType === this.C.NEWLINE || followingType === this.C.COMMENT) {
      this._hideAndAddPendingToken(nlToken);
      if (isLookingAhead) this._addPendingToken(this._currentToken!);
    } else if (isLookingAhead) {
      const indentationLength =
        followingType === Token.EOF
          ? 0
          : this._getIndentationLength(this._currentToken!.text ?? "");
      if (indentationLength % this._indentLength === 0) {
        this._addPendingToken(nlToken);
        this._addPendingToken(this._currentToken!);
        this._insertIndentOrDedentToken(indentationLength);
      } else {
        this._hideAndAddPendingToken(nlToken);
        this._addPendingToken(this._currentToken!);
      }
    } else {
      this._addPendingToken(nlToken);
      this._insertIndentOrDedentToken(0);
    }
  }

  private _insertIndentOrDedentToken(indentLength: number): void {
    let prev = this._indentLengthStack[this._indentLengthStack.length - 1] ?? 0;
    if (indentLength > prev) {
      this._createAndAddPendingToken(
        this.C.INDENT,
        Token.DEFAULT_CHANNEL,
        null,
        this._followingToken!,
      );
      this._indentLengthStack.push(indentLength);
    } else {
      while (indentLength < prev) {
        this._indentLengthStack.pop();
        prev = this._indentLengthStack[this._indentLengthStack.length - 1] ?? 0;
        if (indentLength <= prev) {
          this._createAndAddPendingToken(
            this.C.DEDENT,
            Token.DEFAULT_CHANNEL,
            null,
            this._followingToken!,
          );
        } else {
          const message = "inconsistent dedent";
          this._reportLexerError(message, this._followingToken!);
          this._createAndAddPendingToken(
            this.C.ERROR_TOKEN,
            Token.DEFAULT_CHANNEL,
            message,
            this._followingToken!,
          );
        }
      }
    }
  }

  private _handleSTRINGToken(): void {
    const text = this._currentToken!.text ?? "";
    if (text.startsWith('"""') || text.startsWith("'''")) {
      this._addPendingToken(this._currentToken!);
      return;
    }
    if (!text.includes("\n") && !text.includes("\r")) {
      this._addPendingToken(this._currentToken!);
      return;
    }
    let replaced = text.replace(STRING_COLLAPSE_NL, "$1");
    replaced = replaced.replace(STRING_STRIP_WRAP_INDENT, "");
    if (text.length === replaced.length) {
      this._addPendingToken(this._currentToken!);
    } else {
      const original = this._currentToken!.clone() as CommonToken;
      this._currentToken!.text = replaced;
      this._addPendingToken(this._currentToken!);
      this._hideAndAddPendingToken(original);
    }
  }

  private _insertTrailingTokens(): void {
    const last = this._lastPendingTokenTypeFromDefaultChannel;
    if (last !== this.C.NEWLINE && last !== this.C.DEDENT) {
      this._createAndAddPendingToken(
        this.C.NEWLINE,
        Token.DEFAULT_CHANNEL,
        null,
        this._followingToken!,
      );
    }
    this._insertIndentOrDedentToken(0);
  }

  private _handleEOFToken(): void {
    if (this._lastPendingTokenTypeFromDefaultChannel > 0) {
      this._insertTrailingTokens();
    }
    this._addPendingToken(this._currentToken!);
  }

  private _reportLexerError(message: string, token: Token): void {
    this.getErrorListener().syntaxError(
      this as never,
      token.type,
      token.line,
      token.column,
      message,
      undefined,
    );
  }

  override reset(): void {
    this._resetInternalStates();
    super.reset();
  }
}
