/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Pine v6 `request.footprint` mock + `footprint.*` / `volume_row.*` accessors.
 * Python `VolumeRow` / `Footprint` / `_handle_request_footprint` (request.py).
 * Seeded mocks use CPython `random.Random` MT19937 so `request.seed` matches.
 */

/** Volume row in a footprint (single price level). */
export class VolumeRow {
  constructor(
    public up_price = 0,
    public down_price = 0,
    public buy_volume = 0,
    public sell_volume = 0,
    public delta = 0,
    public is_imbalance = false,
    public is_poc = false,
    public is_vah = false,
    public is_val = false,
  ) {}
}

/** Footprint object: volume profile for one bar. */
export class Footprint {
  constructor(
    public num_ticks = 100,
    public va_percentage = 70,
    public buy_volume = 0,
    public sell_volume = 0,
    public delta = 0,
    public total_volume = 0,
    public vah_row: VolumeRow | null = null,
    public val_row: VolumeRow | null = null,
    public poc_row: VolumeRow | null = null,
    public rows: VolumeRow[] = [],
  ) {}
}

const N = 624;
const M = 397;
const MATRIX_A = 0x9908b0df;
const UPPER_MASK = 0x80000000;
const LOWER_MASK = 0x7fffffff;

/** CPython 3 `random.Random` (MT19937) for integer `random.seed`. */
class PyRandom {
  private readonly mt = new Uint32Array(N);
  private index = N + 1;

  seed(a: number): void {
    const n = Math.trunc(a);
    const abs = n < 0 ? -n : n;
    const key: number[] = [];
    if (abs === 0) key.push(0);
    else {
      let x = abs;
      while (x > 0) {
        key.push(x >>> 0);
        x = Math.floor(x / 0x100000000);
      }
    }
    this.initByArray(key);
  }

  random(): number {
    const a = this.genrand() >>> 5;
    const b = this.genrand() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  }

  private initGenrand(s: number): void {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let mti = 1; mti < N; mti++) {
      mt[mti] =
        (Math.imul(1812433253, mt[mti - 1]! ^ (mt[mti - 1]! >>> 30)) + mti) >>>
        0;
    }
    this.index = N;
  }

  private initByArray(initKey: number[]): void {
    const mt = this.mt;
    this.initGenrand(19650218);
    let i = 1;
    let j = 0;
    const keyLength = initKey.length;
    let k = N > keyLength ? N : keyLength;
    for (; k > 0; k--) {
      mt[i] =
        ((mt[i]! ^ Math.imul(mt[i - 1]! ^ (mt[i - 1]! >>> 30), 1664525)) +
          initKey[j]! +
          j) >>>
        0;
      i++;
      j++;
      if (i >= N) {
        mt[0] = mt[N - 1]!;
        i = 1;
      }
      if (j >= keyLength) j = 0;
    }
    for (k = N - 1; k > 0; k--) {
      mt[i] =
        ((mt[i]! ^ Math.imul(mt[i - 1]! ^ (mt[i - 1]! >>> 30), 1566083941)) -
          i) >>>
        0;
      i++;
      if (i >= N) {
        mt[0] = mt[N - 1]!;
        i = 1;
      }
    }
    mt[0] = 0x80000000;
    this.index = N;
  }

  private genrand(): number {
    const mt = this.mt;
    if (this.index >= N) {
      for (let kk = 0; kk < N - M; kk++) {
        const y = (mt[kk]! & UPPER_MASK) | (mt[kk + 1]! & LOWER_MASK);
        mt[kk] = (mt[kk + M]! ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      }
      for (let kk = N - M; kk < N - 1; kk++) {
        const y = (mt[kk]! & UPPER_MASK) | (mt[kk + 1]! & LOWER_MASK);
        mt[kk] = (mt[kk + (M - N)]! ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      }
      const y = (mt[N - 1]! & UPPER_MASK) | (mt[0]! & LOWER_MASK);
      mt[N - 1] = (mt[M - 1]! ^ (y >>> 1) ^ (y & 1 ? MATRIX_A : 0)) >>> 0;
      this.index = 0;
    }
    let y = mt[this.index++]!;
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
}

let pyRng: PyRandom | null = null;

/** `request.seed` — CPython `random.seed(seed_int)`. */
export function seedFootprintRng(seed: number): void {
  pyRng = new PyRandom();
  pyRng.seed(seed);
}

function nextRandom(): number {
  return pyRng != null ? pyRng.random() : Math.random();
}

function asCount(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value))
    return Math.trunc(value);
  return fallback;
}

function rowAt(rows: VolumeRow[], idx: number): VolumeRow | null {
  return idx >= 0 && idx < rows.length ? rows[idx]! : null;
}

/**
 * `request.footprint(num_ticks, va_percentage)` mock.
 * Missing ticks / VA % use Python defaults 100 / 70. No data_feed → vol_scale 1.
 */
export function createFootprint(
  numTicks: unknown = 100,
  vaPercentage: unknown = 70,
): Footprint {
  const n = asCount(numTicks, 100);
  const va = asCount(vaPercentage, 70);
  const rows: VolumeRow[] = [];
  const basePrice = 100.0;
  const tickSize = 0.01;
  for (let i = 0; i < n; i++) {
    const priceLevel = basePrice + i * tickSize;
    rows.push(
      new VolumeRow(
        priceLevel + tickSize,
        priceLevel,
        1000.0 + nextRandom() * 500,
        900.0 + nextRandom() * 500,
        100.0 + (nextRandom() * 200 - 100),
        nextRandom() < 0.1,
        i === Math.floor(n / 2),
        i === Math.trunc(n * 0.7),
        i === Math.trunc(n * 0.3),
      ),
    );
  }
  const totalBuy = rows.reduce((s, r) => s + r.buy_volume, 0);
  const totalSell = rows.reduce((s, r) => s + r.sell_volume, 0);
  return new Footprint(
    n,
    va,
    totalBuy,
    totalSell,
    totalBuy - totalSell,
    totalBuy + totalSell,
    rowAt(rows, Math.trunc(n * 0.7)),
    rowAt(rows, Math.trunc(n * 0.3)),
    rowAt(rows, Math.floor(n / 2)),
    rows,
  );
}

export function footprintBuyVolume(fp: unknown): number {
  return fp instanceof Footprint ? fp.buy_volume : 0;
}

export function footprintSellVolume(fp: unknown): number {
  return fp instanceof Footprint ? fp.sell_volume : 0;
}

export function footprintDelta(fp: unknown): number {
  return fp instanceof Footprint ? fp.delta : 0;
}

export function footprintTotalVolume(fp: unknown): number {
  return fp instanceof Footprint ? fp.total_volume : 0;
}

export function footprintVah(fp: unknown): VolumeRow | null {
  return fp instanceof Footprint ? fp.vah_row : null;
}

export function footprintVal(fp: unknown): VolumeRow | null {
  return fp instanceof Footprint ? fp.val_row : null;
}

export function footprintPoc(fp: unknown): VolumeRow | null {
  return fp instanceof Footprint ? fp.poc_row : null;
}

export function footprintRows(fp: unknown): VolumeRow[] {
  return fp instanceof Footprint ? fp.rows.slice() : [];
}

export function footprintGetRowByPrice(
  fp: unknown,
  price: unknown,
): VolumeRow | null {
  if (!(fp instanceof Footprint) || price == null) return null;
  if (typeof price !== "number" || !Number.isFinite(price)) return null;
  for (const row of fp.rows) {
    const lo = Math.min(row.down_price, row.up_price);
    const hi = Math.max(row.down_price, row.up_price);
    if (lo <= price && price <= hi) return row;
  }
  return null;
}

export function volumeRowUpPrice(vr: unknown): number {
  return vr instanceof VolumeRow ? vr.up_price : 0;
}

export function volumeRowDownPrice(vr: unknown): number {
  return vr instanceof VolumeRow ? vr.down_price : 0;
}

export function volumeRowBuyVolume(vr: unknown): number {
  return vr instanceof VolumeRow ? vr.buy_volume : 0;
}

export function volumeRowSellVolume(vr: unknown): number {
  return vr instanceof VolumeRow ? vr.sell_volume : 0;
}

export function volumeRowDelta(vr: unknown): number {
  return vr instanceof VolumeRow ? vr.delta : 0;
}

export function volumeRowTotalVolume(vr: unknown): number {
  return vr instanceof VolumeRow ? vr.buy_volume + vr.sell_volume : 0;
}

export function volumeRowHasBuyImbalance(vr: unknown): boolean {
  return vr instanceof VolumeRow
    ? Boolean(vr.is_imbalance && vr.buy_volume > vr.sell_volume)
    : false;
}

export function volumeRowHasSellImbalance(vr: unknown): boolean {
  return vr instanceof VolumeRow
    ? Boolean(vr.is_imbalance && vr.sell_volume > vr.buy_volume)
    : false;
}
