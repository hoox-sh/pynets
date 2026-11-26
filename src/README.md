# `src/` — deep modules

Every immediate child directory of `src/` is a **deep module** (see GLOSSARY.md): a small interface hiding a large implementation.

## Layout

- **Root files of a module are its entry points.** Everything else in the module is private.
- **Any subfolder is private** — `lib/`, `compile/`, anything. `src/runtime/compile/` is private to `src/runtime/`; `src/runtime/compile.ts` is its root entry.
- Conventional subfolders are `lib/` (implementation) and `tests/` (module-local tests), but the rule is **depth-based**: any subfolder at depth ≥ 2 under `src/` is private. New folders never need config changes.
- `src/index.ts` is the deliberate curated exception: the package barrel. **Expose several small entry points instead of a barrel that re-exports a whole subtree.**

Modules today: `src/ast/`, `src/parser/`, `src/generated/` (committed ANTLR output — never hand-edit), `src/runtime/`.

## The rules (`.dependency-cruiser.cjs`)

1. **`entrypoints-only-from-outside`** — code outside a module (src root files, `test/`, `scripts/`) may import only a module's entry points, never its subfolders. The rest of the repo talks to a module at its face, not through its walls.
2. **`entrypoints-only-across-modules`** — a module may reach its own subfolders freely (`src/runtime/` → `src/runtime/compile/` is fine), but may reach another module only through that module's entry points.
3. **`tests-through-entrypoints`** — tests import a module through its entry points only. A test's own `test/helpers` are fine.
4. **`no-circular`** — no dependency cycles between modules. ANTLR-generated files under `src/generated/` are exempt: `PinescriptParser.ts ⇄ PinescriptParserVisitor.ts` is an inherent ANTLR4 cycle in generated code we never edit (already excluded from typecheck).

**Import a module through its entry points; never its subfolders.**

## Copy me

New module `src/foo/` with implementation in a subfolder:

```text
src/foo/index.ts      # entry point (or several small entry points) — public
src/foo/lib/thing.ts  # private
```

```ts
// ✅ entry point (directory import)
import { thing } from "../src/foo/";
// ✅ entry point (explicit file, as this repo writes them)
import { thing } from "../src/foo/index.ts";

// ❌ banned — reaches into the private subfolder
import { thing } from "../src/foo/lib/thing.ts";
```

Public entry points re-export what callers need. Implementation files import each other freely. Nothing outside the module names the subfolder files.

## Running the check

```bash
bun run lint:boundaries   # depcruise --validate .dependency-cruiser.cjs src test scripts
```

CI runs it as the **Boundaries** step, immediately after **Typecheck**. Violations fail the build.

## This file ships

`package.json` has `files: ["src", ...]`, so this file is included in the npm tarball. That is intentional: consumers reading the published source see the boundary rules, not just the barrel.
