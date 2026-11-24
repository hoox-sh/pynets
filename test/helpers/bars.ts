/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Shared OHLCV fixtures for tests. Keep bespoke fixtures local when their
 * shape is part of the assertion; use these for the common ramps/waves.
 */

export interface TestBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

/** Linear ramp used by ta.ao / ta.aroon tests. */
export function flatBars(n: number): TestBar[] {
  return Array.from({ length: n }, (_, i) => ({
    open: 100 + i * 0.1,
    high: 101 + i * 0.2,
    low: 99 + i * 0.05,
    close: 100.5 + i * 0.1,
    volume: 1000 + i,
    time: i * 86_400_000,
  }));
}

/**
 * Deterministic sine + sawtooth bars used by wave/gap/TA parity tests.
 * Non-monotonic closes keep period-like checks from mistaking a series arg.
 */
export function waveBars(n: number, step = 86_400_000): TestBar[] {
  return Array.from({ length: n }, (_, i) => {
    const close = 100 + 8 * Math.sin(i * 0.37) + (i % 7) * 0.4;
    const open = close - 0.3 + (i % 3) * 0.1;
    return {
      open,
      high: Math.max(open, close) + 0.8 + (i % 5) * 0.15,
      low: Math.min(open, close) - 0.6 - (i % 4) * 0.1,
      close,
      volume: 1000 + ((i * 37) % 500),
      time: i * step,
    };
  });
}

/** Fractional, non-monotonic closes for period-overload tests. */
export function periodBars(n: number): TestBar[] {
  return Array.from({ length: n }, (_, i) => {
    const close = 100 + 10 * Math.sin(i * 1.7) + (i % 5) * 0.5;
    return {
      open: close - 0.25,
      high: close + 1.5,
      low: close - 1.5,
      close,
      volume: 10 + (i % 3) * 2.5,
      time: i * 86_400_000,
    };
  });
}
