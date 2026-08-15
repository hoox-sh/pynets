/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import {
  tickerHeikinashi,
  tickerKagi,
  tickerLinebreak,
  tickerModify,
  tickerNew,
  tickerPointfigure,
  tickerRenko,
  tickerStandard,
} from "../src/runtime/ticker.ts";

describe("ticker constructors", () => {
  test("ticker.new sets symbol and optional session/adjust", () => {
    const t = tickerNew("AAPL", "extended", "splits");
    expect(t.symbol).toBe("AAPL");
    expect(t.session).toBe("extended");
    expect(t.adjust).toBe("splits");
    expect(t.toString()).toBe("AAPL");
    expect(t.heikinashi).toBe(false);
    expect(t.renko).toBe(false);
    expect(t.kagi).toBe(false);
    expect(t.linebreak).toBe(false);
    expect(t.pointfigure).toBe(false);
  });

  test("ticker.standard sets no chart flags and toString() is the symbol", () => {
    const t = tickerStandard("EURUSD");
    expect(t.toString()).toBe("EURUSD");
    expect(t.heikinashi).toBe(false);
    expect(t.renko).toBe(false);
    expect(t.kagi).toBe(false);
    expect(t.linebreak).toBe(false);
    expect(t.pointfigure).toBe(false);
  });

  test("ticker.heikinashi sets heikinashi and toString() is the symbol", () => {
    const t = tickerHeikinashi("BTCUSDT");
    expect(t.heikinashi).toBe(true);
    expect(t.renko).toBe(false);
    expect(t.kagi).toBe(false);
    expect(t.linebreak).toBe(false);
    expect(t.pointfigure).toBe(false);
    expect(t.toString()).toBe("BTCUSDT");
  });

  test("ticker.renko sets renko and toString() is the symbol", () => {
    const t = tickerRenko("NASDAQ:AAPL");
    expect(t.renko).toBe(true);
    expect(t.heikinashi).toBe(false);
    expect(t.kagi).toBe(false);
    expect(t.linebreak).toBe(false);
    expect(t.pointfigure).toBe(false);
    expect(t.toString()).toBe("NASDAQ:AAPL");
  });

  test("ticker.kagi sets kagi and toString() is the symbol", () => {
    const t = tickerKagi("XAUUSD");
    expect(t.kagi).toBe(true);
    expect(t.heikinashi).toBe(false);
    expect(t.renko).toBe(false);
    expect(t.linebreak).toBe(false);
    expect(t.pointfigure).toBe(false);
    expect(t.toString()).toBe("XAUUSD");
  });

  test("ticker.linebreak sets linebreak and toString() is the symbol", () => {
    const t = tickerLinebreak("SPX");
    expect(t.linebreak).toBe(true);
    expect(t.heikinashi).toBe(false);
    expect(t.renko).toBe(false);
    expect(t.kagi).toBe(false);
    expect(t.pointfigure).toBe(false);
    expect(t.toString()).toBe("SPX");
  });

  test("ticker.pointfigure sets pointfigure and toString() is the symbol", () => {
    const t = tickerPointfigure("TSLA");
    expect(t.pointfigure).toBe(true);
    expect(t.heikinashi).toBe(false);
    expect(t.renko).toBe(false);
    expect(t.kagi).toBe(false);
    expect(t.linebreak).toBe(false);
    expect(t.toString()).toBe("TSLA");
  });
});

describe("ticker.modify", () => {
  test("keeps unspecified fields", () => {
    const src = tickerNew("AAPL", "extended", "splits");
    const t = tickerModify(src, { session: "regular" });
    expect(t.symbol).toBe("AAPL");
    expect(t.session).toBe("regular");
    expect(t.adjust).toBe("splits");
    expect(t.toString()).toBe("AAPL");
  });

  test("modify from string", () => {
    const t = tickerModify("NASDAQ:MSFT", { session: "extended", adjust: "dividends" });
    expect(t.symbol).toBe("NASDAQ:MSFT");
    expect(t.session).toBe("extended");
    expect(t.adjust).toBe("dividends");
    expect(t.toString()).toBe("NASDAQ:MSFT");
  });

  test("adjustment is an alias for adjust", () => {
    const src = tickerNew("AAPL", "regular", "splits");
    const t = tickerModify(src, { adjustment: "dividends" });
    expect(t.symbol).toBe("AAPL");
    expect(t.session).toBe("regular");
    expect(t.adjust).toBe("dividends");
  });

  test("omitted opts copy the ticker", () => {
    const src = tickerHeikinashi("BTCUSDT");
    const t = tickerModify(src);
    expect(t.symbol).toBe("BTCUSDT");
    expect(t.heikinashi).toBe(true);
    expect(t).not.toBe(src);
  });
});
