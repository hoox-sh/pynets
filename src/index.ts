/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Stable public surface — TypeScript counterpart of `pynescript`.
 * parse / unparse / dump / Runtime.run match Python names. Do not re-export
 * generated ANTLR, parser internals, or CLI helpers from this barrel.
 */
export { dump, parse, tokenize, unparse, PinescriptSyntaxError } from "./ast/helper.ts";
export type { ParseMode } from "./ast/helper.ts";
export type { AST, Script, Expression } from "./ast/nodes.ts";
export { Runtime, RuntimeStream, interpret, interpretTree } from "./runtime/interpret.ts";
export type {
  DrawingEvent,
  InputOverrides,
  OHLCVBar,
  RuntimeFill,
  RuntimeOptions,
  RuntimeResult,
  StrategyEvent,
  StreamEvent,
} from "./runtime/interpret.ts";
export { NA, PineSeries } from "./runtime/series.ts";
export { TaEngine } from "./runtime/ta.ts";
export type { BrokerSettings, StrategySummary } from "./runtime/strategy.ts";
export { PineArray } from "./runtime/array.ts";
export { PineMap } from "./runtime/map.ts";
export { PineMatrix } from "./runtime/matrix.ts";
export { DrawingBook } from "./runtime/drawings.ts";
export { MemoryProvider, StaticMapProvider, JsonBarProvider, ProviderError, mapJsonBars } from "./runtime/provider.ts";
export type { BarProvider, ProviderBar, JsonBarProviderOptions } from "./runtime/provider.ts";
export {
  LibraryModule,
  LibraryRegistry,
  createStubModule,
  applyStubExport,
  STUB_KNOWN_EXPORTS,
} from "./runtime/library.ts";
export { timestamp, timestampFromComponents, parseTimestampString, weekOfYear, timeTradingDay, utcPartsFromMs } from "./runtime/time.ts";
export type { UtcParts } from "./runtime/time.ts";
export { LogBook } from "./runtime/log.ts";
export type { LogLevel, LogRecord } from "./runtime/log.ts";
export { TickerId, tickerNew, tickerHeikinashi, tickerStandard } from "./runtime/ticker.ts";
export { UdtType, UdtInstance, EnumType, EnumMember } from "./runtime/udt.ts";
