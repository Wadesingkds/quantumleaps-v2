import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchXauusdData } from '@/lib/pinets-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Gann Square of 9 levels
function gannLevels(price: number): number[] {
  const sqrt = Math.sqrt(price);
  const levels: number[] = [];
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    levels.push(Math.round(Math.pow(sqrt + i * 0.25, 2) * 100) / 100);
  }
  return levels;
}

// Score confluence: combine Gann proximity + RSI + MACD + BB
function scoreLevel(level: number, price: number, data: Awaited<ReturnType<typeof fetchXauusdData>>): number {
  let score = 0;
  const pct = Math.abs(level - price) / price * 100;

  // Gann proximity (0-4 pts)
  if (pct < 0.1) score += 4;
  else if (pct < 0.3) score += 3;
  else if (pct < 0.5) score += 2;
  else if (pct < 1.0) score += 1;

  // RSI extreme (0-3 pts)
  const rsi = data.indicators.rsi?.[0]?.slice(-1)[0]?.value;
  if (rsi !== undefined) {
    if (level < price && rsi < 30) score += 3;  // oversold + support
    else if (level > price && rsi > 70) score += 3; // overbought + resistance
    else if (rsi < 40 || rsi > 60) score += 1;
  }

  // BB band touch (0-2 pts)
  const bb = data.indicators.bollingerBands;
  if (bb && bb.length >= 3) {
    const lower = bb[2]?.slice(-1)[0]?.value;
    const upper = bb[1]?.slice(-1)[0]?.value;
    if (lower && Math.abs(level - lower) / lower < 0.002) score += 2;
    if (upper && Math.abs(level - upper) / upper < 0.002) score += 2;
  }

  // EMA alignment (0-1 pt)
  const ema9 = data.indicators.ema?.[0]?.slice(-1)[0]?.value;
  const ema21 = data.indicators.ema?.[1]?.slice(-1)[0]?.value;
  if (ema9 && ema21) {
    if (level < price && ema9 > ema21) score += 1; // uptrend + support
    if (level > price && ema9 < ema21) score += 1; // downtrend + resistance
  }

  return Math.min(score, 10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tf = searchParams.get('tf') || '15m';

    // Fetch data from PineTS worker
    const data = await fetchXauusdData(tf, 200);
    if (!data.price) {
      return NextResponse.json({ error: 'No price data' }, { status: 502 });
    }

    const price = data.price.last;
    const gLevels = gannLevels(price);

    // Build confluence levels
    const levels = gLevels.map(level => ({
      level,
      score: scoreLevel(level, price, data),
      type: level < price ? 'BUY' as const : 'SELL' as const,
      signals: ['Gann'],
    })).sort((a, b) => b.score - a.score).slice(0, 5);

    // Trend from EMA
    const ema9 = data.indicators.ema?.[0]?.slice(-1)[0]?.value;
    const ema21 = data.indicators.ema?.[1]?.slice(-1)[0]?.value;
    const ema50 = data.indicators.ema?.[2]?.slice(-1)[0]?.value;
    const trend = ema9 && ema21 && ema50
      ? (ema9 > ema21 && ema21 > ema50 ? 'BULLISH' : ema9 < ema21 && ema21 < ema50 ? 'BEARISH' : 'NEUTRAL')
      : 'UNKNOWN';

    // RSI
    const rsi = data.indicators.rsi?.[0]?.slice(-1)[0]?.value ?? null;

    // MACD
    const macdData = data.indicators.macd;
    const macd = macdData?.[0]?.slice(-1)[0]?.value ?? null;
    const macdSignal = macdData?.[1]?.slice(-1)[0]?.value ?? null;
    const macdHist = macdData?.[2]?.slice(-1)[0]?.value ?? null;

    // ATR
    const atr = data.indicators.atr?.[0]?.slice(-1)[0]?.value ?? null;

    // Save scan to DB
    const { error: dbError } = await supabase.from('scans').insert({
      timeframe: tf,
      price,
      trend,
      levels: levels.length,
      top_score: levels[0]?.score ?? 0,
    });
    if (dbError) console.error('DB save error:', dbError);

    return NextResponse.json({
      symbol: 'XAUUSD (PAXG)',
      timeframe: tf,
      price,
      trend,
      candles: data.candles,
      rsi,
      macd: { line: macd, signal: macdSignal, histogram: macdHist },
      atr,
      ema: { ema9, ema21, ema50 },
      levels,
      timestamp: new Date().toISOString(),
      source: 'PineTS (Binance PAXG)',
    });
  } catch (e: any) {
    console.error('Confluence error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
