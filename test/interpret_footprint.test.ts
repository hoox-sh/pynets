/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Interpret `request.footprint` / `footprint.*` / `volume_row.*` vs Python Runtime.run.
 */
import { describe, expect, test } from "bun:test";
import { Runtime, type OHLCVBar } from "../src/index.ts";
import { pythonAvailable, pythonBin } from "./helpers/python_runtime.ts";

const PY = pythonBin();

const BARS: OHLCVBar[] = [100, 101, 102, 103, 104].map((close, i) => ({
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 1000,
  time: 1_700_000_000_000 + i * 60_000,
}));

function run(src: string) {
  return new Runtime("TEST").run(src, BARS, { mode: "interpret" });
}

function nums(values: Array<number | null> | undefined): Array<number | null> {
  return (values ?? []).map((v) =>
    typeof v === "number" && Number.isFinite(v) ? v : null,
  );
}

function pythonRun(src: string): {
  plots: Array<number | null>;
  series: Record<string, Array<number | null>>;
} {
  const payload = JSON.stringify({ src, bars: BARS, symbol: "TEST" });
  const proc = Bun.spawnSync(
    [
      PY,
      "-c",
      `import json
from pynescript.runtime import Runtime
req = json.loads(${JSON.stringify(payload)})
out = Runtime(req["symbol"]).run(req["src"], req["bars"], mode="interpret")
err = out.get("error")
if err:
    raise SystemExit(str(err))

def cell(v):
    if v is None:
        return None
    if isinstance(v, bool):
        return 1 if v else 0
    if isinstance(v, (int, float)):
        fv = float(v)
        if fv != fv or fv in (float("inf"), float("-inf")):
            return None
        return fv
    return None

series = {k: [cell(x) for x in vals] for k, vals in (out.get("series") or {}).items()}
print(json.dumps({"plots": [cell(v) for v in (out.get("plots") or [])], "series": series}))`,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (proc.exitCode !== 0) {
    throw new Error(proc.stderr.toString() || proc.stdout.toString());
  }
  return JSON.parse(proc.stdout.toString()) as {
    plots: Array<number | null>;
    series: Record<string, Array<number | null>>;
  };
}

describe("interpret footprint sentinels and structure", () => {
  test("missing / na footprint and row args match Python zeros and empty", () => {
    const out = run(`indicator("t")
plot(footprint.buy_volume(na), "b")
plot(footprint.buy_volume(), "bm")
plot(footprint.sell_volume(na), "s")
plot(footprint.delta(na), "d")
plot(footprint.total_volume(na), "t")
plot(array.size(footprint.rows(na)), "rn")
plot(array.size(footprint.rows()), "rm")
plot(volume_row.up_price(na), "up")
plot(volume_row.buy_volume(), "vb")
plot(volume_row.delta(na), "vd")
plot(volume_row.total_volume(na), "vt")
plot(volume_row.has_buy_imbalance(na) ? 1 : 0, "hb")
plot(volume_row.has_sell_imbalance(na) ? 1 : 0, "hs")
plot(na(footprint.poc(na)) ? 1 : 0, "np")
plot(na(footprint.vah(na)) ? 1 : 0, "nvh")
plot(na(footprint.val(na)) ? 1 : 0, "nvl")`);
    expect(out.error).toBeUndefined();
    expect(out.series.b).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.bm).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.s).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.d).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.t).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.rn).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.rm).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.up).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.vb).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.vd).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.vt).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.hb).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.hs).toEqual([0, 0, 0, 0, 0]);
    expect(out.series.np).toEqual([1, 1, 1, 1, 1]);
    expect(out.series.nvh).toEqual([1, 1, 1, 1, 1]);
    expect(out.series.nvl).toEqual([1, 1, 1, 1, 1]);
  });

  test("request.footprint returns a branded object with finite buy_volume", () => {
    const out = run(`indicator("t")
fp = request.footprint()
plot(footprint.buy_volume(fp), "b")
plot(array.size(footprint.rows(fp)), "n")
plot(na(fp) ? 1 : 0, "na")`);
    expect(out.error).toBeUndefined();
    expect(out.series.n).toEqual([100, 100, 100, 100, 100]);
    expect(out.series.na).toEqual([0, 0, 0, 0, 0]);
    for (const v of out.series.b ?? []) {
      expect(typeof v).toBe("number");
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
    }
  });

  test("rows size, poc/vah/val prices, get_row_by_price", () => {
    const out = run(`indicator("t")
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
miss = footprint.get_row_by_price(fp, 999)
plot(na(miss) ? 1 : 0, "miss")
nap = footprint.get_row_by_price(fp, na)
plot(na(nap) ? 1 : 0, "nap")
naf = footprint.get_row_by_price(na, 100.0)
plot(na(naf) ? 1 : 0, "naf")`);
    expect(out.error).toBeUndefined();
    expect(out.series.n).toEqual([10, 10, 10, 10, 10]);
    expect(out.series.pd).toEqual([100.05, 100.05, 100.05, 100.05, 100.05]);
    expect(out.series.pu).toEqual([100.06, 100.06, 100.06, 100.06, 100.06]);
    expect(out.series.vh).toEqual([100.08, 100.08, 100.08, 100.08, 100.08]);
    expect(out.series.vl).toEqual([100.04, 100.04, 100.04, 100.04, 100.04]);
    expect(out.series.r0).toEqual([100, 100, 100, 100, 100]);
    expect(out.series.hit).toEqual([100.04, 100.04, 100.04, 100.04, 100.04]);
    expect(out.series.miss).toEqual([1, 1, 1, 1, 1]);
    expect(out.series.nap).toEqual([1, 1, 1, 1, 1]);
    expect(out.series.naf).toEqual([1, 1, 1, 1, 1]);
  });

  test("volume_row accessors on poc and zero-tick mock", () => {
    const poc = run(`indicator("t")
fp = request.footprint(10, 70)
r = footprint.poc(fp)
plot(volume_row.buy_volume(r), "b")
plot(volume_row.sell_volume(r), "s")
plot(volume_row.delta(r), "d")
plot(volume_row.total_volume(r), "t")
plot(volume_row.has_buy_imbalance(r) ? 1 : 0, "hb")
plot(volume_row.has_sell_imbalance(r) ? 1 : 0, "hs")`);
    expect(poc.error).toBeUndefined();
    for (let i = 0; i < BARS.length; i++) {
      const b = poc.series.b![i]!;
      const s = poc.series.s![i]!;
      const t = poc.series.t![i]!;
      expect(Number.isFinite(b)).toBe(true);
      expect(Number.isFinite(s)).toBe(true);
      expect(t).toBeCloseTo(b + s, 10);
      expect(poc.series.hb![i] === 0 || poc.series.hb![i] === 1).toBe(true);
      expect(poc.series.hs![i] === 0 || poc.series.hs![i] === 1).toBe(true);
    }
    const zero = run(`indicator("t")
fp = request.footprint(0)
plot(array.size(footprint.rows(fp)), "n")
plot(footprint.buy_volume(fp), "b")
plot(na(footprint.poc(fp)) ? 1 : 0, "p")`);
    expect(zero.error).toBeUndefined();
    expect(zero.series.n).toEqual([0, 0, 0, 0, 0]);
    expect(zero.series.b).toEqual([0, 0, 0, 0, 0]);
    expect(zero.series.p).toEqual([1, 1, 1, 1, 1]);
  });

  test("request.seed makes the mock reproducible across bars", () => {
    const out = run(`indicator("t")
request.seed(42)
fp = request.footprint(5, 70)
plot(footprint.buy_volume(fp), "b")
plot(footprint.sell_volume(fp), "s")
plot(array.size(footprint.rows(fp)), "n")`);
    expect(out.error).toBeUndefined();
    expect(out.series.n).toEqual([5, 5, 5, 5, 5]);
    const buy = out.series.b!;
    const sell = out.series.s!;
    expect(buy[0]).toBeCloseTo(6022.3982120158635, 10);
    expect(sell[0]).toBeCloseTo(5259.805398323103, 10);
    for (const v of buy) expect(v).toBe(buy[0]);
    for (const v of sell) expect(v).toBe(sell[0]);
  });
});

describe.skipIf(!pythonAvailable())(
  "interpret footprint vs Python Runtime.run",
  () => {
    test("seeded buy/sell/delta and row prices match Python", () => {
      const src = `indicator("t")
request.seed(42)
fp = request.footprint(5, 70)
plot(footprint.buy_volume(fp), "b")
plot(footprint.sell_volume(fp), "s")
plot(footprint.delta(fp), "d")
plot(footprint.total_volume(fp), "t")
plot(array.size(footprint.rows(fp)), "n")
poc = footprint.poc(fp)
plot(volume_row.up_price(poc), "pu")
plot(volume_row.down_price(poc), "pd")
plot(volume_row.has_buy_imbalance(poc) ? 1 : 0, "hb")
plot(volume_row.has_sell_imbalance(poc) ? 1 : 0, "hs")`;
      const py = pythonRun(src);
      const ts = run(src);
      expect(ts.error).toBeUndefined();
      for (const key of Object.keys(py.series)) {
        const a = nums(ts.series[key]);
        const e = nums(py.series[key]);
        expect(a.length).toBe(e.length);
        for (let i = 0; i < e.length; i++) {
          if (e[i] == null) {
            expect(a[i]).toBeNull();
            continue;
          }
          expect(a[i]).toBeCloseTo(e[i]!, 8);
        }
      }
    });

    test("both hosts return finite buy_volume for request.footprint()", () => {
      const src = `indicator("t")
fp = request.footprint(10, 70)
plot(footprint.buy_volume(fp), "b")
plot(array.size(footprint.rows(fp)), "n")`;
      const py = pythonRun(src);
      const ts = run(src);
      expect(ts.error).toBeUndefined();
      expect(nums(ts.series.n)).toEqual(nums(py.series.n));
      expect(nums(py.series.n)).toEqual([10, 10, 10, 10, 10]);
      for (let i = 0; i < BARS.length; i++) {
        expect(Number.isFinite(py.series.b![i]!)).toBe(true);
        expect(Number.isFinite(ts.series.b![i]!)).toBe(true);
      }
    });

    test("sentinel scripts match Python plots", () => {
      const src = `indicator("t")
plot(footprint.buy_volume(na), "b")
plot(array.size(footprint.rows(na)), "r")
plot(volume_row.up_price(na), "u")
plot(na(footprint.poc(na)) ? 1 : 0, "p")
plot(volume_row.has_buy_imbalance(na) ? 1 : 0, "h")`;
      const py = pythonRun(src);
      const ts = run(src);
      expect(ts.error).toBeUndefined();
      expect(nums(ts.series.b)).toEqual(nums(py.series.b));
      expect(nums(ts.series.r)).toEqual(nums(py.series.r));
      expect(nums(ts.series.u)).toEqual(nums(py.series.u));
      expect(nums(ts.series.p)).toEqual(nums(py.series.p));
      expect(nums(ts.series.h)).toEqual(nums(py.series.h));
    });
  },
);
