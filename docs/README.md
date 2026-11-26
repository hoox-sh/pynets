# PyneTS documentation

The public docs live in this directory and publish at <https://hoox.sh/pyne-ts/docs>. They are Mintlify-style MDX (`docs.json` + one `.mdx` per page), synced into the landing site by `hoox-landing-page/scripts/sync-product-docs.mjs` (landing-page wiring is tracked separately).

| Page                 | URL                                           |
| -------------------- | --------------------------------------------- |
| Hub                  | https://hoox.sh/pyne-ts/docs                  |
| Install              | https://hoox.sh/pyne-ts/docs/install          |
| CLI                  | https://hoox.sh/pyne-ts/docs/cli              |
| Runtime              | https://hoox.sh/pyne-ts/docs/runtime          |
| JS compile           | https://hoox.sh/pyne-ts/docs/compile          |
| Parity               | https://hoox.sh/pyne-ts/docs/parity           |
| Missing features     | https://hoox.sh/pyne-ts/docs/missing-features |
| Parity status (repo) | [`../PARITY.md`](../PARITY.md)                |
| PyneTS repo          | https://github.com/hoox-sh/pyne-ts            |

LLM entry points: [`llm.txt`](./llm.txt) (plain-text page index) and [`llms.txt`](./llms.txt) (llmstxt.org site map).

Current parity snapshot: **PYNE 0.6.32** — **941/941** registered builtins resolve; **1,468** tests, 1,322 pass / 146 skip / 0 fail. The repo [`PARITY.md`](../PARITY.md) tracks it; update it whenever a builtin wave lands.

Writing rules: `pynescript/docs/WRITING.md` (tone, structure, frontmatter). Package facts come from `package.json`; do not hand-copy versions.

The old in-repo home of these pages — `pynescript/docs/pyne/pynets/` — is the legacy copy from before the rename to `@hoox-sh/pyne-ts`. It is kept read-only for reference and is pending retirement; do not edit it or add pages there. Landing-page sync consumes this directory.

The `assets/` directory holds the CLI screenshots referenced by the top-level README.
