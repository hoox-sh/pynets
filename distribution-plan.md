# Distribution plan — @hoox-sh/pynets

**Status:** PLAN ONLY. Nothing in this document has been executed: nothing was published, tagged, released, or uploaded, and no workflow or publish config was modified.
**Date:** 2026-11-25 · **Author:** engineering seat (oo-spec-2) · **Card:** `plan-distribution-artifacts-for--783f362c`
**Where this lives:** repo root, next to `PARITY.md` / `PERFORMANCE.md`. `docs/` is scoped to CLI screenshots (see `docs/README.md`) and there is no ADR convention, so it was deliberately not placed there. Owner may move it.

## Baseline (verified 2026-11-25, this checkout @ `12f88a7`)

What exists today:

- **npm** `@hoox-sh/pynets` — `bun publish`-equivalent via `.github/workflows/publish.yml` on `v*` tags (Trusted Publishing/OIDC, or `NPM_TOKEN_HOOXSH`), provenance on. `npm latest` is **0.10.0**; package.json says **0.11.0** (tag/publish not yet done — owner's call, out of scope).
- **Exports** — `.`, `./parse`, `./runtime`; `browser` condition only on `.` (→ `dist/browser.js`, 757 kB, zero `node:*` imports) and on `./parse` (→ `dist/parse.js`, which **does** embed `node:module` via antlr4's node build — see F3).
- **CLI** — `bin: pynets → ./src/cli.ts`, shebang `#!/usr/bin/env bun`; distributed in the npm tarball; requires Bun on `PATH` (README says so explicitly).
- **Build** — `scripts/build.ts` → `dist/` (node ESM `index.js` 1.3 MB, browser `browser.js`, `parse.js` 587 kB, `dist/types/`); runs via `prepack`.
- **CDN** — no config needed; unpkg / jsdelivr / esm.sh serve the published package (verified HTTP 200 for `@0.10.0`, all three; `0.11.0` 404s until tagged).
- **Workflows** — only `ci.yml` (typecheck/test/build/node smoke/pack dry-run + Codecov) and `publish.yml`. No release, container, or binary workflows. No Dockerfile anywhere in repo.
- **License** — AGPL-3.0-or-later; `LICENSE` + `NOTICE` ship in the npm tarball (`files` includes them).

Verification run locally (this checkout):

| Command                                                         | Result                                                                                                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`                                                 | OK — node 1319 kB, browser 757 kB, parse 587 kB, `dist/types/index.d.ts`                                                                            |
| `bun test`                                                      | 1322 pass · 146 skip · **0 fail** (1468 tests, 122 files)                                                                                           |
| `bun run typecheck`                                             | clean (exit 0)                                                                                                                                      |
| `npm pack --dry-run`                                            | OK — 118 files, 877.1 kB packed, 4.7 MB unpacked                                                                                                    |
| `node src/cli.ts -- help` (Node v26.13.1)                       | **fails**: `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]` (parameter properties, strip-only mode)                                                |
| `bun build --compile --minify src/cli.ts` → `/tmp/…/pynets-bin` | OK; binary (~91 MB) runs, `… info` prints JSON — but reports `"version":"0.10.0"` (see F2)                                                          |
| `bun build --target node` of `src/cli.ts`                       | does **not** yield a working Node CLI: CJS output re-runs nothing (`import.meta.main` is Bun-only); ESM output crashes (`__require is not defined`) |

## Findings (fix before any new artifact)

**F1 — `bin` vs `engines` mismatch (the real packaging bug).** `bin: pynets → ./src/cli.ts` requires Bun at runtime; `engines` claims `node >=20`. On a Node-only machine, `npx pynets` does not work: npm's bin shim runs the shebang (`env bun` → not found), and invoking the `.ts` directly on Node 20–26 crashes on TS syntax (verified, above). The `node >=20` claim is only true for the **library** (`dist/index.js` imports cleanly and CI's Node smoke test passes). Fix options in §Decisions.

**F2 — stale CLI version.** `src/cli/rich.ts:15` hardcodes `VERSION = "0.10.0"`; package.json is 0.11.0. `pynets --info` and any compiled binary report 0.10.0. Fix: derive from `package.json` (single source). ~15 min.

**F3 — browser CDN gaps in subpaths.** `./parse`'s `browser` condition points at the node-targeted `dist/parse.js`, which embeds `import { createRequire } from "node:module"` (antlr4 node build). `./runtime` has **no** `browser` condition, so bundlers fall back to `import` → `dist/index.js`, also containing `node:module`. Net: `@hoox-sh/pynets` root works in browsers (verified 0 `node:*` imports in `dist/browser.js`), but the two subpaths can hit bare-specifier breakage under strict bundlers/CDNs. (Whether esm.sh's polyfills rescue every case was not tested; do not rely on it.) Fix: emit browser bundles for `parse` (and alias `./runtime` `browser` → `./dist/browser.js`, or a runtime-only browser bundle). ~0.5 day.

## Kept — what makes sense, and what it costs

### K1 — Packaging hygiene PR (F1 + F2 + F3). Recommend. Not a new artifact.

- **Whose pain:** every Node/Bun/browser consumer; support noise from "npx pynets is broken" and misreported versions.
- **Maintain cost:** ~zero ongoing; one PR, CI covers it.
- **Why now:** 0.11.0 is unpublished and untagged; landing this before the 0.11.0 tag keeps the release self-consistent.
- **Shape:** F2 one-liner; F3 build.ts gains `dist/parse.browser.js` + `exports` tweak; F1 per owner decision (D1). Optional: README install section gets one sentence on CDNs + binaries.
- **Acceptance:** `bun test` / `typecheck` / `build` green; `grep -c "node:" dist/parse.browser.js` = 0; `pynets info` prints package.json version; if option (b): CI Node smoke runs `node dist/cli.js -- help` (needs D1-b).
- **Effort:** ~0.5–1.5 day depending on D1.

### K2 — Single-file executables on GitHub Releases (bun build --compile). Recommend, behind owner approval.

- **Whose pain:** CLI users with no Bun/Node (locked-down laptops, minimal CI containers, trading-ops machines) who today must install a toolchain to run `pynets check/run/dump`.
- **What it is:** per `v*` tag, a new workflow (`.github/workflows/release.yml`, **not** touching `publish.yml`) compiles `src/cli.ts` for `linux-x64`, `linux-arm64`, `darwin-arm64`, `windows-x64` (drop `darwin-x64` unless asked), archives each with `LICENSE` + `NOTICE` + a source-tag pointer (AGPL §6 conveyance), publishes sha256 checksums, attaches to the GitHub Release for the tag.
- **Verified feasible:** `bun build --compile --minify` produced a working binary here (see baseline). No new dependency; no registry account; binaries are ~90 MB (≈360 MB/release across 4 targets).
- **Maintain cost:** one workflow + occasional target fixes; effectively zero per-release human work. No server to run.
- **Why now:** the compile path is proven, 0.11.0/0.12.0 tagging is imminent, and it reuses the existing `v*` trigger — no new release ceremony. Why not everything: signing/notarization deferred (see rejected).
- **Risks:** unsigned macOS/Windows binaries trigger Gatekeeper/SmartScreen (document; code signing is a paid Apple/MS account — owner decision, not included); F2 must land first or binaries report the wrong version; AGPL requires the source offer — the git tag _is_ the corresponding source; link it in release notes and ship LICENSE/NOTICE in archives.
- **Acceptance:** tag a pre-release or dry-run via `workflow_dispatch`; each artifact installs and `pynets check examples/...` exits 0; sha256 file attached; release notes include source link + license notice.
- **Effort:** ~0.5–1 day including a dry run.

### K3 — Document the channels that already work (README install section). Recommend, trivial.

- **Whose pain:** the many users who never learn the package exists on esm.sh/unpkg/jsdelivr; confusion between "npm latest 0.10.0" and repo state.
- **What:** add CDN one-liners (`https://esm.sh/@hoox-sh/pynets`), note "no config needed, serves the npm tarball", note binaries once K2 ships, and state the CLI-requires-Bun fact next to install (or the Node-compatible mode, if D1-b).
- **Why now / cost:** ~30 min, docs-only, zero maintenance.
- **Acceptance:** README renders; links verified 200 (done for 0.10.0 on all three CDNs).

## Rejected

| Candidate                                                      | Why not                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Split packages (`@hoox-sh/pynets-cli` / `-parse` / `-runtime`) | `exports` subpaths already serve this; split triples publish/version-skew surface for zero named consumers                                                                                                                                                                                                   |
| npm "alias" packages (e.g. `pynets-cli` → `@hoox-sh/pynets`)   | Name-squatting optics, support burden, no demand                                                                                                                                                                                                                                                             |
| GitHub Packages npm mirror                                     | Duplicates npm for zero auth benefit (OIDC trusted publishing exists); nobody asked; extra failure surface                                                                                                                                                                                                   |
| **Container image (ghcr.io / Docker Hub)**                     | No named user. `pyne-worker` already covers hosted execution (Python, POST /run, edge). CLI-in-container is served by `bunx`/`npx` in any existing CI image. Multi-arch + base-image bumps + registry perms = perpetual cost. Revisit only on a concrete ask (e.g. AXIS wants `pynets` in a sandboxed image) |
| Homebrew tap / scoop / apt / AUR                               | Binaries don't exist yet; per-manager repos + CI are ongoing labor with zero current demand. Revisit after K2 ships and download counts say something                                                                                                                                                        |
| pkg / nexe node binaries                                       | Unmaintained/deprecated; superseded by `bun build --compile`; would add a second build system                                                                                                                                                                                                                |
| Own CDN / CDNJS submission                                     | unpkg/jsdelivr/esm.sh already serve the tarball with verified 200s; CDNJS adds review latency and serves nothing new                                                                                                                                                                                         |
| Apple notarization / Windows Authenticode now                  | Paid certificates; only justified if binaries ship and users report blocks. Unsigned + documented beats never-released                                                                                                                                                                                       |
| Extra lockfiles (npm/pnpm/yarn)                                | Repo rule is bun-only; the npm tarball is consumed by npm fine without one                                                                                                                                                                                                                                   |
| Splitting publish to GitHub Releases instead of npm            | npm is where consumers look; releases (K2) are additive, not a replacement                                                                                                                                                                                                                                   |

**Explicit null option:** doing K1+K3 only (no new artifact of any kind) is a legitimate end state for 0.11.0. K2 is the only item that adds a new distribution surface, and it is separable.

## Decision needed from owner

1. **F1 / bin mismatch** — pick one: **(a)** keep the CLI Bun-only; fix README/engines wording so the Node claim can't mislead (recommended, minimal, honest) — or **(b)** ship a Node-capable `dist/cli.js` (add entry guard, build step, bin repoint, CI smoke on Node) ≈ 0.5–1 extra day.
2. **F2** — approve the one-line fix deriving CLI version from `package.json` (can ride in the same PR as K1).
3. **F3** — approve browser bundles for `./parse` (+ `browser` condition for `./runtime` → `./dist/browser.js`), or accept CDN root-only usage and document it.
4. **K2** — approve creating `.github/workflows/release.yml` and attaching compiled binaries (+ LICENSE/NOTICE + checksums) to future GitHub Releases; pick targets (proposed: linux-x64, linux-arm64, darwin-arm64, windows-x64). This creates a public artifact; it does **not** change how npm publishes.
5. **Container image** — confirm rejection (recommended) so it is on record, or commission it with a named consumer.
6. **Homebrew/scoop** — confirm deferred until binaries exist and demand is measurable.
7. **Plan location** — this file lives at repo root because `docs/` is scoped to CLI screenshots; say the word if you want it moved.

None of 1–6 has been done. No packages were published, no workflows added, no tags pushed, `package.json` untouched.

## Risks & rollback

- All of K1/K3 is a normal PR — revert merges it away. K2's rollback is deleting the release/workflow; binaries already downloaded stay valid (they embed the same AGPL source pointer). Nothing here touches the npm publish path; `publish.yml` stays authoritative for npm.
- Main risk is **saying yes to too much**: binaries + packages + image is three surfaces to maintain; this plan deliberately keeps one.
- AGPL: every new binary/image must carry LICENSE + NOTICE and a source link; npm tarball already compliant; verified `files` includes both.

## What this plan deliberately did not do

Publish/tag 0.11.0 (owner's flow), create any workflow, sign binaries, test the CDNs under an actual browser, build the `parse.browser.js` bundle, change `package.json`, or fix F2. All waiting on the decisions above.
