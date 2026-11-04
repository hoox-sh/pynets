# PyneTS ↔ PYNE parity status

Source of truth: local `pynescript` checkout (`$PYNESCRIPT_ROOT`, default
`/home/jango/Git/pynescript`). This snapshot was upgraded against **PYNE 0.6.32**.

The Python probe in `test/helpers/python_runtime.ts` runs a wrapper that puts
`$PYNESCRIPT_ROOT/src` on `PYTHONPATH`, so parity tests always import the local
source tree — never a `pynescript` release installed in `.venv`.

## Verified

`bun test` (1322 tests) and `bun run typecheck` are green against 0.6.32.

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

Every wave ships interpret + JS compile emit and a Python `Runtime.run` parity
test (`test/interpret_wave11.test.ts`, `test/interpret_wave12.test.ts`).

## Remaining work

### Advanced analytics (not yet ported)

`ta.advanced_breakout_detector`, `ta.contrarian_signal`,
`ta.correlation_filter`, `ta.divergence_detector`, `ta.drawdown_recovery_level`,
`ta.economic_impact_score`, `ta.ema_cross_signal`,
`ta.employment_cycle_indicator`, `ta.expected_value`, `ta.gamma_levels`,
`ta.gdp_growth_proxy`, `ta.inflation_proxy_indicator`,
`ta.intelligent_strategy_synthesizer`, `ta.market_structure_pivot` (full
list/left-right semantics), `ta.momentum_divergence`, `ta.momentum_filter`,
`ta.pivot_point_levels`, `ta.pullback_bounce_level`, `ta.spread_analysis`,
`ta.trailing_exit_level` (step semantics), `ta.volatility_regime`,
`ta.volatility_regime_score`.

### History-list quirks

A few PYNE handlers call `_expect_list` on a `PineSeries` and then index
`[-1]`, which in bar mode reads the **oldest** sample of the newest-first
history (capped at 1000), not the current bar. `ta.market_structure_pivot`,
`ta.optimal_entry_zone`, and `ta.mean_reversion_entry` currently use the current
sample in PyneTS. Matching the quirk needs a per-call-site history window and
should be done deliberately, with a test pinning the cap.

### Aliases / constants

- Bare ticker chart types: `renko`, `kagi`, `linebreak`, `pointfigure`.
- `ticker.inherit`.
- `last_bar_time` bare-name resolution (currently available via context/time
  helpers but not as a standalone registered builtin).
- `ta.percentile_linear_interpolation` / `ta.percentile_nearest_rank` bare
  aliases.

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
