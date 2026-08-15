# PyneTS

TypeScript / Bun counterpart of [PYNE / pynescript](https://github.com/hoox-sh/pyne) (`import pynescript`).

Python `pynescript.runtime` remains the **source of truth**. When semantics disagree, Python wins.

This repository is the standalone `@hoox/pynets` checkout. In PYNE it is consumed **only** as the [`pynets/`](https://github.com/hoox-sh/pyne) git submodule — do not copy sources back into `hoox-sh/pyne`.

## Why this exists

`pine-worker` is a Cloudflare Worker with a forked grammar and a Zod AST. PyneTS is the library-shaped port:

| | pynescript (Python) | pine-worker | **PyneTS** |
|---|---|---|---|
| Role | SoT library | Edge worker (partial) | TS library |
| Grammar | `*.g4` | copied / forked | **same `*.g4`**, TS target |
| AST | ASDL | Zod (`Identifier`/`Literal`) | ASDL field names |
| Runtime | interpret + Numba | broken composition | interpret only |
| API | `parse` / `unparse` / `Runtime.run` | Worker `POST /run` | same names as Python |

## Usage

```ts
import { parse, unparse, Runtime } from "@hoox/pynets";

const src = `//@version=5
indicator("t")
plot(close)
`;

const tree = parse(src);
console.log(unparse(tree));

const out = new Runtime("TEST").run(src, [
  { open: 1, high: 1, low: 1, close: 1 },
  { open: 2, high: 2, low: 2, close: 2 },
]);
// out.series, out.plots, out.count
```

## CLI

Rich-inspired TTY UI (PYNE volt palette). Pipes and CI stay plain (`check` → `ok`, `run`/`info` → JSON).

```bash
bun run src/cli.ts                  # banner + help
bun run src/cli.ts check script.pine
bun run src/cli.ts format script.pine
bun run src/cli.ts run script.pine --bars 20
bun run src/cli.ts run keltner.pine --bars 40   # 3 plots: mid / up / lo
bun run src/cli.ts run strategy_entry.pine      # events table when present
bun run src/cli.ts run strat.pine --commission 0.001 --slippage 1 --pyramiding 0
bun run src/cli.ts dump script.pine
bun run src/cli.ts dump script.pine --rich --full
bun run src/cli.ts info
# or: bun run pynets -- check script.pine
```

`run` prints one sparkline + last-value row per plot title (keltner mid/up/lo), a small events table (`bar`, `type`, `id`) when the runtime returns strategy events, and a drawings/alerts table (`kind`, `bar`, `text`) when `result.drawings` or `result.alerts` is present. `--plain` stays machine JSON (includes `drawings` / `fills` / `alerts` when present). `dump --rich` keeps at least 80 lines; `--full` prints the whole AST.

| Flag | Effect |
| --- | --- |
| `--bars N` | Synthetic bar count for `run` (default 20) |
| `--commission N` | Runtime broker commission fraction (e.g. `0.001`) |
| `--slippage N` | Runtime broker slippage in price units |
| `--pyramiding N` | Runtime broker max same-direction adds |
| `--json` | Machine-readable `run` / `info` |
| `--full` | Print the full AST dump (no 80-line cap on `--rich`) |
| `--plain` | Disable styling (`NO_COLOR` too) |
| `--rich` | Force panels / sparklines (`FORCE_COLOR` too) |

## Development

Agent brief: [`AGENTS.md`](AGENTS.md).

```bash
git clone https://github.com/hoox-sh/pynets.git
cd pynets
bun install
bun test
bun run typecheck
```

Generated files under `src/generated/` are committed so `bun test` does not require Java.

### Grammar (do not fork)

`bun run generate` needs the shared PYNE `.g4` files. They are **not** vendored here.

Resolution order (`scripts/generate-antlr.ts`):

1. `PYNETS_GRAMMAR` — directory that contains `PinescriptLexer.g4` / `PinescriptParser.g4`
2. `PYNESCRIPT_ROOT` — a `hoox-sh/pyne` checkout root
3. Parent checkout (this repo used as the `pynets/` submodule of PYNE)
4. Sibling checkouts: `../pynescript` or `../pyne`

```bash
# standalone, with PYNE cloned next to this repo
bun run generate

# or point at any checkout
PYNESCRIPT_ROOT=/path/to/pyne bun run generate
```

Java is required only to regenerate. The ANTLR complete jar is cached in `.tools/` (gitignored).

### Inside PYNE

```bash
git clone --recurse-submodules https://github.com/hoox-sh/pyne.git
cd pyne/pynets
bun install && bun test
```

After a plain `git clone` of PYNE:

```bash
git submodule update --init --recursive
```

## Non-goals (still open)

Numba / compile, remaining `ta.*`, Worker packaging, ASDL codegen.

## License

AGPL-3.0-or-later — same as PYNE. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
