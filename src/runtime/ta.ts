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
  started: boolean;
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

interface AroonState {
  length: number;
  highs: Cell[];
  lows: Cell[];
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
  sumPv: number;
  sumV: number;
  naCount: number;
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
  up: number;
  down: number;
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

interface AccdistState {
  ad: number;
}

interface PivotState {
  left: number;
  right: number;
  window: Cell[];
  n: number;
}

interface MfiState {
  period: number;
  tps: Cell[];
  mfs: Cell[];
}

interface SarState {
  start: number;
  increment: number;
  maximum: number;
  started: boolean;
  sar: Cell;
  ep: Cell;
  trend: number;
  af: number;
}

interface AdxState {
  period: number;
  prevH: Cell;
  prevL: Cell;
  prevC: Cell;
  n: number;
}

interface DmiState {
  diLen: number;
  prevH: Cell;
  prevL: Cell;
  prevC: Cell;
}

interface CorrState {
  length: number;
  a: Cell[];
  b: Cell[];
}

interface SwmaState {
  period: number;
  window: Cell[];
  weights: number[];
  wsum: number;
}

interface WindowState {
  period: number;
  window: Cell[];
}

interface TsiState {
  longPeriod: number;
  shortPeriod: number;
  prev: Cell;
  nBars: number;
  value: Cell;
}

interface CumState {
  total: number;
}

interface BarsSinceState {
  everTrue: boolean;
  barsSince: number;
}

interface ValueWhenState {
  occurrence: number;
  hits: Cell[];
}

interface PercentileState {
  period: number;
  percentage: number;
  window: Cell[];
}

interface PvtState {
  pvt: number;
  prev: Cell;
}

interface WadState {
  wad: number;
  prev: Cell;
  started: boolean;
}

interface VolIndexState {
  value: number;
  prevClose: Cell;
  prevVol: Cell;
  started: boolean;
}

interface WvadState {
  period: number;
  vols: number[];
  volSum: number;
}

interface CmfState {
  period: number;
  mf: number[];
  vol: number[];
  mfSum: number;
  volSum: number;
}

interface KlingerState {
  prev: Cell;
  cum: number;
  started: boolean;
}

interface UoState {
  n1: number;
  n2: number;
  n3: number;
  prev: Cell;
  window: Array<[Cell, Cell]>;
}

interface RciState {
  length: number;
  window: Cell[];
}

interface DpoState {
  length: number;
  window: Cell[];
}

interface KstState {
  key: string;
  window: Cell[];
}

interface StochRsiState {
  rsiLen: number;
  stochLen: number;
  prices: number[];
  rsiRing: number[];
  bars: number;
  validRsi: number;
  signal: number | null;
}

interface BbPctState {
  length: number;
  window: Cell[];
}

interface EmvState {
  length: number;
  prevH: Cell;
  prevL: Cell;
  started: boolean;
  valid: number[];
}

interface FractalState {
  period: number;
  highs: Cell[];
  lows: Cell[];
  bars: number;
}

interface ZigzagState {
  samples: Cell[];
}

interface EngulfingState {
  prevOpen: Cell;
  prevClose: Cell;
  count: number;
}

interface InsideBarState {
  prevHigh: Cell;
  prevLow: Cell;
  count: number;
}

interface DoubleTopBottomState {
  highs: Cell[];
  lows: Cell[];
  count: number;
}

interface RsiDivergenceState {
  window: Cell[];
  count: number;
}

interface CumulativeDeltaState {
  closes: Cell[];
  volumes: Cell[];
  count: number;
}

interface VolumeMomentumState {
  window: number[];
}

interface VolumeThrustState {
  closes: Cell[];
  volume: Cell;
  sma: Cell;
  nClose: number;
  nVolume: number;
  nSma: number;
}

interface StochSmoothState {
  highs: Cell[];
  lows: Cell[];
}

interface SmaWeightedState {
  window: Cell[];
  weights: number[];
  wsum: number;
}

interface PairWindowState {
  a: Cell[];
  b: Cell[];
}

interface SingleWindowState {
  window: Cell[];
}

interface MarketConditionState {
  window: Cell[];
  atr: Cell;
}

interface OrderFlowState {
  highs: Cell[];
  lows: Cell[];
  closes: Cell[];
  volumes: Cell[];
}

interface LiquidityState {
  volume: Cell[];
  volatility: Cell[];
  spread: Cell[];
}

interface MeanReversionState {
  countClose: number;
  countSma: number;
}

interface VolumeWeightedMomentumState {
  prices: Cell[];
  volumes: Cell[];
}

export type PivotPoints = {
  pp: Cell;
  r1: Cell;
  s1: Cell;
  r2: Cell;
  s2: Cell;
};

function finiteCell(value: Cell): Cell {
  return value !== null && Number.isFinite(value) ? value : null;
}

/** Plain dict returned by `ta.*` handlers. Attribute reads are brand-gated. */
export interface TaRecord {
  readonly __taRecord: true;
  [key: string]: number | null | boolean | string;
}

function taRec(fields: Record<string, number | null | boolean | string>): TaRecord {
  return { __taRecord: true, ...fields };
}

function pushCap<T>(window: T[], value: T, cap: number): void {
  if (window.length === cap) window.shift();
  window.push(value);
}

function finiteOut(value: number): Cell {
  return Number.isFinite(value) ? value : null;
}

/** Python `_sma` last sample: strict window, any `na` → `na`. */
function smaOf(series: Cell[], period: number): Cell {
  if (period <= 0 || series.length < period) return null;
  const window = series.slice(series.length - period);
  let sum = 0;
  for (const v of window) {
    if (v === null) return null;
    sum += v;
  }
  return sum / period;
}

/** Python `_stdev` last sample: population stdev, strict window. */
function stdevOf(series: Cell[], period: number): Cell {
  if (period <= 1 || series.length < period) return null;
  const window = series.slice(series.length - period);
  const vals: number[] = [];
  for (const v of window) {
    if (v === null) return null;
    vals.push(v);
  }
  let mean = 0;
  for (const v of vals) mean += v;
  mean /= period;
  let sumSq = 0;
  for (const v of vals) sumSq += (v - mean) ** 2;
  return Math.sqrt(sumSq / period);
}

/** Near-integer floats round (14.0000000001 → 14); else floor. Python `_float_to_period_int`. */
const PERIOD_INT_EPS = 1e-9;

/** Pine length: finite, >= 1 after near-int round / floor. */
function pinePeriod(period: number): number | null {
  if (!Number.isFinite(period) || period <= 0) return null;
  const nearest = Math.round(period);
  const n = Math.abs(period - nearest) <= PERIOD_INT_EPS ? nearest : Math.floor(period);
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
  private readonly mfiSites = new Map<string, MfiState>();
  private readonly sarSites = new Map<string, SarState>();
  private readonly adxSites = new Map<string, AdxState>();
  private readonly dmiSites = new Map<string, DmiState>();
  private readonly correlationSites = new Map<string, CorrState>();
  private readonly highestBarsSites = new Map<string, HighestLowestState>();
  private readonly lowestBarsSites = new Map<string, HighestLowestState>();
  private readonly swmaSites = new Map<string, SwmaState>();
  private readonly cogSites = new Map<string, WindowState>();
  private readonly tsiSites = new Map<string, TsiState>();
  private readonly devSites = new Map<string, SmaState>();
  private readonly varianceSites = new Map<string, StdevState>();
  private readonly medianSites = new Map<string, WindowState>();
  private readonly modeSites = new Map<string, WindowState>();
  private readonly percentrankSites = new Map<string, WindowState>();
  private readonly percentileNearestSites = new Map<string, PercentileState>();
  private readonly percentileLinearSites = new Map<string, PercentileState>();
  private readonly cumSites = new Map<string, CumState>();
  private readonly barssinceSites = new Map<string, BarsSinceState>();
  private readonly valuewhenSites = new Map<string, ValueWhenState>();
  private readonly accdistSites = new Map<string, AccdistState>();
  private readonly pvtSites = new Map<string, PvtState>();
  private readonly wadSites = new Map<string, WadState>();
  private readonly nviSites = new Map<string, VolIndexState>();
  private readonly pviSites = new Map<string, VolIndexState>();
  private readonly wvadSites = new Map<string, WvadState>();
  private readonly cmfSites = new Map<string, CmfState>();
  private readonly klingerSites = new Map<string, KlingerState>();
  private readonly aroonSites = new Map<string, AroonState>();
  private readonly uoSites = new Map<string, UoState>();
  private readonly rciSites = new Map<string, RciState>();
  private readonly dpoSites = new Map<string, DpoState>();
  private readonly kstSites = new Map<string, KstState>();
  private readonly stochRsiSites = new Map<string, StochRsiState>();
  private readonly bbPctSites = new Map<string, BbPctState>();
  private readonly emvSites = new Map<string, EmvState>();
  private readonly fractalSites = new Map<string, FractalState>();
  private readonly zigzagSites = new Map<string, ZigzagState>();
  private readonly engulfingSites = new Map<string, EngulfingState>();
  private readonly insideBarSites = new Map<string, InsideBarState>();
  private readonly doubleTopBottomSites = new Map<string, DoubleTopBottomState>();
  private readonly rsiDivergenceSites = new Map<string, RsiDivergenceState>();
  private readonly stochSmoothSites = new Map<string, StochSmoothState>();
  private readonly smaWeightedSites = new Map<string, SmaWeightedState>();
  private readonly betaSites = new Map<string, PairWindowState>();
  private readonly rSquaredSites = new Map<string, PairWindowState>();
  private readonly comovementSites = new Map<string, PairWindowState>();
  private readonly skewnessSites = new Map<string, SingleWindowState>();
  private readonly kurtosisSites = new Map<string, SingleWindowState>();
  private readonly vwmSites = new Map<string, VolumeWeightedMomentumState>();
  private readonly meanReversionSites = new Map<string, MeanReversionState>();
  private readonly marketConditionSites = new Map<string, MarketConditionState>();
  private readonly orderFlowSites = new Map<string, OrderFlowState>();
  private readonly liquiditySites = new Map<string, LiquidityState>();

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

  /** `ta.atr` ≡ `ta.rma(ta.tr, length)`. Bar 0 seeds TR with `high - low` (0.6.32). */
  atr(site: string, high: Cell, low: Cell, close: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.atrSites.get(site);
    if (st === undefined || st.period !== n) {
      st = {
        period: n,
        prevClose: null,
        started: false,
        rma: { period: n, rma: null, seeded: false, started: false, seedBuf: [] },
      };
      this.atrSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    if (!st.started) {
      st.started = true;
      st.prevClose = c;
      if (h === null || l === null) return null;
      return rmaStep(st.rma, h - l, n);
    }
    const prev = st.prevClose;
    st.prevClose = c;
    if (prev === null || h === null || l === null || c === null) return null;
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
    if (x === null) return null; // leave Wilder state untouched (no NaN-poison)

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

  /** Population stdev (ddof=0, Python `_stdev_inc_update`). Any na in window → na; period<=1 → na. */
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
    let v = (st.sumsq - (st.sum * st.sum) / n) / n;
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
   * Bollinger: mid=SMA, dev=population stdev, bands=mid ± mult*dev.
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

  /** `100 * (source - source[length]) / source[length]`. na if lookback missing, denom 0, or length<=0. */
  roc(site: string, source: Cell, length: number): Cell {
    if (!Number.isFinite(length) || length <= 0) return null;
    const n = Math.trunc(length);
    const x = finiteCell(source);
    if (n <= 0) return null;
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
      st = { period: n, srcWindow: [], volWindow: [], sumPv: 0, sumV: 0, naCount: 0 };
      this.vwmaSites.set(site, st);
    }
    const s = finiteCell(source);
    const v = finiteCell(volume);
    if (st.srcWindow.length === n) {
      const oldS = st.srcWindow.shift()!;
      const oldV = st.volWindow.shift()!;
      if (oldS === null || oldV === null) st.naCount -= 1;
      else {
        st.sumPv -= oldS * oldV;
        st.sumV -= oldV;
      }
    }
    st.srcWindow.push(s);
    st.volWindow.push(v);
    if (s === null || v === null) st.naCount += 1;
    else {
      st.sumPv += s * v;
      st.sumV += v;
    }
    if (st.srcWindow.length < n || st.naCount > 0 || st.sumV === 0) return null;
    return st.sumPv / st.sumV;
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
    return this.extremeBars(this.highestBarsSites, site, source, period, true);
  }

  /** Offset of the lowest in the window (negative TV style). */
  lowestbars(site: string, source: Cell, period: number): Cell {
    return this.extremeBars(this.lowestBarsSites, site, source, period, false);
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
    let st = sites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      sites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let bestI = -1;
    let best: number | null = null;
    for (let i = 0; i < st.window.length; i++) {
      const v = st.window[i];
      if (v === null) continue;
      // Strict compare so ties keep the oldest bar (Python `_highestbars`).
      if (best === null || (highest ? v > best : v < best)) {
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
    if (!Number.isFinite(offset) || !Number.isFinite(sigma)) return null;
    const off = offset;
    const sig = sigma;
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
      st = { period: n, window: [], up: 0, down: 0 };
      this.cmoSites.set(site, st);
    }
    const x = finiteCell(source);
    if (st.window.length === n + 1) {
      const old = st.window[0]!;
      const nxt = st.window[1]!;
      if (old !== null && nxt !== null) {
        const d = nxt - old;
        if (d > 0) st.up -= d;
        else st.down -= -d;
      }
      st.window.shift();
    }
    const prev = st.window.length === 0 ? null : st.window[st.window.length - 1]!;
    st.window.push(x);
    if (prev !== null && x !== null) {
      const d = x - prev;
      if (d > 0) st.up += d;
      else st.down += -d;
    }
    if (st.window.length < n + 1) return null;
    const denom = st.up + st.down;
    if (denom === 0) return 0;
    return (100 * (st.up - st.down)) / denom;
  }

  /** Kaufman AMA. First output on bar index `length` (need length+1 samples). */
  kama(site: string, source: Cell, period: number, fast = 2, slow = 30): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    const f = Number.isFinite(fast) ? Math.trunc(fast) : 2;
    const sl = Number.isFinite(slow) ? Math.trunc(slow) : 30;
    // 2/(fast+1) / 2/(slow+1) — reject the singular -1 case (NaN-poison).
    if (f === -1 || sl === -1) return null;
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

  /**
   * Hull MA: WMA(2*WMA(n/2)-WMA(n), sqrt(n)).
   * Nested wma sites `${site}:half` / `:full` / `:sqrt` (`_hma_inc_update`).
   */
  hma(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    const half = Math.max(1, Math.trunc(n / 2));
    const sqrtN = Math.max(1, Math.trunc(Math.sqrt(n)));
    const wh = this.wma(`${site}:half`, source, half);
    const wf = this.wma(`${site}:full`, source, n);
    const raw = wh === null || wf === null ? null : 2 * wh - wf;
    return this.wma(`${site}:sqrt`, raw, sqrtN);
  }

  /**
   * Money Flow Index. Needs `period+1` typical prices; equal TP is neither side.
   * Only +MF → 100; only −MF → 0; both 0 → 50 (`_mfi_inc_update`).
   */
  mfi(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    volume: Cell,
    period: number,
  ): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.mfiSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, tps: [], mfs: [] };
      this.mfiSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    if (st.tps.length === n + 1) {
      st.tps.shift();
      st.mfs.shift();
    }
    if (h === null || l === null || c === null) {
      st.tps.push(null);
      st.mfs.push(null);
      return null;
    }
    const vol = finiteCell(volume) ?? 0;
    const tp = (h + l + c) / 3;
    st.tps.push(tp);
    st.mfs.push(tp * vol);
    if (st.tps.length <= n) return null;

    let pos = 0;
    let neg = 0;
    const startK = st.tps.length - n;
    for (let k = startK; k < st.tps.length; k++) {
      const tpCur = st.tps[k]!;
      const tpPrev = st.tps[k - 1]!;
      const mf = st.mfs[k]!;
      if (tpCur === null || tpPrev === null || mf === null) return null;
      if (tpCur > tpPrev) pos += mf;
      else if (tpCur < tpPrev) neg += mf;
    }
    if (neg === 0) return pos === 0 ? 50 : 100;
    const ratio = pos / neg;
    return 100 - 100 / (1 + ratio);
  }

  /**
   * Parabolic SAR. First valid bar is low; leading na stays na (`_sar_inc_update`).
   */
  sar(
    site: string,
    high: Cell,
    low: Cell,
    start = 0.02,
    increment = 0.02,
    maximum = 0.2,
  ): Cell {
    if (!Number.isFinite(start) || !Number.isFinite(increment) || !Number.isFinite(maximum)) {
      return null;
    }
    const startF = start;
    const incF = increment;
    const maxF = maximum;
    let st = this.sarSites.get(site);
    if (
      st === undefined ||
      st.start !== startF ||
      st.increment !== incF ||
      st.maximum !== maxF
    ) {
      st = {
        start: startF,
        increment: incF,
        maximum: maxF,
        started: false,
        sar: null,
        ep: null,
        trend: 1,
        af: startF,
      };
      this.sarSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    if (!st.started) {
      if (h === null || l === null) return null;
      st.started = true;
      st.sar = l;
      st.ep = h;
      st.trend = 1;
      st.af = startF;
      return l;
    }
    const previous = st.sar;
    const ep = st.ep;
    if (previous === null || h === null || l === null || ep === null) return previous;
    let trend = st.trend;
    let af = st.af;
    let epF = ep;
    let sarV: number;
    if (trend === 1) {
      sarV = previous + af * (epF - previous);
      if (h > epF) {
        epF = h;
        af = Math.min(af + incF, maxF);
      }
      if (sarV > l) {
        trend = -1;
        sarV = epF;
        epF = l;
        af = startF;
      }
    } else {
      sarV = previous - af * (previous - epF);
      if (l < epF) {
        epF = l;
        af = Math.min(af + incF, maxF);
      }
      if (sarV < h) {
        trend = 1;
        sarV = epF;
        epF = h;
        af = startF;
      }
    }
    st.sar = sarV;
    st.ep = epF;
    st.trend = trend;
    st.af = af;
    return Number.isFinite(sarV) ? sarV : null;
  }

  /**
   * ADX (nan-first DM). Early bars and unseeded ATR/DX → 0 (`_adx_inc_update`).
   */
  adx(site: string, high: Cell, low: Cell, close: Cell, length: number): Cell {
    const n = pinePeriod(length);
    if (n === null) return 0;
    let st = this.adxSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, prevH: null, prevL: null, prevC: null, n: 0 };
      this.adxSites.set(site, st);
    }
    let tr: Cell;
    let plusDm: Cell;
    let minusDm: Cell;
    if (st.prevH === null || st.prevL === null || st.prevC === null) {
      tr = null;
      plusDm = null;
      minusDm = null;
    } else {
      const hf = high !== null && Number.isFinite(high) ? high : Number.NaN;
      const lf = low !== null && Number.isFinite(low) ? low : Number.NaN;
      const trRaw = Math.max(
        hf - lf,
        Math.abs(hf - st.prevC),
        Math.abs(lf - st.prevC),
      );
      tr = Number.isFinite(trRaw) ? trRaw : null;
      const highDiff = hf - st.prevH;
      const lowDiff = st.prevL - lf;
      plusDm = highDiff > lowDiff && highDiff > 0 ? highDiff : 0;
      minusDm = lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0;
    }
    st.prevH = finiteCell(high);
    st.prevL = finiteCell(low);
    st.prevC = finiteCell(close);
    st.n += 1;

    const atr = this.rma(`${site}:tr`, tr, n);
    const pd = this.rma(`${site}:pdm`, plusDm, n);
    const md = this.rma(`${site}:mdm`, minusDm, n);
    if (st.n < n) return 0;
    if (atr === null) return 0;

    let dxIn: Cell;
    if (pd === null || md === null) {
      dxIn = null;
    } else {
      const plusDi = atr !== 0 ? 100 * pd / atr : 0;
      const minusDi = atr !== 0 ? 100 * md / atr : 0;
      const denom = plusDi + minusDi;
      dxIn = denom !== 0 ? 100 * Math.abs(plusDi - minusDi) / denom : 0;
    }
    const adxV = this.rma(`${site}:dx`, dxIn, n);
    return adxV === null ? 0 : adxV;
  }

  /**
   * DMI: 0-first +DI/−DI (RMA diLength) + nan-first ADX via `${site}:adx`.
   */
  dmi(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    diLength: number,
    adxSmoothing: number,
  ): { plus: Cell; minus: Cell; adx: Cell } {
    const diN = pinePeriod(diLength);
    if (diN === null) return { plus: null, minus: null, adx: null };
    let st = this.dmiSites.get(site);
    if (st === undefined || st.diLen !== diN) {
      st = { diLen: diN, prevH: null, prevL: null, prevC: null };
      this.dmiSites.set(site, st);
    }
    let tr: Cell;
    let plusDm: number;
    let minusDm: number;
    if (st.prevH === null || st.prevL === null || st.prevC === null) {
      tr = null;
      plusDm = 0;
      minusDm = 0;
    } else {
      const hf = finiteCell(high) ?? 0;
      const lf = finiteCell(low) ?? 0;
      const ph = st.prevH;
      const pl = st.prevL;
      const pc = st.prevC;
      tr = Math.max(hf - lf, Math.abs(hf - pc), Math.abs(lf - pc));
      const highDiff = hf - ph;
      const lowDiff = pl - lf;
      plusDm = highDiff > lowDiff && highDiff > 0 ? highDiff : 0;
      minusDm = lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0;
    }
    st.prevH = finiteCell(high);
    st.prevL = finiteCell(low);
    st.prevC = finiteCell(close);

    const atr = this.rma(`${site}:tr`, tr, diN);
    const pd = this.rma(`${site}:pdm`, plusDm, diN);
    const md = this.rma(`${site}:mdm`, minusDm, diN);
    let plus: Cell;
    let minus: Cell;
    if (atr === null) {
      plus = null;
      minus = null;
    } else if (atr === 0) {
      plus = 0;
      minus = 0;
    } else {
      plus = 100 * (pd ?? 0) / atr;
      minus = 100 * (md ?? 0) / atr;
    }
    const adx = this.adx(`${site}:adx`, high, low, close, adxSmoothing);
    return { plus, minus, adx };
  }

  /**
   * Pearson correlation over `length` samples (na pairs skipped).
   * `length<2`, short window, <2 pairs, or zero variance → na.
   */
  correlation(site: string, a: Cell, b: Cell, length: number): Cell {
    const n = pinePeriod(length);
    if (n === null || n < 2) return null;
    let st = this.correlationSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, a: [], b: [] };
      this.correlationSites.set(site, st);
    }
    if (st.a.length === n) {
      st.a.shift();
      st.b.shift();
    }
    st.a.push(finiteCell(a));
    st.b.push(finiteCell(b));
    if (st.a.length < n) return null;

    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < n; i++) {
      const x = st.a[i]!;
      const y = st.b[i]!;
      if (x !== null && y !== null) {
        xs.push(x);
        ys.push(y);
      }
    }
    if (xs.length < 2) return null;
    const m = xs.length;
    let mx = 0;
    let my = 0;
    for (let i = 0; i < m; i++) {
      mx += xs[i]!;
      my += ys[i]!;
    }
    mx /= m;
    my /= m;
    let num = 0;
    let denx = 0;
    let deny = 0;
    for (let i = 0; i < m; i++) {
      const dx = xs[i]! - mx;
      const dy = ys[i]! - my;
      num += dx * dy;
      denx += dx * dx;
      deny += dy * dy;
    }
    const sx = Math.sqrt(denx);
    const sy = Math.sqrt(deny);
    if (sx === 0 || sy === 0) return null;
    return num / (sx * sy);
  }

  /**
   * Cumulative A/D: CLV * volume. H/L/C na keeps previous ad; vol na → 0;
   * zero range → CLV 0 (`_accdist_inc_update`).
   */
  accdist(site: string, high: Cell, low: Cell, close: Cell, volume: Cell): Cell {
    let st = this.accdistSites.get(site);
    if (st === undefined) {
      st = { ad: 0 };
      this.accdistSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    if (h === null || l === null || c === null) return st.ad;
    const vv = finiteCell(volume) ?? 0;
    const rng = h - l;
    const clv = rng === 0 ? 0 : ((c - l) - (h - c)) / rng;
    st.ad += clv * vv;
    return st.ad;
  }

  /**
   * Price-Volume Trend. Adds vol*(c-prev)/prev when prev is finite and != 0.
   * First bar is 0; na close or vol skips the add.
   */
  pvt(site: string, close: Cell, volume: Cell): Cell {
    let st = this.pvtSites.get(site);
    if (st === undefined) {
      st = { pvt: 0, prev: null };
      this.pvtSites.set(site, st);
    }
    const c = finiteCell(close);
    const prev = st.prev;
    if (prev !== null && prev !== 0 && c !== null) {
      const vv = finiteCell(volume) ?? 0;
      st.pvt += (vv * (c - prev)) / prev;
    }
    if (c !== null) st.prev = c;
    return st.pvt;
  }

  /**
   * Williams AD (`_wad_inc_update`). First bar 0. Later: up adds
   * vol*(close-low); down subtracts vol*(high-close). Missing H/L
   * fallback to close; vol na → 0.
   */
  wad(site: string, high: Cell, low: Cell, close: Cell, volume: Cell): Cell {
    let st = this.wadSites.get(site);
    if (st === undefined) {
      st = { wad: 0, prev: null, started: false };
      this.wadSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    const vv = finiteCell(volume) ?? 0;
    if (!st.started) {
      st.started = true;
      st.prev = c;
      st.wad = 0;
      return 0;
    }
    const prev = st.prev;
    if (c !== null && prev !== null) {
      const hi = h ?? c;
      const lo = l ?? c;
      if (c > prev) st.wad += vv * (c - lo);
      else if (c < prev) st.wad -= vv * (hi - c);
    }
    if (c !== null) st.prev = c;
    return st.wad;
  }

  /**
   * Negative Volume Index. Starts at 1000; updates when volume < prev volume.
   */
  nvi(site: string, close: Cell, volume: Cell): Cell {
    return this.volIndexStep(this.nviSites, site, close, volume, (vol, prevVol) => vol < prevVol);
  }

  /**
   * Positive Volume Index. Starts at 1000; updates when volume > prev volume.
   */
  pvi(site: string, close: Cell, volume: Cell): Cell {
    return this.volIndexStep(this.pviSites, site, close, volume, (vol, prevVol) => vol > prevVol);
  }

  private volIndexStep(
    sites: Map<string, VolIndexState>,
    site: string,
    close: Cell,
    volume: Cell,
    trigger: (vol: number, prevVol: number) => boolean,
  ): Cell {
    let st = sites.get(site);
    if (st === undefined) {
      st = { value: 1000, prevClose: null, prevVol: null, started: false };
      sites.set(site, st);
    }
    const c = finiteCell(close);
    const vol = finiteCell(volume) ?? 0;
    if (!st.started) {
      st.started = true;
      if (c !== null) st.prevClose = c;
      st.prevVol = vol;
      return st.value;
    }
    if (c !== null && st.prevClose !== null && trigger(vol, st.prevVol ?? 0)) {
      const change = st.prevClose !== 0 ? (c - st.prevClose) / st.prevClose : 0;
      const next = st.value * (1 + change);
      if (Number.isFinite(next)) st.value = next;
    }
    if (c !== null) st.prevClose = c;
    st.prevVol = vol;
    return st.value;
  }

  /**
   * Intraday Intensity: ((2c-h-l)/(h-l))*volume. Zero range → 0; H/L/C na → na;
   * vol na → 0 (`_builtin_ta_iii` * volume).
   */
  iii(site: string, high: Cell, low: Cell, close: Cell, volume: Cell): Cell {
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    if (h === null || l === null || c === null) return null;
    const rng = h - l;
    if (rng === 0) return 0;
    const vv = finiteCell(volume) ?? 0;
    return ((2 * c - h - l) / rng) * vv;
  }

  /**
   * Williams Volume AD (`_wvad_inc_update`): last WAD / rolling volume sum.
   * period<=0 or zero vol sum → 0. Nested WAD uses `${site}:wad`.
   */
  wvad(site: string, high: Cell, low: Cell, close: Cell, volume: Cell, period: number): Cell {
    const wad = this.wad(`${site}:wad`, high, low, close, volume);
    const n = Number.isFinite(period) ? Math.trunc(period) : 0;
    if (n <= 0) return 0;
    let st = this.wvadSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, vols: [], volSum: 0 };
      this.wvadSites.set(site, st);
    }
    const vv = finiteCell(volume) ?? 0;
    if (st.vols.length === n) st.volSum -= st.vols.shift()!;
    st.vols.push(vv);
    st.volSum += vv;
    if (st.volSum > 0 && wad !== null) return wad / st.volSum;
    return 0;
  }

  /**
   * Chaikin Money Flow (`_cmf_inc_update`). CLV*vol rolling window.
   * period<=0 → na; zero vol sum → 0; missing H/L/C → clv 0.
   */
  cmf(site: string, high: Cell, low: Cell, close: Cell, volume: Cell, period: number): Cell {
    const n = Number.isFinite(period) ? Math.trunc(period) : 0;
    if (n <= 0) return null;
    let st = this.cmfSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, mf: [], vol: [], mfSum: 0, volSum: 0 };
      this.cmfSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    const vv = finiteCell(volume) ?? 0;
    let clv = 0;
    if (h !== null && l !== null && c !== null) {
      const rng = h - l;
      clv = rng === 0 ? 0 : ((c - l) - (h - c)) / rng;
    }
    const mf = clv * vv;
    if (st.mf.length === n) {
      st.mfSum -= st.mf.shift()!;
      st.volSum -= st.vol.shift()!;
    }
    st.mf.push(mf);
    st.vol.push(vv);
    st.mfSum += mf;
    st.volSum += vv;
    return st.volSum > 0 ? st.mfSum / st.volSum : 0;
  }

  /**
   * Klinger oscillator (`_klinger_inc_update`): signed-volume cumulant,
   * then EMA(fast)−EMA(slow) via `${site}:fast` / `${site}:slow`.
   */
  klinger(site: string, close: Cell, volume: Cell, fast: number, slow: number): Cell {
    let st = this.klingerSites.get(site);
    if (st === undefined) {
      st = { prev: null, cum: 0, started: false };
      this.klingerSites.set(site, st);
    }
    const c = finiteCell(close);
    const vv = finiteCell(volume) ?? 0;
    if (!st.started) {
      st.started = true;
      st.prev = c;
      st.cum = 0;
    } else {
      const prev = st.prev;
      let trv = 0;
      if (c !== null && prev !== null) {
        if (c > prev) trv = vv;
        else if (c < prev) trv = -vv;
      }
      st.cum += trv;
      if (c !== null) st.prev = c;
    }
    const fastV = this.ema(`${site}:fast`, st.cum, fast);
    const slowV = this.ema(`${site}:slow`, st.cum, slow);
    if (fastV === null || slowV === null) return null;
    const out = fastV - slowV;
    return Number.isFinite(out) ? out : null;
  }

  /**
   * Classic floor pivots. na high/low/close → all na.
   * Optional `type` is accepted; classic levels are always returned.
   */
  pivotPoints(site: string, high: Cell, low: Cell, close: Cell, type?: string): PivotPoints {
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    if (h === null || l === null || c === null) {
      return { pp: null, r1: null, s1: null, r2: null, s2: null };
    }
    const pp = (h + l + c) / 3;
    const rng = h - l;
    return {
      pp,
      r1: 2 * pp - l,
      s1: 2 * pp - h,
      r2: pp + rng,
      s2: pp - rng,
    };
  }

  /**
   * Symmetric WMA. Omitted/NaN period → fixed 4-sample weights 1/2/2/1.
   * Else `_builtin_ta_swma` 2-arg weights. Any na in window → na.
   */
  swma(site: string, source: Cell, period?: number): Cell {
    const useFixed = period === undefined || Number.isNaN(period);
    const n = useFixed ? 4 : pinePeriod(period);
    if (n === null) return null;
    let st = this.swmaSites.get(site);
    if (st === undefined || st.period !== n) {
      const weights: number[] = [];
      let wsum = 0;
      for (let i = 0; i < n; i++) {
        const w = i < (n >> 1) ? i + 1 : i > ((n - 1) >> 1) ? n - i : (n >> 1) + 1;
        weights.push(w);
        wsum += w;
      }
      st = { period: n, window: [], weights, wsum };
      this.swmaSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n || st.wsum === 0) return null;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const v = st.window[i];
      if (v == null) return null;
      acc += v * st.weights[i]!;
    }
    return acc / st.wsum;
  }

  /** Center of Gravity: `-sum((i+1)*x_rev) / sum(x)` over `period`. den=0 → na. */
  cog(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.cogSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.cogSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      const v = st.window[n - 1 - i];
      if (v === null) continue;
      num += (i + 1) * v;
      den += v;
    }
    if (den === 0) return null;
    return -num / den;
  }

  /** TSI: 100 * EMA(EMA(mom, long), short) / EMA(EMA(|mom|, long), short). */
  tsi(site: string, source: Cell, longPeriod: number, shortPeriod: number): Cell {
    const longN = pinePeriod(longPeriod);
    const shortN = pinePeriod(shortPeriod);
    if (longN === null || shortN === null) return null;
    let st = this.tsiSites.get(site);
    if (st === undefined || st.longPeriod !== longN || st.shortPeriod !== shortN) {
      st = { longPeriod: longN, shortPeriod: shortN, prev: null, nBars: 0, value: null };
      this.tsiSites.set(site, st);
    }
    const x = finiteCell(source);
    st.nBars += 1;
    const prev = st.prev;
    st.prev = x;
    if (prev === null || x === null) {
      if (st.nBars < longN + shortN) {
        st.value = null;
        return null;
      }
      return st.value;
    }
    const mom = x - prev;
    const tag = `${site}:${longN}:${shortN}`;
    const e1 = this.ema(`${tag}:mom`, mom, longN);
    const e2 = this.ema(`${tag}:mom2`, e1, shortN);
    const a1 = this.ema(`${tag}:abs`, Math.abs(mom), longN);
    const a2 = this.ema(`${tag}:abs2`, a1, shortN);
    if (st.nBars < longN + shortN) {
      st.value = null;
      return null;
    }
    if (a2 === null || a2 === 0) {
      st.value = a2 === 0 ? 0 : null;
      return st.value;
    }
    if (e2 === null) {
      st.value = null;
      return null;
    }
    st.value = 100 * (e2 / a2);
    return st.value;
  }

  /** `(up - lo) / mid` from `kc`. na if mid is 0/null. */
  kcw(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    length: number,
    mult: number,
  ): Cell {
    const r = this.kc(site, high, low, close, length, mult);
    if (r.mid === null || r.up === null || r.lo === null || r.mid === 0) return null;
    return (r.up - r.lo) / r.mid;
  }

  /** Mean absolute deviation. Full window; any na → na. */
  dev(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.devSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [], sum: 0, count: 0 };
      this.devSites.set(site, st);
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
    const mean = st.sum / n;
    let acc = 0;
    for (const v of st.window) {
      if (v === null) return null;
      acc += Math.abs(v - mean);
    }
    return acc / n;
  }

  /** Sample variance (ddof=1). Any na in window → na; period<=1 → na. */
  variance(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null || n <= 1) return null;
    let st = this.varianceSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [], sum: 0, sumsq: 0, count: 0 };
      this.varianceSites.set(site, st);
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
    let v = (st.sumsq - (st.sum * st.sum) / n) / n;
    if (v < 0) v = 0;
    return v;
  }

  /** Median of finite samples. Needs a full `period` window. */
  median(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.medianSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.medianSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    const valid: number[] = [];
    for (const v of st.window) {
      if (v !== null) valid.push(v);
    }
    if (valid.length === 0) return null;
    valid.sort((a, b) => a - b);
    const mid = valid.length >> 1;
    if (valid.length % 2 === 1) return valid[mid]!;
    return (valid[mid - 1]! + valid[mid]!) / 2;
  }

  /** Most frequent finite value. Ties keep the first in-window value. */
  mode(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.modeSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.modeSites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    const counts = new Map<number, number>();
    let best: number | null = null;
    let bestC = 0;
    for (const v of st.window) {
      if (v === null) continue;
      const c = (counts.get(v) ?? 0) + 1;
      counts.set(v, c);
      if (c > bestC) {
        bestC = c;
        best = v;
      }
    }
    return best;
  }

  /** `100 * count(x < current) / count`. <2 finite samples → 50; current na → na. */
  percentrank(site: string, source: Cell, period: number): Cell {
    const n = pinePeriod(period);
    if (n === null) return null;
    let st = this.percentrankSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, window: [] };
      this.percentrankSites.set(site, st);
    }
    const x = finiteCell(source);
    if (st.window.length === n) st.window.shift();
    st.window.push(x);
    if (st.window.length < n) return null;
    const valid: number[] = [];
    for (const v of st.window) {
      if (v !== null) valid.push(v);
    }
    if (valid.length < 2) return 50;
    if (x === null) return null;
    let below = 0;
    for (const v of valid) {
      if (v < x) below += 1;
    }
    return (below / valid.length) * 100;
  }

  /** Nearest-rank percentile. Rank = ceil(p/100 * n), 1-indexed. */
  percentileNearest(site: string, source: Cell, period: number, percentage: number): Cell {
    return this.percentileStep(this.percentileNearestSites, site, source, period, percentage, false);
  }

  /** Linear-interpolation percentile at rank (p/100)*(n-1). */
  percentileLinear(site: string, source: Cell, period: number, percentage: number): Cell {
    return this.percentileStep(this.percentileLinearSites, site, source, period, percentage, true);
  }

  private percentileStep(
    sites: Map<string, PercentileState>,
    site: string,
    source: Cell,
    period: number,
    percentage: number,
    linear: boolean,
  ): Cell {
    const n = pinePeriod(period);
    if (n === null || !Number.isFinite(percentage)) return null;
    let st = sites.get(site);
    if (st === undefined || st.period !== n || st.percentage !== percentage) {
      st = { period: n, percentage, window: [] };
      sites.set(site, st);
    }
    if (st.window.length === n) st.window.shift();
    st.window.push(finiteCell(source));
    if (st.window.length < n) return null;
    const sorted: number[] = [];
    for (const v of st.window) {
      if (v !== null) sorted.push(v);
    }
    if (sorted.length === 0) return null;
    sorted.sort((a, b) => a - b);
    const m = sorted.length;
    if (linear) {
      if (m === 1) return sorted[0]!;
      const rank = (percentage / 100) * (m - 1);
      const lo = Math.trunc(rank);
      const hi = Math.min(lo + 1, m - 1);
      const frac = rank - lo;
      return sorted[lo]! * (1 - frac) + sorted[hi]! * frac;
    }
    let rank = Math.trunc((percentage / 100) * m + 0.999999);
    if (rank < 1) rank = 1;
    if (rank > m) rank = m;
    return sorted[rank - 1]!;
  }

  /** Running sum. na / non-finite contributes 0 (`_cum_inc_update`). */
  cum(site: string, source: Cell): Cell {
    let st = this.cumSites.get(site);
    if (st === undefined) {
      st = { total: 0 };
      this.cumSites.set(site, st);
    }
    const x = finiteCell(source);
    st.total += x ?? 0;
    return st.total;
  }

  /** Bars since last truthy cond (non-null, !=0). Never true → na. */
  barssince(site: string, cond: Cell): Cell {
    let st = this.barssinceSites.get(site);
    if (st === undefined) {
      st = { everTrue: false, barsSince: 0 };
      this.barssinceSites.set(site, st);
    }
    const c = finiteCell(cond);
    if (c !== null && c !== 0) {
      st.everTrue = true;
      st.barsSince = 0;
      return 0;
    }
    st.barsSince += 1;
    return st.everTrue ? st.barsSince : null;
  }

  /** Source at the `occurrence`-th most recent true cond (0 = latest). */
  valuewhen(site: string, cond: Cell, source: Cell, occurrence = 0): Cell {
    if (!Number.isFinite(occurrence) || occurrence < 0) return null;
    const occ = Math.trunc(occurrence);
    let st = this.valuewhenSites.get(site);
    if (st === undefined || st.occurrence !== occ) {
      st = { occurrence: occ, hits: [] };
      this.valuewhenSites.set(site, st);
    }
    const c = finiteCell(cond);
    if (c !== null && c !== 0) {
      if (st.hits.length === occ + 1) st.hits.shift();
      st.hits.push(finiteCell(source));
    }
    if (st.hits.length <= occ) return null;
    return st.hits[st.hits.length - 1 - occ]!;
  }

  /** `highest - lowest` over `period` (nested highest/lowest sites). */
  range(site: string, source: Cell, period: number): Cell {
    const hi = this.highest(`${site}:hi`, source, period);
    const lo = this.lowest(`${site}:lo`, source, period);
    if (hi === null || lo === null) return null;
    return hi - lo;
  }

  /** Alias of `highest`. */
  max(site: string, source: Cell, period: number): Cell {
    return this.highest(site, source, period);
  }

  /** Alias of `lowest`. */
  min(site: string, source: Cell, period: number): Cell {
    return this.lowest(site, source, period);
  }

  /**
   * Awesome Oscillator: SMA(hl2, fast) − SMA(hl2, slow). Default 5 / 34.
   * Warm-up until the slow window is full (`_builtin_ta_ao`).
   */
  ao(site: string, high: Cell, low: Cell, fast = 5, slow = 34): Cell {
    const f = pinePeriod(fast);
    const s = pinePeriod(slow);
    if (f === null || s === null) return null;
    const h = finiteCell(high);
    const l = finiteCell(low);
    const hl2 = h !== null && l !== null ? (h + l) / 2 : null;
    const fv = this.sma(`${site}:ao:fast:${f}`, hl2, f);
    const sv = this.sma(`${site}:ao:slow:${s}`, hl2, s);
    if (fv === null || sv === null) return null;
    const out = fv - sv;
    return Number.isFinite(out) ? out : null;
  }

  /**
   * Aroon pair `{down, up}`. Window is `length + 1`; ties keep the oldest
   * extreme (`_builtin_ta_aroon` / `numba_aroon`).
   */
  aroon(
    site: string,
    high: Cell,
    low: Cell,
    length = 14,
  ): { down: Cell; up: Cell } {
    const n = pinePeriod(length);
    const na = { down: null, up: null };
    if (n === null) return na;
    const window = n + 1;
    let st = this.aroonSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, highs: [], lows: [] };
      this.aroonSites.set(site, st);
    }
    if (st.highs.length === window) {
      st.highs.shift();
      st.lows.shift();
    }
    st.highs.push(finiteCell(high));
    st.lows.push(finiteCell(low));
    if (st.highs.length < window) return na;
    let hh: number | null = null;
    let ll: number | null = null;
    let hhK = 0;
    let llK = 0;
    for (let k = 0; k < window; k++) {
      const hv = st.highs[k]!;
      const lv = st.lows[k]!;
      if (hv === null || lv === null) return na;
      if (hh === null || hv > hh) {
        hh = hv;
        hhK = k;
      }
      if (ll === null || lv < ll) {
        ll = lv;
        llK = k;
      }
    }
    const barsSinceHh = window - 1 - hhK;
    const barsSinceLl = window - 1 - llK;
    const up = (100 * (n - barsSinceHh)) / n;
    const down = (100 * (n - barsSinceLl)) / n;
    return {
      down: Number.isFinite(down) ? down : null,
      up: Number.isFinite(up) ? up : null,
    };
  }

  /**
   * Ultimate Oscillator. BP/TR window; first bar has no prev close.
   * Weights 4, 2, 1. Ready once the longest window is all finite (`_uo_inc_update`).
   */
  uo(site: string, high: Cell, low: Cell, close: Cell, n1: number, n2: number, n3: number): Cell {
    const a = pinePeriod(n1);
    const b = pinePeriod(n2);
    const c = pinePeriod(n3);
    if (a === null || b === null || c === null) return null;
    const need = Math.max(a, b, c);
    let st = this.uoSites.get(site);
    if (st === undefined || st.n1 !== a || st.n2 !== b || st.n3 !== c) {
      st = { n1: a, n2: b, n3: c, prev: null, window: [] };
      this.uoSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const cl = finiteCell(close);
    const prev = st.prev;
    st.prev = cl;
    let bp: Cell = null;
    let tr: Cell = null;
    if (prev !== null && h !== null && l !== null && cl !== null) {
      const lowRef = l < prev ? l : prev;
      const highRef = h > prev ? h : prev;
      bp = cl - lowRef;
      tr = highRef - lowRef;
    }
    pushCap(st.window, [bp, tr], need);
    if (st.window.length < need) return null;
    const avg = (length: number): Cell => {
      let bpS = 0;
      let trS = 0;
      const start = st.window.length - length;
      for (let i = start; i < st.window.length; i++) {
        const pair = st.window[i]!;
        if (pair[0] === null || pair[1] === null) return null;
        bpS += pair[0];
        trS += pair[1];
      }
      if (trS === 0) return null;
      return bpS / trS;
    };
    const a1 = avg(a);
    const a2 = avg(b);
    const a3 = avg(c);
    if (a1 === null || a2 === null || a3 === null) return null;
    return finiteOut((100 * (4 * a1 + 2 * a2 + a3)) / 7);
  }

  /**
   * Rank Correlation Index: Spearman rho of time vs value (not ×100).
   * Length < 2 raises, matching `_builtin_ta_rci` (not the kernel's soft na).
   */
  rci(site: string, source: Cell, length: number): Cell {
    const n = pinePeriod(length);
    if (n === null || n < 2) {
      throw new Error("ta.rci length must be at least 2");
    }
    let st = this.rciSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, window: [] };
      this.rciSites.set(site, st);
    }
    pushCap(st.window, finiteCell(source), n);
    if (st.window.length < n) return null;
    const vals: number[] = [];
    for (const v of st.window) {
      if (v === null) return null;
      vals.push(v);
    }
    return spearmanRho(vals);
  }

  /** `close[length//2+1] - sma(close, length)` (`_dpo_inc_update`). Any na in the window → na. */
  dpo(site: string, close: Cell, length: number): Cell {
    const n = pinePeriod(length);
    if (n === null) return null;
    const disp = Math.floor(n / 2) + 1;
    const keep = Math.max(n, disp);
    let st = this.dpoSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, window: [] };
      this.dpoSites.set(site, st);
    }
    const x = finiteCell(close);
    pushCap(st.window, x, keep);
    if (st.window.length < n || st.window.length < disp) return null;
    const smaStart = st.window.length - n;
    if (x === null) return null;
    let sum = 0;
    for (let i = smaStart; i < st.window.length; i++) {
      const v = st.window[i]!;
      if (v === null) return null;
      sum += v;
    }
    const displaced = st.window[st.window.length - disp];
    if (displaced === null || displaced === undefined) return null;
    return finiteOut(displaced - sum / n);
  }

  /**
   * Know Sure Thing. ROC is `(close - close[-length]) / close[-length] * 100`
   * (lookback `length`, not `length` bars via `src[length]`). Weights 1/2/3/4, /10.
   */
  kst(site: string, close: Cell, l1: number, l2: number, l3: number, l4: number): Cell {
    const lengths = [pinePeriod(l1), pinePeriod(l2), pinePeriod(l3), pinePeriod(l4)];
    if (lengths.some((v) => v === null)) return null;
    const ns = lengths as number[];
    if (Math.min(...ns) < 1) return null;
    const keep = Math.max(...ns);
    const key = ns.join(",");
    let st = this.kstSites.get(site);
    if (st === undefined || st.key !== key) {
      st = { key, window: [] };
      this.kstSites.set(site, st);
    }
    const x = finiteCell(close);
    pushCap(st.window, x, keep);
    if (st.window.length < keep || x === null) return null;
    const rocs: number[] = [];
    for (const length of ns) {
      const base = st.window[st.window.length - length];
      if (base === null || base === undefined) return null;
      if (base === 0) rocs.push(0);
      else rocs.push(((x - base) / base) * 100);
    }
    return finiteOut((rocs[0]! * 1 + rocs[1]! * 2 + rocs[2]! * 3 + rocs[3]! * 4) / 10);
  }

  /**
   * StochRSI. Simple (non-Wilder) RSI: sum of gains/losses over `rsiLen` closes
   * divided by `rsiLen`. First RSI omits the oldest close (`bars > rsiLen`).
   * Signal is `0.33 * stoch + 0.67 * prev` (`_stochrsi_inc_update`).
   */
  stochRsi(site: string, close: Cell, rsiLength: number, stochLength: number): TaRecord {
    const empty = taRec({ stochrsi: null, signal: null });
    const rsiLen = pinePeriod(rsiLength);
    const stochLen = pinePeriod(stochLength);
    if (rsiLen === null || stochLen === null) return empty;
    let st = this.stochRsiSites.get(site);
    if (st === undefined || st.rsiLen !== rsiLen || st.stochLen !== stochLen) {
      st = {
        rsiLen,
        stochLen,
        prices: [],
        rsiRing: [],
        bars: 0,
        validRsi: 0,
        signal: null,
      };
      this.stochRsiSites.set(site, st);
    }
    const x = finiteCell(close);
    if (x === null) return taRec({ stochrsi: null, signal: st.signal });
    pushCap(st.prices, x, rsiLen);
    st.bars += 1;
    if (st.bars <= rsiLen) return empty;
    if (st.prices.length < rsiLen) return empty;
    let gains = 0;
    let losses = 0;
    for (let j = 1; j < st.prices.length; j++) {
      const d = st.prices[j]! - st.prices[j - 1]!;
      if (d > 0) gains += d;
      else losses += -d;
    }
    const avgGain = gains / rsiLen;
    const avgLoss = losses / rsiLen;
    const rs = avgLoss !== 0 ? avgGain / avgLoss : 100;
    const rsiVal = 100 - 100 / (1 + rs);
    pushCap(st.rsiRing, rsiVal, stochLen);
    st.validRsi += 1;
    if (st.validRsi < stochLen || st.rsiRing.length < stochLen) return empty;
    let rsiHigh = st.rsiRing[0]!;
    let rsiLow = rsiHigh;
    for (const v of st.rsiRing) {
      if (v > rsiHigh) rsiHigh = v;
      if (v < rsiLow) rsiLow = v;
    }
    const rsiRange = rsiHigh - rsiLow;
    const stoch = rsiRange === 0 ? 0 : ((rsiVal - rsiLow) / rsiRange) * 100;
    const prev = st.signal === null ? stoch : st.signal;
    const signal = stoch * 0.33 + prev * 0.67;
    st.signal = signal;
    return taRec({
      stochrsi: finiteOut(stoch),
      signal: finiteOut(signal),
    });
  }

  /** Donchian channel via nested highest/lowest (`_donchian_inc_update`). */
  donchian(site: string, high: Cell, low: Cell, length: number): TaRecord {
    const empty = taRec({ high: null, low: null, mid: null });
    const hi = this.highest(`${site}:hi`, high, length);
    const lo = this.lowest(`${site}:lo`, low, length);
    if (hi === null || lo === null) return empty;
    return taRec({ high: hi, low: lo, mid: (hi + lo) / 2 });
  }

  /**
   * Ichimoku. Tenkan/kijun are high-low midpoints. Senkou B is fixed at 52
   * (`ICHIMOKU_SENKOU_B_PERIOD`), not `2 * slow`.
   */
  ichimoku(site: string, high: Cell, low: Cell, fast: number, slow: number): TaRecord {
    const mid = (tag: string, period: number): Cell => {
      const hi = this.highest(`${site}:${tag}:hi`, high, period);
      const lo = this.lowest(`${site}:${tag}:lo`, low, period);
      if (hi === null || lo === null) return null;
      return (hi + lo) / 2;
    };
    const tenkan = mid("tenkan", fast);
    const kijun = mid("kijun", slow);
    const senkouA = tenkan !== null && kijun !== null ? (tenkan + kijun) / 2 : null;
    const senkouB = mid("spanb", 52);
    return taRec({
      tenkan_sen: tenkan,
      kijun_sen: kijun,
      senkou_span_a: senkouA,
      senkou_span_b: senkouB,
    });
  }

  /** Bollinger %B × 100, population variance (`/ length`), clamped to 0..100. */
  bbPct(site: string, close: Cell, length: number, mult: number): Cell {
    const n = pinePeriod(length);
    if (n === null) return null;
    const m = Number.isFinite(mult) ? mult : 2;
    let st = this.bbPctSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, window: [] };
      this.bbPctSites.set(site, st);
    }
    pushCap(st.window, finiteCell(close), n);
    if (st.window.length < n) return null;
    let sum = 0;
    for (const v of st.window) {
      if (v === null) return null;
      sum += v;
    }
    const sma = sum / n;
    let varSum = 0;
    for (const v of st.window) {
      const d = v! - sma;
      varSum += d * d;
    }
    const std = Math.sqrt(varSum / n);
    const upper = sma + std * m;
    const lower = sma - std * m;
    if (upper === lower) return 50;
    const last = st.window[st.window.length - 1]!;
    let pct = ((last - lower) / (upper - lower)) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    return finiteOut(pct);
  }

  /**
   * Ease of Movement, SMA of the last `length` finite EMV samples
   * (na bars are skipped, not zeros). Bar 0 is na.
   */
  emv(site: string, high: Cell, low: Cell, volume: Cell, length: number): Cell {
    const n = pinePeriod(length);
    if (n === null) return null;
    let st = this.emvSites.get(site);
    if (st === undefined || st.length !== n) {
      st = { length: n, prevH: null, prevL: null, started: false, valid: [] };
      this.emvSites.set(site, st);
    }
    const h = finiteCell(high);
    const l = finiteCell(low);
    const vol = finiteCell(volume);
    if (!st.started) {
      st.started = true;
      st.prevH = h;
      st.prevL = l;
      return null;
    }
    let sample: number | null = null;
    if (h !== null && l !== null && vol !== null && vol !== 0 && st.prevH !== null && st.prevL !== null) {
      const distance = (h + l) / 2 - (st.prevH + st.prevL) / 2;
      const box = h - l;
      if (box !== 0) {
        const emv = (distance / box) * (h - l) / vol;
        sample = Number.isFinite(emv) ? emv : null;
      }
    }
    st.prevH = h;
    st.prevL = l;
    if (sample !== null) pushCap(st.valid, sample, n);
    if (st.valid.length < n) return null;
    let sum = 0;
    for (const v of st.valid) sum += v;
    return finiteOut(sum / n);
  }

  /**
   * Fractal flags. Python evaluates at the series end, so the forward half of
   * the centered window is empty: once `bars >= 2*period+1`, current equals
   * the extreme of the last `period+1` bars (ties count). Warmup is false, not na.
   */
  fractal(site: string, high: Cell, low: Cell, period: number): TaRecord {
    const none = taRec({ is_high_fractal: false, is_low_fractal: false });
    const n = pinePeriod(period);
    if (n === null) return none;
    const win = n + 1;
    const need = n * 2 + 1;
    let st = this.fractalSites.get(site);
    if (st === undefined || st.period !== n) {
      st = { period: n, highs: [], lows: [], bars: 0 };
      this.fractalSites.set(site, st);
    }
    st.bars += 1;
    pushCap(st.highs, finiteCell(high), win);
    pushCap(st.lows, finiteCell(low), win);
    if (st.bars < need || st.highs.length < win) return none;
    const ch = st.highs[st.highs.length - 1]!;
    const cl = st.lows[st.lows.length - 1]!;
    if (ch === null || cl === null) return none;
    let maxH = ch;
    let minL = cl;
    for (const h of st.highs) {
      if (h === null) return none;
      if (h > maxH) maxH = h;
    }
    for (const l of st.lows) {
      if (l === null) return none;
      if (l < minL) minL = l;
    }
    return taRec({ is_high_fractal: ch === maxH, is_low_fractal: cl === minL });
  }

  /** ATR stop around chart close. Non-positive ATR → na (`_builtin_ta_atr_stop`). */
  atrStop(close: Cell, atr: Cell, multiplier: number): TaRecord {
    const c = finiteCell(close);
    const a = finiteCell(atr);
    const m = Number.isFinite(multiplier) ? multiplier : 2;
    if (c === null || a === null || a <= 0) return taRec({ long_stop: null, short_stop: null });
    return taRec({ long_stop: finiteOut(c - a * m), short_stop: finiteOut(c + a * m) });
  }

  /**
   * Zigzag tuple `(high, low, direction)`. Incremental SoT
   * `_zigzag_inc_update`: keep the last two numeric samples (`deque(maxlen=2)`),
   * skip `na` samples, and compare the threshold against their percent span.
   */
  zigzag(site: string, source: Cell, threshold: number): { high: Cell; low: Cell; dir: number } {
    const th = Number.isFinite(threshold) ? threshold : 5;
    let st = this.zigzagSites.get(site);
    if (st === undefined) {
      st = { samples: [] };
      this.zigzagSites.set(site, st);
    }
    const x = finiteCell(source);
    if (x !== null) pushCap(st.samples, x, 2);
    if (st.samples.length < 2) return { high: null, low: null, dir: 0 };
    const oldest = st.samples[0]!;
    const newest = st.samples[1]!;
    const recentHigh = Math.max(oldest, newest);
    const recentLow = Math.min(oldest, newest);
    const pct = recentLow !== 0 ? ((recentHigh - recentLow) / recentLow) * 100 : 0;
    const direction = recentHigh === newest ? 1 : -1;
    return { high: recentHigh, low: recentLow, dir: pct > th ? 1 : direction };
  }

  private readonly accelSites = new Map<string, Cell[]>();

  /** Python `pine_expect_int`: near-integers round, other finites floor. `na` throws. */
  private coerceTaInt(value: Cell, message: string): number {
    if (value === null || !Number.isFinite(value)) throw new Error(`${message}. Got: na`);
    const nearest = Math.round(value);
    if (Math.abs(value - nearest) <= PERIOD_INT_EPS) return nearest;
    return Math.floor(value);
  }

  /**
   * Current-bar hammer / doji (`patterns.py` `_hammer`). Both flags can be
   * true; strength prefers doji. `na` OHLC raises (Python `TypeError`).
   */
  hammer(open: Cell, high: Cell, low: Cell, close: Cell): TaRecord {
    if (open === null || high === null || low === null || close === null) {
      throw new Error("bad operand type for abs(): 'NoneType'");
    }
    const body = Math.abs(close - open);
    const range = high - low;
    const lower = Math.min(open, close) - low;
    const upper = high - Math.max(open, close);
    const isDoji = body < range * 0.1;
    const isHammer = body > 0 && lower > body * 2 && upper < body;
    let strength = 0;
    if (isDoji) strength = 1 - body / (range + 0.0001);
    else if (isHammer) strength = Math.min(1, lower / (range + 0.0001));
    return taRec({
      is_hammer: isHammer,
      is_doji: isDoji,
      pattern_strength: Number.isFinite(strength) ? strength : null,
    });
  }

  /**
   * Gap vs an explicit prev-close scalar (`patterns.py` `_gap_detector`).
   * `na` prev-close is the missing-scalar sentinel (zeros), not an error.
   * Numeric prev with `na` high/low raises, matching Python arithmetic.
   */
  gapDetector(high: Cell, low: Cell, prevClose: Cell): TaRecord {
    const none = taRec({ gap_size: 0, gap_type: 0, gap_percent: 0 });
    if (prevClose === null) return none;
    if (high === null || low === null) {
      throw new Error("unsupported operand type(s) for -: 'float' and 'NoneType'");
    }
    const upside = Math.max(0, low - prevClose);
    const downside = Math.max(0, prevClose - high);
    if (upside > downside) {
      const pct = prevClose !== 0 ? (upside / prevClose) * 100 : 0;
      return taRec({
        gap_size: upside,
        gap_type: 1,
        gap_percent: Number.isFinite(pct) ? pct : null,
      });
    }
    if (downside > 0) {
      const pct = prevClose !== 0 ? (downside / prevClose) * 100 : 0;
      return taRec({
        gap_size: downside,
        gap_type: -1,
        gap_percent: Number.isFinite(pct) ? pct : null,
      });
    }
    return none;
  }

  /** `macd_line - signal_line` (`oscillators.py`). Either `na` → `na`. */
  macdSignal(macdLine: Cell, signalLine: Cell): Cell {
    if (macdLine === null || signalLine === null) return null;
    return finiteOut(macdLine - signalLine);
  }

  /**
   * `advanced.py` `_acceleration_factor_inc_update`: last `period + 1`
   * samples (including `na`), clean numeric, compare the newest against the
   * mean of the preceding window, clamp to `[-2, 2]`.
   */
  accelerationFactor(site: string, source: Cell, period: Cell): Cell {
    const p = this.coerceTaInt(period, "ta.acceleration_factor() requires 2 arguments");
    if (p <= 0) return 0;
    const key = `${site}:${p}`;
    let samples = this.accelSites.get(key);
    if (samples === undefined) {
      samples = [];
      this.accelSites.set(key, samples);
    }
    pushCap(samples, finiteCell(source), p + 1);
    if (samples.length < p + 1) return 0;
    const clean: number[] = [];
    for (const v of samples) {
      if (v !== null) clean.push(v);
    }
    if (clean.length < 2) return 0;
    let oldSum = 0;
    for (let i = 0; i < clean.length - 1; i++) oldSum += clean[i]!;
    const oldMom = oldSum / (clean.length - 1);
    const newMom = clean[clean.length - 1]!;
    if (Math.abs(oldMom) < 1e-10) return 0;
    let acc = (newMom - oldMom) / oldMom;
    if (acc < -2) acc = -2;
    if (acc > 2) acc = 2;
    return finiteOut(acc);
  }

  /**
   * `core.py` `_stoch_smooth_inc_update`: raw %K over the last `period`
   * highs/lows (all must be numeric), then EMA(%K, smooth_k) and
   * EMA(that, smooth_d) with SMA-seeded EMA state.
   */
  stochSmooth(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    period: Cell,
    smoothK: Cell,
    smoothD: Cell,
  ): Cell {
    const p = this.coerceTaInt(period, "ta.stoch_smooth period must be integer");
    const k = this.coerceTaInt(smoothK, "ta.stoch_smooth smooth_k must be integer");
    const d = this.coerceTaInt(smoothD, "ta.stoch_smooth smooth_d must be integer");
    if (p < 1 || k < 1 || d < 1) return null;
    const key = `${site}:${p}:${k}:${d}`;
    let st = this.stochSmoothSites.get(key);
    if (st === undefined) {
      st = { highs: [], lows: [] };
      this.stochSmoothSites.set(key, st);
    }
    pushCap(st.highs, finiteCell(high), p);
    pushCap(st.lows, finiteCell(low), p);
    const c = finiteCell(close);
    let stoch: Cell = null;
    if (c !== null && !st.highs.includes(null) && !st.lows.includes(null)) {
      let hh = -Infinity;
      let ll = Infinity;
      for (const v of st.highs) {
        if (v! > hh) hh = v!;
      }
      for (const v of st.lows) {
        if (v! < ll) ll = v!;
      }
      stoch = hh === ll ? 50 : (100 * (c - ll)) / (hh - ll);
    }
    const kVal = this.ema(`${site}:k`, stoch, k);
    return this.ema(`${site}:d`, kVal, d);
  }

  /**
   * `core.py` `_engulfing_inc_update`: last two opens/closes; warmup is two
   * bars. High/low are still required by the caller but unused.
   */
  engulfing(site: string, open: Cell, close: Cell): TaRecord {
    const off = taRec({ is_bullish: false, is_bearish: false, pattern_strength: 0 });
    let st = this.engulfingSites.get(site);
    if (st === undefined) {
      st = { prevOpen: null, prevClose: null, count: 0 };
      this.engulfingSites.set(site, st);
    }
    const o = finiteCell(open);
    const c = finiteCell(close);
    st.count += 1;
    const prevO = st.prevOpen;
    const prevC = st.prevClose;
    if (st.count < 2 || prevO === null || prevC === null || o === null || c === null) {
      st.prevOpen = o;
      st.prevClose = c;
      return off;
    }
    const isBullish = o < prevC && c > prevO && c > o;
    const isBearish = o > prevC && c < prevO && c < o;
    let engulf = 0;
    if (isBullish) {
      engulf = Math.max(0, Math.min(1, (c - prevO) / Math.abs(prevO - prevC + 0.0001)));
    } else if (isBearish) {
      engulf = Math.max(0, Math.min(1, (prevO - c) / Math.abs(prevC - prevO + 0.0001)));
    }
    st.prevOpen = o;
    st.prevClose = c;
    return taRec({
      is_bullish: isBullish,
      is_bearish: isBearish,
      pattern_strength: finiteOut(engulf) ?? 0,
    });
  }

  /** `core.py` `_inside_bar_pattern_inc_update`: last two highs/lows. */
  insideBarPattern(site: string, high: Cell, low: Cell): boolean {
    let st = this.insideBarSites.get(site);
    if (st === undefined) {
      st = { prevHigh: null, prevLow: null, count: 0 };
      this.insideBarSites.set(site, st);
    }
    const currH = high !== null && Number.isFinite(high) ? high : 0;
    const currL = low !== null && Number.isFinite(low) ? low : 0;
    st.count += 1;
    const prevH = st.prevHigh;
    const prevL = st.prevLow;
    if (st.count < 2 || prevH === null || prevL === null) {
      st.prevHigh = currH;
      st.prevLow = currL;
      return false;
    }
    const val = currH < prevH && currL > prevL;
    st.prevHigh = currH;
    st.prevLow = currL;
    return val;
  }

  /**
   * `core.py` `_double_top_bottom_inc_update`: last `period` highs/lows,
   * local-maxima peaks seeded with the first numeric high. `na` period raises.
   */
  doubleTopBottom(site: string, high: Cell, low: Cell, period: Cell): TaRecord {
    const n = this.coerceTaInt(period, "period must be integer");
    const off = taRec({ pattern_type: "none", strength: 0, breakout_level: 0 });
    if (n < 1) return off;
    const key = `${site}:${n}`;
    let st = this.doubleTopBottomSites.get(key);
    if (st === undefined) {
      st = { highs: [], lows: [], count: 0 };
      this.doubleTopBottomSites.set(key, st);
    }
    pushCap(st.highs, finiteCell(high), n);
    pushCap(st.lows, finiteCell(low), n);
    st.count += 1;
    if (st.count < n) return off;
    const recentHigh: number[] = [];
    for (const v of st.highs) {
      if (v !== null) recentHigh.push(v);
    }
    const recentLow: number[] = [];
    for (const v of st.lows) {
      if (v !== null) recentLow.push(v);
    }
    if (recentHigh.length < 3 || recentLow.length === 0) return off;
    const peaks = [recentHigh[0]!];
    for (let i = 1; i < recentHigh.length - 1; i++) {
      if (recentHigh[i]! > recentHigh[i - 1]! && recentHigh[i]! > recentHigh[i + 1]!) {
        peaks.push(recentHigh[i]!);
      }
    }
    if (peaks.length < 2) return off;
    const peakDiff = Math.abs(peaks[peaks.length - 1]! - peaks[peaks.length - 2]!);
    const avgPeak = (peaks[peaks.length - 1]! + peaks[peaks.length - 2]!) / 2;
    const strength = avgPeak > 0 ? 1 - Math.min(1, peakDiff / avgPeak) : 0;
    let minLow = recentLow[0]!;
    for (const v of recentLow) {
      if (v < minLow) minLow = v;
    }
    return taRec({
      pattern_type: "double_top",
      strength: finiteOut(strength) ?? 0,
      breakout_level: finiteOut(minLow - avgPeak * 0.1) ?? 0,
    });
  }

  // `core.py` incremental call-site state for the wave10 detectors.
  private readonly cumDeltaSites = new Map<string, CumulativeDeltaState>();
  private readonly volMomSites = new Map<string, VolumeMomentumState>();
  private readonly volProfileLowSites = new Map<string, { close: Cell[]; volume: Cell[] }>();
  private readonly volThrustSites = new Map<string, VolumeThrustState>();

  private asCount(value: number): number | null {
    if (!Number.isFinite(value)) return null;
    const nearest = Math.round(value);
    return Math.abs(value - nearest) <= PERIOD_INT_EPS ? nearest : Math.floor(value);
  }

  private pushChrono(buf: Cell[], value: Cell): void {
    buf.push(value !== null && Number.isFinite(value) ? value : null);
    if (buf.length > 1000) buf.shift();
  }

  /** Newest-first negative index into a chronological buffer. */
  private nf(buf: Cell[], i: number): Cell {
    const v = buf[-i - 1];
    return v === undefined ? null : v;
  }

  /** `ta.voi` — non-numeric inputs are 0 (`volume.py`). */
  voi(buy: Cell, sell: Cell): Cell {
    const b = buy !== null && Number.isFinite(buy) ? buy : 0;
    const s = sell !== null && Number.isFinite(sell) ? sell : 0;
    const total = b + s;
    if (total === 0) return 0;
    return finiteOut((b - s) / total);
  }

  /** `ta.bid_ask_imbalance` — `{imbalance_ratio, spread}` (`volume.py`). */
  bidAskImbalance(bidSize: Cell, askSize: Cell, bidPrice: Cell, askPrice: Cell): TaRecord {
    const bid = bidSize !== null && Number.isFinite(bidSize) ? bidSize : 0;
    const ask = askSize !== null && Number.isFinite(askSize) ? askSize : 0;
    const bidPx = bidPrice !== null && Number.isFinite(bidPrice) ? bidPrice : 0;
    const askPx = askPrice !== null && Number.isFinite(askPrice) ? askPrice : 0;
    const total = bid + ask;
    if (total === 0) return taRec({ imbalance_ratio: 0, spread: 0 });
    return taRec({
      imbalance_ratio: finiteOut((bid - ask) / total),
      spread: finiteOut(bidPx > 0 ? askPx - bidPx : 0),
    });
  }

  /** `ta.rsi_oversold_overbought` — current sample only (`oscillators.py`). */
  rsiOversoldOverbought(rsi: Cell, oversold: number, overbought: number): TaRecord {
    if (rsi === null || !Number.isFinite(rsi)) {
      return taRec({ is_oversold: false, is_overbought: false, rsi: null });
    }
    const os = this.asCount(oversold);
    const ob = this.asCount(overbought);
    if (os === null || ob === null) {
      return taRec({ is_oversold: false, is_overbought: false, rsi });
    }
    return taRec({ is_oversold: rsi < os, is_overbought: rsi > ob, rsi });
  }

  /**
   * `core.py` `_rsi_divergence_inc_update`: last `period + 1` RSI samples,
   * scaled to `[-1, 1]`. Warmup (`count <= period`) and degenerate windows
   * return `0`.
   */
  rsiDivergence(site: string, value: Cell, period: number): Cell {
    const p = this.asCount(period);
    if (p === null || p < 1) return 0;
    let st = this.rsiDivergenceSites.get(`${site}:${p}`);
    if (st === undefined) {
      st = { window: [], count: 0 };
      this.rsiDivergenceSites.set(`${site}:${p}`, st);
    }
    const x = finiteCell(value);
    pushCap(st.window, x, p + 1);
    st.count += 1;
    if (st.count <= p) return 0;
    const vals: number[] = [];
    for (const v of st.window) {
      if (v !== null) vals.push(v);
    }
    if (vals.length < 2 || x === null) return 0;
    let lo = vals[0]!;
    let hi = vals[0]!;
    for (const v of vals) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    const range = hi - lo;
    return range > 0 ? finiteOut(((x - lo) / range) * 2 - 1) : 0;
  }

  /** `core.py` `_cumulative_delta_inc_update`: signed volume over the last `period` bars. */
  cumulativeDelta(site: string, close: Cell, volume: Cell, period: number): Cell {
    const n = this.asCount(period);
    if (n === null || n <= 0) return 0;
    let st = this.cumDeltaSites.get(`${site}:${n}`);
    if (st === undefined) {
      st = { closes: [], volumes: [], count: 0 };
      this.cumDeltaSites.set(`${site}:${n}`, st);
    }
    const c = finiteCell(close);
    const v = volume !== null && Number.isFinite(volume) ? volume : 0;
    pushCap(st.closes, c, n + 1);
    pushCap(st.volumes, v, n);
    st.count += 1;
    if (st.count < n) return 0;
    let delta = 0;
    const offset = st.closes.length - st.volumes.length;
    for (let j = 0; j < st.volumes.length; j++) {
      const idx = offset + j;
      const cRaw = st.closes[idx] ?? null;
      const cur = cRaw ?? 0;
      const prevRaw = idx === 0 ? null : (st.closes[idx - 1] ?? null);
      const prev = prevRaw ?? cur;
      const vol = st.volumes[j]!;
      if (cur > prev) delta += vol;
      else if (cur < prev) delta -= vol;
    }
    return finiteOut(delta);
  }

  /** `core.py` `_volume_momentum_inc_update`: ROC of the period SMA of volume. */
  volumeMomentum(site: string, volume: Cell, period: number): Cell {
    const n = this.asCount(period);
    if (n === null || n <= 0) return 0;
    let st = this.volMomSites.get(`${site}:${n}`);
    if (st === undefined) {
      st = { window: [] };
      this.volMomSites.set(`${site}:${n}`, st);
    }
    if (volume !== null && Number.isFinite(volume)) pushCap(st.window, volume, n + 1);
    if (st.window.length < n + 1) return 0;
    let oldSum = 0;
    for (let i = 0; i < n; i++) oldSum += st.window[i]!;
    let newSum = 0;
    for (let i = 1; i <= n; i++) newSum += st.window[i]!;
    const oldVol = oldSum / n;
    const newVol = newSum / n;
    if (oldVol === 0) return 0;
    let momentum = ((newVol - oldVol) / oldVol) * 100;
    if (momentum > 100) momentum = 100;
    if (momentum < -100) momentum = -100;
    return finiteOut(momentum);
  }

  /** `moving_averages.py` `_sma_weighted_inc_update`: linear / quadratic / sqrt weights. */
  smaWeighted(site: string, source: Cell, period: Cell, weightType: unknown): Cell {
    const n = this.coerceTaInt(period, "period must be integer");
    const kind = typeof weightType === "string" ? weightType : "linear";
    if (n < 1) return null;
    const key = `${site}:${n}:${kind}`;
    let st = this.smaWeightedSites.get(key);
    if (st === undefined) {
      const weights: number[] = [];
      for (let i = 0; i < n; i++) {
        if (kind === "quadratic") weights.push((i + 1) ** 2);
        else if (kind === "sqrt") weights.push((i + 1) ** 0.5);
        else weights.push(i + 1);
      }
      st = { window: [], weights, wsum: weights.reduce((a, b) => a + b, 0) };
      this.smaWeightedSites.set(key, st);
    }
    pushCap(st.window, finiteCell(source), n);
    if (st.window.length < n || st.window.includes(null) || st.wsum <= 0) return null;
    let total = 0;
    for (let i = 0; i < n; i++) total += st.window[i]! * st.weights[i]!;
    return finiteOut(total / st.wsum);
  }

  /** `volume.py` `_apo_inc_update`: `EMA(fast) - EMA(slow)`. */
  apo(site: string, source: Cell, fast: Cell, slow: Cell): Cell {
    const f = this.coerceTaInt(fast, "ta.apo fast_period must be integer");
    const s = this.coerceTaInt(slow, "ta.apo slow_period must be integer");
    const fastV = this.ema(`${site}:fast`, source, f);
    const slowV = this.ema(`${site}:slow`, source, s);
    if (fastV === null || slowV === null) return null;
    return finiteOut(fastV - slowV);
  }

  /** `volatility.py` `_atr_normalized_inc_update`: ATR as a percent of close. */
  atrNormalized(site: string, high: Cell, low: Cell, close: Cell, period: Cell): Cell {
    const n = this.coerceTaInt(period, "period must be integer");
    const atr = this.atr(`${site}:atr`, high, low, close, n);
    const c = finiteCell(close);
    if (c === null || c === 0 || atr === null) return null;
    return finiteOut((atr / c) * 100);
  }

  private pairWindow(
    sites: Map<string, PairWindowState>,
    site: string,
    a: Cell,
    b: Cell,
    length: Cell,
  ): { a: number[]; b: number[] } | null {
    const n = this.coerceTaInt(length, "length must be integer");
    if (n < 1) return null;
    const key = `${site}:${n}`;
    let st = sites.get(key);
    if (st === undefined) {
      st = { a: [], b: [] };
      sites.set(key, st);
    }
    pushCap(st.a, finiteCell(a), n);
    pushCap(st.b, finiteCell(b), n);
    if (st.a.length < n || st.b.length < n) return null;
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i < n; i++) {
      const av = st.a[i]!;
      const bv = st.b[i]!;
      if (av === null || bv === null) return null;
      left.push(av);
      right.push(bv);
    }
    return { a: left, b: right };
  }

  /** `volatility.py` `_beta_inc_update`: `cov(a,b) / var(b)`. */
  beta(site: string, a: Cell, b: Cell, length: Cell): Cell {
    const pair = this.pairWindow(this.betaSites, site, a, b, length);
    if (pair === null) return null;
    const n = pair.a.length;
    let meanA = 0;
    let meanB = 0;
    for (let i = 0; i < n; i++) {
      meanA += pair.a[i]!;
      meanB += pair.b[i]!;
    }
    meanA /= n;
    meanB /= n;
    let covariance = 0;
    let varianceB = 0;
    for (let i = 0; i < n; i++) {
      covariance += (pair.a[i]! - meanA) * (pair.b[i]! - meanB);
      varianceB += (pair.b[i]! - meanB) ** 2;
    }
    covariance /= n;
    varianceB /= n;
    if (varianceB === 0) return 0;
    return finiteOut(covariance / varianceB);
  }

  /** `volatility.py` `_r_squared_inc_update`: `corr(a,b)^2` clipped to [0, 1]. */
  rSquared(site: string, a: Cell, b: Cell, length: Cell): Cell {
    const pair = this.pairWindow(this.rSquaredSites, site, a, b, length);
    if (pair === null) return null;
    const n = pair.a.length;
    let meanA = 0;
    let meanB = 0;
    for (let i = 0; i < n; i++) {
      meanA += pair.a[i]!;
      meanB += pair.b[i]!;
    }
    meanA /= n;
    meanB /= n;
    let covariance = 0;
    let varA = 0;
    let varB = 0;
    for (let i = 0; i < n; i++) {
      covariance += (pair.a[i]! - meanA) * (pair.b[i]! - meanB);
      varA += (pair.a[i]! - meanA) ** 2;
      varB += (pair.b[i]! - meanB) ** 2;
    }
    covariance /= n;
    varA /= n;
    varB /= n;
    if (varA === 0 || varB === 0) return 0;
    const corr = covariance / Math.sqrt(varA * varB);
    return finiteOut(Math.max(0, Math.min(1, corr ** 2)));
  }

  /** `volatility.py` `_comovement_inc_update`: percent of same-sign bar deltas. */
  comovement(site: string, a: Cell, b: Cell, length: Cell): Cell {
    const pair = this.pairWindow(this.comovementSites, site, a, b, length);
    if (pair === null) return null;
    const n = pair.a.length;
    if (n <= 1) return 0;
    let same = 0;
    for (let i = 1; i < n; i++) {
      if ((pair.a[i]! - pair.a[i - 1]!) * (pair.b[i]! - pair.b[i - 1]!) > 0) same += 1;
    }
    return finiteOut((same / (n - 1)) * 100);
  }

  /** `common.py` `_skewness_inc_update`: population third central moment / std³. */
  skewness(site: string, source: Cell, period: Cell): Cell {
    const n = this.coerceTaInt(period, "period must be integer");
    if (n < 1) return null;
    const key = `${site}:${n}`;
    let st = this.skewnessSites.get(key);
    if (st === undefined) {
      st = { window: [] };
      this.skewnessSites.set(key, st);
    }
    pushCap(st.window, finiteCell(source), n);
    if (st.window.length < n || st.window.includes(null)) return null;
    const vals = st.window as number[];
    let mean = 0;
    for (const v of vals) mean += v;
    mean /= n;
    let variance = 0;
    for (const v of vals) variance += (v - mean) ** 2;
    variance /= n;
    const std = Math.sqrt(variance);
    if (std === 0) return 0;
    let third = 0;
    for (const v of vals) third += (v - mean) ** 3;
    return finiteOut(third / (n * std ** 3));
  }

  /** `common.py` `_kurtosis_inc_update`: excess kurtosis. */
  kurtosis(site: string, source: Cell, period: Cell): Cell {
    const n = this.coerceTaInt(period, "period must be integer");
    if (n < 1) return null;
    const key = `${site}:${n}`;
    let st = this.kurtosisSites.get(key);
    if (st === undefined) {
      st = { window: [] };
      this.kurtosisSites.set(key, st);
    }
    pushCap(st.window, finiteCell(source), n);
    if (st.window.length < n || st.window.includes(null)) return null;
    const vals = st.window as number[];
    let mean = 0;
    for (const v of vals) mean += v;
    mean /= n;
    let variance = 0;
    for (const v of vals) variance += (v - mean) ** 2;
    variance /= n;
    const std = Math.sqrt(variance);
    if (std === 0) return 0;
    let fourth = 0;
    for (const v of vals) fourth += (v - mean) ** 4;
    fourth /= n;
    return finiteOut(fourth / std ** 4 - 3);
  }

  /** `volume.py` `_volume_weighted_momentum_inc_update`. */
  volumeWeightedMomentum(site: string, source: Cell, volume: Cell, length: Cell): Cell {
    const n = this.coerceTaInt(length, "length must be integer");
    if (n < 1) return null;
    const key = `${site}:${n}`;
    let st = this.vwmSites.get(key);
    if (st === undefined) {
      st = { prices: [], volumes: [] };
      this.vwmSites.set(key, st);
    }
    pushCap(st.prices, finiteCell(source), n + 1);
    pushCap(st.volumes, finiteCell(volume), n);
    if (st.volumes.length < n) return null;
    const ps = st.prices;
    const vs = st.volumes;
    let momentumSum = 0;
    let volumeSum = 0;
    for (let i = 0; i < n; i++) {
      const pEnd = ps.length - 1 - i;
      const pPrev = pEnd - 1;
      if (pPrev < 0) break;
      const pv = ps[pEnd] ?? null;
      const pp = ps[pPrev] ?? null;
      if (pv === null || pp === null) return null;
      const vol = vs[vs.length - 1 - i] ?? 0;
      momentumSum += (pv - pp) * vol;
      volumeSum += vol;
    }
    return finiteOut(volumeSum > 0 ? momentumSum / volumeSum : 0);
  }

  /** `common.py` `_parkinson`: volatility from the high/low ratio. */
  parkinson(high: Cell, low: Cell): Cell {
    const h = finiteCell(high);
    const l = finiteCell(low);
    if (h === null || l === null || h <= l) return null;
    const ratio = h / l;
    if (ratio <= 0) return null;
    return finiteOut(Math.sqrt(Math.log(ratio) ** 2 / (4 * Math.log(2))));
  }

  /** `common.py` `_garman_klass`: OHLC volatility. */
  garmanKlass(high: Cell, low: Cell, close: Cell, open: Cell): Cell {
    const h = finiteCell(high);
    const l = finiteCell(low);
    const c = finiteCell(close);
    const o = finiteCell(open);
    if (h === null || l === null || c === null || o === null) return null;
    if (h <= l || h <= 0 || c <= 0) return null;
    const term1 = 0.5 * Math.log(h / l) ** 2;
    const term2 = (2 * Math.log(2) - 1) * Math.log(c / o) ** 2;
    return finiteOut(Math.sqrt(term1 - term2));
  }

  /** `core.py` `_mean_reversion_score_inc_update`: period is a warmup gate. */
  meanReversionScore(site: string, close: Cell, sma: Cell, stdev: Cell, period: Cell): number {
    const n = this.coerceTaInt(period, "ta.mean_reversion_score() requires 4 arguments");
    if (n <= 0) return 50;
    let st = this.meanReversionSites.get(`${site}:${n}`);
    if (st === undefined) {
      st = { countClose: 0, countSma: 0 };
      this.meanReversionSites.set(`${site}:${n}`, st);
    }
    st.countClose += 1;
    st.countSma += 1;
    if (st.countClose < n || st.countSma < n) return 50;
    const c = finiteCell(close) ?? 100;
    const s = finiteCell(sma) ?? 100;
    const sd = finiteCell(stdev) ?? 1;
    if (sd === 0) return 50;
    return Math.max(0, Math.min(100, Math.min(100, (Math.abs(c - s) / sd) * 20)));
  }

  /** `core.py` `_market_condition_inc_update`. */
  marketCondition(site: string, close: Cell, atr: Cell, smaPeriod: Cell, stdevPeriod: Cell): string {
    const smaN = this.coerceTaInt(smaPeriod, "sma period must be integer");
    const stdevN = this.coerceTaInt(stdevPeriod, "stdev period must be integer");
    if (smaN <= 0 || stdevN <= 0) return "ranging";
    const win = Math.max(smaN, stdevN);
    const key = `${site}:${smaN}:${stdevN}`;
    let st = this.marketConditionSites.get(key);
    if (st === undefined) {
      st = { window: [], atr: null };
      this.marketConditionSites.set(key, st);
    }
    pushCap(st.window, finiteCell(close), win);
    st.atr = finiteCell(atr);
    if (st.window.length < win) return "ranging";
    const cLast = st.window[st.window.length - 1] ?? null;
    const currentClose = cLast ?? 0;
    const currentAtr = st.atr ?? 1;
    const currentSma = smaOf(st.window, smaN) ?? currentClose;
    const stdevVal = stdevOf(st.window, stdevN);
    if (stdevVal !== null && stdevVal > currentAtr * 1.5) return "volatile";
    if (currentClose > currentSma && currentAtr > 0.5) return "trending_up";
    if (currentClose < currentSma && currentAtr > 0.5) return "trending_down";
    return "ranging";
  }

  /** `core.py` `_order_flow_imbalance_inc_update`. */
  orderFlowImbalance(
    site: string,
    high: Cell,
    low: Cell,
    close: Cell,
    volume: Cell,
    period: Cell,
  ): number {
    const n = this.coerceTaInt(period, "period must be integer");
    if (n <= 0) return 0;
    const key = `${site}:${n}`;
    let st = this.orderFlowSites.get(key);
    if (st === undefined) {
      st = { highs: [], lows: [], closes: [], volumes: [] };
      this.orderFlowSites.set(key, st);
    }
    pushCap(st.highs, finiteCell(high), n);
    pushCap(st.lows, finiteCell(low), n);
    pushCap(st.closes, finiteCell(close), n);
    pushCap(st.volumes, finiteCell(volume), n);
    if (st.highs.length < n || st.lows.length < n) return 0;
    let buy = 0;
    let sell = 0;
    for (let i = 0; i < n; i++) {
      const h = st.highs[i] ?? 0;
      const l = st.lows[i] ?? 0;
      const c = st.closes[i] ?? 0;
      const v = st.volumes[i] ?? 0;
      if (h > l) {
        const mid = (h + l) / 2;
        if (c > mid) buy += v;
        else sell += v;
      }
    }
    const total = buy + sell;
    if (total === 0) return 0;
    return finiteOut((buy - sell) / total) ?? 0;
  }

  /** `core.py` `_liquidity_score_inc_update`. */
  liquidityScore(site: string, volume: Cell, volatility: Cell, spread: Cell, period: Cell): number {
    const n = this.coerceTaInt(period, "period must be integer");
    if (n <= 0) return 50;
    const key = `${site}:${n}`;
    let st = this.liquiditySites.get(key);
    if (st === undefined) {
      st = { volume: [], volatility: [], spread: [] };
      this.liquiditySites.set(key, st);
    }
    pushCap(st.volume, finiteCell(volume), n);
    pushCap(st.volatility, finiteCell(volatility), n);
    pushCap(st.spread, finiteCell(spread), n);
    if (st.volume.length < n || st.volatility.length < n || st.spread.length < n) return 50;
    let volSum = 0;
    for (const v of st.volume) if (v !== null) volSum += v;
    let volaSum = 0;
    for (const v of st.volatility) if (v !== null) volaSum += v;
    let spreadSum = 0;
    for (const v of st.spread) if (v !== null) spreadSum += v;
    const volScore = Math.min(100, volSum / n / 100);
    const volatilityScore = Math.max(0, 100 - (volaSum / n) * 50);
    const spreadScore = Math.max(0, 100 - (spreadSum / n) * 100);
    const liquidity = volScore * 0.4 + volatilityScore * 0.3 + spreadScore * 0.3;
    return Math.max(0, Math.min(100, liquidity));
  }

  /** `core.py` `_fear_greed_index_inc_update` — last samples only. */
  fearGreedIndex(rsi: Cell, vix: Cell, putCall: Cell, breadth: Cell): number {
    const r = finiteCell(rsi) ?? 50;
    const v = finiteCell(vix) ?? 2;
    const pc = finiteCell(putCall) ?? 1;
    const b = finiteCell(breadth) ?? 0.5;
    const index = ((r - 50) * 1 + (v - 2) * 10 + (1 - pc) * 50 + (b - 0.5) * 100) / 4;
    return Math.max(-100, Math.min(100, index));
  }

  /** `core.py` `_crowd_sentiment_inc_update` — last samples only. */
  crowdSentiment(priceAgreement: Cell, volumeAgreement: Cell, timeAgreement: Cell): number {
    const p = finiteCell(priceAgreement) ?? 0.5;
    const v = finiteCell(volumeAgreement) ?? 0.5;
    const t = finiteCell(timeAgreement) ?? 0.5;
    return Math.max(0, Math.min(100, ((p + v + t) / 3) * 100));
  }

  /** `core.py` `_smart_money_flow_inc_update` — last samples only. */
  smartMoneyFlow(priceChange: Cell, volume: Cell, timeHigh: Cell, timeLow: Cell): number {
    const p = finiteCell(priceChange) ?? 0;
    const v = finiteCell(volume) ?? 1000;
    const th = finiteCell(timeHigh) ?? 10;
    const tl = finiteCell(timeLow) ?? 10;
    const volFactor = Math.min(1, v / 5000);
    let flow = 0;
    if (p > 0 && th < tl) flow = volFactor * 0.8;
    else if (p < 0 && tl < th) flow = -volFactor * 0.8;
    return Math.max(-1, Math.min(1, flow));
  }

  /** `core.py` `_trend_confirmation_score_inc_update` — last samples only. */
  trendConfirmationScore(
    momentum: Cell,
    trendAlignment: Cell,
    strength: Cell,
    rsi: Cell,
    rsiAlignment: Cell,
  ): number {
    const m = finiteCell(momentum) ?? 0;
    const t = finiteCell(trendAlignment) ?? 0;
    const s = finiteCell(strength) ?? 1;
    const r = finiteCell(rsi) ?? 50;
    const a = finiteCell(rsiAlignment) ?? 0;
    const momentumScore = Math.min(100, Math.abs(m) * 20);
    const trendScore = Math.max(0, ((t + 1) / 2) * 100);
    const strengthScore = Math.min(100, s * 50);
    const rsiScore = Math.abs(r - 50) > 10 ? Math.min(100, Math.abs(r - 50) * 2) : 40;
    const alignmentBonus = Math.abs(a) > 0.5 ? 20 : 0;
    const total =
      momentumScore * 0.25 + trendScore * 0.3 + strengthScore * 0.25 + rsiScore * 0.15 + alignmentBonus;
    return Math.max(0, Math.min(100, total));
  }

  /** `core.py` `_max_loss_level_inc_update` — last samples only. */
  maxLossLevel(entry: Cell, account: Cell, maxLossPct: Cell): number {
    const e = finiteCell(entry) ?? 100;
    const a = finiteCell(account) ?? 10000;
    const p = finiteCell(maxLossPct) ?? 1;
    const maxLossAmount = a * (p / 100);
    if (e <= 0) return 0;
    const shares = a / e;
    const stop = shares > 0 ? e - maxLossAmount / shares : 0;
    return Math.max(0, stop);
  }

  /** `core.py` `_profit_lock_level_inc_update` — last samples only. */
  profitLockLevel(entry: Cell, current: Cell, trailPct: Cell, direction: Cell): number {
    const e = finiteCell(entry) ?? 100;
    const c = finiteCell(current) ?? 100;
    const t = Math.max(0, Math.min(1, finiteCell(trailPct) ?? 0.05));
    const d = finiteCell(direction) ?? 1;
    return d > 0 ? Math.max(e * 0.9, c - c * t) : Math.min(e * 1.1, c + c * t);
  }

  /** `advanced.py` `_builtin_ta_position_sizing`. */
  positionSizing(account: Cell, riskPct: Cell, entry: Cell, stop: Cell): number {
    const a = finiteCell(account) ?? 10000;
    const r = finiteCell(riskPct) ?? 0.01;
    const e = finiteCell(entry) ?? 100;
    const s = finiteCell(stop) ?? 95;
    const riskAmount = a * (r / 100);
    const distance = e - s;
    if (Math.abs(distance) < 1e-10) return 0;
    return Math.max(0, riskAmount / Math.abs(distance));
  }

  /** `advanced.py` `_builtin_ta_kelly_criterion`. */
  kellyCriterion(winRate: Cell, avgWin: Cell, avgLoss: Cell): number {
    const wr = Math.max(0, Math.min(1, finiteCell(winRate) ?? 0.5));
    const win = finiteCell(avgWin) ?? 1;
    const loss = finiteCell(avgLoss) ?? 1;
    if (Math.abs(win) < 1e-10) return 0;
    const kelly = (wr * win - (1 - wr) * loss) / win;
    return Math.max(0, kelly);
  }

  /** `advanced.py` `_builtin_ta_risk_reward_ratio`. */
  riskRewardRatio(entry: Cell, stop: Cell, target: Cell): Cell {
    const e = finiteCell(entry) ?? 0;
    const s = finiteCell(stop) ?? 0;
    const t = finiteCell(target) ?? 0;
    const risk = e - s;
    if (Math.abs(risk) < 1e-10) return null;
    return finiteOut((t - e) / risk);
  }

  /** `strategies.py` `_builtin_ta_risk_reward_asymmetry`. */
  riskRewardAsymmetry(entry: Cell, stop: Cell, target: Cell, winRate: Cell): TaRecord {
    const e = finiteCell(entry) ?? 0;
    const s = finiteCell(stop) ?? 0;
    const t = finiteCell(target) ?? 0;
    const wr = finiteCell(winRate) ?? 0.5;
    const risk = Math.abs(e - s);
    const reward = Math.abs(t - e);
    const ratio = risk > 0 ? reward / risk : 0;
    const ev = wr * reward - (1 - wr) * risk;
    const kelly = ratio > 0 ? wr - (1 - wr) / ratio : 0;
    return taRec({
      ratio: finiteOut(ratio) ?? 0,
      expected_value: finiteOut(ev) ?? 0,
      kelly_percent: finiteOut(kelly * 100) ?? 0,
      is_favorable: ev > 0,
      risk_reward_ratio: finiteOut(ratio) ?? 0,
      kelly_percentage: finiteOut(kelly * 100) ?? 0,
    });
  }

  /** `advanced.py` `_builtin_ta_probability_of_movement`. */
  probabilityOfMovement(current: Cell, target: Cell, atr: Cell, period: Cell): number {
    const c = finiteCell(current) ?? 100;
    const t = finiteCell(target) ?? 100;
    const a = finiteCell(atr) ?? 1;
    const n = this.coerceTaInt(period, "period must be integer");
    if (Math.abs(c) < 1e-10 || Math.abs(a) < 1e-10) return 0.5;
    const distance = Math.abs(t - c);
    const expected = a * Math.sqrt(n);
    if (expected === 0) return 0.5;
    return Math.max(0, Math.min(1, Math.min(1, distance / expected) * 0.8 + 0.1));
  }

  /** `advanced.py` `_builtin_ta_trend_strength`. */
  trendStrength(price: Cell, adx: Cell, rsi: Cell): number {
    const a = finiteCell(adx) ?? 20;
    const r = finiteCell(rsi) ?? 50;
    const adxNorm = Math.min(100, Math.max(0, a));
    const rsiExtremeness = Math.abs(r - 50) / 50;
    return Math.min(100, Math.max(0, adxNorm * 0.6 + rsiExtremeness * 40));
  }

  /** `strategies.py` `_builtin_ta_breakeven_level`. */
  breakevenLevel(entry: Cell, qty: Cell, commission: Cell, slippage: Cell, direction: Cell): TaRecord {
    const e = finiteCell(entry) ?? 0;
    const q = finiteCell(qty) ?? 0;
    const comm = finiteCell(commission) ?? 0;
    const slip = finiteCell(slippage) ?? 0;
    const d = finiteCell(direction) ?? 1;
    const cost = comm + slip * q;
    const impact = q > 0 ? cost / q : 0;
    const breakeven = d >= 0 ? e + impact : e - impact;
    const move = e > 0 ? (Math.abs(breakeven - e) / e) * 100 : 0;
    return taRec({
      breakeven_price: finiteOut(breakeven) ?? 0,
      total_cost: finiteOut(cost) ?? 0,
      move_required_percent: finiteOut(move) ?? 0,
    });
  }

  /** `strategies.py` `_builtin_ta_market_structure_pivot` (bar-mode last close). */
  marketStructurePivot(close: Cell): TaRecord {
    const c = finiteCell(close) ?? 0;
    return taRec({ pivot_price: c, structure: "fractal", type: "high" });
  }

  /** `strategies.py` `_builtin_ta_position_sizing_score`. */
  positionSizingScore(risk: Cell, volatility: Cell, conviction: Cell, correlation: Cell): TaRecord {
    const r = finiteCell(risk) ?? 0;
    const v = finiteCell(volatility) ?? 0;
    const c = finiteCell(conviction) ?? 0;
    const corr = finiteCell(correlation) ?? 0;
    let score = (r / (v + 0.1)) * c * (1 - corr);
    score = Math.max(0, Math.min(1, score * 0.1));
    return taRec({
      score: finiteOut(score * 100) ?? 0,
      position_size_ratio: finiteOut(score) ?? 0,
      kelly_fraction: finiteOut(score * 0.5) ?? 0,
      correlation_adjustment: finiteOut(1 - corr) ?? 0,
    });
  }

  /** `strategies.py` `_builtin_ta_trailing_exit_level`. */
  trailingExitLevel(entry: Cell, current: Cell, atr: Cell, mult: Cell, step: Cell): TaRecord {
    const e = finiteCell(entry) ?? 0;
    const c = finiteCell(current) ?? 0;
    const a = finiteCell(atr) ?? 0;
    const m = finiteCell(mult) ?? 0;
    void (finiteCell(step) ?? 0);
    const trail = c > e ? Math.max(e * 1.001, c - a * m) : c + a * m;
    return taRec({
      trail_stop: finiteOut(trail) ?? 0,
      protected_profit: c > e ? finiteOut(Math.max(0, c - e)) ?? 0 : 0,
      risk_reward_current: a > 0 ? finiteOut(Math.abs(c - e) / a) ?? 0 : 0,
    });
  }

  /** `strategies.py` `_builtin_ta_optimal_entry_zone` (bar-mode last close). */
  optimalEntryZone(close: Cell): TaRecord {
    const c = finiteCell(close) ?? 0;
    return taRec({
      min: finiteOut(c * 0.99) ?? 0,
      max: finiteOut(c * 1.01) ?? 0,
      optimal: c,
      entry_zone_low: finiteOut(c * 0.99) ?? 0,
      entry_zone_high: finiteOut(c * 1.01) ?? 0,
      best_entry: c,
      zone_strength: 85,
    });
  }

  /** `strategies.py` `_builtin_ta_mean_reversion_entry` (bar-mode last samples). */
  meanReversionEntry(price: Cell, sma: Cell, stdev: Cell, threshold: Cell): TaRecord {
    const p = finiteCell(price) ?? 0;
    const s = finiteCell(sma) ?? 0;
    const sd = finiteCell(stdev) ?? 1;
    const th = finiteCell(threshold) ?? 0;
    const z = sd !== 0 ? (p - s) / sd : 0;
    return taRec({
      entry_price: 100,
      stop_loss: 95,
      take_profit: 105,
      probability: 0.7,
      reversion_probability: 0.75,
      target_price: 105,
      z_score: finiteOut(z) ?? 0,
      is_mean_reversion_setup: Math.abs(z) > th,
    });
  }

  /** `strategies.py` `_builtin_ta_multi_timeframe_signal`. */
  multiTimeframeSignal(s1: Cell, s2: Cell, s3: Cell, w1: Cell, w2: Cell, w3: Cell): TaRecord {
    const score =
      (finiteCell(s1) ?? 0) * (finiteCell(w1) ?? 0) +
      (finiteCell(s2) ?? 0) * (finiteCell(w2) ?? 0) +
      (finiteCell(s3) ?? 0) * (finiteCell(w3) ?? 0);
    return taRec({ score: finiteOut(score) ?? 0, signal: score > 0.5 ? "buy" : "sell", agreement: true });
  }

  /** `strategies.py` `_builtin_ta_market_timing_index`. */
  marketTimingIndex(trend: Cell, momentum: Cell, volatility: Cell, sentiment: Cell): TaRecord {
    const t = finiteCell(trend) ?? 0;
    const m = finiteCell(momentum) ?? 0;
    const v = finiteCell(volatility) ?? 0;
    const s = finiteCell(sentiment) ?? 0;
    const score = t * 0.3 + m * 0.3 + v * 0.2 + s * 0.2;
    let recommendation = "hold";
    if (score > 80) recommendation = "strong_buy";
    else if (score > 60) recommendation = "buy";
    else if (score < 20) recommendation = "strong_sell";
    else if (score < 40) recommendation = "sell";
    return taRec({
      score: finiteOut(score) ?? 0,
      recommendation,
      regime: Math.abs(t) > 50 ? "trending" : "ranging",
      timing_index: finiteOut(score) ?? 0,
      market_condition: score > 80 ? "optimal_long" : "neutral",
      confidence: 0.85,
    });
  }

  /** `strategies.py` `_builtin_ta_regime_adaptive_signal`. */
  regimeAdaptiveSignal(
    strength: Cell,
    volRegime: unknown,
    trendRegime: unknown,
  ): TaRecord {
    const vol = typeof volRegime === "string" ? volRegime : "";
    const trend = typeof trendRegime === "string" ? trendRegime : "";
    let adapted = finiteCell(strength) ?? 0;
    let fit = 1;
    if (vol === "high") {
      adapted *= 0.8;
      fit *= 0.8;
    }
    if (trend === "ranging") {
      adapted *= 0.5;
      fit *= 0.5;
    }
    return taRec({
      signal: adapted > 0.5 ? "buy" : "sell",
      strength: finiteOut(adapted) ?? 0,
      confidence: finiteOut(adapted * 100) ?? 0,
      adapted_signal: finiteOut(adapted) ?? 0,
      regime_fit: finiteOut(fit) ?? 0,
      strategy_recommendation: trend === "trending" ? "trend_following" : "mean_reversion",
      signal_confidence: finiteOut(adapted) ?? 0,
    });
  }

  /** `advanced.py` `_builtin_ta_strategy_score`. */
  strategyScore(rsi: Cell, macd: Cell, emaCross: Cell, trend: Cell): number {
    const r = finiteCell(rsi) ?? 50;
    const m = finiteCell(macd) ?? 0;
    const cross = emaCross != null && emaCross !== 0;
    const t = finiteCell(trend) ?? 50;
    const rsiNorm = ((r - 50) / 50) * 25;
    const macdNorm = Math.max(-25, Math.min(25, m * 50));
    const emaBonus = cross ? 25 : -25;
    const trendNorm = ((t - 50) / 50) * 25;
    return Math.max(-100, Math.min(100, rsiNorm + macdNorm + emaBonus + trendNorm));
  }

  /** `advanced.py` `_builtin_ta_breakout_detection`. */
  breakoutDetection(close: Cell, resistance: Cell, support: Cell): TaRecord {
    const c = finiteCell(close) ?? 0;
    const r = finiteCell(resistance) ?? 0;
    const s = finiteCell(support) ?? 0;
    if (c > r) {
      const strength = r > 0 ? ((c - r) / r) * 100 : 0;
      return taRec({
        is_breakout: true,
        breakout_type: "resistance",
        breakout_strength: finiteOut(strength) ?? 0,
      });
    }
    if (c < s) {
      const strength = s > 0 ? ((s - c) / s) * 100 : 0;
      return taRec({
        is_breakout: true,
        breakout_type: "support",
        breakout_strength: finiteOut(strength) ?? 0,
      });
    }
    return taRec({ is_breakout: false, breakout_type: "none", breakout_strength: 0 });
  }

  /**
   * `ta.volume_profile_high` — numeric list only (`advanced.py`).
   * A one-element pair is that price when its volume is the strict max.
   */
  volumeProfileHigh(prices: Cell[], volumes: Cell[]): Cell {
    if (prices.length === 0 || volumes.length === 0 || prices.length !== volumes.length) return 0;
    let maxVol = 0;
    let maxPrice = 0;
    for (let i = 0; i < prices.length; i++) {
      const v = volumes[i];
      if (v === null || !Number.isFinite(v) || !(v > maxVol)) continue;
      maxVol = v;
      const p = prices[i];
      maxPrice = p !== null && Number.isFinite(p) ? p : 0;
    }
    return finiteOut(maxPrice);
  }

  /** `ta.volume_profile_low` — buckets over the oldest `period` pairs (`advanced.py`). */
  volumeProfileLow(site: string, close: Cell, volume: Cell, period: number, levels: number): Cell {
    const p = this.asCount(period);
    const lv = this.asCount(levels);
    let st = this.volProfileLowSites.get(site);
    if (st === undefined) {
      st = { close: [], volume: [] };
      this.volProfileLowSites.set(site, st);
    }
    this.pushChrono(st.close, close);
    this.pushChrono(st.volume, volume);
    const oldest = st.close.length > 0 ? st.close[0]! : null;
    const fallback: Cell = st.close.length === 0 ? 100 : oldest !== null && Number.isFinite(oldest) ? oldest : null;
    if (p === null || lv === null || p <= 0 || lv <= 0 || st.close.length < p) return fallback;
    const prices: number[] = [];
    const vols: number[] = [];
    for (let i = -p; i < 0; i++) {
      const c = this.nf(st.close, i);
      const v = this.nf(st.volume, i);
      if (c !== null && Number.isFinite(c) && v !== null && Number.isFinite(v)) {
        prices.push(c);
        vols.push(v);
      }
    }
    if (prices.length === 0) return fallback;
    let minP = prices[0]!;
    let maxP = prices[0]!;
    for (const c of prices) {
      if (c < minP) minP = c;
      if (c > maxP) maxP = c;
    }
    if (minP === maxP) return minP;
    const bucket = (maxP - minP) / lv;
    const buckets = new Array<number>(lv).fill(0);
    for (let k = 0; k < prices.length; k++) {
      let idx = Math.trunc((prices[k]! - minP) / bucket);
      if (idx > lv - 1) idx = lv - 1;
      if (idx < 0) idx = 0;
      buckets[idx] = (buckets[idx] ?? 0) + vols[k]!;
    }
    let minIdx = 0;
    for (let i = 1; i < lv; i++) {
      if ((buckets[i] ?? 0) < (buckets[minIdx] ?? 0)) minIdx = i;
    }
    return finiteOut(minP + minIdx * bucket);
  }

  /**
   * `core.py` `_volume_thrust_inc_update`: volume spike plus a >1% price
   * move. `na` samples fall back to 100 / 1000; the first sample of each
   * series is skipped when it is `na`.
   */
  volumeThrust(site: string, close: Cell, volume: Cell, volSma: Cell, sensitivity: number): Cell {
    const sens = Number.isFinite(sensitivity) ? sensitivity : 0.3;
    let st = this.volThrustSites.get(site);
    if (st === undefined) {
      st = { closes: [], volume: null, sma: null, nClose: 0, nVolume: 0, nSma: 0 };
      this.volThrustSites.set(site, st);
    }
    if (!(close === null && st.nClose === 0)) {
      pushCap(st.closes, finiteCell(close), 2);
      st.nClose += 1;
    }
    if (!(volume === null && st.nVolume === 0)) {
      st.volume = finiteCell(volume);
      st.nVolume += 1;
    }
    if (!(volSma === null && st.nSma === 0)) {
      st.sma = finiteCell(volSma);
      st.nSma += 1;
    }
    if (st.nClose < 1 || st.nVolume < 1 || st.nSma < 1) return 0;
    const cVal = st.closes[st.closes.length - 1] ?? 100;
    const cPrev = st.closes.length > 1 ? (st.closes[st.closes.length - 2] ?? 100) : 100;
    const vVal = st.volume ?? 1000;
    const vsVal = st.sma ?? 1000;
    const spike = vVal > vsVal * (1 + sens);
    const move = cPrev !== 0 ? Math.abs(cVal - cPrev) / cPrev > 0.01 : false;
    return spike && move ? 1 : 0;
  }
}

/** Spearman rho. Rank is the stable sort position (`_rci_spearman`). */
function spearmanRho(vals: number[]): Cell {
  const n = vals.length;
  if (n < 2) return null;
  const order = vals.map((_, i) => i);
  order.sort((i, j) => vals[i]! - vals[j]!);
  let d2 = 0;
  for (let pos = 0; pos < n; pos++) {
    const d = order[pos]! - pos;
    d2 += d * d;
  }
  const denom = n * (n * n - 1);
  if (denom === 0) return null;
  return finiteOut(1 - (6 * d2) / denom);
}
