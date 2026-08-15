/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Public compile surface. Names match Python pynescript.compiler where they
 * apply: compileScript, transpile, CompiledScript, clearCompileCache.
 * Backend is JS emit only (Python object-mode analog — no Numba).
 */
export {
  CompileError,
  CompileEmitError,
  CompileIneligibleError,
  CompileLoadError,
} from "./types.ts";
export type {
  CompileBackend,
  CompileCacheStats,
  CompileEligibility,
  CompilePlotMeta,
  CompiledScript,
  RuntimeMode,
} from "./types.ts";
export {
  compileEligible,
  compileScript,
  clearCompileCache,
  compileCacheStats,
  transpile,
  runScript,
  compileToResult,
} from "./engine.ts";
export { emitScript } from "./emit.ts";
