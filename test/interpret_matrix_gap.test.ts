/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, test } from "bun:test";
import { Runtime } from "../src/index.ts";

/** One bar. Values locked against Python `Runtime.run(..., mode="interpret")`. */
const BARS = [{ open: 1, high: 2, low: 0, close: 1, volume: 10, time: 1_700_000_000_000 }];

const SRC = `indicator("t")
m = matrix.new<float>(3, 3, 0)
matrix.set(m, 0, 0, 1)
matrix.set(m, 0, 1, 2)
matrix.set(m, 0, 2, 2)
matrix.set(m, 1, 0, 4)
matrix.set(m, 1, 1, na)
matrix.set(m, 1, 2, 6)
matrix.set(m, 2, 0, 2)
matrix.set(m, 2, 1, 8)
matrix.set(m, 2, 2, 1)
plot(matrix.sum_row(m, 0), title="sum_row")
plot(matrix.sum_row(m, 1), title="sum_row_na")
plot(matrix.sum_col(m, 0), title="sum_col")
plot(matrix.sum_col(m, 1), title="sum_col_na")
plot(matrix.avg_row(m, 0), title="avg_row")
plot(matrix.avg_row(m, 1), title="avg_row_na")
plot(matrix.avg_col(m, 2), title="avg_col")
plot(matrix.min_row(m, 1), title="min_row")
plot(matrix.max_row(m, 1), title="max_row")
plot(matrix.min_col(m, 1), title="min_col")
plot(matrix.max_col(m, 1), title="max_col")
plot(matrix.mode_all(m), title="mode_all")
plot(matrix.mode_row(m, 0), title="mode_row")
plot(matrix.mode_col(m, 0), title="mode_col")
plot(matrix.stdev(m), title="stdev")
plot(matrix.variance(m), title="variance")
row = matrix.copy_row(m, 0)
plot(array.get(row, 0), title="copy_r0")
plot(array.get(row, 2), title="copy_r2")
col = matrix.copy_col(m, 1)
plot(array.get(col, 0), title="copy_c0")
plot(array.get(col, 1), title="copy_c_na")
plot(array.get(col, 2), title="copy_c2")
matrix.fill_row(m, 2, 9)
plot(matrix.get(m, 2, 0), title="fill_row")
matrix.fill_col(m, 0, 3)
plot(matrix.get(m, 1, 0), title="fill_col")
plot(matrix.get(m, 2, 1), title="fill_keep")
matrix.fill_diagonal(m, 7)
plot(matrix.get(m, 0, 0), title="diag0")
plot(matrix.get(m, 1, 1), title="diag1")
plot(matrix.get(m, 0, 1), title="offdiag")
matrix.reverse_rows(m)
plot(matrix.get(m, 0, 1), title="rev_rows")
matrix.reverse_cols(m)
plot(matrix.get(m, 0, 0), title="rev_cols")
m2 = matrix.new<float>(1, 2, na)
plot(matrix.sum_row(m2, 0), title="sum_na")
plot(matrix.avg_row(m2, 0), title="avg_na")
plot(matrix.min_row(m2, 0), title="min_na")
plot(matrix.max_col(m2, 0), title="max_na")
plot(matrix.mode_row(m2, 0), title="mode_na")
m3 = matrix.new<float>(1, 1, 5)
plot(matrix.stdev(m3), title="stdev_one")
plot(matrix.variance(m3), title="var_one")
m4 = matrix.new<float>(1, 4, 0)
matrix.set(m4, 0, 0, 1)
matrix.set(m4, 0, 1, 2)
matrix.set(m4, 0, 2, 1)
matrix.set(m4, 0, 3, 2)
plot(matrix.mode_row(m4, 0), title="mode_tie")
m5 = matrix.new<float>(0, 0)
plot(matrix.mode_all(m5), title="mode_empty")
plot(matrix.stdev(m5), title="stdev_empty")
plot(matrix.variance(m5), title="var_empty")
md = matrix.new<float>(2, 3, 0)
matrix.fill_diagonal(md, 5)
plot(matrix.get(md, 0, 0), title="rdiag0")
plot(matrix.get(md, 1, 1), title="rdiag1")
plot(matrix.get(md, 0, 2), title="rdiag_off")
mt = matrix.new<float>(1, 2, na)
matrix.set(mt, 0, 0, 1)
plot(matrix.mode_row(mt, 0), title="mode_na_tie")
mt2 = matrix.new<float>(1, 2, 1)
matrix.set(mt2, 0, 0, na)
plot(matrix.mode_row(mt2, 0), title="mode_na_first")
`;

describe("matrix gap builtins", () => {
  test("row/col stats, fill, reverse, copy, stdev, mode match Python", () => {
    const out = new Runtime("TEST").run(SRC, BARS);
    expect(out.error).toBeUndefined();
    const at = (title: string) => out.series[title]?.[0];
    expect(at("sum_row")).toBe(5);
    expect(at("sum_row_na")).toBe(10);
    expect(at("sum_col")).toBe(7);
    expect(at("sum_col_na")).toBe(10);
    expect(at("avg_row")).toBeCloseTo(1.6666666666666667, 12);
    expect(at("avg_row_na")).toBe(5);
    expect(at("avg_col")).toBe(3);
    expect(at("min_row")).toBe(4);
    expect(at("max_row")).toBe(6);
    expect(at("min_col")).toBe(2);
    expect(at("max_col")).toBe(8);
    expect(at("mode_all")).toBe(2);
    expect(at("mode_row")).toBe(2);
    expect(at("mode_col")).toBe(1);
    expect(at("stdev")).toBeCloseTo(2.5495097567963922, 12);
    expect(at("variance")).toBeCloseTo(6.5, 12);
    expect(at("copy_r0")).toBe(1);
    expect(at("copy_r2")).toBe(2);
    expect(at("copy_c0")).toBe(2);
    expect(at("copy_c_na")).toBeNull();
    expect(at("copy_c2")).toBe(8);
    expect(at("fill_row")).toBe(9);
    expect(at("fill_col")).toBe(3);
    expect(at("fill_keep")).toBe(9);
    expect(at("diag0")).toBe(7);
    expect(at("diag1")).toBe(7);
    expect(at("offdiag")).toBe(2);
    expect(at("rev_rows")).toBe(9);
    expect(at("rev_cols")).toBe(7);
    expect(at("sum_na")).toBe(0);
    expect(at("avg_na")).toBe(0);
    expect(at("min_na")).toBeNull();
    expect(at("max_na")).toBeNull();
    expect(at("mode_na")).toBeNull();
    expect(at("stdev_one")).toBeNull();
    expect(at("var_one")).toBeNull();
    expect(at("mode_tie")).toBe(1);
    expect(at("mode_empty")).toBeNull();
    expect(at("stdev_empty")).toBeNull();
    expect(at("var_empty")).toBeNull();
    expect(at("rdiag0")).toBe(5);
    expect(at("rdiag1")).toBe(5);
    expect(at("rdiag_off")).toBe(0);
    expect(at("mode_na_tie")).toBe(1);
    expect(at("mode_na_first")).toBeNull();
  });
});
