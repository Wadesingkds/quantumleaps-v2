// Confluence Scorer
// Combines Gann levels with SMC signals to produce confluence scores

import { calculateGannLevels, GannLevel } from "./gann";
import { detectAllSignals, SMCSignal, Candle } from "./smc";

export type ConfluenceLevel = {
  type: "buy" | "sell";
  price: string;
  score: number;
  signals: string[];
  gann?: GannLevel;
  smc: SMCSignal[];
};

// Score weights for each signal type
const SIGNAL_WEIGHTS: Record<string, number> = {
  FVG: 2,
  OB: 3,
  BOS: 2,
  CHoCH: 4,
};

const GANN_WEIGHT = 2;
const PROXIMITY_THRESHOLD = 0.003; // 0.3% — how close signals need to be to count as confluence

function isNear(price: number, target: number): boolean {
  return Math.abs(price - target) / target < PROXIMITY_THRESHOLD;
}

export function calculateConfluence(candles: Candle[], timeframe: string): ConfluenceLevel[] {
  if (candles.length < 20) return [];

  // Find swing high/low from recent candles
  const lookback = Math.min(candles.length, 100);
  const recent = candles.slice(-lookback);
  let swingHigh = -Infinity, swingLow = Infinity;
  for (const c of recent) {
    if (c.high > swingHigh) swingHigh = c.high;
    if (c.low < swingLow) swingLow = c.low;
  }

  // Calculate Gann levels
  const gannLevels = calculateGannLevels(swingHigh, swingLow);

  // Detect SMC signals (from recent candles only for relevance)
  const smcSignals = detectAllSignals(candles.slice(-200));

  // For each Gann level, check nearby SMC signals
  const levels: ConfluenceLevel[] = [];

  for (const gann of gannLevels) {
    const nearbySignals = smcSignals.filter((s) => isNear(s.price, gann.price));
    if (nearbySignals.length === 0) continue;

    const signalTypes = new Set(nearbySignals.map((s) => s.type));
    let score = GANN_WEIGHT; // base score for Gann level
    for (const sig of nearbySignals) {
      score += SIGNAL_WEIGHTS[sig.type] || 1;
    }
    // Bonus for multiple signal types
    if (signalTypes.size >= 2) score += 2;
    if (signalTypes.size >= 3) score += 3;

    // Cap at 10
    score = Math.min(score, 10);

    levels.push({
      type: gann.type === "BUY" ? "buy" : "sell",
      price: gann.price.toFixed(2),
      score,
      signals: [...signalTypes],
      gann,
      smc: nearbySignals,
    });
  }

  // Also add high-scoring SMC clusters that aren't near Gann levels
  const gannPrices = new Set(gannLevels.map((g) => g.price));
  const smcOnlyLevels = findSMCClusters(smcSignals, gannPrices);
  levels.push(...smcOnlyLevels);

  // Deduplicate: merge levels that are very close together
  const merged = mergeNearbyLevels(levels);

  // Sort by score descending, then by recency
  return merged.sort((a, b) => b.score - a.score);
}

function findSMCClusters(signals: SMCSignal[], gannPrices: Set<number>): ConfluenceLevel[] {
  const levels: ConfluenceLevel[] = [];
  const used = new Set<number>();

  for (let i = 0; i < signals.length; i++) {
    if (used.has(i)) continue;
    const s1 = signals[i];
    const cluster: SMCSignal[] = [s1];
    used.add(i);

    for (let j = i + 1; j < signals.length; j++) {
      if (used.has(j)) continue;
      if (signals[j].direction === s1.direction && isNear(signals[j].price, s1.price)) {
        cluster.push(signals[j]);
        used.add(j);
      }
    }

    if (cluster.length >= 2) {
      const types = new Set(cluster.map((s) => s.type));
      let score = 0;
      for (const s of cluster) score += SIGNAL_WEIGHTS[s.type] || 1;
      if (types.size >= 2) score += 2;
      score = Math.min(score, 10);

      // Skip if too close to a Gann level (already counted)
      const avgPrice = cluster.reduce((sum, s) => sum + s.price, 0) / cluster.length;
      let nearGann = false;
      for (const gp of gannPrices) {
        if (isNear(avgPrice, gp)) { nearGann = true; break; }
      }
      if (nearGann) continue;

      levels.push({
        type: s1.direction,
        price: avgPrice.toFixed(2),
        score,
        signals: [...types],
        smc: cluster,
      });
    }
  }

  return levels;
}

function mergeNearbyLevels(levels: ConfluenceLevel[]): ConfluenceLevel[] {
  const merged: ConfluenceLevel[] = [];
  const used = new Set<number>();

  for (let i = 0; i < levels.length; i++) {
    if (used.has(i)) continue;
    const l1 = levels[i];
    const group: ConfluenceLevel[] = [l1];
    used.add(i);

    for (let j = i + 1; j < levels.length; j++) {
      if (used.has(j)) continue;
      if (levels[j].type === l1.type && isNear(+levels[j].price, +l1.price)) {
        group.push(levels[j]);
        used.add(j);
      }
    }

    if (group.length === 1) {
      merged.push(l1);
    } else {
      // Merge: take highest score, combine signals
      const allSignals = new Set<string>();
      for (const g of group) g.signals.forEach((s) => allSignals.add(s));
      const best = group.reduce((a, b) => a.score > b.score ? a : b);
      const avgPrice = group.reduce((sum, g) => sum + +g.price, 0) / group.length;
      merged.push({
        ...best,
        price: avgPrice.toFixed(2),
        signals: [...allSignals],
        score: Math.min(best.score + (group.length > 2 ? 1 : 0), 10),
      });
    }
  }

  return merged;
}
