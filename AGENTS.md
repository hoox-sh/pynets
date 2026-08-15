# PyneTS — Agent Instructions

TypeScript / Bun library port of [PYNE / pynescript](https://github.com/hoox-sh/pyne).
Public names match Python: `parse`, `unparse`, `Runtime.run`.

**Python `pynescript.runtime` is the source of truth.** When semantics disagree, Python wins. Do not invent TradingView platform behaviour that Python does not implement.

This repo is the standalone `@hoox/pynets` checkout. PYNE consumes it **only** as the `pynets/` git submodule — never copy sources into `hoox-sh/pyne`.

## Commands

```bash
bun install
bun test                 # unit tests (bun native runner)
bun test test/foo.test.ts
bun run typecheck        # tsc --noEmit (excludes src/generated)
bun run src/cli.ts -- help
bun run generate         # ANTLR TS regen — needs Java + PYNE .g4
```

Grammar resolution (`scripts/generate-antlr.ts`): `PYNETS_GRAMMAR` → `PYNESCRIPT_ROOT` → parent PYNE checkout → sibling `../pynescript` or `../pyne`.

Local PYNE SoT: `/home/jango/Git/pynescript` (package `pynescript`).

## Hard constraints

- **Do not hand-edit** `src/generated/*`. Regen with `bun run generate`.
- **Do not fork the grammar.** Edit `.g4` only in PYNE (`src/pynescript/ast/grammar/antlr4/resource/`), then regen here.
- **AST field names stay ASDL** (`kind`, `lineno`, `col_offset`, …) — not pine-worker Zod (`Identifier` / `Literal`).
- **Interpret only.** No Numba/compile port, no Worker packaging, no ASDL codegen (README non-goals).
- **`bun` only** — never npm/yarn/pnpm.
- **`na` is `null`.** Non-finite in/out is `na`. Per-call-site TA state (Python incremental kernels).
- **`request.security` foreign / HTF without data → `na`.** Do not invent chart series as foreign data.
- Copyright header + `SPDX-License-Identifier: AGPL-3.0-or-later` on new source files.

## Layout

| Path | Role |
|---|---|
| `src/ast/` | parse / unparse / dump / hand-written ASDL nodes |
| `src/parser/` | LexerBase / ParserBase (indent, line-join) |
| `src/generated/` | committed ANTLR TS (do not edit) |
| `src/runtime/` | interpret host + ta / strategy / collections |
| `src/cli.ts` | TTY CLI (`check` / `format` / `run` / `dump` / `info`) |
| `test/` | bun tests; first-party fixtures live in PYNE |

## Parity workflow

1. Read the Python handler first (`src/pynescript/ast/evaluator/builtins/` or `runtime/`).
2. Port na / lookback / call-site semantics; do not “improve” them.
3. Wire the name in `src/runtime/interpret.ts` `evalCall` (or the matching `eval*Call`).
4. Add a focused `test/interpret_*.test.ts` (or extend the existing file).
5. If PYNE is present, compare `Runtime.run` plots on the same bars.
6. `bun test` and `bun run typecheck` before claiming done.

Use `/pynets-parity` when adding or fixing builtins. Use `/pynets-generate` when touching grammar output.

## Sister repos

| Repo | Path | Role |
|---|---|---|
| PYNE (SoT) | `/home/jango/Git/pynescript` | Python parser + Runtime |
| pine-worker | `/home/jango/Git/pine-worker` | forked TS Worker — **not** a dependency |
| pyne-worker | `/home/jango/Git/pyne-worker` | Python edge host |
| hoox | `/home/jango/Git/hoox` | mesh monorepo |

## Verify

```bash
bun test
bun run typecheck
```
