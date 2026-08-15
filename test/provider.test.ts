/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  JsonBarProvider,
  mapJsonBars,
  MemoryProvider,
  ProviderError,
  StaticMapProvider,
  type ProviderBar,
} from "../src/runtime/provider.ts";

const SAMPLE: ProviderBar[] = [
  { time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100 },
  { time: 2, open: 11, high: 13, low: 10, close: 12, volume: 110 },
  { time: 3, open: 12, high: 14, low: 11, close: 13, volume: 120 },
];

/** `mapJsonBars` stores Unix seconds as milliseconds. */
const SAMPLE_MS: ProviderBar[] = [
  { time: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
  { time: 2000, open: 11, high: 13, low: 10, close: 12, volume: 110 },
  { time: 3000, open: 12, high: 14, low: 11, close: 13, volume: 120 },
];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { "content-type": "application/json" },
  });
}

function stubFetch(
  impl: (input: string | URL, init?: RequestInit) => Promise<Response> | Response,
): typeof fetch {
  return (async (input: string | URL, init?: RequestInit) => impl(input, init)) as typeof fetch;
}

describe("MemoryProvider", () => {
  test("returns last N bars", async () => {
    const p = new MemoryProvider(SAMPLE);
    expect(await p.fetch({ limit: 2 })).toEqual(SAMPLE.slice(-2));
  });

  test("returns a copy of all bars when limit is omitted", async () => {
    const p = new MemoryProvider(SAMPLE);
    const got = await p.fetch({});
    expect(got).toEqual(SAMPLE);
    expect(got).not.toBe(SAMPLE);
  });

  test("ignores symbol and timeframe", async () => {
    const p = new MemoryProvider(SAMPLE);
    expect(
      await p.fetch({ symbol: "OTHER", timeframe: "D", limit: 1 } as {
        symbol: string;
        timeframe: string;
        limit: number;
      }),
    ).toEqual([SAMPLE[2]]);
  });
});

describe("StaticMapProvider", () => {
  test("looks up symbol", async () => {
    const p = new StaticMapProvider({ AAPL: SAMPLE });
    expect(await p.fetch({ symbol: "AAPL" })).toEqual(SAMPLE);
  });

  test("missing symbol returns empty", async () => {
    const p = new StaticMapProvider({ AAPL: SAMPLE });
    expect(await p.fetch({ symbol: "MSFT" })).toEqual([]);
  });

  test("prefers symbol:timeframe then falls back to symbol", async () => {
    const p = new StaticMapProvider({
      BTC: [{ close: 1 }],
      "BTC:60": [{ close: 2 }],
    });
    expect(await p.fetch({ symbol: "BTC", timeframe: "60" })).toEqual([{ close: 2 }]);
    expect(await p.fetch({ symbol: "ETH", timeframe: "60" })).toEqual([]);
    expect(await p.fetch({ symbol: "BTC", timeframe: "D" })).toEqual([{ close: 1 }]);
  });

  test("limit slices tail", async () => {
    const p = new StaticMapProvider({ AAPL: SAMPLE });
    expect(await p.fetch({ symbol: "AAPL", limit: 1 })).toEqual([SAMPLE[2]]);
  });
});

describe("mapJsonBars", () => {
  test("object-array body", () => {
    expect(mapJsonBars(SAMPLE)).toEqual(SAMPLE_MS);
  });

  test("tuple-array body", () => {
    expect(
      mapJsonBars([
        [1, 10, 12, 9, 11, 100],
        [2, 11, 13, 10, 12, 110],
      ]),
    ).toEqual([
      { time: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
      { time: 2000, open: 11, high: 13, low: 10, close: 12, volume: 110 },
    ]);
  });

  test("tuple without volume", () => {
    expect(mapJsonBars([[1, 10, 12, 9, 11]])).toEqual([
      { time: 1000, open: 10, high: 12, low: 9, close: 11 },
    ]);
  });

  test("12-number tuple uses first 6", () => {
    expect(
      mapJsonBars([
        [1_700_000_000, 10, 12, 9, 11, 100, 99, 98, 97, 96, 95, 94],
      ]),
    ).toEqual([
      { time: 1_700_000_000_000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
    ]);
  });

  test("unix seconds become milliseconds", () => {
    expect(mapJsonBars([{ time: 1_700_000_000, close: 11 }])).toEqual([
      { time: 1_700_000_000_000, close: 11 },
    ]);
    expect(mapJsonBars([{ t: 1_700_000_000, c: 11 }])).toEqual([
      { time: 1_700_000_000_000, close: 11 },
    ]);
    expect(mapJsonBars([[1_700_000_000, 10, 12, 9, 11, 100]])).toEqual([
      { time: 1_700_000_000_000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
    ]);
  });

  test("already-ms time is unchanged", () => {
    expect(mapJsonBars([{ time: 1_700_000_000_000, close: 11 }])).toEqual([
      { time: 1_700_000_000_000, close: 11 },
    ]);
    expect(mapJsonBars([{ t: 1_700_000_000_000, c: 11 }])).toEqual([
      { time: 1_700_000_000_000, close: 11 },
    ]);
    expect(mapJsonBars([[1_700_000_000_000, 10, 12, 9, 11, 100]])).toEqual([
      { time: 1_700_000_000_000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
    ]);
  });

  test("{ bars: [...] } wrapper", () => {
    expect(mapJsonBars({ bars: SAMPLE })).toEqual(SAMPLE_MS);
  });

  test("{ data: [...] } wrapper", () => {
    expect(mapJsonBars({ data: SAMPLE })).toEqual(SAMPLE_MS);
  });

  test("t/o/h/l/c/v keys", () => {
    expect(
      mapJsonBars([{ t: 1, o: 10, h: 12, l: 9, c: 11, v: 100 }]),
    ).toEqual([{ time: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 }]);
  });

  test("non-finite numbers omit that field", () => {
    expect(
      mapJsonBars([{ close: 11, open: Number.NaN, high: Infinity, low: -Infinity, volume: 1 }]),
    ).toEqual([{ close: 11, volume: 1 }]);
  });

  test("empty or unknown JSON returns empty", () => {
    expect(mapJsonBars(null)).toEqual([]);
    expect(mapJsonBars(undefined)).toEqual([]);
    expect(mapJsonBars({})).toEqual([]);
    expect(mapJsonBars({ foo: 1 })).toEqual([]);
    expect(mapJsonBars("nope")).toEqual([]);
    expect(mapJsonBars(42)).toEqual([]);
    expect(mapJsonBars([])).toEqual([]);
  });
});

describe("JsonBarProvider", () => {
  test("object-array body", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() => jsonResponse(SAMPLE)),
    });
    expect(await p.fetch({ symbol: "AAPL" })).toEqual(SAMPLE_MS);
  });

  test("tuple-array body", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() => jsonResponse([[1, 10, 12, 9, 11, 100]])),
    });
    expect(await p.fetch({ symbol: "AAPL" })).toEqual([
      { time: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
    ]);
  });

  test("{ data: [...] } wrapper", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() => jsonResponse({ data: SAMPLE })),
    });
    expect(await p.fetch({ symbol: "AAPL" })).toEqual(SAMPLE_MS);
  });

  test("t/o/h/l/c/v keys", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() =>
        jsonResponse([{ t: 1, o: 10, h: 12, l: 9, c: 11, v: 100 }]),
      ),
    });
    expect(await p.fetch({ symbol: "AAPL" })).toEqual([
      { time: 1000, open: 10, high: 12, low: 9, close: 11, volume: 100 },
    ]);
  });

  test("HTTP 500 throws", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() => jsonResponse({ error: "nope" }, 500)),
    });
    let err: unknown;
    try {
      await p.fetch({ symbol: "AAPL" });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ProviderError);
    expect((err as ProviderError).status).toBe(500);
    expect((err as ProviderError).message).toContain("500");
  });

  test("empty or unknown JSON returns empty", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() => jsonResponse({ foo: 1 })),
    });
    expect(await p.fetch({ symbol: "AAPL" })).toEqual([]);
  });

  test("invalid JSON throws", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(
        () =>
          new Response("not-json", {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    });
    await expect(p.fetch({ symbol: "AAPL" })).rejects.toBeInstanceOf(ProviderError);
  });

  test("limit slices tail", async () => {
    const p = new JsonBarProvider({
      url: () => "https://example.test/bars",
      fetch: stubFetch(() => jsonResponse(SAMPLE)),
    });
    expect(await p.fetch({ symbol: "AAPL", limit: 2 })).toEqual(SAMPLE_MS.slice(-2));
  });

  test("url builder receives symbol/timeframe/limit", async () => {
    let seen: { symbol: string; timeframe?: string | null; limit?: number } | undefined;
    const p = new JsonBarProvider({
      url: (opts) => {
        seen = opts;
        return "https://example.test/ohlcv?s=AAPL";
      },
      fetch: stubFetch((input) => {
        expect(String(input)).toBe("https://example.test/ohlcv?s=AAPL");
        return jsonResponse(SAMPLE);
      }),
    });
    await p.fetch({ symbol: "AAPL", timeframe: "60", limit: 3 });
    expect(seen).toEqual({ symbol: "AAPL", timeframe: "60", limit: 3 });
  });
});
