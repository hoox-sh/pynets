# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `FunctionDef.returns` — UDF/method return types survive parse → unparse (`int ilog2(...)`)
- `Runtime.run(..., timeout_seconds)` — interpret wall-clock circuit breaker (every 32 bars); `timed_out` + `error_kind=runtime`
- `Runtime.run(..., libraries=[{namespace, name, version, source}])` — same list shape as Python `Runtime.run`
- `Type.new(...)` positional args fill fields in declaration order (kwargs still override)
- `ta.vpt` / `vpt` alias of `ta.pvt` (Python `ta.pvt` / `ta.vpt` cumulative)
- `strategy.exit` pending stop/limit/trail, tick `profit`/`loss`, `qty_percent`, `from_entry`; `trail_points=0`/`na` does not disable `trail_offset`
- UDT array cells; `array.sort` / `binary_search*` `sort_field` (default `0` on UDT arrays)
- Incremental `ta.cmf` / `ta.klinger`; `ta.wad` volume-scaled; `ta.wvad` is WAD / rolling volume
- ASDL `AugAssign`, `Qualify`/`Specialize`, bitwise/shift (`& | ^ << >>`)
- Incremental interpret `ta.ao` / `ta.aroon` (SMA(hl2,5)−SMA(hl2,34); Aroon pair, ties keep oldest)

### Changed
- Parser regen from PYNE 0.3.11: left-factored typed names; bare `x =` is `Assign`; `=` reassignment only on attribute/subscript
- Compile `strategy.exit` uses `placeExit` (trail / ticks / `qty_percent` / `from_entry`)
- Compile arrays keep UDT/object cells; `sort` / `binary_search*` pass `sort_field`
- Compile `ta.wad` / `ta.wvad` / `ta.cmf` / `ta.klinger` match interpret kernels
- Compile emit bitwise/shift, `AugAssign`, and zero-arg `ta.*` attributes
- Interpret `order.ascending` / `order.descending` (1 / -1)
- Interpret `plot(ta.wvad)` / `plot(ta.cmf)` as the 0-arg forms (period 20)
- `matrix.sort` / `matrix.sort_indices` take `sort_field`; UDT cells allowed
- Pine namespace constants (`order`/`format`/`display`/`shape`/`dayofweek`/`month`/…) on interpret and compile
- Compile matrix UDT cells and `matrix.sort_indices`
- Interpret `strategy(..., avg_price_model=, leverage=)` plus `strategy.leverage` / liquidation price
- Compile `strategy(...)` folds `leverage` / `avg_price_model` / default qty / margins; `strategy.leverage` / `position_avg_price` / `margin_liquidation_price`; omitted entry qty uses `resolveDefaultQty`; close passes qty

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
