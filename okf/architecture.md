---
type: Reference
title: Architecture
description: The project shape and the OpenOrchestrate team.
tags: [architecture, openorchestrate]
status: stable
---

# Architecture

@hoox-sh/pynets uses OpenOrchestrate. Languages: TypeScript.

## Runtime surfaces

PyneTS — a TypeScript / Bun library that parses, unparses, and interprets Pine
Script. It mirrors the Python `pynescript` public names (`parse`, `unparse`,
`Runtime.run`); Python is the source of truth when semantics disagree.

- **Entry points:** the `@hoox-sh/pynets` exports and the `pynets` CLI binary.
- **Run:** `bun run build` to compile, `bun run pynets` for the CLI.
- **Verify:** `./scripts/verify.sh` runs `bun fmt --check`,
  `bun run typecheck`, and `bun run test`.

## The team

| Seat        | Title               | Agent        |
| ----------- | ------------------- | ------------ |
| Chief       | Chief of Staff      | `oo-chief`   |
| Ops         | Head of Operations  | `oo-ops`     |
| Checker     | Quality Gate        | `oo-checker` |
| Docs        | Head of Docs        | `oo-spec-1`  |
| Engineering | Head of Engineering | `oo-spec-2`  |
| Misc        | General Desk        | `oo-misc`    |

## The board

The board lives at `.openorchestrate/board.md`. It has five statuses:
Todo, Working, Blocked, Ready for Review, Done. A card moves to Done only with proof.

## Related

- [Development](development.md)
- [Security](security.md)
