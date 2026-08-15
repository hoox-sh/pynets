/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  compileScript,
  transpile,
  compileEligible,
  clearCompileCache,
  compileCacheStats,
} from "../src/runtime/compile/index.ts";
import { runScript } from "../src/runtime/compile/engine.ts";
import { Runtime } from "../src/index.ts";

const CLOSES = [1, 2, 3, 4];
const BARS = CLOSES.map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

const SMA_SRC = `//@version=5
indicator("sma")
plot(ta.sma(close, 3))
`;

const EMA_SRC = `//@version=5
indicator("ema")
plot(ta.ema(close, 2))
`;

const LOOKBACK_SRC = `//@version=5
indicator("lookback")
plot(close[1])
`;

const NA_EQ_NA_SRC = `//@version=5
indicator("na_eq_na")
plot(na == na ? 1 : 0)
`;

const ONE_EQ_NA_SRC = `//@version=5
indicator("one_eq_na")
plot(1 == na ? 1 : 0)
`;

const NZ_NA_SRC = `//@version=5
indicator("nz_na")
plot(nz(na))
`;

function firstCompilePlot(source: string): Array<number | null> {
  const compiled = compileScript(source);
  const out = runScript(source, BARS);
  const title = compiled.plots[0]?.title;
  if (title != null && Array.isArray(out[title])) return out[title]!;
  const series = Object.values(out).find((v) => Array.isArray(v));
  return series ?? [];
}

function interpretPlots(source: string): Array<number | null> {
  const out = new Runtime().run(source, BARS);
  if (out.error) throw new Error(out.error);
  return out.plots;
}

function pythonRuntimePlots(source: string): Array<number | null> | null {
  const py = `
import json, math, os, sys
sys.path.insert(0, ${JSON.stringify("/home/jango/Git/pynescript/src")})
from pynescript.runtime import Runtime
src = ${JSON.stringify(source)}
bars = ${JSON.stringify(BARS)}
out = Runtime().run(src, bars)
plots = out.get("plots") or []
def cell(v):
    if v is None:
        return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    return v
print(json.dumps([cell(v) for v in plots]))
`;
  try {
    const proc = Bun.spawnSync(["python3", "-c", py], {
      cwd: "/home/jango/Git/pynescript",
      env: { ...process.env, PYTHONPATH: "/home/jango/Git/pynescript/src" },
      stdout: "pipe",
      stderr: "pipe",
    });
    if (proc.exitCode !== 0) return null;
    const parsed = JSON.parse(proc.stdout.toString().trim());
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

describe("compileEligible", () => {
  test("rejects import foo/bar/1", () => {
    const src = `//@version=5
indicator("lib")
import foo/bar/1
plot(close)
`;
    const elig = compileEligible(src);
    expect(elig.ok).toBe(false);
    expect(elig.reason ?? "").toMatch(/import/i);
  });

  test("accepts source containing request.security", () => {
    const src = `//@version=5
indicator("sec")
plot(request.security("X", "1D", close))
`;
    const elig = compileEligible(src);
    expect(elig.ok).toBe(true);
  });
});

describe("transpile", () => {
  test("emitted string contains execute_script_compiled", () => {
    const code = transpile(SMA_SRC);
    expect(code).toContain("execute_script_compiled");
  });
});

describe("compile vs interpret plots", () => {
  test("SMA 3 on close [1,2,3,4] matches interpret Runtime.run plots", () => {
    const compiled = firstCompilePlot(SMA_SRC);
    const interpreted = interpretPlots(SMA_SRC);
    expect(interpreted).toEqual([null, null, 2, 3]);
    expect(compiled).toEqual(interpreted);
    const py = pythonRuntimePlots(SMA_SRC);
    if (py != null) expect(compiled).toEqual(py);
  });

  test("ema(close, 2) matches interpret Runtime.run plots", () => {
    const compiled = firstCompilePlot(EMA_SRC);
    const interpreted = interpretPlots(EMA_SRC);
    expect(compiled).toEqual(interpreted);
  });

  test("plot(close[1]) first bar is na then previous close", () => {
    const compiled = firstCompilePlot(LOOKBACK_SRC);
    const interpreted = interpretPlots(LOOKBACK_SRC);
    expect(interpreted).toEqual([null, 1, 2, 3]);
    expect(compiled).toEqual(interpreted);
    expect(compiled[0]).toBeNull();
    expect(compiled.slice(1)).toEqual([1, 2, 3]);
  });

  test("na == na is true: plot last value is 1", () => {
    const compiled = firstCompilePlot(NA_EQ_NA_SRC);
    const interpreted = interpretPlots(NA_EQ_NA_SRC);
    expect(interpreted.at(-1)).toBe(1);
    expect(compiled).toEqual(interpreted);
    expect(compiled.at(-1)).toBe(1);
  });

  test("1 == na is false: plot last value is 0", () => {
    const compiled = firstCompilePlot(ONE_EQ_NA_SRC);
    const interpreted = interpretPlots(ONE_EQ_NA_SRC);
    expect(interpreted.at(-1)).toBe(0);
    expect(compiled).toEqual(interpreted);
    expect(compiled.at(-1)).toBe(0);
  });

  test("nz(na) is 0", () => {
    const compiled = firstCompilePlot(NZ_NA_SRC);
    const interpreted = interpretPlots(NZ_NA_SRC);
    expect(interpreted.at(-1)).toBe(0);
    expect(compiled).toEqual(interpreted);
    expect(compiled.at(-1)).toBe(0);
  });
});

describe("compile cache", () => {
  test("clearCompileCache + compileCacheStats", () => {
    compileScript(SMA_SRC);
    expect(compileCacheStats().source_entries).toBeGreaterThan(0);
    clearCompileCache();
    const stats = compileCacheStats();
    expect(stats.source_entries).toBe(0);
    expect(stats.source_max).toBeGreaterThan(0);
  });

  test("compile twice same source reuses cache (source_entries does not grow unbounded)", () => {
    clearCompileCache();
    expect(compileCacheStats().source_entries).toBe(0);
    compileScript(SMA_SRC);
    expect(compileCacheStats().source_entries).toBe(1);
    compileScript(SMA_SRC);
    compileScript(SMA_SRC);
    expect(compileCacheStats().source_entries).toBe(1);
    compileScript(EMA_SRC);
    expect(compileCacheStats().source_entries).toBe(2);
    for (let i = 0; i < 8; i++) compileScript(SMA_SRC);
    expect(compileCacheStats().source_entries).toBe(2);
  });
});

describe("Runtime mode", () => {
  test("mode=compile matches interpret SMA plots", () => {
    const compiled = new Runtime("TEST", { mode: "compile" }).run(SMA_SRC, BARS);
    const interpreted = new Runtime("TEST").run(SMA_SRC, BARS);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
    expect(compiled.plots).toEqual(interpreted.plots);
  });

  test("mode=auto compiles SMA and falls back on import", () => {
    const ok = new Runtime("TEST", { mode: "auto" }).run(SMA_SRC, BARS);
    expect(ok.error).toBeUndefined();
    expect(ok.auto_backend).toBe("compile");
    const src = `//@version=5
indicator("lib")
import foo/bar/1
plot(close)
`;
    const fb = new Runtime("TEST", { mode: "auto" }).run(src, BARS);
    expect(fb.mode).toBe("interpret");
    expect(fb.auto_backend).toBe("interpret");
    expect(fb.compile_fallback_reason ?? "").toMatch(/import/i);
  });
});
