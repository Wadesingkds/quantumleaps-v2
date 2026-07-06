import { NextResponse } from "next/server";

// ── Gann Square of 9 ──
function gannLevel(price: number, degrees: number): number {
  const sqrt = Math.sqrt(price);
  const rotated = sqrt + degrees / 360;
  return +(rotated * rotated).toFixed(2);
}

// Single swing: derive opposite side from candles (±0.5% if not given)
function calcGannFromSwing(
  swingPrice: number,
  swingDir: "HIGH" | "LOW",
  candles: { low: number; high: number; close: number }[]
) {
  // Derive opposite side from recent candle range if user only gave 1 swing
  let low: number, high: number;
  if (swingDir === "HIGH") {
    high = swingPrice;
    // use recent lowest low as opposite swing
    low = Math.min(...candles.slice(-50).map((c) => c.low));
  } else {
    low = swingPrice;
    // use recent highest high as opposite swing
    high = Math.max(...candles.slice(-50).map((c) => c.high));
  }

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
  return { levels, high, low, pivot: (high + low) / 2 };
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

// ── Confluence ──
const TOLERANCE = 2;

function scoreConfluence(
  gannPrice: number,
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

// ── Route: POST with candles + single swing ──
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { swingPrice, swingDir, candles } = body as {
      swingPrice: number;
      swingDir: "HIGH" | "LOW";
      candles: Candle[];
    };

    if (!swingPrice || swingPrice <= 0)
      return NextResponse.json({ error: "Invalid swing price" }, { status: 400 });
    if (!swingDir || (swingDir !== "HIGH" && swingDir !== "LOW"))
      return NextResponse.json({ error: "swingDir must be HIGH or LOW" }, { status: 400 });
    if (!candles || candles.length < 50)
      return NextResponse.json({ error: "Need ≥50 candles" }, { status: 400 });

    const { levels, high, low, pivot } = calcGannFromSwing(swingPrice, swingDir, candles);
    const allSignals = [
      ...detectFVG(candles),
      ...detectOB(candles),
      ...detectStructure(candles),
    ];

    const results = levels.map((g) => {
      const { smcSignals, score, grade } = scoreConfluence(g.price, allSignals);
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
      pivot,
      timeframe: "client-supplied",
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── GET fallback: Gann-only (no SMC) ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const swingPrice = Number(searchParams.get("swingPrice"));
  const swingDir = (searchParams.get("swingDir") || "HIGH").toUpperCase() as "HIGH" | "LOW";

  if (!swingPrice || swingPrice <= 0)
    return NextResponse.json(
      {
        error: "Invalid swing price",
        example: "/api/gann?swingPrice=4300&swingDir=HIGH",
        note: "POST with candles array for full SMC confluence.",
      },
      { status: 400 }
    );

  // No candles → use 0.5% range as fallback
  const high = swingDir === "HIGH" ? swingPrice : swingPrice * 1.005;
  const low = swingDir === "LOW" ? swingPrice : swingPrice * 0.995;

  const { levels, pivot } = calcGannFromSwing(swingPrice, swingDir, [
    { low, high, close: swingPrice } as any,
  ]);

  const results = levels.map((g) => ({
    type: g.direction,
    level: g.price,
    pivot: g.direction === "BUY" ? low : high,
    pctFromPivot: +(((g.price - (g.direction === "BUY" ? low : high)) / (g.direction === "BUY" ? low : high)) * 100).toFixed(3),
    rawScore: 0,
    smcSignals: [] as string[],
    smcBonus: 0,
    confluenceScore: 0,
    grade: "LOW" as const,
  })).sort((a, b) => a.level - b.level);

  return NextResponse.json({
    swingHigh: high,
    swingLow: low,
    pivot,
    results,
    note: "Gann-only (no SMC). POST with candles array for full confluence.",
  });
}
