/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  isRequestBuiltin,
  lastRequestSeed,
  resolveCurrencyRate,
  resolveForeignNa,
  resolveRequest,
  resolveSecurity,
  resolveSeed,
  timeframeMinutes,
} from "../src/runtime/request.ts";

describe("resolveSecurity same-symbol passthrough", () => {
  test("same symbol returns value", () => {
    expect(resolveSecurity("AAPL", "D", { symbol: "AAPL", timeframe: "D" }, 42)).toBe(
      42,
    );
  });

  test("empty / missing symbol is the host chart", () => {
    expect(resolveSecurity("AAPL", "D", { timeframe: "D" }, 7)).toBe(7);
    expect(resolveSecurity("AAPL", "D", { symbol: null, timeframe: "D" }, 7)).toBe(7);
    expect(resolveSecurity("AAPL", "D", { symbol: "", timeframe: "D" }, 7)).toBe(7);
  });

  test("case-insensitive ticker match", () => {
    expect(resolveSecurity("AAPL", "D", { symbol: "aapl", timeframe: "D" }, 1)).toBe(
      1,
    );
  });
});

describe("resolveSecurity foreign-na", () => {
  test("different symbol returns null", () => {
    expect(
      resolveSecurity("AAPL", "D", { symbol: "MSFT", timeframe: "D" }, 42),
    ).toBeNull();
  });

  test("does not invent a foreign close", () => {
    const hostClose = 185.5;
    expect(
      resolveSecurity("AAPL", "D", { symbol: "UPVOL.NY", timeframe: "D" }, hostClose),
    ).toBeNull();
  });

  test("different symbol stays na on HTF request", () => {
    expect(
      resolveSecurity("AAPL", "15", { symbol: "MSFT", timeframe: "60" }, 9),
    ).toBeNull();
  });
});

describe("resolveSecurity prefix-stripped match", () => {
  test("NASDAQ:AAPL vs host AAPL", () => {
    expect(
      resolveSecurity("AAPL", "D", { symbol: "NASDAQ:AAPL", timeframe: "D" }, 10),
    ).toBe(10);
  });

  test("bare ticker vs host NASDAQ:AAPL", () => {
    expect(
      resolveSecurity("NASDAQ:AAPL", "D", { symbol: "AAPL", timeframe: "D" }, 10),
    ).toBe(10);
  });

  test("same ticker, different exchange prefix", () => {
    expect(
      resolveSecurity("NASDAQ:AAPL", "D", { symbol: "NYSE:AAPL", timeframe: "D" }, 10),
    ).toBe(10);
  });

  test("prefix-stripped mismatch stays foreign", () => {
    expect(
      resolveSecurity("NASDAQ:AAPL", "D", { symbol: "NASDAQ:MSFT", timeframe: "D" }, 10),
    ).toBeNull();
  });
});

describe("resolveSecurity timeframe", () => {
  test("empty / missing request TF is the host TF", () => {
    expect(resolveSecurity("AAPL", "D", { symbol: "AAPL" }, 3)).toBe(3);
    expect(resolveSecurity("AAPL", "D", { symbol: "AAPL", timeframe: "" }, 3)).toBe(3);
    expect(resolveSecurity("AAPL", "D", { symbol: "AAPL", timeframe: null }, 3)).toBe(
      3,
    );
  });

  test("different TF same symbol is last-close passthrough", () => {
    expect(
      resolveSecurity("AAPL", "D", { symbol: "AAPL", timeframe: "60" }, 3),
    ).toBe(3);
  });

  test("same-symbol HTF last-close passthrough", () => {
    expect(
      resolveSecurity("AAPL", "15", { symbol: "AAPL", timeframe: "60" }, 9),
    ).toBe(9);
    expect(
      resolveSecurity("AAPL", "60", { symbol: "AAPL", timeframe: "1D" }, 9),
    ).toBe(9);
    expect(
      resolveSecurity("AAPL", "1h", { symbol: "AAPL", timeframe: "1W" }, 9),
    ).toBe(9);
  });
});

describe("timeframeMinutes", () => {
  test("parses minute, hour, day, week tokens", () => {
    expect(timeframeMinutes("1")).toBe(1);
    expect(timeframeMinutes("5")).toBe(5);
    expect(timeframeMinutes("15")).toBe(15);
    expect(timeframeMinutes("60")).toBe(60);
    expect(timeframeMinutes("1h")).toBe(60);
    expect(timeframeMinutes("240")).toBe(240);
    expect(timeframeMinutes("1D")).toBe(1440);
    expect(timeframeMinutes("1W")).toBe(10080);
  });

  test("aliases and case", () => {
    expect(timeframeMinutes("D")).toBe(1440);
    expect(timeframeMinutes("W")).toBe(10080);
    expect(timeframeMinutes("4H")).toBe(240);
    expect(timeframeMinutes(" 15 ")).toBe(15);
  });

  test("unknown or empty is null", () => {
    expect(timeframeMinutes(null)).toBeNull();
    expect(timeframeMinutes(undefined)).toBeNull();
    expect(timeframeMinutes("")).toBeNull();
    expect(timeframeMinutes("weird")).toBeNull();
  });
});

describe("isRequestBuiltin", () => {
  test("request.security and request.security_lower_tf", () => {
    expect(isRequestBuiltin("request.security")).toBe(true);
    expect(isRequestBuiltin("request.security_lower_tf")).toBe(true);
  });

  test("fundamentals and other request names resolve", () => {
    expect(isRequestBuiltin("request.dividends")).toBe(true);
    expect(isRequestBuiltin("request.earnings")).toBe(true);
    expect(isRequestBuiltin("request.splits")).toBe(true);
    expect(isRequestBuiltin("request.financial")).toBe(true);
    expect(isRequestBuiltin("request.economic")).toBe(true);
    expect(isRequestBuiltin("request.quandl")).toBe(true);
    expect(isRequestBuiltin("request.currency_rate")).toBe(true);
    expect(isRequestBuiltin("request.seed")).toBe(true);
    expect(isRequestBuiltin("request.footprint")).toBe(true);
  });

  test("other names are not request builtins", () => {
    expect(isRequestBuiltin("security")).toBe(false);
    expect(isRequestBuiltin("ta.sma")).toBe(false);
    expect(isRequestBuiltin(null)).toBe(false);
    expect(isRequestBuiltin(undefined)).toBe(false);
  });
});

describe("resolveCurrencyRate", () => {
  test("identical currencies are 1.0", () => {
    expect(resolveCurrencyRate("USD", "USD")).toBe(1);
    expect(resolveCurrencyRate("usd", "USD")).toBe(1);
    expect(resolveCurrencyRate("EUR", "eur")).toBe(1);
    expect(resolveCurrencyRate("USDUSD")).toBe(1);
    expect(resolveCurrencyRate("USD/USD")).toBe(1);
  });

  test("cross rates are na (no invented FX)", () => {
    expect(resolveCurrencyRate("USD", "EUR")).toBeNull();
    expect(resolveCurrencyRate("EURUSD")).toBeNull();
  });
});

describe("resolveForeignNa", () => {
  test("foreign financial is na", () => {
    expect(resolveForeignNa()).toBeNull();
    expect(
      resolveRequest("request.financial", { symbol: "AAPL" }, { symbol: "MSFT" }),
    ).toBeNull();
    expect(
      resolveRequest("request.dividends", { symbol: "AAPL" }, { symbol: "MSFT" }),
    ).toBeNull();
    expect(
      resolveRequest("request.earnings", { symbol: "AAPL" }, { symbol: "MSFT" }),
    ).toBeNull();
    expect(
      resolveRequest("request.splits", { symbol: "AAPL" }, { symbol: "MSFT" }),
    ).toBeNull();
    expect(
      resolveRequest("request.economic", { symbol: "AAPL" }, ["US", "UNRATE"]),
    ).toBeNull();
    expect(
      resolveRequest("request.quandl", { symbol: "AAPL" }, ["EIA/PET_RWTC_D"]),
    ).toBeNull();
    expect(resolveRequest("request.footprint", { symbol: "AAPL" }, [100, 70])).toBeNull();
  });
});

describe("resolveSeed", () => {
  test("records seed and returns na", () => {
    expect(resolveSeed(42)).toBeNull();
    expect(lastRequestSeed()).toBe(42);
    expect(resolveRequest("request.seed", { symbol: "AAPL" }, { seed: 7 })).toBeNull();
    expect(lastRequestSeed()).toBe(7);
  });
});

describe("resolveRequest security unchanged", () => {
  test("same-symbol passthrough", () => {
    expect(
      resolveRequest(
        "request.security",
        { symbol: "AAPL", timeframe: "D" },
        { symbol: "AAPL", timeframe: "D", sameSymbolValue: 42 },
      ),
    ).toBe(42);
  });

  test("foreign stays na", () => {
    expect(
      resolveRequest(
        "request.security",
        { symbol: "AAPL", timeframe: "D" },
        { symbol: "MSFT", timeframe: "D", sameSymbolValue: 42 },
      ),
    ).toBeNull();
  });
});

describe("resolveSecurity non-finite / empty harden", () => {
  test("non-finite same-symbol value is na", () => {
    expect(
      resolveSecurity("AAPL", "D", { symbol: "AAPL", timeframe: "D" }, Number.NaN),
    ).toBeNull();
    expect(
      resolveSecurity("AAPL", "D", { symbol: "AAPL", timeframe: "D" }, Number.POSITIVE_INFINITY),
    ).toBeNull();
    expect(
      resolveSecurity("AAPL", "15", { symbol: "AAPL", timeframe: "60" }, Number.NEGATIVE_INFINITY),
    ).toBeNull();
  });

  test("empty symbol + null timeframe still passthrough finite value", () => {
    expect(resolveSecurity("AAPL", "D", { symbol: "", timeframe: null }, 12)).toBe(12);
    expect(resolveSecurity("AAPL", null, { symbol: "   ", timeframe: undefined }, 12)).toBe(12);
  });

  test("empty symbol does not invent a foreign close", () => {
    expect(
      resolveSecurity("AAPL", "D", { symbol: "MSFT", timeframe: null }, 185.5),
    ).toBeNull();
  });

  test("null args object is treated as chart passthrough", () => {
    expect(resolveSecurity("AAPL", "D", null as unknown as { symbol?: string }, 4)).toBe(4);
  });
});
