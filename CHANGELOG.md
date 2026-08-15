# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-16

JS compile backend (`mode: "compile" | "auto"`). Interpret unchanged.

### Added

- JS compile backend (`mode: "compile" | "auto"`) — emit a bar-loop function. No Numba.
- Compile object-mode strategy (`__h.strategy` / fills / events) and UDF series state (`src[1]`, `var` locals)
- Compile array / map / matrix, UDT (`Type.new` / field get-set), drawings (`label`/`line`/`box`), named UDF kwargs
- Compile input overrides, `color.*` / named colors, enums, extra array/matrix/drawing mutators; `mode: "auto"` no longer skips compile when inputs are set
- Compile `request.security` same-symbol passthrough (foreign → `na`), `barstate.*` / `syminfo` stubs, calendar `year`/`month`/…, `str.*`, UDT `method` calls
- Compile Heikin-Ashi `ticker.heikinashi` + `timestamp` / `timeframe.in_seconds` / `weekofyear`
- Compile `import`: inline registered library sources; unresolved aliases stub to `na`. `str.format` / `str.format_time`
- Compile `session.*` / `chart.*`, `log.*` (result `logs`), `ticker.new/standard`, `request.currency_rate`, `alertcondition`

### Notes

- Compile is JS emit (Python object-mode analog), not Numba
- `import` / foreign `request.*` stay interpret-or-na; no invented bars

## [0.1.0] - 2026-08-15

First public `@hoox-sh/pynets` release. TypeScript / Bun port of PYNE interpret.

### Added

- `parse` / `unparse` / `dump` / `Runtime.run` / `Runtime.stream` matching Python names
- Interpret host: series lookback, `var`/`:=`, UDF, UDT, enum, plots, inputs
- Strategy book: market + pending fills, trade ledger, `strategy.risk.*`, OCA
- Collections: `array.*`, `map.*`, `matrix.*` including `pinv` / eigenvalues
- In-process library registry and `import namespace/name/version`
- Calendar: `timestamp`, `weekofyear`, `time_tradingday`, UTC parts
- Bar adapters: `MemoryProvider`, `StaticMapProvider`, `JsonBarProvider`
- CLI: `check` / `format` / `run` / `dump` / `info`
- Node / browser ESM bundles (`bun run build` → `dist/`)

### Notes

- Python `pynescript.runtime` remains the source of truth
- Bun imports TypeScript source; Node and browsers use the bundle
- Interpret only (no compile / Numba)
