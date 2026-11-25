# Glossary

How @hoox-sh/pyne-ts names things. Read this before naming a module, route, event,
state, or command — and add a term here in the same change that coins it.

Format: **Term** — one line. _Avoid:_ the near-synonym that causes drift.

<!-- oo:glossary-seed — delete this marker once every TODO below is filled in. -->

## Project terms

- **TODO** — replace this with the first domain term the team coins. _Avoid:_ TODO.
- **@hoox-sh/pyne-ts** — PyneTS — TypeScript / Bun Pine Script library (parse, unparse, interpret, stream). Python pynescript Runtime remains the source of truth. Renamed from `@hoox-sh/pynets` on 2026-11-25; the old name is historical (pre-rename tarballs stay on npm under it). _Avoid:_ @hoox-sh/pynets (except when referring to the historical name).
- **PYNE_TS_GRAMMAR** — canonical environment variable overriding the ANTLR grammar path used by `bun run generate` (resolution: `PYNE_TS_GRAMMAR` → `PYNESCRIPT_ROOT` → parent PYNE checkout → sibling). `PYNETS_GRAMMAR` is the deprecated alias (honored with a warning, to be removed in a future release).
- **Docs** — Seat `oo-spec-1`, Head of Docs: owns docs work and decisions and nothing outside the docs domain — anything else goes to the Chief.
- **Engineering** — Seat `oo-spec-2`, Head of Engineering: owns engineering work and decisions and nothing outside the engineering domain — anything else goes to the Chief.
- **Identity** — Seat `oo-identity`, Identity Lead (Cooperate Identity and Design): owns brand identity, naming, voice, and visual consistency and nothing outside that domain — anything else goes to the Chief.
- **Design** — Seat `oo-design`, Design Lead (Cooperate Identity and Design): owns product and interface design, design systems, and accessibility and nothing outside that domain — anything else goes to the Chief.

<!-- oo:glossary:begin -->

## Engineering vocabulary

Shared ground for humans and seats, adapted from the codebase-design skill.
Use these terms exactly; do not substitute near-synonyms.

- **Module** — anything with an interface and an implementation. Scale-agnostic: a function, a package, or a tier-spanning slice. _Avoid:_ unit, component, service.
- **Interface** — everything a caller must know: the signature plus invariants, ordering constraints, error modes, required configuration. _Avoid:_ API, signature (both too narrow).
- **Implementation** — what sits behind the interface. _Avoid:_ guts, internals.
- **Depth** — leverage at the interface: how much behaviour a caller exercises per unit of interface learned. A deep module hides a lot behind a small interface.
- **Seam** — where you can alter behaviour without editing in that place; the location where an interface lives. _Avoid:_ boundary (overloaded with bounded context).
- **Adapter** — a concrete thing that satisfies an interface at a seam. _Avoid:_ wrapper, shim.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, and verification concentrate in one place.
- **Deep module** — small interface, large implementation. The default goal.
- **Shallow module** — the interface is nearly as complex as the implementation; complexity leaks to every caller. _Avoid:_ pass-through helpers.

## Maintaining this file

1. Coin the term in code and here in the same change.
2. One line per term; link the doc that owns the detail instead of growing entries.
3. If this file and the code disagree, one of them is wrong — fix it in the same change.
4. Reviewers: flag domain terms that appear without an entry here.

<!-- oo:glossary:end -->
