import { NextResponse } from "next/server";
import { detectAllSignals, type SMCSignal, type Candle } from "@/lib/smc";


function makeSyntheticCandles(tf: string, limit: number): Candle[] {
  const stepMs = tf.endsWith("h") ? Number(tf.slice(0, -1)) * 3600000 : Number(tf.slice(0, -1)) * 60000;
  const now = Date.now();
  let close = 4130;
  return Array.from({ length: limit }, (_, i) => {
    const wave = Math.sin(i / 7) * 8 + Math.cos(i / 17) * 14;
    const open = close;
    close = 4130 + wave + i * 0.08;
    const high = Math.max(open, close) + 2.5;
    const low = Math.min(open, close) - 2.5;
    return { time: now - (limit - i) * stepMs, open, high, low, close };
  });
}

const QA_URL = "https://quantum-api.quantumleaps.biz.id";

async function fetchLivePrice(): Promise<number | null> {
  try {
    const r = await fetch(`${QA_URL}/price`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) { console.error("price fetch failed:", r.status); return null; }
    const d = await r.json();
    return d.close ?? null;
  } catch(e: any) { console.error("price error:", e.message); return null; }
}

async function fetchCandles(tf: string, limit: number): Promise<Candle[]> {
  try {
    const resp = await fetch(`${QA_URL}/candles?tf=${tf}&limit=${limit}`, {
      signal: AbortSignal.timeout(25000),
    });
    if (!resp.ok) { console.error("candles fetch failed:", resp.status, await resp.text().catch(()=>"")); return []; }
    const json = await resp.json();
    return json.data ?? [];
  } catch(e: any) { console.error("candles error:", e.message); return []; }
}

function rsi(candles: Candle[], period = 14): number {
  let gains = 0, losses = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close;
    if (d > 0) gains += d; else losses -= d;
  }
  const rs = gains / (losses || 0.001);
  return 100 - 100 / (1 + rs);
}

function ema(candles: Candle[], period: number): number {
  const k = 2 / (period + 1);
  let e = candles[0].close;
  for (let i = 1; i < candles.length; i++) e = candles[i].close * k + e * (1 - k);
  return e;
}

function atr(candles: Candle[], period = 14): number {
  let sum = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - (candles[i - 1]?.close || candles[i].close)),
      Math.abs(candles[i].low - (candles[i - 1]?.close || candles[i].close))
    );
    sum += tr;
  }
  return sum / period;
}

function macd(candles: Candle[]): { line: number; signal: number; histogram: number } {
  const k12 = 2 / 13, k26 = 2 / 27, k9 = 2 / 10;
  let e12 = candles[0].close, e26 = candles[0].close, signal = 0;
  for (let i = 1; i < candles.length; i++) {
    e12 = candles[i].close * k12 + e12 * (1 - k12);
    e26 = candles[i].close * k26 + e26 * (1 - k26);
    const line = e12 - e26;
    signal = line * k9 + signal * (1 - k9);
    if (i === candles.length - 1) return { line, signal, histogram: line - signal };
  }
  return { line: 0, signal: 0, histogram: 0 };
}

function bb(candles: Candle[], period = 20): { basis: number; upper: number; lower: number } {
  const closes = candles.slice(-period).map(c => c.close);
  const mean = closes.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(closes.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
  return { basis: mean, upper: mean + 2 * std, lower: mean - 2 * std };
}

function gannLevels(price: number): number[] {
  const sqrt = Math.sqrt(price);
  const levels: number[] = [];
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    levels.push(Math.round((sqrt + i * 0.25) ** 2 * 100) / 100);
  }
  return levels;
}

async function buildResponse(candles: Candle[], tf: string) {
  const price = candles[candles.length - 1].close;
  const rsiVal = rsi(candles);
  const macdVal = macd(candles);
  const atrVal = atr(candles);
  const ema9 = ema(candles, 9);
  const ema21 = ema(candles, 21);
  const ema50 = ema(candles, 50);
  const bbVal = bb(candles);
  const trend = ema9 > ema21 && ema21 > ema50 ? "BULLISH" : ema9 < ema21 && ema21 < ema50 ? "BEARISH" : "NEUTRAL";

  // SMC detection
  const smcSignals = detectAllSignals(candles);
  const price_time = candles[candles.length - 1].time;
  const recentSMC = smcSignals.filter(s => {
    const age = (price_time - s.time) / 3600000; // hours
    return age < 24; // only signals from last 24h
  });
  const smcMap = { fvg: 0, ob: 0, bos: 0, choch: 0 } as Record<string, number>;
  for (const s of recentSMC) smcMap[s.type.toLowerCase()]++;

  const levels = gannLevels(price).map(level => {
    let score = 0;
    const pct = Math.abs(level - price) / price * 100;
    if (pct < 0.1) score += 4; else if (pct < 0.3) score += 3; else if (pct < 0.5) score += 2; else if (pct < 1.0) score += 1;
    if (level < price && rsiVal < 30) score += 3;
    else if (level > price && rsiVal > 70) score += 3;
    else if (rsiVal < 40 || rsiVal > 60) score += 1;
    if (level < price && Math.abs(level - bbVal.lower) / bbVal.lower < 0.002) score += 2;
    if (level > price && Math.abs(level - bbVal.upper) / bbVal.upper < 0.002) score += 2;
    if (level < price && ema9 > ema21) score += 1;
    if (level > price && ema9 < ema21) score += 1;

    // SMC bonus: if level near an OB/FVG zone, boost score
    const smcBonus = recentSMC.filter(s => {
      if (s.type === "OB") {
        return Math.abs(level - s.price) / price < 0.005;
      }
      if (s.type === "FVG") {
        const halfATR = atrVal * 0.5;
        return level >= s.price - halfATR && level <= s.price + halfATR;
      }
      return false;
    }).length;
    score += Math.min(smcBonus * 2, 4);

    // BOS/CHoCH trend alignment bonus
    const recentBOS = recentSMC.filter(s => s.type === "BOS" || s.type === "CHoCH");
    for (const bos of recentBOS) {
      const bosDir = bos.direction;
      if (bosDir === "buy" && level < price) score += 1;
      if (bosDir === "sell" && level > price) score += 1;
    }

    const signals: string[] = ["Gann"];
    if (recentSMC.some(s => s.type === "OB" && s.direction === (level < price ? "buy" : "sell"))) signals.push("OB");
    if (recentSMC.some(s => s.type === "FVG")) signals.push("FVG");
    if (recentBOS.some(s => s.direction === (level < price ? "buy" : "sell"))) signals.push(level < price ? "BOS↑" : "BOS↓");

    return {
      level, score: Math.min(score, 14),
      type: level < price ? "BUY" as const : "SELL" as const,
      signals,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  // supabase scan logging — skip if env missing

  const livePrice = await fetchLivePrice();
  const finalPrice = livePrice ?? price;
  return {
    symbol: "XAUUSD", timeframe: tf, price: finalPrice, trend,
    candles: candles.length,
    rsi: Math.round(rsiVal * 100) / 100,
    macd: {
      line: Math.round(macdVal.line * 10000) / 10000,
      signal: Math.round(macdVal.signal * 10000) / 10000,
      histogram: Math.round(macdVal.histogram * 10000) / 10000,
    },
    atr: Math.round(atrVal * 1000) / 1000,
    ema: { ema9: Math.round(ema9 * 100) / 100, ema21: Math.round(ema21 * 100) / 100, ema50: Math.round(ema50 * 100) / 100 },
    bb: { basis: Math.round(bbVal.basis * 100) / 100, upper: Math.round(bbVal.upper * 100) / 100, lower: Math.round(bbVal.lower * 100) / 100 },
    smc: smcMap,
    levels,
    timestamp: new Date().toISOString(),
    source: "OANDA:XAUUSD via quantum-api (TradingView)",
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tf = searchParams.get("tf") || "15m";
    const limit = Math.min(Number(searchParams.get("limit") || 200), 500);
    const candles = await fetchCandles(tf, limit);
    if (candles.length < 50)
      return NextResponse.json({ error: "Need ≥50 candles" }, { status: 400 });
    return NextResponse.json(await buildResponse(candles, tf));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tf, candles } = body as { tf: string; candles: Candle[] };
    if (!candles || candles.length < 50)
      return NextResponse.json({ error: "Need ≥50 candles" }, { status: 400 });
    return NextResponse.json(await buildResponse(candles, tf || "15m"));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
