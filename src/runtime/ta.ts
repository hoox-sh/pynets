/**
 * Copyright (C) 2024-2026 jango_blockchained
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Incremental TA (Python `TechnicalHelpers` SoT).
 * Stateful per call-site; one sample per bar.
 */

export type Cell = number | null;

interface SmaState {
  period: number;
  window: Cell[];
  sum: number;
  count: number;
}

interface EmaState {
  period: number;
  ema: number | null;
  seeded: boolean;
  seedBuf: number[];
}

interface RmaState {
  period: number;
  rma: number | null;
  seeded: boolean;
  started: boolean;
  seedBuf: number[];
}

interface AtrState {
  period: number;
  prevClose: Cell;
  rma: RmaState;
}

interface RsiState {
  period: number;
  prev: number | null;
  gainSeed: number[];
  lossSeed: number[];
  avgGain: number | null;
  avgLoss: number | null;
  seeded: boolean;
}

interface TrState {
  prevClose: Cell;
}

interface HighestLowestState {
  period: number;
  window: Cell[];
}

interface StdevState {
  period: number;
  window: Cell[];
  sum: number;
  sumsq: number;
  count: number;
}

interface ChangeState {
  length: number;
  window: Cell[];
}

interface WmaState {
  period: number;
  window: Cell[];
}

interface VwmaState {
  period: number;
  srcWindow: Cell[];
  volWindow: Cell[];
}

interface CrossState {
  prevA: Cell;
  prevB: Cell;
  started: boolean;
}

interface LinregState {
  period: number;
  offset: number;
  window: Cell[];
}

interface VwapState {
  cumPv: number;
  cumV: number;
  value: Cell;
}

interface RiseFallState {
  length: number;
  prev: Cell;
  streak: number;
  started: boolean;
}

interface AlmaState {
  period: number;
  offset: number;
  sigma: number;
  window: Cell[];
  weights: number[];
  wsum: number;
}

interface CmoState {
  period: number;
  window: Cell[];
}

interface KamaState {
  period: number;
  fast: number;
  slow: number;
  prices: number[];
  diffs: number[];
  vol: number;
  kama: number | null;
  seeded: boolean;
  bars: number;
}

interface ObvState {
  prev: Cell;
  obv: number;
  bars: number;
}

interface PivotState {
  left: number;
  right: number;
  window: Cell[];
  n: number;
}

function finiteCell(value: Cell): Cell {
  return value !== null && Number.isFinite(value) ? value : null;
}

/** Pine length: finite, trunc toward 0, must be >= 1. */
function pinePeriod(period: number): number | null {
  if (!Number.isFinite(period) || period <= 0) return null;
  const n = Math.trunc(period);
  return n > 0 ? n : null;
}

function rmaStep(st: RmaState, x: Cell, n: number): Cell {
  const alpha = 1 / n;
  if (!st.started) {
    if (x === null) return null;
    st.started = true;
  }
  if (!st.seeded) {
    if (x !== null) st.seedBuf.push(x);
    if (st.seedBuf.length < n) return null;
    const seed = st.seedBuf.reduce((a, b) => a + b, 0) / n;
    st.rma = seed;
    st.seeded = true;
    st.seedBuf = [];
    return seed;
  }
  if (x === null) return st.rma;
  st.rma = alpha * x + (1 - alpha) * (st.rma ?? x);
  return st.rma;
}

export class TaEngine {
  private readonly smaSites = new Map<string, SmaState>();
  private readonly emaSites = new Map<string, EmaState>();
  private readonly rmaSites = new Map<string, RmaState>();
  private readonly atrSites = new Map<string, AtrState>();
  private readonly rsiSites = new Map<string, RsiState>();
  private readonly trSites = new Map<string, TrState>();
  private readonly highestSites = new Map<string, HighestLowestState>();
  private readonly lowestSites = new Map<string, HighestLowestState>();
  private readonly stdevSites = new Map<string, StdevState>();
  private readonly changeSites = new Map<string, ChangeState>();
  private readonly wmaSites = new Map<string, WmaState>();
  private readonly sumSites = new Map<string, SmaState>();
  private readonly rocSites = new Map<string, ChangeState>();
  private readonly vwmaSites = new Map<string, VwmaState>();
  private readonly cciSites = new Map<string, WmaState>();
  private readonly crossoverSites = new Map<string, CrossState>();
  private readonly crossunderSites = new Map<string, CrossState>();
  private readonly linregSites = new Map<string, LinregState>();
  private readonly vwapSites = new Map<string, VwapState>();
  private readonly risingSites = new Map<string, RiseFallState>();
  private readonly fallingSites = new Map<string, RiseFallState>();
  private readonly almaSites = new Map<string, AlmaState>();
  private readonly cmoSites = new Map<string, CmoState>();
  private readonly kamaSites = new Map<string, KamaState>();
  private readonly obvSites = new Map<string, ObvState>();
  private readonly pivotHighSites = new Map<string, PivotState>();
  private readonly pivotLowSites = new Map<string, PivotState>();

  sma(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;

    let st = this.smaSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [], sum: 0, count: 0 };
      this.smaSites.set(site, st);
    }

    const x = finiteCell(source);
    if (st.window.length === n) {
      const old = st.window.shift()!;
      if (old !== null) {
        st.sum -= old;
        st.count -= 1;
      }
    }
    st.window.push(x);
    if (x !== null) {
      st.sum += x;
      st.count += 1;
    }

    // Full window required; any na in the window → na (`_sma_inc_update`).
    if (st.window.length < n || st.count !== n) return null;
    return st.sum / n;
  }

  /** Pine EMA: SMA seed of first `period` finite samples, then α=2/(n+1). */
  ema(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.emaSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, ema: null, seeded: false, seedBuf: [] };
      this.emaSites.set(site, st);
    }
    const x = finiteCell(source);
    const alpha = 2 / (n + 1);
    if (!st.seeded) {
      if (x === null) return null;
      st.seedBuf.push(x);
      if (st.seedBuf.length < n) return null;
      const seed = st.seedBuf.reduce((a, b) => a + b, 0) / n;
      st.ema = seed;
      st.seeded = true;
      st.seedBuf = [];
      return seed;
    }
    if (x === null) return st.ema;
    st.ema = st.ema == null ? x : alpha * x + (1 - alpha) * st.ema;
    return st.ema;
  }

  /** Wilder RMA: mean seed, then α=1/n. na after seed keeps previous. */
  rma(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.rmaSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, rma: null, seeded: false, started: false, seedBuf: [] };
      this.rmaSites.set(site, st);
    }
    return rmaStep(st, finiteCell(source), n);
  }

  /** `ta.atr(length)` ≡ `ta.rma(ta.tr, length)`. First bar is na (no prev close). */
  atr(site: string, high: Cell, low: Cell, close: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.atrSites.get(site);
    if (st === undefined || st.period !== n) {
      st = {
        period: n,
        prevClose: null,
        rma: { period: n, rma: null, seeded: false, started: false, seedBuf: [] },
      };
      this.atrSites.set(site, st);
    }
    const prev = st.prevClose;
    st.prevClose = finiteCell(close);
    if (prev === null) return null;
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    if (h === null || l === null || c === null) return null;
    const tr = Math.max(h - l, Math.abs(h - prev), Math.abs(l - prev));
    return rmaStep(st.rma, tr, n);
  }

  rsi(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;

    let st = this.rsiSites.get(site);
    if (st === undefined || st.period !== n) {
      st = {
        period: n,
        prev: null,
        gainSeed: [],
        lossSeed: [],
        avgGain: null,
        avgLoss: null,
        seeded: false,
      };
      this.rsiSites.set(site, st);
    }

    const x = finiteCell(source);
    // NA source: emit na and leave Wilder state untouched.
    if (x === null) return null;

    const prev = st.prev;
    st.prev = x;
    if (prev === null) return null;

    const change = x - prev;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    const alpha = 1 / n;

    if (!st.seeded) {
      st.gainSeed.push(gain);
      st.lossSeed.push(loss);
      if (st.gainSeed.length < n) return null;
      let gSum = 0;
      let lSum = 0;
      for (let i = 0; i < n; i++) {
        gSum += st.gainSeed[i]!;
        lSum += st.lossSeed[i]!;
      }
      st.avgGain = gSum / n;
      st.avgLoss = lSum / n;
      st.seeded = true;
      st.gainSeed = [];
      st.lossSeed = [];
    } else {
      st.avgGain = alpha * gain + (1 - alpha) * st.avgGain!;
      st.avgLoss = alpha * loss + (1 - alpha) * st.avgLoss!;
    }

    // Python `_rsi_inc_update`: avg_loss == 0 → 100 (including both-zero).
    if (st.avgLoss === 0) return 100;
    const rs = st.avgGain! / st.avgLoss;
    return 100 - 100 / (1 + rs);
  }

  /**
   * Keltner: mid=EMA(close,length); bands=mid ± mult*ATR(length).
   * Mid na → all na. Nested EMA/ATR keep their own per-site state.
   */
  kc(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    length: number,
    mult: number,
  ): { mid: Cell; up: Cell; lo: Cell } {
    const n = pinePeriod(length);
    if (n === null) return { mid: null, up: null, lo: null };
    const mid = this.ema(`${site}:ema`, close, n);
    const atrVal = this.atr(`${site}:atr`, high, low, close, n);
    if (mid === null) return { mid: null, up: null, lo: null };
    // `_kc_inc_update`: None ATR → 0 width (nan ATR is not produced here).
    const width = (atrVal ?? 0) * mult;
    return { mid, up: mid + width, lo: mid - width };
  }

  /**
   * Supertrend: ATR; mid=(h+l)/2; dir=-1 if close>=mid else 1;
   * st=lower if dir<0 else upper. None/nan ATR → 0 (`_supertrend_inc_update`).
   */
  supertrend(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    factor: number,
    atrPeriod: number,
  ): { st: Cell; dir: Cell } {
    const n = pinePeriod(atrPeriod);
    const atrVal = n === null ? null : this.atr(`${site}:atr`, high, low, close, n);
    const atrF = atrVal === null || !Number.isFinite(atrVal) ? 0 : atrVal;
    const h = finiteCell(high) ?? 0;
    const l = finiteCell(low) ?? 0;
    const c = finiteCell(close) ?? h;
    const mid = (h + l) / 2;
    const upper = mid + factor * atrF;
    const lower = mid - factor * atrF;
    const dir = c >= mid ? -1 : 1;
    return { st: dir < 0 ? lower : upper, dir };
  }

  /** True range. First bar na (no prev close); else max(h-l, |h-prevC|, |l-prevC|). */
  tr(site: string, high: Cell, low: Cell, close: Cell): Cell {
    let st = this.trSites.get(site);
    if (st === undefined) {
      st = { prevClose: null };
      this.trSites.set(site, st);
    }
    const prev = st.prevClose;
    st.prevClose = finiteCell(close);
    if (prev === null) return null;
    const h = finiteCell(high);
    const l = finiteCell(low);
    if (h === null || l === null) return null;
    return Math.max(h - l, Math.abs(h - prev), Math.abs(l - prev));
  }

  /** Highest in last `period` samples (na skipped). */
  highest(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.highestSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.highestSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let best: number | null = null;
    for (const v of st.window) {
      if (v !== null && (best === null || v > best)) best = v;
    }
    return best;
  }

  /** Lowest in last `period` samples (na skipped). */
  lowest(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.lowestSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.lowestSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let best: number | null = null;
    for (const v of st.window) {
      if (v !== null && (best === null || v < best)) best = v;
    }
    return best;
  }

  /** Sample stdev (ddof=1). Any na in window → na; period<=1 → na. */
  stdev(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null || n <= 1) return null;
    let st = this.stdevSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [], sum: 0, sumsq: 0, count: 0 };
      this.stdevSites.set(site, st);
    }
    const x = finiteCell(source);
    if (st.window.length === n) {
      const old = st.window.shift()!;
      if (old !== null) {
        st.sum -= old;
        st.sumsq -= old * old;
        st.count -= 1;
      }
    }
    st.window.push(x);
    if (x !== null) {
      st.sum += x;
      st.sumsq += x * x;
      st.count += 1;
    }
    if (st.window.length < n || st.count !== n) return null;
    let v = (st.sumsq - (st.sum * st.sum) / n) / (n - 1);
    if (v < 0) v = 0;
    return Math.sqrt(v);
  }

  /** `source - source[length]`. na if lookback missing. */
  change(site: string, source: Cell, length = 1): Cell {
    if (!Number.isFinite(length) || length < 0) return null;
    const n = Math.trunc(length);
    const x = finiteCell(source);
    if (n === 0) return x === null ? null : 0;
    let st = this.changeSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, window: [] };
      this.changeSites.set(site, st);
    }
    if (st.window.length === n + 1) st.window.shift();
    st.window.push(x);
    if (st.window.length <= n) return null;
    const curr = st.window[st.window.length - 1]!;
    const prev = st.window[0]!;
    if (curr === null || prev === null) return null;
    return curr - prev;
  }

  /** Weighted MA, weights 1..n (oldest=1). Any na in window → na. */
  wma(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.wmaSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.wmaSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const v = st.window[i];
      if (v == null) return null;
      acc += v * (i + 1);
    }
    return acc / (n * (n + 1) / 2);
  }

  /** 1 when prev a<=b and now a>b; first bar 0. */
  crossover(site: string, a: Cell, b: Cell): Cell {
    return this.crossStep(this.crossoverSites, site, a, b, false);
  }

  /** 1 when prev a>=b and now a<b; first bar 0. */
  crossunder(site: string, a: Cell, b: Cell): Cell {
    return this.crossStep(this.crossunderSites, site, a, b, true);
  }

  /**
   * MACD via nested EMA sites (`${site}:fast` / `:slow` / `:signal`).
   * Either EMA na → macd null; hist only when macd and signal both finite.
   */
  macd(
    site: string,
    source: Cell,
    fast = 12,
    slow = 26,
    signal = 9,
  ): { macd: Cell; signal: Cell; hist: Cell } {
    const ef = this.ema(`${site}:fast`, source, fast);
    const es = this.ema(`${site}:slow`, source, slow);
    const macdVal = ef === null || es === null ? null : ef - es;
    const sigVal = this.ema(`${site}:signal`, macdVal, signal);
    const hist =
      macdVal !== null && sigVal !== null && Number.isFinite(macdVal) && Number.isFinite(sigVal)
        ? macdVal - sigVal
        : null;
    return { macd: macdVal, signal: sigVal, hist };
  }

  /**
   * Bollinger: mid=SMA, dev=sample stdev, bands=mid ± mult*dev.
   * All null if mid or stdev null.
   */
  bb(
    site: string,
    source: Cell,
    length: number,
    mult = 2,
  ): { mid: Cell; up: Cell; lo: Cell } {
    const mid = this.sma(`${site}:sma`, source, length);
    const dev = this.stdev(`${site}:stdev`, source, length);
    if (mid === null || dev === null) return { mid: null, up: null, lo: null };
    return { mid, up: mid + mult * dev, lo: mid - mult * dev };
  }

  /** Rolling sum. Full window required; any na in the window → na (like sma). */
  sum(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;

    let st = this.sumSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [], sum: 0, count: 0 };
      this.sumSites.set(site, st);
    }

    const x = finiteCell(source);
    if (st.window.length === n) {
      const old = st.window.shift()!;
      if (old !== null) {
        st.sum -= old;
        st.count -= 1;
      }
    }
    st.window.push(x);
    if (x !== null) {
      st.sum += x;
      st.count += 1;
    }

    if (st.window.length < n || st.count !== n) return null;
    return st.sum;
  }

  /** `100 * (source - source[length]) / source[length]`. na if lookback missing or denom 0. */
  roc(site: string, source: Cell, length: number): Cell {
    if (!Number.isFinite(length) || length < 0) return null;
    const n = Math.trunc(length);
    const x = finiteCell(source);
    if (n === 0) return x === null || x === 0 ? null : 0;
    let st = this.rocSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, window: [] };
      this.rocSites.set(site, st);
    }
    if (st.window.length === n + 1) st.window.shift();
    st.window.push(x);
    if (st.window.length <= n) return null;
    const curr = st.window[st.window.length - 1]!;
    const prev = st.window[0]!;
    if (curr === null || prev === null || prev === 0) return null;
    return 100 * (curr - prev) / prev;
  }

  /** `source - source[length]`. Same lag math as `change`. */
  mom(site: string, source: Cell, length: number): Cell {
    return this.change(site, source, length);
  }

  /** Volume-weighted MA: sum(src*vol)/sum(vol). Any na in window → na. */
  vwma(site: string, source: Cell, volume: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.vwmaSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, srcWindow: [], volWindow: [] };
      this.vwmaSites.set(site, st);
    }
    if (st.srcWindow.length === n) {
      st.srcWindow.shift();
      st.volWindow.shift();
    }
    st.srcWindow.push(finiteCell(source));
    st.volWindow.push(finiteCell(volume));
    if (st.srcWindow.length < n) return null;
    let sumPv = 0;
    let sumV = 0;
    for (let i = 0; i < n; i++) {
      const s = st.srcWindow[i];
      const v = st.volWindow[i];
      if (s == null || v == null) return null;
      sumPv += s * v;
      sumV += v;
    }
    if (sumV === 0) return null;
    return sumPv / sumV;
  }

  /** CCI: (tp - sma(tp)) / (0.015 * meanDev). Any na in window → na. */
  cci(site: string, typicalPrice: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.cciSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.cciSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(typicalPrice));
    if (st.window.length < n) return null;
    let acc = 0;
    for (const v of st.window) {
      if (v == null) return null;
      acc += v;
    }
    const sma = acc / n;
    let mad = 0;
    for (const v of st.window) mad += Math.abs(v! - sma);
    const meanDev = mad / n;
    if (meanDev === 0) return null;
    return (st.window[n - 1]! - sma) / (0.015 * meanDev);
  }

  /** Williams %R: -100*(hh-c)/(hh-ll). na if incomplete window or hh==ll. */
  willr(site: string, high: Cell, low: Cell, close: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    const hh = this.highest(`${site}:hh`, high, n);
    const ll = this.lowest(`${site}:ll`, low, n);
    const c = finiteCell(close);
    if (hh === null || ll === null || c === null || hh === ll) return null;
    return -100 * (hh - c) / (hh - ll);
  }

  /** Stochastic %K: 100*(c-ll)/(hh-ll). na if incomplete window or hh==ll. */
  stoch(site: string, source: Cell, high: Cell, low: Cell, length: number): Cell {
    const n = pinePeriod(length);
    if (n === null) return null;
    const hh = this.highest(`${site}:hh`, high, n);
    const ll = this.lowest(`${site}:ll`, low, n);
    const c = finiteCell(source);
    if (hh === null || ll === null || c === null || hh === ll) return null;
    return 100 * (c - ll) / (hh - ll);
  }

  /** Least-squares line value at `length-1-offset`. Any na in window → na. */
  linreg(site: string, source: Cell, length: number, offset = 0): Cell {
    const n = pinePeriod(length);
    if (n === null || n < 2) return null;
    const off = Number.isFinite(offset) ? Math.trunc(offset) : 0;
    let st = this.linregSites.get(site);
    if (st === undefined || st.period !== n || st.offset !== off) {
      st = { period: n, offset: off, window: [] };
      this.linregSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let sumY = 0;
    for (const v of st.window) {
      if (v == null) return null;
      sumY += v;
    }
    const meanX = (n - 1) / 2;
    const meanY = sumY / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      const dx = i - meanX;
      num += dx * (st.window[i]! - meanY);
      den += dx * dx;
    }
    if (den === 0) return meanY;
    const slope = num / den;
    return meanY + slope * ((n - 1 - off) - meanX);
  }

  /** Cumulative VWAP: sum(src*vol)/sum(vol). Skips na source; no session reset. */
  vwap(site: string, source: Cell, volume: Cell): Cell {
    let st = this.vwapSites.get(site);
    if (st === undefined) {
      st = { cumPv: 0, cumV: 0, value: null };
      this.vwapSites.set(site, st);
    }
    const p = finiteCell(source);
    if (p === null) return st.value;
    const v = finiteCell(volume) ?? 0;
    st.cumPv += p * v;
    st.cumV += v;
    st.value = st.cumV !== 0 ? st.cumPv / st.cumV : p;
    return st.value;
  }

  /** 1 if `source > source[1]` for `length` bars; else 0. Warmup 0. */
  rising(site: string, source: Cell, length: number): Cell {
    return this.riseFallStep(this.risingSites, site, source, length, false);
  }

  /** 1 if `source < source[1]` for `length` bars; else 0. Warmup 0. */
  falling(site: string, source: Cell, length: number): Cell {
    return this.riseFallStep(this.fallingSites, site, source, length, true);
  }

  private riseFallStep(
    sites: Map<string, RiseFallState>,
    site: string,
    source: Cell,
    length: number,
    falling: boolean,
  ): Cell {
    const n = pinePeriod(length);
    if (n === null) return 0;
    let st = sites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, prev: null, streak: 0, started: false };
      sites.set(site, st);
    }
    const x = finiteCell(source);
    if (!st.started) {
      st.prev = x;
      st.started = true;
      st.streak = 0;
      return 0;
    }
    const prev = st.prev;
    const step = x !== null && prev !== null && (falling ? x < prev : x > prev);
    st.streak = step ? st.streak + 1 : 0;
    st.prev = x;
    return st.streak >= n ? 1 : 0;
  }

  private crossStep(
    sites: Map<string, CrossState>,
    site: string,
    a: Cell,
    b: Cell,
    under: boolean,
  ): Cell {
    let st = sites.get(site);
    if (st === undefined) {
      st = { prevA: null, prevB: null, started: false };
      sites.set(site, st);
    }
    const aF = finiteCell(a);
    const bF = finiteCell(b);
    let hit = 0;
    if (st.started && st.prevA !== null && st.prevB !== null && aF !== null && bF !== null) {
      const crossed = under
        ? st.prevA >= st.prevB && aF < bF
        : st.prevA <= st.prevB && aF > bF;
      hit = crossed ? 1 : 0;
    }
    st.prevA = aF;
    st.prevB = bF;
    st.started = true;
    return hit;
  }

  /** 1 if crossover or crossunder this bar. */
  cross(site: string, a: Cell, b: Cell): Cell {
    const up = this.crossover(`${site}:up`, a, b);
    const down = this.crossunder(`${site}:down`, a, b);
    return up === 1 || down === 1 ? 1 : 0;
  }

  /** `(up - lo) / mid` from `bb`. */
  bbw(site: string, source: Cell, length: number, mult = 2): Cell {
    const r = this.bb(site, source, length, mult);
    if (r.mid === null || r.up === null || r.lo === null || r.mid === 0) return null;
    return (r.up - r.lo) / r.mid;
  }

  /** `2*ema - ema(ema)`. */
  dema(site: string, source: Cell, period: number): Cell {
    const e1 = this.ema(`${site}:e1`, source, period);
    const e2 = this.ema(`${site}:e2`, e1, period);
    if (e1 === null || e2 === null) return null;
    return 2 * e1 - e2;
  }

  /** `3*ema - 3*ema(ema) + ema(ema(ema))`. */
  tema(site: string, source: Cell, period: number): Cell {
    const e1 = this.ema(`${site}:e1`, source, period);
    const e2 = this.ema(`${site}:e2`, e1, period);
    const e3 = this.ema(`${site}:e3`, e2, period);
    if (e1 === null || e2 === null || e3 === null) return null;
    return 3 * e1 - 3 * e2 + e3;
  }

  /**
   * Offset (negative, TradingView style) of the highest in the window.
   * `0` = current bar is the high; `-n+1` = oldest bar.
   */
  highestbars(site: string, source: Cell, period: number): Cell {
    return this.extremeBars(this.highestSites, site, source, period, true);
  }

  /** Offset of the lowest in the window (negative TV style). */
  lowestbars(site: string, source: Cell, period: number): Cell {
    return this.extremeBars(this.lowestSites, site, source, period, false);
  }

  private extremeBars(
    sites: Map<string, HighestLowestState>,
    site: string,
    source: Cell,
    period: number,
    highest: boolean,
  ): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = sites.get(`${site}:bars`);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      sites.set(`${site}:bars`, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let bestI = -1;
    let best: number | null = null;
    for (let i = 0; i < st.window.length; i++) {
      const v = st.window[i];
      if (v === null) continue;
      if (best === null || (highest ? v >= best : v <= best)) {
        best = v;
        bestI = i;
      }
    }
    if (bestI < 0) return null;
    return bestI - (st.window.length - 1);
  }

  /** Arnaud Legoux MA. na in window → na. Defaults offset=0.85, sigma=6. */
  alma(site: string, source: Cell, period: number, offset = 0.85, sigma = 6): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    const off = Number.isFinite(offset) ? offset : 0.85;
    const sig = Number.isFinite(sigma) ? sigma : 6;
    let st = this.almaSites.get(site);
    if (st === undefined || st.period !== n || st.offset !== off || st.sigma !== sig) {
      const m = off * (n - 1);
      const s = sig === 0 ? 0 : n / sig;
      const weights: number[] = [];
      let wsum = 0;
      for (let i = 0; i < n; i++) {
        const w = s === 0 ? 1 : Math.exp(-((i - m) ** 2) / (2 * s * s));
        weights.push(w);
        wsum += w;
      }
      st = { period: n, offset: off, sigma: sig, window: [], weights, wsum };
      this.almaSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n || st.wsum === 0) return null;
    let total = 0;
    for (let i = 0; i < n; i++) {
      const v = st.window[i];
      if (v == null) return null;
      total += v * st.weights[i]!;
    }
    return total / st.wsum;
  }

  /** Chande Momentum Oscillator. Window of length+1; denom 0 → 0. */
  cmo(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.cmoSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.cmoSites.set(site, st);
    }
    if (st.window.length === n + 1) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n + 1) return null;
    let up = 0;
    let down = 0;
    let prev: Cell = null;
    for (const v of st.window) {
      if (prev !== null && v !== null) {
        const d = v - prev;
        if (d > 0) up += d;
        else down += -d;
      }
      prev = v;
    }
    const denom = up + down;
    if (denom === 0) return 0;
    return (100 * (up - down)) / denom;
  }

  /** Kaufman AMA. First output on bar index `length` (need length+1 samples). */
  kama(site: string, source: Cell, period: number, fast = 2, slow = 30): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    const f = Number.isFinite(fast) && fast > 0 ? Math.trunc(fast) : 2;
    const sl = Number.isFinite(slow) && slow > 0 ? Math.trunc(slow) : 30;
    let st = this.kamaSites.get(site);
    if (st === undefined || st.period !== n || st.fast !== f || st.slow !== sl) {
      st = {
        period: n,
        fast: f,
        slow: sl,
        prices: [],
        diffs: [],
        vol: 0,
        kama: null,
        seeded: false,
        bars: 0,
      };
      this.kamaSites.set(site, st);
    }
    const x = finiteCell(source);
    if (x === null) return null;
    const prev = st.prices.length === 0 ? null : st.prices[st.prices.length - 1]!;
    if (st.prices.length === n + 1) st.prices.shift();
    st.prices.push(x);
    st.bars += 1;
    if (prev !== null) {
      const d = Math.abs(x - prev);
      if (st.diffs.length === n) st.vol -= st.diffs.shift()!;
      st.diffs.push(d);
      st.vol += d;
    }
    if (!st.seeded) {
      if (st.bars < n) return null;
      st.kama = x;
      st.seeded = true;
      return null;
    }
    const oldest = st.prices[0]!;
    const change = Math.abs(x - oldest);
    const volatility = st.vol;
    let sc: number;
    if (volatility !== 0) {
      const efficiency = change / volatility;
      const fastest = 2 / (f + 1);
      const slowest = 2 / (sl + 1);
      const smoothing = efficiency * (fastest - slowest) + slowest;
      sc = smoothing * smoothing;
    } else {
      sc = (2 / (sl + 1)) ** 2;
    }
    st.kama = (st.kama ?? x) + sc * (x - (st.kama ?? x));
    return st.kama;
  }

  /**
   * On-Balance Volume. Python `_obv`: 0 until 3 samples; then signed volume
   * from index 2 onward.
   */
  obv(site: string, close: Cell, volume: Cell): Cell {
    let st = this.obvSites.get(site);
    if (st === undefined) {
      st = { prev: null, obv: 0, bars: 0 };
      this.obvSites.set(site, st);
    }
    const c = finiteCell(close);
    const v = finiteCell(volume) ?? 0;
    st.bars += 1;
    if (st.bars < 3) {
      st.prev = c;
      return 0;
    }
    if (c !== null && st.prev !== null) {
      if (c > st.prev) st.obv += v;
      else if (c < st.prev) st.obv -= v;
    }
    st.prev = c;
    return st.obv;
  }

  /** Left-only pivothigh (Python incremental). */
  pivothigh(site: string, source: Cell, left: number, right: number): Cell {
    return this.pivotStep(this.pivotHighSites, site, source, left, right, true);
  }

  /** Left-only pivotlow (Python incremental). */
  pivotlow(site: string, source: Cell, left: number, right: number): Cell {
    return this.pivotStep(this.pivotLowSites, site, source, left, right, false);
  }

  private pivotStep(
    sites: Map<string, PivotState>,
    site: string,
    source: Cell,
    left: number,
    right: number,
    high: boolean,
  ): Cell {
    if (!Number.isFinite(left) || !Number.isFinite(right) || left < 0 || right < 0) return null;
    const L = Math.trunc(left);
    const R = Math.trunc(right);
    let st = sites.get(site);
    if (st === undefined || st.left !== L || st.right !== R) {
      st = { left: L, right: R, window: [], n: 0 };
      sites.set(site, st);
    }
    const need = L + 1;
    if (st.window.length === need) st.window.shift();
    st.window.push(finiteCell(source));
    st.n += 1;
    if (st.n <= L + R || st.window.length < need) return null;
    const current = st.window[st.window.length - 1];
    if (current === null) return null;
    for (let i = 1; i <= L; i++) {
      const leftVal = st.window[st.window.length - 1 - i];
      if (leftVal === null) continue;
      if (high ? leftVal >= current : leftVal <= current) return null;
    }
    return current;
  }
}
