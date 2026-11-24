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
