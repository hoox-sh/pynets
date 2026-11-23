# Performance Guide — `@hoox-sh/pynets`

## Overview

PyneTS is a TypeScript/Bun port of the Python `pynescript` runtime. Performance
characteristics closely mirror the Python implementation, with a few TypeScript
specific considerations.

## Key Performance Characteristics

### TA Computation

All `ta.*` functions use **O(1) ring buffers** for window management (replacing
the O(n) `Array.shift()` pattern). Per-bar cost is O(1) per call site regardless
of window period.

### Realtime Streaming

`RuntimeStream.push()` re-evaluates the entire script from bar 0 on each push
(matching Python `_run_batch` semantics). This is **O(n²)** total for n bars:

| Bars   | Total Bar Visits |
| ------ | ---------------- |
| 100    | ~5,050           |
| 1,000  | ~500,500         |
| 10,000 | ~50,005,000      |

For streaming use cases with many bars, consider:

- Batching bars and calling `run()` once instead of `push()` per bar
- Using `updateLastBar()` for forming-bar revisions instead of `push()`

### Compile Backend

The `compile` mode transpiles Pine AST to JavaScript and evaluates it via
`new Function()`. Compiled scripts are cached in an LRU (max 128 entries)
keyed by source SHA-256. Subsequent runs of the same source skip transpilation.

### Memory

- Each variable in a script allocates a `PineSeries` on first use (lazy
  allocation).
- `PineSeries` grows unbounded by default. Use `new PineSeries({ maxSize: N })`
  to enable FIFO eviction.
- TA call-site state is retained per script instance for the duration of the
  run.

## Configuration Options

| Option            | Default   | Description                          |
| ----------------- | --------- | ------------------------------------ |
| `maxBars`         | 100,000   | Maximum OHLCV bars per `run()` call  |
| `whileCap`        | 10,000    | Max while loop iterations per bar    |
| `forCap`          | 1,000,000 | Max for-to/for-in iterations per bar |
| `timeout_seconds` | null      | Wall-clock budget (interpret mode)   |
| `realtimeTicks`   | 1         | Visits per realtime bar              |

## Benchmarks

Run the built-in benchmarks:

```bash
bun test bench/
```

## Optimization Checklist

- [ ] Use `compile` mode for production backtests (faster than interpret)
- [ ] Batch bars for streaming instead of `push()` per bar
- [ ] Set `maxBars` to prevent memory exhaustion from oversized datasets
- [ ] Use `PineSeries({ maxSize: N })` for long historical runs
- [ ] Profile with `timeout_seconds` to detect runaway scripts
