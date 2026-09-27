/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Compile emit for request.footprint / footprint.* / volume_row.* vs interpret.
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar } from "../src/index.ts";

const BARS: OHLCVBar[] = [100, 101, 102, 103, 104].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1000,
  time: 1_700_000_000_000 + i * 60_000,
}));

function expectSeries(body: string): void {
  const src = `indicator("t")\n${body}`;
  const compiled = new Runtime("TEST").run(src, BARS, { mode: "compile" });
  const interpreted = new Runtime("TEST").run(src, BARS, { mode: "interpret" });
  expect(compiled.error).toBeUndefined();
  expect(interpreted.error).toBeUndefined();
  expect(compiled.series).toEqual(interpreted.series);
}

describe("compile footprint vs interpret", () => {
  test("missing / na footprint and row args are zeros and empty", () => {
    expectSeries(`plot(footprint.buy_volume(na), "b")
plot(footprint.buy_volume(), "bm")
plot(array.size(footprint.rows(na)), "rn")
plot(volume_row.up_price(na), "up")
plot(volume_row.has_buy_imbalance(na) ? 1 : 0, "hb")
plot(na(footprint.poc(na)) ? 1 : 0, "np")`);
  });

  test("request.footprint default size and seeded volumes", () => {
    expectSeries(`request.seed(42)
fp = request.footprint()
plot(array.size(footprint.rows(fp)), "n")
plot(footprint.buy_volume(fp), "b")
plot(footprint.sell_volume(fp), "s")
plot(footprint.delta(fp), "d")
plot(footprint.total_volume(fp), "t")
plot(na(fp) ? 1 : 0, "na")`);
  });

  test("poc / vah / val prices, get_row_by_price, volume_row", () => {
    expectSeries(`request.seed(42)
fp = request.footprint(10, 70)
plot(array.size(footprint.rows(fp)), "n")
poc = footprint.poc(fp)
vah = footprint.vah(fp)
val = footprint.val(fp)
plot(volume_row.down_price(poc), "pd")
plot(volume_row.up_price(poc), "pu")
plot(volume_row.up_price(vah), "vh")
plot(volume_row.up_price(val), "vl")
r0 = array.get(footprint.rows(fp), 0)
plot(volume_row.down_price(r0), "r0")
hit = footprint.get_row_by_price(fp, 100.05)
plot(volume_row.down_price(hit), "hit")
plot(na(footprint.get_row_by_price(fp, 999)) ? 1 : 0, "miss")
plot(volume_row.buy_volume(poc), "pb")
plot(volume_row.total_volume(poc), "pt")
plot(volume_row.has_buy_imbalance(poc) ? 1 : 0, "hb")`);
  });
});
