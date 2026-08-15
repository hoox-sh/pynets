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

const SAME_SYMBOL_SRC = `//@version=5
indicator("sec")
plot(request.security(syminfo.ticker, timeframe.period, close))
`;

const FOREIGN_SRC = `//@version=5
indicator("sec")
plot(request.security("OTHER", "1D", close))
`;

const ISFIRST_SRC = `//@version=5
indicator("isfirst")
plot(barstate.isfirst ? 1 : 0)
`;

const YEAR_TIME_SRC = `//@version=5
indicator("year")
plot(year(time))
`;

const YEAR_SRC = `//@version=5
indicator("year")
plot(year())
`;

function parseOk(source: string): boolean {
  try {
    parse(source);
    return true;
  } catch {
    return false;
  }
}

function runCompile(source: string) {
  return new Runtime("TEST", { mode: "compile" }).run(source, BARS);
}

function runInterpret(source: string) {
  return new Runtime("TEST").run(source, BARS);
}

function allNa(n: number): Array<null> {
  return Array.from({ length: n }, () => null);
}

const yearSrc = parseOk(YEAR_TIME_SRC) ? YEAR_TIME_SRC : YEAR_SRC;

describe("compile vs interpret request", () => {
  test.skipIf(!parseOk(SAME_SYMBOL_SRC))(
    "request.security same-symbol passthrough matches interpret",
    () => {
      const compiled = runCompile(SAME_SYMBOL_SRC);
      const interpreted = runInterpret(SAME_SYMBOL_SRC);
      expect(compiled.error).toBeUndefined();
      expect(interpreted.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(interpreted.plots).toEqual([1, 2, 3, 4]);
      expect(compiled.plots).toEqual(interpreted.plots);
    },
  );

  test.skipIf(!parseOk(FOREIGN_SRC))(
    "request.security foreign symbol is na",
    () => {
      const compiled = runCompile(FOREIGN_SRC);
      const interpreted = runInterpret(FOREIGN_SRC);
      expect(compiled.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(compiled.plots).toEqual(allNa(BARS.length));
      if (interpreted.error == null) {
        expect(compiled.plots).toEqual(interpreted.plots);
      }
    },
  );

  test.skipIf(!parseOk(ISFIRST_SRC))(
    "barstate.isfirst plots 1 then 0",
    () => {
      const compiled = runCompile(ISFIRST_SRC);
      const interpreted = runInterpret(ISFIRST_SRC);
      expect(compiled.error).toBeUndefined();
      expect(interpreted.error).toBeUndefined();
      expect(compiled.mode).toBe("compile");
      expect(interpreted.plots).toEqual([1, 0, 0, 0]);
      expect(compiled.plots).toEqual(interpreted.plots);
    },
  );

  test.skipIf(!parseOk(yearSrc))("year(time) or year() compile has no error", () => {
    const compiled = runCompile(yearSrc);
    expect(compiled.error).toBeUndefined();
    expect(compiled.mode).toBe("compile");
  });
});
