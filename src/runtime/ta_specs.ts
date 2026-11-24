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
      readonly default: "na" | "close";
    }
  | {
      readonly kind: "value";
      readonly names: readonly string[];
      readonly callIndex: number;
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
    };

export interface TaContextCallSpec {
  /** Pine name without the `ta.` prefix. */
  readonly name: string;
  /** `TaEngine` method (camelCase). */
  readonly method: string;
  readonly args: readonly TaCallArgSpec[];
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
  def: "na" | "close" = "na",
): TaCallArgSpec => ({ kind: "source", names, callIndex, default: def });
const v = (callIndex: number, names: readonly string[]): TaCallArgSpec => ({
  kind: "value",
  names,
  callIndex,
});
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
  { name: "fractal", method: "fractal", args: [c("high"), c("low"), n(0)] },
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

export const TA_OVERLOAD_SPECS: readonly TaOverloadSpec[] = [
  { name: "willr", method: "willr", variants: WILLR_VARIANTS },
  { name: "wpr", method: "willr", variants: WILLR_VARIANTS },
  { name: "atr", method: "atr", variants: OHLC_LENGTH_VARIANTS },
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
