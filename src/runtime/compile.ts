/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Root entry for the compile submodule — its only public face.
 */
export * from "./compile/index.ts";

// Compile-kernel internals, re-exported so the package's own unit tests can
// import them through this entry point instead of reaching into the module's
// private subfolders. Not promoted on the package barrel (src/index.ts).
export {
  NA,
  defaultTime,
  defaultVolume,
  histGet,
  histStore,
  hold,
  isNaCell,
  naNum,
  nz,
  pineEq,
  pineGt,
  pineGtE,
  pineLt,
  pineLtE,
  pineNe,
  safeAdd,
  safeDiv,
  safeMod,
  safeMul,
  safeNeg,
  safeSub,
  toFloatArr,
} from "./compile/helpers.ts";
export { createCompileHelpers } from "./compile/runtime.ts";
export {
  compileArray,
  compileMap,
  compileMatrix,
} from "./compile/collections.ts";
