# Contributing to PyneTS

Part of **[HOOX](https://hoox.sh)**. Python SoT lives in
[hoox-sh/pyne](https://github.com/hoox-sh/pyne) (`import pynescript`).

Thank you for contributing.

## Setup

```bash
git clone https://github.com/hoox-sh/pynets.git
cd pynets
bun install
bun test
bun run typecheck
```

Local development is **Bun only** (`bun install` / `bun test` / `bun run`).
Do not add npm/yarn/pnpm lockfiles.

## Source of truth

Python `pynescript.runtime` wins when semantics disagree. Do not invent
TradingView platform behaviour that Python does not implement.

Read [`AGENTS.md`](AGENTS.md) before changing interpret builtins or the grammar.

## Workflow

1. Fork and branch from `main`.
2. Port or fix against the Python handler first.
3. Wire names in `src/runtime/interpret.ts` (one dispatcher).
4. Add a focused `test/*.test.ts`.
5. `bun test` and `bun run typecheck` must stay green.
6. Open a pull request.

## Hard constraints

- Do not hand-edit `src/generated/*` — regen with `bun run generate`.
- Do not fork the `.g4` grammar here. Edit it in PYNE, then regen.
- AST field names stay ASDL (`kind`, `lineno`, `col_offset`, …).
- Interpret only. No Numba/compile port, no Worker packaging, no ASDL codegen.
- `na` is `null`. Non-finite in/out is `na`.
- New source files: copyright header + `SPDX-License-Identifier: AGPL-3.0-or-later`.

## Publishing

npm `@hoox/pynets` is published from version tags (`v0.1.0`) by
[`.github/workflows/publish.yml`](.github/workflows/publish.yml).
Maintainers: bump `package.json` + `CHANGELOG.md`, tag, push.

## License

Contributions are licensed under AGPL-3.0-or-later. See [LICENSE](LICENSE) and
[NOTICE](NOTICE).
