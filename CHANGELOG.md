# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-15

First public `@hoox/pynets` release. TypeScript / Bun port of PYNE interpret.

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
