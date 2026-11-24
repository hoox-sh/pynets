/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Shared descriptors for the common `ta.<name>(source, length)` kernels.
 * Compile uses `compileDefaultLength`; interpret uses the same table for the
 * names that are not already on the hot `TA_DISPATCH` map.
 */

export interface TaSrcLenSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  /** Compile default when `length` is omitted. */
  readonly compileDefaultLength: number;
  /** Interpret default when `length` is omitted. */
  readonly interpretDefaultLength: number;
  /** Interpret routes this name through the hot `TA_DISPATCH` map. */
  readonly interpretDispatch: boolean;
  /** Interpret routes this name through the generic `evalExtraTa` handler. */
  readonly interpretGeneric: boolean;
}

const LEN14 = 14;
const LEN1 = 1;
const LEN0 = 0;

export const TA_SRC_LEN_SPECS: readonly TaSrcLenSpec[] = [
  {
    name: "sma",
    method: "sma",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "ema",
    method: "ema",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "rma",
    method: "rma",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "rsi",
    method: "rsi",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "stdev",
    method: "stdev",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "wma",
    method: "wma",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "hma",
    method: "hma",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "cmo",
    method: "cmo",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "sum",
    method: "sum",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "dema",
    method: "dema",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "tema",
    method: "tema",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "dev",
    method: "dev",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "variance",
    method: "variance",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "median",
    method: "median",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "mode",
    method: "mode",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "percentrank",
    method: "percentrank",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "range",
    method: "range",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "cog",
    method: "cog",
    compileDefaultLength: LEN14,
    interpretDefaultLength: LEN0,
    interpretDispatch: false,
    interpretGeneric: true,
  },
  {
    name: "change",
    method: "change",
    compileDefaultLength: LEN1,
    interpretDefaultLength: LEN1,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "mom",
    method: "mom",
    compileDefaultLength: LEN1,
    interpretDefaultLength: LEN1,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "roc",
    method: "roc",
    compileDefaultLength: LEN1,
    interpretDefaultLength: LEN1,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "rising",
    method: "rising",
    compileDefaultLength: LEN1,
    interpretDefaultLength: LEN1,
    interpretDispatch: true,
    interpretGeneric: false,
  },
  {
    name: "falling",
    method: "falling",
    compileDefaultLength: LEN1,
    interpretDefaultLength: LEN1,
    interpretDispatch: true,
    interpretGeneric: false,
  },
];

export const TA_SRC_LEN_BY_NAME: ReadonlyMap<string, TaSrcLenSpec> = new Map(
  TA_SRC_LEN_SPECS.map((spec) => [spec.name, spec]),
);

export type TaContextArg = "high" | "low" | "close" | "volume";

export interface TaOhlcvArgSpec {
  /** Accepted keyword names, in resolution order. */
  readonly names: readonly string[];
  /** Context fallback when the argument is omitted. */
  readonly context: TaContextArg;
}

export interface TaOhlcvSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  readonly args: readonly TaOhlcvArgSpec[];
}

const OHLCV: readonly TaOhlcvArgSpec[] = [
  { names: ["high"], context: "high" },
  { names: ["low"], context: "low" },
  { names: ["close"], context: "close" },
  { names: ["volume"], context: "volume" },
];

const CLOSE_VOLUME: readonly TaOhlcvArgSpec[] = [
  { names: ["source", "close"], context: "close" },
  { names: ["volume"], context: "volume" },
];

export const TA_OHLCV_SPECS: readonly TaOhlcvSpec[] = [
  { name: "obv", method: "obv", args: CLOSE_VOLUME },
  { name: "nvi", method: "nvi", args: CLOSE_VOLUME },
  { name: "pvi", method: "pvi", args: CLOSE_VOLUME },
  { name: "pvt", method: "pvt", args: CLOSE_VOLUME },
  { name: "vpt", method: "pvt", args: CLOSE_VOLUME },
  { name: "accdist", method: "accdist", args: OHLCV },
  { name: "ad", method: "accdist", args: OHLCV },
  { name: "wad", method: "wad", args: OHLCV },
];

export const TA_OHLCV_BY_NAME: ReadonlyMap<string, TaOhlcvSpec> = new Map(
  TA_OHLCV_SPECS.map((spec) => [spec.name, spec]),
);

export interface TaLenExtraSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  /** Context series prepended before the source/length slots. */
  readonly contextArgs: readonly TaContextArg[];
  /** True when slot 0 is a source argument; false when context supplies it. */
  readonly hasSourceArg: boolean;
  /** Positional index of the length argument. */
  readonly lengthIndex: number;
  /** Positional index of the trailing extra argument (mult/offset). */
  readonly extraIndex: number;
  /** Accepted names for the trailing extra argument. */
  readonly extraNames: readonly string[];
  readonly compileDefaultLength: number;
  readonly interpretDefaultLength: number;
  readonly compileDefaultExtra: number;
  readonly interpretDefaultExtra: number;
}

const MULT = ["mult", "multiplier"] as const;

export const TA_LEN_EXTRA_SPECS: readonly TaLenExtraSpec[] = [
  {
    name: "bbw",
    method: "bbw",
    contextArgs: [],
    hasSourceArg: true,
    lengthIndex: 1,
    extraIndex: 2,
    extraNames: MULT,
    compileDefaultLength: 0,
    interpretDefaultLength: 0,
    compileDefaultExtra: 2,
    interpretDefaultExtra: 2,
  },
  {
    name: "kcw",
    method: "kcw",
    contextArgs: ["high", "low", "close"],
    hasSourceArg: false,
    lengthIndex: 0,
    extraIndex: 1,
    extraNames: MULT,
    compileDefaultLength: 0,
    interpretDefaultLength: 0,
    compileDefaultExtra: 2,
    interpretDefaultExtra: 2,
  },
  {
    name: "bb_pct",
    method: "bbPct",
    contextArgs: ["close"],
    hasSourceArg: false,
    lengthIndex: 0,
    extraIndex: 1,
    extraNames: ["std_dev", "mult", "std"],
    compileDefaultLength: 0,
    interpretDefaultLength: 0,
    compileDefaultExtra: 2,
    interpretDefaultExtra: 2,
  },
  {
    name: "linreg",
    method: "linreg",
    contextArgs: [],
    hasSourceArg: true,
    lengthIndex: 1,
    extraIndex: 2,
    extraNames: ["offset"],
    compileDefaultLength: 0,
    interpretDefaultLength: 0,
    compileDefaultExtra: 0,
    interpretDefaultExtra: 0,
  },
];

export const TA_LEN_EXTRA_BY_NAME: ReadonlyMap<string, TaLenExtraSpec> =
  new Map(TA_LEN_EXTRA_SPECS.map((spec) => [spec.name, spec]));

export type TaCallArgSpec =
  | { readonly kind: "context"; readonly context: TaContextArg }
  | {
      readonly kind: "number";
      readonly names: readonly string[];
      readonly callIndex: number;
      readonly default: number;
      /** Gate on `_is_period_like` (integer) instead of finite coercion. */
      readonly periodLike?: boolean;
    }
  | {
      readonly kind: "condition";
      readonly names: readonly string[];
      readonly callIndex: number;
    }
  | {
      readonly kind: "source";
      readonly names: readonly string[];
      readonly callIndex: number;
      readonly default: "na" | "close" | "hlc3";
    }
  | {
      readonly kind: "value";
      readonly names: readonly string[];
      readonly callIndex: number;
    }
  | {
      readonly kind: "required";
      readonly names: readonly string[];
      readonly callIndex: number;
      /** Runtime error message when the argument is absent. */
      readonly message: string;
    }
  | {
      readonly kind: "typicalExplicit";
      readonly highIndex: number;
      readonly lowIndex: number;
      readonly closeIndex: number;
    }
  | { readonly kind: "typicalContext" }
  | {
      readonly kind: "periodPair";
      readonly firstIndex: number;
      readonly secondIndex: number;
      readonly firstName: string;
      readonly secondName: string;
      readonly fallback: number;
      /** Which slot wins when both are integer-like. */
      readonly pick?: "first" | "second";
    }
  | {
      readonly kind: "volumeSwap";
      readonly names: readonly string[];
      readonly callIndex: number;
    };

export interface TaContextCallSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  readonly args: readonly TaCallArgSpec[];
  /** False for stateless kernels without a call-site argument. */
  readonly hasSite?: boolean;
  /** Record fields to expose as a Pine tuple (e.g. dmi). */
  readonly tupleFields?: readonly string[];
}

const c = (context: TaContextArg): TaCallArgSpec => ({
  kind: "context",
  context,
});
const n = (
  callIndex: number,
  names: readonly string[] = ["length"],
  def = 0,
  periodLike = false,
): TaCallArgSpec => ({
  kind: "number",
  names,
  callIndex,
  default: def,
  periodLike,
});
const cond = (
  callIndex: number,
  names: readonly string[] = ["condition", "cond"],
): TaCallArgSpec => ({ kind: "condition", names, callIndex });
const source = (
  callIndex: number,
  names: readonly string[] = ["source", "series"],
  def: "na" | "close" | "hlc3" = "na",
): TaCallArgSpec => ({ kind: "source", names, callIndex, default: def });
const v = (callIndex: number, names: readonly string[]): TaCallArgSpec => ({
  kind: "value",
  names,
  callIndex,
});
const req = (
  callIndex: number,
  names: readonly string[],
  message: string,
): TaCallArgSpec => ({ kind: "required", names, callIndex, message });
const requiredArgs = (
  message: string,
  slots: readonly {
    readonly index: number;
    readonly names: readonly string[];
  }[],
): readonly TaCallArgSpec[] =>
  slots.map(({ index, names }) => req(index, names, message));
const typical = (
  highIndex: number,
  lowIndex: number,
  closeIndex: number,
): TaCallArgSpec => ({
  kind: "typicalExplicit",
  highIndex,
  lowIndex,
  closeIndex,
});
const typicalContext = (): TaCallArgSpec => ({ kind: "typicalContext" });
const periodPair = (
  firstIndex: number,
  secondIndex: number,
  firstName: string,
  secondName: string,
  fallback: number,
  pick: "first" | "second" = "second",
): TaCallArgSpec => ({
  kind: "periodPair",
  firstIndex,
  secondIndex,
  firstName,
  secondName,
  fallback,
  pick,
});
const volumeSwap = (
  callIndex: number,
  names: readonly string[] = ["volume"],
): TaCallArgSpec => ({ kind: "volumeSwap", names, callIndex });

export const TA_CONTEXT_CALL_SPECS: readonly TaContextCallSpec[] = [
  {
    name: "iii",
    method: "iii",
    args: [c("high"), c("low"), c("close"), c("volume")],
  },
  {
    name: "uo",
    method: "uo",
    args: [c("high"), c("low"), c("close"), n(0), n(1), n(2)],
  },
  { name: "dpo", method: "dpo", args: [c("close"), n(0)] },
  {
    name: "kst",
    method: "kst",
    args: [c("close"), n(0), n(1), n(2), n(3)],
  },
  {
    name: "stochrsi",
    method: "stochRsi",
    args: [c("close"), n(0), n(1)],
  },
  { name: "donchian", method: "donchian", args: [c("high"), c("low"), n(0)] },
  {
    name: "ichimoku",
    method: "ichimoku",
    args: [c("high"), c("low"), n(0), n(1)],
  },
  {
    name: "emv",
    method: "emv",
    args: [c("high"), c("low"), c("volume"), n(0)],
  },
  {
    name: "dmi",
    method: "dmi",
    args: [
      c("high"),
      c("low"),
      c("close"),
      n(0, ["diLength", "length"], 14),
      n(1, ["adxSmoothing", "adxlen"], 14),
    ],
    tupleFields: ["plus", "minus", "adx"],
  },
  { name: "fractal", method: "fractal", args: [c("high"), c("low"), n(0)] },
  {
    name: "macd",
    method: "macd",
    args: [
      source(0),
      n(1, ["fastlen", "fastLength", "fast"], 12),
      n(2, ["slowlen", "slowLength", "slow"], 26),
      n(3, ["signal", "signalLength", "siglen"], 9),
    ],
    tupleFields: ["macd", "signal", "hist"],
  },
  {
    name: "vwap",
    method: "vwap",
    args: [source(0, ["source", "series", "src"], "hlc3"), c("volume")],
  },
  {
    name: "alma",
    method: "alma",
    args: [
      source(0),
      n(1, ["length"], 0),
      n(2, ["offset"], 0.85),
      n(3, ["sigma"], 6),
    ],
  },
  {
    name: "kama",
    method: "kama",
    args: [
      source(0),
      n(1, ["length"], 0),
      n(2, ["fastLength", "fast", "fastlen"], 2),
      n(3, ["slowLength", "slow", "slowlen"], 30),
    ],
  },
  {
    name: "sar",
    method: "sar",
    args: [
      c("high"),
      c("low"),
      n(0, ["start"], 0.02),
      n(1, ["increment"], 0.02),
      n(2, ["maximum", "max"], 0.2),
    ],
  },
  {
    name: "correlation",
    method: "correlation",
    args: [source(0), v(1, ["source2", "b", "series2"]), n(2, ["length"], 0)],
  },
  { name: "rci", method: "rci", args: [source(0), n(1, ["length"], 0)] },
  {
    name: "percentile_nearest_rank",
    method: "percentileNearest",
    args: [source(0), n(1, ["length"], 0), n(2, ["percentage", "percent"], 50)],
  },
  {
    name: "percentile_linear_interpolation",
    method: "percentileLinear",
    args: [source(0), n(1, ["length"], 0), n(2, ["percentage", "percent"], 50)],
  },
  {
    name: "atr_stop",
    method: "atrStop",
    args: [
      c("close"),
      v(0, ["atr", "atr_value"]),
      n(1, ["multiplier", "mult"], 2),
    ],
  },
  {
    name: "zigzag",
    method: "zigzag",
    args: [source(0), n(1, ["threshold", "percent", "deviation"], 5)],
    tupleFields: ["high", "low", "dir"],
  },
  {
    name: "crossover",
    method: "crossover",
    args: [source(0), v(1, ["source2", "b", "series2"])],
  },
  {
    name: "crossunder",
    method: "crossunder",
    args: [source(0), v(1, ["source2", "b", "series2"])],
  },
  {
    name: "cross",
    method: "cross",
    args: [source(0), v(1, ["source2", "b", "series2"])],
  },
  {
    name: "apo",
    method: "apo",
    args: requiredArgs(
      "ta.apo() requires 3 arguments: series, fast_period, slow_period",
      [
        { index: 0, names: ["series", "source"] },
        { index: 1, names: ["fast_period", "fast"] },
        { index: 2, names: ["slow_period", "slow"] },
      ],
    ),
  },
  {
    name: "atr_normalized",
    method: "atrNormalized",
    args: requiredArgs(
      "ta.atr_normalized() requires 4 arguments: high, low, close, period",
      [
        { index: 0, names: ["high"] },
        { index: 1, names: ["low"] },
        { index: 2, names: ["close"] },
        { index: 3, names: ["period", "length"] },
      ],
    ),
  },
  {
    name: "beta",
    method: "beta",
    args: requiredArgs(
      "ta.beta() requires 3 arguments: series1, series2, length",
      [
        { index: 0, names: ["series1", "series", "source"] },
        { index: 1, names: ["series2", "series_b", "other"] },
        { index: 2, names: ["length", "period"] },
      ],
    ),
  },
  {
    name: "r_squared",
    method: "rSquared",
    args: requiredArgs(
      "ta.r_squared() requires 3 arguments: series1, series2, length",
      [
        { index: 0, names: ["series1", "series", "source"] },
        { index: 1, names: ["series2", "series_b", "other"] },
        { index: 2, names: ["length", "period"] },
      ],
    ),
  },
  {
    name: "comovement",
    method: "comovement",
    args: requiredArgs(
      "ta.comovement() requires 3 arguments: series1, series2, length",
      [
        { index: 0, names: ["series1", "series", "source"] },
        { index: 1, names: ["series2", "series_b", "other"] },
        { index: 2, names: ["length", "period"] },
      ],
    ),
  },
  {
    name: "skewness",
    method: "skewness",
    args: requiredArgs("ta.skewness() requires 2 arguments: series, period", [
      { index: 0, names: ["series", "source"] },
      { index: 1, names: ["period", "length"] },
    ]),
  },
  {
    name: "kurtosis",
    method: "kurtosis",
    args: requiredArgs("ta.kurtosis() requires 2 arguments: series, period", [
      { index: 0, names: ["series", "source"] },
      { index: 1, names: ["period", "length"] },
    ]),
  },
  {
    name: "volume_weighted_momentum",
    method: "volumeWeightedMomentum",
    args: requiredArgs(
      "ta.volume_weighted_momentum() requires 3 arguments: series, volume, length",
      [
        { index: 0, names: ["series", "source"] },
        { index: 1, names: ["volume"] },
        { index: 2, names: ["length", "period"] },
      ],
    ),
  },
  {
    name: "mean_reversion_score",
    method: "meanReversionScore",
    args: requiredArgs("ta.mean_reversion_score() requires 4 arguments", [
      { index: 0, names: ["close", "source"] },
      { index: 1, names: ["sma"] },
      { index: 2, names: ["stdev", "std_dev"] },
      { index: 3, names: ["period", "length"] },
    ]),
  },
  {
    name: "market_condition",
    method: "marketCondition",
    args: requiredArgs("ta.market_condition() requires 4 arguments", [
      { index: 0, names: ["close", "source"] },
      { index: 1, names: ["atr"] },
      { index: 2, names: ["sma_period", "sma_length"] },
      { index: 3, names: ["stdev_period", "stdev_length"] },
    ]),
  },
  {
    name: "order_flow_imbalance",
    method: "orderFlowImbalance",
    args: requiredArgs("ta.order_flow_imbalance() requires 5 arguments", [
      { index: 0, names: ["high"] },
      { index: 1, names: ["low"] },
      { index: 2, names: ["close"] },
      { index: 3, names: ["volume"] },
      { index: 4, names: ["period", "length"] },
    ]),
  },
  {
    name: "liquidity_score",
    method: "liquidityScore",
    args: requiredArgs("ta.liquidity_score() requires 4 arguments", [
      { index: 0, names: ["volume"] },
      { index: 1, names: ["volatility"] },
      { index: 2, names: ["spread"] },
      { index: 3, names: ["period", "length"] },
    ]),
  },
  {
    name: "fear_greed_index",
    method: "fearGreedIndex",
    hasSite: false,
    args: requiredArgs("ta.fear_greed_index() requires 4 arguments", [
      { index: 0, names: ["rsi"] },
      { index: 1, names: ["vix"] },
      { index: 2, names: ["put_call", "put_call_ratio"] },
      { index: 3, names: ["breadth"] },
    ]),
  },
  {
    name: "crowd_sentiment",
    method: "crowdSentiment",
    hasSite: false,
    args: requiredArgs("ta.crowd_sentiment() requires 3 arguments", [
      { index: 0, names: ["price_agreement", "price"] },
      { index: 1, names: ["volume_agreement", "volume"] },
      { index: 2, names: ["time_agreement", "time"] },
    ]),
  },
  {
    name: "smart_money_flow",
    method: "smartMoneyFlow",
    hasSite: false,
    args: requiredArgs("ta.smart_money_flow() requires 4 arguments", [
      { index: 0, names: ["price_change"] },
      { index: 1, names: ["volume"] },
      { index: 2, names: ["time_since_high", "time_high"] },
      { index: 3, names: ["time_since_low", "time_low"] },
    ]),
  },
  {
    name: "max_loss_level",
    method: "maxLossLevel",
    hasSite: false,
    args: requiredArgs("ta.max_loss_level() requires 3 arguments", [
      { index: 0, names: ["entry", "entry_price"] },
      { index: 1, names: ["account", "account_size"] },
      { index: 2, names: ["max_loss_pct", "max_loss_percent"] },
    ]),
  },
  {
    name: "profit_lock_level",
    method: "profitLockLevel",
    hasSite: false,
    args: requiredArgs("ta.profit_lock_level() requires 4 arguments", [
      { index: 0, names: ["entry", "entry_price"] },
      { index: 1, names: ["current", "current_price"] },
      { index: 2, names: ["trail_pct", "trail_percent"] },
      { index: 3, names: ["direction"] },
    ]),
  },
  {
    name: "hammer",
    method: "hammer",
    hasSite: false,
    args: requiredArgs(
      "ta.hammer() requires 4 arguments: open, high, low, close",
      [
        { index: 0, names: ["open"] },
        { index: 1, names: ["high"] },
        { index: 2, names: ["low"] },
        { index: 3, names: ["close"] },
      ],
    ),
  },
  {
    name: "gap_detector",
    method: "gapDetector",
    hasSite: false,
    args: requiredArgs(
      "ta.gap_detector() requires 3 arguments: high, low, prev_close",
      [
        { index: 0, names: ["high"] },
        { index: 1, names: ["low"] },
        { index: 2, names: ["prev_close", "prev"] },
      ],
    ),
  },
  {
    name: "macd_signal",
    method: "macdSignal",
    hasSite: false,
    args: requiredArgs(
      "ta.macd_signal() requires 2 arguments: macd_line, signal_line",
      [
        { index: 0, names: ["macd_line", "macd"] },
        { index: 1, names: ["signal_line", "signal"] },
      ],
    ),
  },
  {
    name: "double_top_bottom",
    method: "doubleTopBottom",
    args: requiredArgs("ta.double_top_bottom() requires 3 arguments", [
      { index: 0, names: ["high"] },
      { index: 1, names: ["low"] },
      { index: 2, names: ["period", "length"] },
    ]),
  },
  {
    name: "inside_bar_pattern",
    method: "insideBarPattern",
    args: requiredArgs("ta.inside_bar_pattern() requires 2 arguments", [
      { index: 0, names: ["high"] },
      { index: 1, names: ["low"] },
    ]),
  },
  {
    name: "acceleration_factor",
    method: "accelerationFactor",
    args: requiredArgs("ta.acceleration_factor() requires 2 arguments", [
      { index: 0, names: ["momentum_list", "momentum", "source", "series"] },
      { index: 1, names: ["period", "length"] },
    ]),
  },
  {
    name: "stoch_smooth",
    method: "stochSmooth",
    args: requiredArgs(
      "ta.stoch_smooth() requires 6 arguments: high, low, close, period, smooth_k, smooth_d",
      [
        { index: 0, names: ["high"] },
        { index: 1, names: ["low"] },
        { index: 2, names: ["close"] },
        { index: 3, names: ["period", "length"] },
        { index: 4, names: ["smooth_k", "k"] },
        { index: 5, names: ["smooth_d", "d"] },
      ],
    ),
  },
  {
    name: "position_sizing",
    method: "positionSizing",
    hasSite: false,
    args: requiredArgs("ta.position_sizing() requires 4 arguments", [
      { index: 0, names: ["account", "account_size"] },
      { index: 1, names: ["risk_pct", "risk_percent"] },
      { index: 2, names: ["entry", "entry_price"] },
      { index: 3, names: ["stop", "stop_price"] },
    ]),
  },
  {
    name: "kelly_criterion",
    method: "kellyCriterion",
    hasSite: false,
    args: requiredArgs("ta.kelly_criterion() requires 3 arguments", [
      { index: 0, names: ["win_rate"] },
      { index: 1, names: ["avg_win"] },
      { index: 2, names: ["avg_loss"] },
    ]),
  },
  {
    name: "risk_reward_ratio",
    method: "riskRewardRatio",
    hasSite: false,
    args: requiredArgs("ta.risk_reward_ratio() requires 3 arguments", [
      { index: 0, names: ["entry", "entry_price"] },
      { index: 1, names: ["stop", "stop_price"] },
      { index: 2, names: ["target", "target_price"] },
    ]),
  },
  {
    name: "risk_reward_asymmetry",
    method: "riskRewardAsymmetry",
    hasSite: false,
    args: requiredArgs("ta.risk_reward_asymmetry() requires 4 arguments", [
      { index: 0, names: ["entry", "entry_price"] },
      { index: 1, names: ["stop", "stop_price"] },
      { index: 2, names: ["target", "target_price"] },
      { index: 3, names: ["win_rate"] },
    ]),
  },
  {
    name: "probability_of_movement",
    method: "probabilityOfMovement",
    hasSite: false,
    args: requiredArgs("ta.probability_of_movement() requires 4 arguments", [
      { index: 0, names: ["current", "current_price"] },
      { index: 1, names: ["target", "target_price"] },
      { index: 2, names: ["atr"] },
      { index: 3, names: ["period", "length"] },
    ]),
  },
  {
    name: "trend_strength",
    method: "trendStrength",
    hasSite: false,
    args: requiredArgs("ta.trend_strength() requires 3 arguments", [
      { index: 0, names: ["price", "source"] },
      { index: 1, names: ["adx"] },
      { index: 2, names: ["rsi"] },
    ]),
  },
  {
    name: "breakeven_level",
    method: "breakevenLevel",
    hasSite: false,
    args: requiredArgs("ta.breakeven_level() requires 5 arguments", [
      { index: 0, names: ["entry", "entry_price"] },
      { index: 1, names: ["quantity", "qty"] },
      { index: 2, names: ["commission"] },
      { index: 3, names: ["slippage"] },
      { index: 4, names: ["direction"] },
    ]),
  },
  {
    name: "position_sizing_score",
    method: "positionSizingScore",
    hasSite: false,
    args: requiredArgs("ta.position_sizing_score() requires 4 arguments", [
      { index: 0, names: ["account_risk", "risk"] },
      { index: 1, names: ["volatility"] },
      { index: 2, names: ["conviction"] },
      { index: 3, names: ["correlation"] },
    ]),
  },
  {
    name: "trailing_exit_level",
    method: "trailingExitLevel",
    hasSite: false,
    args: requiredArgs("ta.trailing_exit_level() requires 5 arguments", [
      { index: 0, names: ["entry", "entry_price"] },
      { index: 1, names: ["current", "current_price"] },
      { index: 2, names: ["atr"] },
      { index: 3, names: ["multiplier", "mult"] },
      { index: 4, names: ["step"] },
    ]),
  },
  {
    name: "multi_timeframe_signal",
    method: "multiTimeframeSignal",
    hasSite: false,
    args: requiredArgs("ta.multi_timeframe_signal() requires 6 arguments", [
      { index: 0, names: ["s1", "signal1"] },
      { index: 1, names: ["s2", "signal2"] },
      { index: 2, names: ["s3", "signal3"] },
      { index: 3, names: ["w1", "weight1"] },
      { index: 4, names: ["w2", "weight2"] },
      { index: 5, names: ["w3", "weight3"] },
    ]),
  },
  {
    name: "market_timing_index",
    method: "marketTimingIndex",
    hasSite: false,
    args: requiredArgs("ta.market_timing_index() requires 4 arguments", [
      { index: 0, names: ["trend"] },
      { index: 1, names: ["momentum"] },
      { index: 2, names: ["volatility"] },
      { index: 3, names: ["sentiment"] },
    ]),
  },
  {
    name: "strategy_score",
    method: "strategyScore",
    hasSite: false,
    args: requiredArgs("ta.strategy_score() requires 4 arguments", [
      { index: 0, names: ["rsi"] },
      { index: 1, names: ["macd"] },
      { index: 2, names: ["ema_cross"] },
      { index: 3, names: ["trend"] },
    ]),
  },
  {
    name: "ema_cross_signal",
    method: "emaCrossSignal",
    args: requiredArgs("ta.ema_cross_signal() requires 3 arguments", [
      { index: 0, names: ["fast_ema", "fast"] },
      { index: 1, names: ["slow_ema", "slow"] },
      { index: 2, names: ["threshold"] },
    ]),
  },
  {
    name: "momentum_filter",
    method: "momentumFilter",
    args: requiredArgs("ta.momentum_filter() requires 3 arguments", [
      { index: 0, names: ["momentum_raw", "momentum"] },
      { index: 1, names: ["volume"] },
      { index: 2, names: ["period", "length"] },
    ]),
  },
  {
    name: "volatility_regime",
    method: "volatilityRegime",
    args: requiredArgs("ta.volatility_regime() requires 2 arguments", [
      { index: 0, names: ["atr_series", "atr", "source"] },
      { index: 1, names: ["period", "length"] },
    ]),
  },
  {
    name: "economic_impact_score",
    method: "economicImpactScore",
    hasSite: false,
    args: requiredArgs("ta.economic_impact_score() requires 3 arguments", [
      { index: 0, names: ["price_change"] },
      { index: 1, names: ["volatility"] },
      { index: 2, names: ["volume_change"] },
    ]),
  },
  {
    name: "contrarian_signal",
    method: "contrarianSignal",
    hasSite: false,
    args: requiredArgs("ta.contrarian_signal() requires 3 arguments", [
      { index: 0, names: ["sentiment"] },
      { index: 1, names: ["volatility"] },
      { index: 2, names: ["time_since_extreme", "time_extreme"] },
    ]),
  },
  {
    name: "drawdown_recovery_level",
    method: "drawdownRecoveryLevel",
    hasSite: false,
    args: requiredArgs("ta.drawdown_recovery_level() requires 4 arguments", [
      { index: 0, names: ["peak"] },
      { index: 1, names: ["current", "current_price"] },
      { index: 2, names: ["recovery_factor", "factor"] },
      { index: 3, names: ["period", "length"] },
    ]),
  },
];

export const TA_CONTEXT_CALL_BY_NAME: ReadonlyMap<string, TaContextCallSpec> =
  new Map(TA_CONTEXT_CALL_SPECS.map((spec) => [spec.name, spec]));

export const TA_CONDITION_CALL_SPECS: readonly TaContextCallSpec[] = [
  { name: "barssince", method: "barssince", args: [cond(0)] },
  {
    name: "cum",
    method: "cum",
    args: [source(0, ["source", "series", "src"], "na")],
  },
  {
    name: "valuewhen",
    method: "valuewhen",
    args: [cond(0), source(1), n(2, ["occurrence", "occ"], 0)],
  },
];

export const TA_CONDITION_CALL_BY_NAME: ReadonlyMap<string, TaContextCallSpec> =
  new Map(TA_CONDITION_CALL_SPECS.map((spec) => [spec.name, spec]));

export interface TaOverloadVariant {
  /** Select when the call has at least this many positional arguments. */
  readonly minPositional?: number;
  /** Select when the call has at most this many positional arguments. */
  readonly maxPositional?: number;
  /** Select only when the call has exactly this many positional arguments. */
  readonly positional?: number;
  /** Select only when at least one of these keywords is present. */
  readonly requiresKwarg?: readonly string[];
  /** Select only when none of these keywords is present. */
  readonly forbidsKwarg?: readonly string[];
  readonly args: readonly TaCallArgSpec[];
}

export interface TaOverloadSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  /** Ordered variants; the first matching one wins. */
  readonly variants: readonly TaOverloadVariant[];
  /** Record fields to expose as a Pine tuple (e.g. kc). */
  readonly tupleFields?: readonly string[];
}

const WILLR_VARIANTS: readonly TaOverloadVariant[] = [
  {
    minPositional: 4,
    args: [v(0, ["high"]), v(1, ["low"]), v(2, ["close"]), v(3, ["length"])],
  },
  {
    args: [c("high"), c("low"), c("close"), n(0, ["length"], 0, true)],
  },
];

const OHLC_LENGTH_VARIANTS: readonly TaOverloadVariant[] = [
  {
    minPositional: 4,
    args: [v(0, ["high"]), v(1, ["low"]), v(2, ["close"]), v(3, ["length"])],
  },
  {
    args: [c("high"), c("low"), c("close"), n(0, ["length"], 0, true)],
  },
];

const HIGH_LOW_VARIANTS = (
  context: TaContextArg,
): readonly TaOverloadVariant[] => [
  {
    maxPositional: 1,
    forbidsKwarg: ["source", "series"],
    args: [c(context), n(0, ["length"], 0, true)],
  },
  { args: [source(0), n(1, ["length"], 0)] },
];

export const TA_OVERLOAD_SPECS: readonly TaOverloadSpec[] = [
  { name: "highest", method: "highest", variants: HIGH_LOW_VARIANTS("high") },
  { name: "lowest", method: "lowest", variants: HIGH_LOW_VARIANTS("low") },
  { name: "willr", method: "willr", variants: WILLR_VARIANTS },
  { name: "wpr", method: "willr", variants: WILLR_VARIANTS },
  { name: "atr", method: "atr", variants: OHLC_LENGTH_VARIANTS },
  {
    name: "kc",
    method: "kc",
    tupleFields: ["mid", "up", "lo"],
    variants: [
      {
        minPositional: 4,
        args: [
          v(0, ["high"]),
          v(1, ["low"]),
          v(2, ["close"]),
          n(3, ["length"], 0),
          n(4, ["mult", "multiplier"], 1),
        ],
      },
      {
        args: [
          c("high"),
          c("low"),
          source(0),
          n(1, ["length"], 0, true),
          n(2, ["mult", "multiplier"], 1),
        ],
      },
    ],
  },
  {
    name: "tsi",
    method: "tsi",
    variants: [
      {
        positional: 2,
        args: [
          c("close"),
          n(1, ["long", "long_length"], 25, true),
          n(0, ["short", "short_length"], 13, true),
        ],
      },
      {
        args: [
          source(0),
          n(2, ["long", "long_length"], 25),
          n(1, ["short", "short_length"], 13),
        ],
      },
    ],
  },
  {
    name: "wvad",
    method: "wvad",
    variants: [
      {
        minPositional: 4,
        args: [
          v(0, ["high"]),
          v(1, ["low"]),
          v(2, ["close"]),
          v(3, ["volume"]),
          n(4, ["length", "period"], 20),
        ],
      },
      {
        args: [
          c("high"),
          c("low"),
          c("close"),
          c("volume"),
          n(0, ["length", "period"], 20, true),
        ],
      },
    ],
  },
  {
    name: "cmf",
    method: "cmf",
    variants: [
      {
        minPositional: 5,
        args: [
          v(1, ["high"]),
          v(2, ["low"]),
          v(0, ["close", "source"]),
          v(3, ["volume"]),
          n(4, ["length", "period"], 20),
        ],
      },
      {
        args: [
          c("high"),
          c("low"),
          c("close"),
          c("volume"),
          n(0, ["length", "period"], 20, true),
        ],
      },
    ],
  },
  {
    name: "klinger",
    method: "klinger",
    variants: [
      {
        args: [
          v(2, ["close"]),
          v(3, ["volume"]),
          n(4, ["fast_period", "fast", "fastlen"], 0),
          n(5, ["slow_period", "slow", "slowlen"], 0),
        ],
      },
    ],
  },
  {
    name: "vwma",
    method: "vwma",
    variants: [
      {
        maxPositional: 1,
        forbidsKwarg: ["volume"],
        args: [c("close"), c("volume"), n(0, ["length"], 0, true)],
      },
      {
        minPositional: 3,
        args: [source(0), volumeSwap(1), n(2, ["length", "period"], 0)],
      },
      {
        requiresKwarg: ["volume"],
        args: [source(0), volumeSwap(1), n(2, ["length", "period"], 0)],
      },
      {
        args: [source(0), c("volume"), n(1, ["length"], 0)],
      },
    ],
  },
  {
    name: "highestbars",
    method: "highestbars",
    variants: [
      {
        maxPositional: 1,
        forbidsKwarg: ["source", "series"],
        args: [c("high"), n(0, ["length"], 0, true)],
      },
      { args: [source(0), n(1, ["length"], 0)] },
    ],
  },
  {
    name: "lowestbars",
    method: "lowestbars",
    variants: [
      {
        maxPositional: 1,
        forbidsKwarg: ["source", "series"],
        args: [c("low"), n(0, ["length"], 0, true)],
      },
      { args: [source(0), n(1, ["length"], 0)] },
    ],
  },
  {
    name: "stoch",
    method: "stoch",
    variants: [
      {
        positional: 2,
        forbidsKwarg: ["high"],
        args: [
          c("close"),
          c("high"),
          c("low"),
          periodPair(0, 1, "length", "d", 0, "first"),
        ],
      },
      {
        maxPositional: 1,
        forbidsKwarg: ["high"],
        args: [c("close"), c("high"), c("low"), n(0, ["length"], 0, true)],
      },
      {
        args: [source(0), v(1, ["high"]), v(2, ["low"]), n(3, ["length"], 0)],
      },
    ],
  },
  {
    name: "adx",
    method: "adx",
    variants: [
      {
        minPositional: 4,
        args: [
          v(0, ["source", "series"]),
          v(1, ["low"]),
          v(2, ["close"]),
          n(3, ["length"], 0),
        ],
      },
      {
        positional: 2,
        forbidsKwarg: ["high", "low", "close"],
        args: [
          c("high"),
          c("low"),
          c("close"),
          periodPair(0, 1, "diLength", "adxSmoothing", 14),
        ],
      },
      {
        args: [c("high"), c("low"), c("close"), n(0, ["length"], 14, true)],
      },
    ],
  },
  {
    name: "cci",
    method: "cci",
    variants: [
      {
        minPositional: 4,
        args: [typical(0, 1, 2), n(3, ["length"], 0)],
      },
      {
        minPositional: 2,
        args: [source(0), n(1, ["length"], 0)],
      },
      {
        requiresKwarg: ["source", "series"],
        args: [source(0), n(1, ["length"], 0)],
      },
      {
        forbidsKwarg: ["source", "series"],
        args: [typicalContext(), n(0, ["length"], 0, true)],
      },
    ],
  },
  {
    name: "mfi",
    method: "mfi",
    variants: [
      {
        minPositional: 3,
        args: [
          v(0, ["high"]),
          v(1, ["low"]),
          v(2, ["close"]),
          v(3, ["volume"]),
          n(4, ["length"], 0),
        ],
      },
      {
        minPositional: 2,
        args: [
          source(0),
          source(0),
          source(0),
          c("volume"),
          n(1, ["length"], 0),
        ],
      },
      {
        args: [
          c("high"),
          c("low"),
          c("close"),
          c("volume"),
          n(0, ["length"], 0, true),
        ],
      },
    ],
  },
];

export const TA_OVERLOAD_BY_NAME: ReadonlyMap<string, TaOverloadSpec> = new Map(
  TA_OVERLOAD_SPECS.map((spec) => [spec.name, spec]),
);

export interface TaRuntimePeriodFirstSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  /** Context source used by the period-first form. */
  readonly contextSource: TaContextArg;
  /** Period-first `(length, mult)` slot names/default. */
  readonly periodFirst: {
    readonly lengthNames: readonly string[];
    readonly multNames: readonly string[];
    readonly multDefault: number;
  };
  /** Series-form arguments. */
  readonly series: readonly TaCallArgSpec[];
  /** Record fields to expose as a Pine tuple. */
  readonly tupleFields?: readonly string[];
}

export const TA_RUNTIME_PERIOD_FIRST_SPECS: readonly TaRuntimePeriodFirstSpec[] =
  [
    {
      name: "bb",
      method: "bb",
      contextSource: "close",
      periodFirst: {
        lengthNames: ["source", "series", "length"],
        multNames: ["mult", "multiplier"],
        multDefault: Number.NaN,
      },
      series: [source(0), n(1, ["length"], 0), n(2, ["mult", "multiplier"], 2)],
      tupleFields: ["mid", "up", "lo"],
    },
  ];

export const TA_RUNTIME_PERIOD_FIRST_BY_NAME: ReadonlyMap<
  string,
  TaRuntimePeriodFirstSpec
> = new Map(TA_RUNTIME_PERIOD_FIRST_SPECS.map((spec) => [spec.name, spec]));

/**
 * Python's legacy `_merge_kwargs_into_args` path: positional values first,
 * then keyword values appended in source order with their names ignored.
 * Each period slot gates on `_is_period_like`; non-integers use the default.
 */
export interface TaMergedKwargSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  /** Context series prepended before the merged arguments. */
  readonly contextArgs: readonly TaContextArg[];
  /** Period-like slots after the context args, with their fallback defaults. */
  readonly periodDefaults: readonly number[];
  /** Record fields to expose as a Pine tuple. */
  readonly tupleFields?: readonly string[];
}

export const TA_MERGED_KWARG_SPECS: readonly TaMergedKwargSpec[] = [
  {
    name: "ao",
    method: "ao",
    contextArgs: ["high", "low"],
    periodDefaults: [5, 34],
  },
  {
    name: "aroon",
    method: "aroon",
    contextArgs: ["high", "low"],
    periodDefaults: [14],
    tupleFields: ["down", "up"],
  },
];

export const TA_MERGED_KWARG_BY_NAME: ReadonlyMap<string, TaMergedKwargSpec> =
  new Map(TA_MERGED_KWARG_SPECS.map((spec) => [spec.name, spec]));

/**
 * Two positional period slots that must both be integer-like for the context
 * form; otherwise the call falls through to the series form (`pivothigh` /
 * `pivotlow`).
 */
export interface TaRuntimePairGateSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  /** Context series used by the gated form. */
  readonly contextSource: TaContextArg;
  /** Slots gated on `_is_period_like`; both must pass. */
  readonly gate: {
    readonly firstIndex: number;
    readonly firstNames: readonly string[];
    readonly secondIndex: number;
    readonly secondNames: readonly string[];
  };
  /** Fallback series-form arguments. */
  readonly series: readonly TaCallArgSpec[];
}

const PIVOT_SERIES: readonly TaCallArgSpec[] = [
  source(0),
  n(1, ["leftbars", "left"], 5),
  n(2, ["rightbars", "right"], 5),
];

const PIVOT_GATE = {
  firstIndex: 0,
  firstNames: ["leftbars", "left"],
  secondIndex: 1,
  secondNames: ["rightbars", "right"],
} as const;

export const TA_RUNTIME_PAIR_GATE_SPECS: readonly TaRuntimePairGateSpec[] = [
  {
    name: "pivothigh",
    method: "pivothigh",
    contextSource: "high",
    gate: PIVOT_GATE,
    series: PIVOT_SERIES,
  },
  {
    name: "pivotlow",
    method: "pivotlow",
    contextSource: "low",
    gate: PIVOT_GATE,
    series: PIVOT_SERIES,
  },
];

export const TA_RUNTIME_PAIR_GATE_BY_NAME: ReadonlyMap<
  string,
  TaRuntimePairGateSpec
> = new Map(TA_RUNTIME_PAIR_GATE_SPECS.map((spec) => [spec.name, spec]));
