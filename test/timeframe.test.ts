/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";
import {
  timeframeFromSeconds,
  timeframeInSeconds,
  timeframeIsDaily,
  timeframeIsDwm,
  timeframeIsHours,
  timeframeIsIntraday,
  timeframeIsMinutes,
  timeframeIsMonthly,
  timeframeIsSeconds,
  timeframeIsWeekly,
  timeframeMultiplier,
} from "../src/runtime/timeframe.ts";

describe("timeframeInSeconds", () => {
  test("minute tokens are minutes * 60", () => {
    expect(timeframeInSeconds("1")).toBe(60);
    expect(timeframeInSeconds("5")).toBe(300);
    expect(timeframeInSeconds("15")).toBe(900);
    expect(timeframeInSeconds("60")).toBe(3600);
  });

  test("hour aliases", () => {
    expect(timeframeInSeconds("1H")).toBe(3600);
    expect(timeframeInSeconds("1h")).toBe(3600);
    expect(timeframeInSeconds("60")).toBe(3600);
    expect(timeframeInSeconds("4H")).toBe(14_400);
  });

  test("day / week / month (30-day)", () => {
    expect(timeframeInSeconds("D")).toBe(86_400);
    expect(timeframeInSeconds("1D")).toBe(86_400);
    expect(timeframeInSeconds("W")).toBe(7 * 86_400);
    expect(timeframeInSeconds("1W")).toBe(604_800);
    expect(timeframeInSeconds("M")).toBe(30 * 86_400);
    expect(timeframeInSeconds("1M")).toBe(2_592_000);
    expect(timeframeInSeconds("1MO")).toBe(2_592_000);
  });

  test("unknown / empty / na is null", () => {
    expect(timeframeInSeconds(null)).toBeNull();
    expect(timeframeInSeconds("")).toBeNull();
    expect(timeframeInSeconds("   ")).toBeNull();
    expect(timeframeInSeconds("weird")).toBeNull();
  });

  test("trims whitespace", () => {
    expect(timeframeInSeconds(" 15 ")).toBe(900);
    expect(timeframeInSeconds(" 1D ")).toBe(86_400);
  });
});

describe("timeframeFromSeconds", () => {
  test("compact tokens closest without going under", () => {
    expect(timeframeFromSeconds(60)).toBe("1");
    expect(timeframeFromSeconds(300)).toBe("5");
    expect(timeframeFromSeconds(900)).toBe("15");
    expect(timeframeFromSeconds(3600)).toBe("60");
    expect(timeframeFromSeconds(86_400)).toBe("D");
    expect(timeframeFromSeconds(604_800)).toBe("W");
    expect(timeframeFromSeconds(2_592_000)).toBe("M");
  });

  test("does not pick a shorter token than seconds", () => {
    expect(timeframeFromSeconds(61)).toBe("2");
    expect(timeframeFromSeconds(301)).toBe("6");
    expect(timeframeFromSeconds(3601)).toBe("61");
    expect(timeframeFromSeconds(86_401)).toBe("2D");
    expect(timeframeFromSeconds(604_801)).toBe("2W");
    expect(timeframeFromSeconds(2_592_001)).toBe("2M");
  });

  test("sub-minute ceils to 1 minute", () => {
    expect(timeframeFromSeconds(1)).toBe("1");
    expect(timeframeFromSeconds(59)).toBe("1");
  });

  test("invalid / non-finite is null", () => {
    expect(timeframeFromSeconds(0)).toBeNull();
    expect(timeframeFromSeconds(-60)).toBeNull();
    expect(timeframeFromSeconds(Number.NaN)).toBeNull();
    expect(timeframeFromSeconds(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("timeframeIsIntraday", () => {
  test("minutes and hours", () => {
    expect(timeframeIsIntraday("1")).toBe(true);
    expect(timeframeIsIntraday("5")).toBe(true);
    expect(timeframeIsIntraday("15")).toBe(true);
    expect(timeframeIsIntraday("60")).toBe(true);
    expect(timeframeIsIntraday("1H")).toBe(true);
    expect(timeframeIsIntraday("4H")).toBe(true);
    expect(timeframeIsIntraday("15M")).toBe(true);
  });

  test("D/W/M are not intraday", () => {
    expect(timeframeIsIntraday("D")).toBe(false);
    expect(timeframeIsIntraday("1D")).toBe(false);
    expect(timeframeIsIntraday("W")).toBe(false);
    expect(timeframeIsIntraday("M")).toBe(false);
    expect(timeframeIsIntraday("1M")).toBe(false);
    expect(timeframeIsIntraday("1MO")).toBe(false);
  });

  test("unknown / empty / na is false", () => {
    expect(timeframeIsIntraday(null)).toBe(false);
    expect(timeframeIsIntraday("")).toBe(false);
    expect(timeframeIsIntraday("weird")).toBe(false);
  });
});

describe("timeframeIsDaily", () => {
  test("day tokens", () => {
    expect(timeframeIsDaily("D")).toBe(true);
    expect(timeframeIsDaily("1D")).toBe(true);
    expect(timeframeIsDaily("2D")).toBe(true);
    expect(timeframeIsDaily("d")).toBe(true);
  });

  test("non-daily", () => {
    expect(timeframeIsDaily("1")).toBe(false);
    expect(timeframeIsDaily("60")).toBe(false);
    expect(timeframeIsDaily("W")).toBe(false);
    expect(timeframeIsDaily("M")).toBe(false);
    expect(timeframeIsDaily(null)).toBe(false);
    expect(timeframeIsDaily("")).toBe(false);
  });
});

describe("timeframeIsWeekly", () => {
  test("week tokens", () => {
    expect(timeframeIsWeekly("W")).toBe(true);
    expect(timeframeIsWeekly("1W")).toBe(true);
    expect(timeframeIsWeekly("2W")).toBe(true);
  });

  test("non-weekly", () => {
    expect(timeframeIsWeekly("D")).toBe(false);
    expect(timeframeIsWeekly("60")).toBe(false);
    expect(timeframeIsWeekly("M")).toBe(false);
    expect(timeframeIsWeekly(null)).toBe(false);
  });
});

describe("timeframeIsMonthly", () => {
  test("month tokens (1M / MO, not 15M)", () => {
    expect(timeframeIsMonthly("M")).toBe(true);
    expect(timeframeIsMonthly("1M")).toBe(true);
    expect(timeframeIsMonthly("1MO")).toBe(true);
    expect(timeframeIsMonthly("MO")).toBe(true);
    expect(timeframeIsMonthly("3MO")).toBe(true);
  });

  test("minute M-suffix and others are not monthly", () => {
    expect(timeframeIsMonthly("15M")).toBe(false);
    expect(timeframeIsMonthly("2M")).toBe(false);
    expect(timeframeIsMonthly("D")).toBe(false);
    expect(timeframeIsMonthly("60")).toBe(false);
    expect(timeframeIsMonthly(null)).toBe(false);
  });
});

describe("timeframeIsSeconds / isminutes / ishours / isdwm", () => {
  test("isseconds only S-suffix counts", () => {
    expect(timeframeIsSeconds("1S")).toBe(true);
    expect(timeframeIsSeconds("15S")).toBe(true);
    expect(timeframeIsSeconds("1")).toBe(false);
    expect(timeframeIsSeconds("D")).toBe(false);
    expect(timeframeIsSeconds(null)).toBe(false);
  });

  test("isminutes is numeric < 60 or nM (not monthly)", () => {
    expect(timeframeIsMinutes("1")).toBe(true);
    expect(timeframeIsMinutes("5")).toBe(true);
    expect(timeframeIsMinutes("15M")).toBe(true);
    expect(timeframeIsMinutes("60")).toBe(false);
    expect(timeframeIsMinutes("1H")).toBe(false);
    expect(timeframeIsMinutes("1M")).toBe(false);
    expect(timeframeIsMinutes("D")).toBe(false);
  });

  test("ishours is 1H or numeric >= 60", () => {
    expect(timeframeIsHours("1H")).toBe(true);
    expect(timeframeIsHours("4H")).toBe(true);
    expect(timeframeIsHours("60")).toBe(true);
    expect(timeframeIsHours("5")).toBe(false);
    expect(timeframeIsHours("D")).toBe(false);
  });

  test("isdwm is daily / weekly / monthly", () => {
    expect(timeframeIsDwm("D")).toBe(true);
    expect(timeframeIsDwm("1W")).toBe(true);
    expect(timeframeIsDwm("1M")).toBe(true);
    expect(timeframeIsDwm("60")).toBe(false);
    expect(timeframeIsDwm("1H")).toBe(false);
  });
});

describe("timeframeMultiplier", () => {
  test("leading integer or 1", () => {
    expect(timeframeMultiplier("1")).toBe(1);
    expect(timeframeMultiplier("5")).toBe(5);
    expect(timeframeMultiplier("15")).toBe(15);
    expect(timeframeMultiplier("60")).toBe(60);
    expect(timeframeMultiplier("4H")).toBe(4);
    expect(timeframeMultiplier("1D")).toBe(1);
    expect(timeframeMultiplier("2W")).toBe(2);
    expect(timeframeMultiplier("D")).toBe(1);
    expect(timeframeMultiplier("W")).toBe(1);
    expect(timeframeMultiplier("M")).toBe(1);
  });

  test("empty / na is 1", () => {
    expect(timeframeMultiplier(null)).toBe(1);
    expect(timeframeMultiplier("")).toBe(1);
  });
});

// Runtime-level timeframe.* members with NO configured timeframe.
// Python SoT: pynescript/ast/evaluator/base.py "Chart timeframe defaults
// (daily)" + builtins/timeframe.py `_period_flags("D")` / `_chart_period()` —
// the chart resolves to daily: period "D", main_period "D", multiplier 1,
// isdaily/isdwm true, all other flags false.
const BARS = [1, 2, 3, 4].map((close) => ({
  open: close,
  high: close,
  low: close,
  close,
  volume: 1,
}));

function defaultTfPlots(src: string): Array<number | null> {
  const out = new Runtime("TEST").run(`indicator("t")\n${src}`, BARS);
  expect(out.error).toBeUndefined();
  return out.plots;
}

describe("Runtime timeframe.* default state (no configured timeframe)", () => {
  const ones = [1, 1, 1, 1];
  const zeros = [0, 0, 0, 0];

  test("period / main_period default to 'D' (not '')", () => {
    expect(defaultTfPlots(`plot(timeframe.period == "D" ? 1 : 0)`)).toEqual(ones);
    expect(defaultTfPlots(`plot(timeframe.period == "" ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.main_period == "D" ? 1 : 0)`)).toEqual(ones);
  });

  test("multiplier defaults to 1", () => {
    expect(defaultTfPlots(`plot(timeframe.multiplier)`)).toEqual(ones);
  });

  test("isdaily / isdwm default to true", () => {
    expect(defaultTfPlots(`plot(timeframe.isdaily ? 1 : 0)`)).toEqual(ones);
    expect(defaultTfPlots(`plot(timeframe.isdwm ? 1 : 0)`)).toEqual(ones);
  });

  test("all other flags default to false", () => {
    expect(defaultTfPlots(`plot(timeframe.isintraday ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.isweekly ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.ismonthly ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.isseconds ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.isinseconds ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.isminutes ? 1 : 0)`)).toEqual(zeros);
    expect(defaultTfPlots(`plot(timeframe.ishours ? 1 : 0)`)).toEqual(zeros);
  });

  test("configured timeframe still derives dynamically", () => {
    const minutes = new Runtime("TEST", { timeframe: "5" }).run(
      `indicator("t")
plot(timeframe.period == "5" ? 1 : 0)
plot(timeframe.isminutes ? 1 : 0)
plot(timeframe.isdwm ? 1 : 0)`,
      BARS,
    );
    expect(minutes.error).toBeUndefined();
    expect(minutes.series.plot).toEqual([1, 1, 1, 1]);
    expect(minutes.series.plot_2).toEqual([1, 1, 1, 1]);
    expect(minutes.series.plot_3).toEqual([0, 0, 0, 0]);
  });
});
