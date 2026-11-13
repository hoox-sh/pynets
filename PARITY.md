# PyneTS ↔ PYNE parity status

Source of truth: local `pynescript` checkout (`$PYNESCRIPT_ROOT`, default
`/home/jango/Git/pynescript`). This snapshot was upgraded against **PYNE 0.6.32**.

The Python probe in `test/helpers/python_runtime.ts` runs a wrapper that puts
`$PYNESCRIPT_ROOT/src` on `PYTHONPATH`, so parity tests always import the local
source tree — never a `pynescript` release installed in `.venv`.

## Verified

`bun test` (1394 tests) and `bun run typecheck` are green against 0.6.32.

### Runtime semantics upgraded

- **ATR** seeds bar 0 with `high - low` (`_atr_inc_update`, 0.6.32).
- **`ta.stdev` / `ta.variance` / `ta.bb`** use population variance (ddof=0).
- **Incremental bar-mode detectors** now match `_*_inc_update` rather than the
  full-list path: `ta.zigzag`, `ta.acceleration_factor`, `ta.stoch_smooth`,
  `ta.engulfing`, `ta.inside_bar_pattern`, `ta.double_top_bottom`,
  `ta.rsi_divergence`, `ta.cumulative_delta`, `ta.volume_momentum`,
  `ta.volume_thrust`.
- **Strategy broker next-bar fills** (PYNE 0.6.29):
  market `entry` / `order` / `exit` / `close` / `close_all` orders placed on bar
  N fill at the open of bar N+1; orders never fill on their placement bar;
  `close` / `close_all` emit their placement event immediately; entry fills
  emit `entry`; trade `entry_time` / `exit_time` use bar timestamps.
- **Compile** mirrors the same broker flow (`deferMarket`), and `hold()`
  preserves strings so string-valued TA results survive assignments.

### Builtins added

Wave 11 (statistical / advanced):

`ta.sma_weighted`, `ta.apo`, `ta.atr_normalized`, `ta.beta`, `ta.r_squared`,
`ta.comovement`, `ta.skewness`, `ta.kurtosis`, `ta.volume_weighted_momentum`,
`ta.parkinson`, `ta.garman_klass`, `ta.mean_reversion_score`,
`ta.market_condition`, `ta.order_flow_imbalance`, `ta.liquidity_score`,
`ta.fear_greed_index`, `ta.crowd_sentiment`, `ta.smart_money_flow`,
`ta.trend_confirmation_score`, `ta.max_loss_level`, `ta.profit_lock_level`.

Wave 12 (risk / sizing / timing):

`ta.position_sizing`, `ta.kelly_criterion`, `ta.risk_reward_ratio`,
`ta.risk_reward_asymmetry`, `ta.probability_of_movement`, `ta.trend_strength`,
`ta.breakeven_level`, `ta.market_structure_pivot`, `ta.position_sizing_score`,
`ta.trailing_exit_level`, `ta.optimal_entry_zone`, `ta.mean_reversion_entry`,
`ta.multi_timeframe_signal`, `ta.market_timing_index`,
`ta.regime_adaptive_signal`, `ta.strategy_score`, `ta.breakout_detection`.

Wave 13 (history / sentiment / macro):

`ta.ema_cross_signal`, `ta.momentum_filter`, `ta.volatility_regime`,
`ta.economic_impact_score`, `ta.contrarian_signal`,
`ta.drawdown_recovery_level`, `ta.pivot_point_levels`,
`ta.volatility_regime_score`, `ta.correlation_filter`,
`ta.advanced_breakout_detector`, `ta.pullback_bounce_level`,
`ta.divergence_detector`, `ta.momentum_divergence`, `ta.spread_analysis`,
`ta.employment_cycle_indicator`, `ta.gdp_growth_proxy`,
`ta.inflation_proxy_indicator`, `ta.expected_value`.

Also added: bare chart-type aliases `renko` / `kagi` / `linebreak` /
`pointfigure`, `ticker.inherit`, and bare
`percentile_linear_interpolation` / `percentile_nearest_rank` aliases.

Wave 14 (list return + capstone synthesis):

`ta.gamma_levels` (returns a `PineArray`; use `array.get(g, 0)`),
`ta.intelligent_strategy_synthesizer`, `ta.signal_confluence`.

Every wave ships interpret + JS compile emit and a Python `Runtime.run` parity
test (`test/interpret_wave11.test.ts` … `test/interpret_wave14.test.ts`).

## Coverage

All **941** names registered by PYNE's `BuiltinEvaluator` resolve in PyneTS.
The literal scan still lists a few names that are handled structurally rather
than by a quoted dispatch key:

- `color.*` — `colorByName` table in `src/runtime/color.ts`.
- `label.all` / `line.all` / `box.all` / `table.all` / `polyline.all` /
  `linefill.all` — `drawingAllKind` + `DrawingBook`.
- `syminfo.ticker`, `timeframe.period` / `main_period` / `multiplier` /
  `is*` — `Attribute` evaluation.
- `last_bar_time` — bare series name resolved from the bar context.

## History-list semantics

PYNE's `_expect_list(PineSeries)` returns the series history **newest-first**
(capped at 1000), so `list[-1]` is the oldest retained sample. Wave 13 adds a
`windowFor` helper to `TaEngine` that mirrors this for both series samples and
`array.from(...)` inputs. The handlers that depend on it
(`market_structure_pivot`, `optimal_entry_zone`, `mean_reversion_entry`,
`volatility_regime_score`, `correlation_filter`, breakout/pullback/divergence,
spread, macro proxies) now match Python.

## Realtime stream

`RuntimeStream` models a forming last bar:

- `push(bar)` re-runs the script with `realtimeLastBar: true`, so the last bar
  sees `barstate.isrealtime=1`, `barstate.ishistory=0`,
  `barstate.islastconfirmedhistory=0`.
- `updateLastBar(bar)` replaces the forming bar and re-runs without advancing
  `barCount`; `once`, TA state, and broker fills recompute from the revised
  history (natural rollback).
- `appendBars(bars)` and `barCount` round out the session API.
- `close()` re-runs with `realtimeLastBar: false`, confirming the last bar.

## Realtime windows (multi-tick)

`Runtime.run` ports Python's realtime window options; resolution precedence
mirrors `_resolve_realtime_first` (`realtimeFromBar` > `realtimeBars` >
`realtimeLastBar` / `realtimeTicks > 1`):

```ts
rt.run(src, bars, { realtimeFromBar: 12, realtimeTicks: 3 });
rt.run(src, bars, { realtimeBars: 5, realtimeTicks: 2 });
```

Bars inside the window are visited once per tick, matching Python
`_run_batch`:

- Intermediate ticks roll back `var` scope, container contents (array / map /
  UDT / matrix), UDF-site `var` state, plot cells, TA windows, and broker
  state; plots capture the final tick only.
- `varip` re-runs its initializer on every realtime tick (reference varip)
  and persists across ticks — it also now initializes once and persists on
  historical bars, matching Python (`varip` ≡ `var` when not realtime).
- `barstate.isnew` is `0` after the first tick; `isconfirmed` is `0` on
  intermediate ticks; `once` commits only on confirmed bars.
- Alerts fire per tick like Python: `freq_all` every tick,
  `freq_once_per_bar` first tick, `freq_once_per_bar_close` final tick.

## List subscript (`g[0]`)

Python `visit_Subscript` indexes list-valued names newest-first
(`value[-(offset + 1)]`; OOB / negative / na → na) — `g[0]` is the _last_
element of `ta.gamma_levels`' `[high, low]`. Both interpret and JS compile
lower `g[0]` this way for names bound from `ta.gamma_levels`, `array.from`,
`array.new*`, `array.copy`, `array.concat`, and `array.slice` (compile tracks
array-valued names; Python's own compile mode returns na here).

## Remaining work

- Python quirks where nested `ta.*` arguments are rejected in bar mode
  (`ta.mean_reversion_entry`); PyneTS accepts them.
- Python's `data_feed` forming-bar polling during realtime ticks is not
  modeled; ticks re-visit the same OHLC (Python without a feed does too).
- `request.security` foreign / HTF without data → `na`; chart series are
  never invented as foreign data.

### Notes

- `ta.market_structure_pivot` uses the `advanced.py` semantics (oldest
  `period` highs/lows, midpoint pivot) because it wins MRO over the
  `strategies.py` variant.
- `ta.breakout_detection` treats a bare series argument as `0` (Python
  `isinstance` check), matching PYNE's bar-mode quirk.
- `ta.mean_reversion_entry` parity requires series arguments; Python errors on
  nested `ta.sma`/`ta.stdev` arguments in bar mode.

## Adding a builtin

1. Read the Python handler (and its `_*_inc_update` when bar mode uses it).
2. Implement in `src/runtime/ta.ts` (stateful) or as a pure method.
3. Wire `evalExtraTa` in `src/runtime/interpret.ts` with Python arg order and
   required-arg messages.
4. Add the method to `TA_METHODS` and an `emitTa` branch in
   `src/runtime/compile/emit_call.ts`. Use `taCall` only for methods that take a
   call-site string; stateless methods use `taPure`.
5. Add a case to `test/interpret_wave*.test.ts` (Python parity + compile
   parity).
