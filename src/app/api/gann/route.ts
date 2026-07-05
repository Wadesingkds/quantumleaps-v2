import { NextResponse } from "next/server";

// ── Gann Square of 9 ──
function gannLevel(price: number, degrees: number): number {
  const sqrt = Math.sqrt(price);
  const rotated = sqrt + degrees / 360;
  return +(rotated * rotated).toFixed(2);
}

function calcGannLevels(high: number, low: number) {
  const levels: { price: number; direction: "BUY" | "SELL" }[] = [];
  const buyAngles = [90, 180, 270, 360];
  const sellAngles = [90, 180, 270, 360];

  for (const angle of sellAngles) {
    const p = gannLevel(high, angle);
    if (p > high && p < high * 1.05)
      levels.push({ price: p, direction: "SELL" });
  }
  for (const angle of buyAngles) {
    const p = gannLevel(low, -angle);
    if (p < low && p > low * 0.95)
      levels.push({ price: p, direction: "BUY" });
  }
  // mid-range
  const mid = (high + low) / 2;
  for (const angle of [45, 135, 225, 315]) {
    const above = gannLevel(mid, angle);
    const below = gannLevel(mid, -angle);
    if (above > low && above < high * 1.03)
      levels.push({ price: above, direction: "SELL" });
    if (below > low * 0.97 && below < high)
      levels.push({ price: below, direction: "BUY" });
  }
  return levels;
}

// ── SMC Detection ──
type Candle = { time: number; open: number; high: number; low: number; close: number };

interface SmcSignal {
  type: "FVG" | "OB" | "BOS" | "CHoCH";
  price: number;
  direction: "bullish" | "bearish";
}

function detectFVG(candles: Candle[]): SmcSignal[] {
  const signals: SmcSignal[] = [];
  for (let i = 2; i < candles.length; i++) {
    if (candles[i - 2].high < candles[i].low)
      signals.push({ type: "FVG", price: (candles[i - 2].high + candles[i].low) / 2, direction: "bullish" });
    if (candles[i - 2].low > candles[i].high)
      signals.push({ type: "FVG", price: (candles[i - 2].low + candles[i].high) / 2, direction: "bearish" });
  }
  return signals;
}

function detectOB(candles: Candle[]): SmcSignal[] {
  const signals: SmcSignal[] = [];
  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];
    if (curr.close < curr.open && next.close > curr.high)
      signals.push({ type: "OB", price: curr.high, direction: "bullish" });
    if (curr.close > curr.open && next.close < curr.low)
      signals.push({ type: "OB", price: curr.low, direction: "bearish" });
  }
  return signals;
}

function detectStructure(candles: Candle[], swingLen = 5): SmcSignal[] {
  const signals: SmcSignal[] = [];
  let lastHigh = -Infinity, lastLow = Infinity;

  for (let i = swingLen; i < candles.length - swingLen; i++) {
    const isSwingHigh = candles.slice(i - swingLen, i + swingLen + 1).every(
      (c, j) => j === swingLen || c.high <= candles[i].high
    );
    const isSwingLow = candles.slice(i - swingLen, i + swingLen + 1).every(
      (c, j) => j === swingLen || c.low >= candles[i].low
    );

    if (isSwingHigh) {
      if (candles[i].high > lastHigh && lastHigh > 0)
        signals.push({ type: "BOS", price: candles[i].high, direction: "bullish" });
      lastHigh = candles[i].high;
    }
    if (isSwingLow) {
      if (candles[i].low < lastLow && lastLow < Infinity)
        signals.push({ type: "BOS", price: candles[i].low, direction: "bearish" });
      lastLow = candles[i].low;
    }
  }
  return signals;
}

// ── Data ──
async function fetchCandles(tf: string, limit = 200): Promise<Candle[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${tf}&limit=${limit}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`Binance ${r.status}`);
  const data = await r.json();
  return data.map((k: number[]) => ({
    time: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4],
  }));
}

// ── Confluence ──
const TOLERANCE = 2; // pips

function scoreConfluence(
  gannPrice: number,
  direction: "BUY" | "SELL",
  signals: SmcSignal[]
): { smcSignals: string[]; score: number; grade: "HIGH" | "MED" | "LOW" } {
  const matched: string[] = [];
  for (const s of signals) {
    if (Math.abs(s.price - gannPrice) <= TOLERANCE) {
      matched.push(`${s.type} ${s.direction === "bullish" ? "↑" : "↓"}`);
    }
  }
  const unique = [...new Set(matched)];
  const score = Math.min(10, unique.length * 3 + (unique.length > 1 ? 2 : 0));
  const grade = score >= 7 ? "HIGH" : score >= 4 ? "MED" : "LOW";
  return { smcSignals: unique, score, grade };
}

// ── Route ──
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const high = Number(searchParams.get("high"));
    const low = Number(searchParams.get("low"));
    const tf = searchParams.get("tf") || "1h";

    if (!high || !low || high <= low)
      return NextResponse.json({ error: "Invalid high/low" }, { status: 400 });

    const candles = await fetchCandles(tf);
    if (candles.length < 50)
      return NextResponse.json({ error: "Not enough candle data" }, { status: 502 });

    const gannLevels = calcGannLevels(high, low);
    const allSignals = [
      ...detectFVG(candles),
      ...detectOB(candles),
      ...detectStructure(candles),
    ];

    const results = gannLevels.map((g) => {
      const { smcSignals, score, grade } = scoreConfluence(g.price, g.direction, allSignals);
      return {
        type: g.direction,
        level: g.price,
        pivot: g.direction === "BUY" ? low : high,
        pctFromPivot: +(((g.price - (g.direction === "BUY" ? low : high)) / (g.direction === "BUY" ? low : high)) * 100).toFixed(3),
        rawScore: score,
        smcSignals,
        smcBonus: smcSignals.length * 3,
        confluenceScore: score,
        grade,
      };
    }).sort((a, b) => b.confluenceScore - a.confluenceScore);

    return NextResponse.json({
      swingHigh: high,
      swingLow: low,
      pivot: (high + low) / 2,
      timeframe: tf,
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
