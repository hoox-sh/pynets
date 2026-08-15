/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { parse, Runtime } from "../src/index.ts";

const BARS = [1, 2, 3, 4].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const LIB_SRC = `//@version=5
library("Geom")
export add1(float x) =>
    x + 1
`;

const REGISTERED_SRC = `//@version=5
indicator("t")
import User/Geom/1 as g
plot(g.add1(close))
`;

const UNRESOLVED_PLOT_CLOSE_SRC = `//@version=5
indicator("t")
import foo/bar/1
plot(close)
`;

const UNRESOLVED_LIB_CALL_SRC = `//@version=5
indicator("t")
import foo/bar/1 as g
plot(g.add1(close))
`;

const FORMAT_SRC = `//@version=5
indicator("fmt")
plot(str.tonumber(str.format("{0}", 3)))
`;

function parseOk(source: string): boolean {
  try {
    parse(source);
    return true;
  } catch {
    return false;
  }
}

function lastPlot(plots: Array<number | null> | undefined): number | null {
  if (plots == null || plots.length === 0) return null;
  const v = plots[plots.length - 1];
  return v == null ? null : v;
}

function lastClose(): number {
  return BARS[BARS.length - 1]!.close;
}

function interpretRegistered(): { ok: boolean; plots: Array<number | null> } {
  const rt = new Runtime("TEST");
  rt.registerLibrarySource("User", "Geom", 1, LIB_SRC);
  const out = rt.run(REGISTERED_SRC, BARS);
  return { ok: out.error == null && lastPlot(out.plots) === lastClose() + 1, plots: out.plots };
}

function compileRegistered(): { ok: boolean; error?: string; plots: Array<number | null> } {
  const rt = new Runtime("TEST", { mode: "compile" });
  rt.registerLibrarySource("User", "Geom", 1, LIB_SRC);
  const out = rt.run(REGISTERED_SRC, BARS);
  return {
    ok: out.error == null && lastPlot(out.plots) === lastClose() + 1,
    error: out.error,
    plots: out.plots,
  };
}

const parsedLib = parseOk(LIB_SRC);
const parsedUse = parseOk(REGISTERED_SRC);
const interpretExport = parsedLib && parsedUse ? interpretRegistered() : { ok: false, plots: [] };
const compileExport = parsedLib && parsedUse && interpretExport.ok ? compileRegistered() : { ok: false, plots: [] };

describe("compile vs interpret import", () => {
  test.skipIf(!parsedLib || !parsedUse || !interpretExport.ok || !compileExport.ok)(
    "registered library add1 compile last is close+1 matching interpret",
    () => {
      const compiled = compileRegistered();
      const interpreted = interpretRegistered();
      expect(compiled.error).toBeUndefined();
      expect(lastPlot(interpreted.plots)).toBe(lastClose() + 1);
      expect(lastPlot(compiled.plots)).toBe(lastClose() + 1);
      expect(compiled.plots).toEqual(interpreted.plots);
    },
  );

  test.skipIf(!parseOk(UNRESOLVED_PLOT_CLOSE_SRC))(
    "unresolved import + plot(close) compile last equals close",
    () => {
      const compiled = new Runtime("TEST", { mode: "compile" }).run(UNRESOLVED_PLOT_CLOSE_SRC, BARS);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(lastPlot(compiled.plots)).toBe(lastClose());
      expect(compiled.plots).toEqual(BARS.map((b) => b.close));
    },
  );

  test.skipIf(!parseOk(UNRESOLVED_LIB_CALL_SRC))(
    "unresolved import library call compile last is na",
    () => {
      const compiled = new Runtime("TEST", { mode: "compile" }).run(UNRESOLVED_LIB_CALL_SRC, BARS);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(lastPlot(compiled.plots)).toBeNull();
      expect(compiled.plots.every((v) => v == null)).toBe(true);
    },
  );

  test.skipIf(!parseOk(FORMAT_SRC))(
    "str.tonumber(str.format(\"{0}\", 3)) compile last is 3",
    () => {
      const compiled = new Runtime("TEST", { mode: "compile" }).run(FORMAT_SRC, BARS);
      const interpreted = new Runtime("TEST").run(FORMAT_SRC, BARS);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(lastPlot(compiled.plots)).toBe(3);
      if (interpreted.error == null) expect(compiled.plots).toEqual(interpreted.plots);
    },
  );
});
