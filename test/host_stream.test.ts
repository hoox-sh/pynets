/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { MemoryProvider, Runtime } from "../src/index.ts";

const SRC = `indicator("t")
plot(close, title="c")
log.info("bar", bar_index)
`;

const BARS = [10, 20, 30].map((close, i) => ({
  close,
  time: 1_700_000_000_000 + i * 60_000,
}));

describe("stream + provider + plot_data + log", () => {
  test("stream emits one result per push", () => {
    const results: number[] = [];
    const s = new Runtime("TEST").stream(SRC);
    s.on("bar", (out) => results.push(out.plots[out.plots.length - 1]!));
    s.push(BARS[0]!);
    s.push(BARS[1]!);
    s.push(BARS[2]!);
    expect(results).toEqual([10, 20, 30]);
    const last = s.close();
    expect(last.plots).toEqual([10, 20, 30]);
    expect(last.plot_data?.c?.data).toHaveLength(3);
    expect(last.plot_data?.c?.data[2]?.value).toBe(30);
    expect(last.logs?.length).toBe(3);
    expect(last.logs?.[0]?.level).toBe("INFO");
  });

  test("MemoryProvider + runProvider", async () => {
    const rt = new Runtime("TEST");
    const out = await rt.runProvider(SRC, new MemoryProvider(BARS));
    expect(out.plots).toEqual([10, 20, 30]);
  });

  test("session.ismarket and ticker.new stringify", () => {
    const out = new Runtime("AAPL").run(
      `indicator("t")
plot(session.ismarket ? 1 : 0)
t = ticker.new("BTCUSDT")
log.info(t)`,
      BARS,
    );
    expect(out.plots).toEqual([1, 1, 1]);
    expect(out.logs?.[0]?.message).toContain("BTCUSDT");
  });
});
