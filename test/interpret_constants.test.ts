/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { interpret, Runtime } from "../src/index.ts";

const PYNE_ROOT = "/home/jango/Git/pynescript";

function pythonPlots(src: string): number[] | null {
  const proc = Bun.spawnSync(
    [
      "python3",
      "-c",
      `from pynescript.runtime import Runtime
import json
src = ${JSON.stringify(src)}
bars = [{"close": 1}, {"close": 2}, {"close": 3}]
out = Runtime("TEST").run(src, bars)
print(json.dumps(out.get("plots") if isinstance(out, dict) else list(out.plots)))`,
    ],
    { cwd: PYNE_ROOT, stdout: "pipe", stderr: "pipe" },
  );
  if (proc.exitCode !== 0) return null;
  try {
    const parsed = JSON.parse(proc.stdout.toString().trim());
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const BARS = [1, 2, 3].map((close) => ({ close }));

function plots(src: string, bars = BARS): Array<number | null> {
  return interpret(src, bars).plots;
}

describe("interpret dotted namespace constants", () => {
  test("plot(order.ascending) → 1, order.descending → -1", () => {
    expect(plots(`indicator("t")\nplot(order.ascending)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(order.descending)`)).toEqual([-1, -1, -1]);
  });

  test("plot(dayofweek.sunday) → 1, dayofweek.saturday → 7", () => {
    expect(plots(`indicator("t")\nplot(dayofweek.sunday)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(dayofweek.saturday)`)).toEqual([7, 7, 7]);
  });

  test("plot(month.december) → 12", () => {
    expect(plots(`indicator("t")\nplot(month.december)`)).toEqual([12, 12, 12]);
  });

  test('plot(format.mintick == "mintick" ? 1 : 0) → 1', () => {
    expect(plots(`indicator("t")\nplot(format.mintick == "mintick" ? 1 : 0)`)).toEqual([1, 1, 1]);
  });

  test("plot(barmerge.gaps_on ? 1 : 0) is 1 (Python True)", () => {
    expect(plots(`indicator("t")\nplot(barmerge.gaps_on ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(barmerge.gaps_off ? 1 : 0)`)).toEqual([0, 0, 0]);
    expect(plots(`indicator("t")\nplot(barmerge.lookahead_on ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(barmerge.lookahead_off ? 1 : 0)`)).toEqual([0, 0, 0]);
  });

  test('plot(shape.circle == "circle" ? 1 : 0)', () => {
    expect(plots(`indicator("t")\nplot(shape.circle == "circle" ? 1 : 0)`)).toEqual([1, 1, 1]);
  });

  test("math.phi / math.rphi / math.pi", () => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const rphi = 2 / (1 + Math.sqrt(5));
    expect(plots(`indicator("t")\nplot(math.phi)`)[0]).toBeCloseTo(phi);
    expect(plots(`indicator("t")\nplot(math.rphi)`)[0]).toBeCloseTo(rphi);
    expect(plots(`indicator("t")\nplot(math.pi)`)[0]).toBeCloseTo(Math.PI);
  });

  test("size.tiny is 8; size.auto is \"auto\"", () => {
    expect(plots(`indicator("t")\nplot(size.tiny)`)).toEqual([8, 8, 8]);
    expect(plots(`indicator("t")\nplot(size.auto == "auto" ? 1 : 0)`)).toEqual([1, 1, 1]);
  });

  test("text.formatting.bold / none", () => {
    expect(plots(`indicator("t")\nplot(text.formatting.bold == "bold" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(text.formatting.none == "" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(text.formatting.bold_italic == "bold italic" ? 1 : 0)`)).toEqual([
      1, 1, 1,
    ]);
  });

  test("hline.style_solid / location / xloc / display / position / extend", () => {
    expect(plots(`indicator("t")\nplot(hline.style_solid == "solid" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(location.abovebar == "abovebar" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(xloc.bar_index == "bar_index" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(yloc.price == "price" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(extend.both == "both" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(display.all == "all" ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(position.top_right == "top_right" ? 1 : 0)`)).toEqual([1, 1, 1]);
  });

  test("bid / ask are na", () => {
    expect(plots(`indicator("t")\nplot(na(bid) ? 1 : 0)`)).toEqual([1, 1, 1]);
    expect(plots(`indicator("t")\nplot(na(ask) ? 1 : 0)`)).toEqual([1, 1, 1]);
  });

  test("syminfo.isin / current_contract / main_tickerid", () => {
    const out = new Runtime("AAPL").run(
      `indicator("t")
plot(syminfo.isin == "" ? 1 : 0)
plot(na(syminfo.current_contract) ? 1 : 0)
plot(syminfo.main_tickerid == "AAPL" ? 1 : 0)`,
      BARS,
    );
    expect(out.error).toBeUndefined();
    expect(out.series.plot).toEqual([1, 1, 1]);
    expect(out.series.plot_2).toEqual([1, 1, 1]);
    expect(out.series.plot_3).toEqual([1, 1, 1]);
  });

  test("timeframe extras: isdwm / main_period / isseconds", () => {
    const daily = new Runtime("T", { timeframe: "D" }).run(
      `indicator("t")
plot(timeframe.isdwm ? 1 : 0)
plot(timeframe.main_period == "D" ? 1 : 0)
plot(timeframe.isseconds ? 1 : 0)
plot(timeframe.isminutes ? 1 : 0)`,
      BARS,
    );
    expect(daily.error).toBeUndefined();
    expect(daily.series.plot).toEqual([1, 1, 1]);
    expect(daily.series.plot_2).toEqual([1, 1, 1]);
    expect(daily.series.plot_3).toEqual([0, 0, 0]);
    expect(daily.series.plot_4).toEqual([0, 0, 0]);

    const minutes = new Runtime("T", { timeframe: "5" }).run(
      `indicator("t")
plot(timeframe.isminutes ? 1 : 0)
plot(timeframe.ishours ? 1 : 0)
plot(timeframe.isdwm ? 1 : 0)`,
      BARS,
    );
    expect(minutes.series.plot).toEqual([1, 1, 1]);
    expect(minutes.series.plot_2).toEqual([0, 0, 0]);
    expect(minutes.series.plot_3).toEqual([0, 0, 0]);
  });

  test.skipIf(pythonPlots(`indicator("t")\nplot(1)`) == null)(
    "barmerge.gaps_on ternary matches Python Runtime.run",
    () => {
      const src = `indicator("t")
plot(barmerge.gaps_on ? 1 : 0)`;
      const py = pythonPlots(src);
      expect(py).not.toBeNull();
      expect(plots(src)).toEqual(py!);
    },
  );
});
