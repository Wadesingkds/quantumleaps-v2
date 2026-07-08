import { NextResponse } from "next/server";

// ── Gann Square of 9 (Fixed-Increment) ──
const INCREMENTS = [0.125, 0.175, 0.250];

function calcGann(high: number, low: number) {
  const levels: { label: string; level: number }[] = [];
  for (const inc of INCREMENTS) {
    levels.push({ label: `BUY${INCREMENTS.indexOf(inc) + 1}`, level: +Math.pow(Math.sqrt(high) - inc, 2).toFixed(2) });
    levels.push({ label: `SELL${INCREMENTS.indexOf(inc) + 1}`, level: +Math.pow(Math.sqrt(low) + inc, 2).toFixed(2) });
  }
  return levels;
}

// ── Candle & Signal Types ──
type Candle = { time: number; open: number; high: number; low: number; close: number };
interface SmcSignal { type: "FVG" | "OB" | "BOS" | "CHoCH"; price: number; direction: "bullish" | "bearish"; }

// ── FVG Detection ──
function detectFVG(candles: Candle[]): SmcSignal[] {
  const signals: SmcSignal[] = [];
  for (let i = 1; i < candles.length - 1; i++) {
    if (candles[i - 1].high < candles[i + 1].low) {
      signals.push({ type: "FVG", price: (candles[i - 1].high + candles[i + 1].low) / 2, direction: "bullish" });
    } else if (candles[i - 1].low > candles[i + 1].high) {
      signals.push({ type: "FVG", price: (candles[i - 1].low + candles[i + 1].high) / 2, direction: "bearish" });
    }
  }
  return signals;
}

// ── Order Block Detection ──
function detectOB(candles: Candle[]): SmcSignal[] {
  const signals: SmcSignal[] = [];
  for (let i = 1; i < candles.length - 4; i++) {
    if (candles[i].close < candles[i].open) {
      // Bearish candle → bullish OB at its high
      if (candles[i + 1].close > candles[i].high)
        signals.push({ type: "OB", price: candles[i].high, direction: "bullish" });
    } else {
      // Bullish candle → bearish OB at its low
      if (candles[i + 1].close < candles[i].low)
        signals.push({ type: "OB", price: candles[i].low, direction: "bearish" });
    }
  }
  return signals;
}

// ── Market Structure ──
function detectStructure(candles: Candle[]): SmcSignal[] {
  const signals: SmcSignal[] = [];
  const swingLen = 5;
  let trend = "";
  let lastSwingHigh = 0;
  let lastSwingLow = Infinity;

  for (let i = swingLen; i < candles.length - swingLen; i++) {
    const c = candles[i];
    const isSwingHigh = candles.slice(i - swingLen, i).every((x) => x.high <= c.high) &&
      candles.slice(i + 1, i + swingLen + 1).every((x) => x.high <= c.high);
    const isSwingLow = candles.slice(i - swingLen, i).every((x) => x.low >= c.low) &&
      candles.slice(i + 1, i + swingLen + 1).every((x) => x.low >= c.low);

    if (isSwingHigh) {
      if (lastSwingHigh && c.high > lastSwingHigh) {
        signals.push({ type: trend === "up" ? "BOS" : "CHoCH", price: c.high, direction: "bullish" });
        trend = "up";
      }
      lastSwingHigh = c.high;
      if (!trend) trend = "up";
    }
    if (isSwingLow) {
      if (lastSwingLow !== Infinity && c.low < lastSwingLow) {
        signals.push({ type: trend === "down" ? "BOS" : "CHoCH", price: c.low, direction: "bearish" });
        trend = "down";
      }
      lastSwingLow = c.low;
      if (!trend) trend = "down";
    }
  }
  return signals;
}

// ── Live Price from quantum-api ──
const QA_URL = "https://quantum-api.sayandaktau.my.id";
const TV_SYMBOL = "OANDA:XAUUSD";
const TOLERANCE = 2;

async function fetchLivePrice(): Promise<number | null> {
  try {
    const r = await fetch(`${QA_URL}/price`, { signal: AbortSignal.timeout(5000) });
    return r.ok ? (await r.json()).close ?? null : null;
  } catch { return null; }
}

// ── Fetch Candles from TradingView ──
async function fetchTVCandles(tf: string, limit: number): Promise<Candle[]> {
  const TradingView = require("@mathieuc/tradingview");

  const candleMap: Record<string, string> = {
    "1m": "1", "5m": "5", "15m": "15", "30m": "30",
    "60": "60", "240": "240", "1h": "60", "4h": "240",
  };
  const tvTf = candleMap[tf] || "60";

  return new Promise((resolve, reject) => {
    const client = new TradingView.Client();
    const chart = new client.Session.Chart();
    chart.setMarket(TV_SYMBOL, { timeframe: tvTf, range: limit });

    chart.onError((...err: any[]) => { client.end(); reject(new Error(err.join(" "))); });

    const timeout = setTimeout(() => {
      client.end();
      reject(new Error("Timeout fetching TradingView candles"));
    }, 15000);

    chart.onUpdate(() => {
      if (chart.periods && chart.periods.length >= 10) {
        clearTimeout(timeout);
        const candles: Candle[] = chart.periods.map((p: any) => ({
          time: p.time,
          open: p.open,
          high: p.max,
          low: p.min,
          close: p.close,
        }));
        client.end();
        resolve(candles);
      }
    });
  });
}

// ── POST: calculate Gann + confluence ──
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { high, low, tf = "15m" } = body as { high: number; low: number; tf: string };

    if (!high || !low || high <= 0 || low <= 0) {
      return NextResponse.json(
        { error: "Provide both high and low parameters > 0", example: "{ high: 4369.66, low: 4306.11, tf: '60' }" },
        { status: 400 }
      );
    }

    const candles = await fetchTVCandles(tf, 500);
    if (candles.length < 50)
      return NextResponse.json({ error: "Need ≥50 candles" }, { status: 400 });

    const gannLevels = calcGann(high, low);
    const allSignals = [...detectFVG(candles), ...detectOB(candles), ...detectStructure(candles)];

    const results = gannLevels.map((g) => {
      const matched: string[] = [];
      for (const s of allSignals) {
        if (Math.abs(s.price - g.level) <= TOLERANCE) {
          matched.push(`${s.type} ${s.direction === "bullish" ? "↑" : "↓"}`);
        }
      }
      const unique = [...new Set(matched)];
      const score = Math.min(10, unique.length * 3 + (unique.length > 1 ? 2 : 0));
      const grade = score >= 7 ? "HIGH" : score >= 4 ? "MED" : "LOW";

      return {
        label: g.label,
        type: g.label.startsWith("BUY") ? "BUY" : "SELL",
        level: g.level,
        pivot: g.label.startsWith("BUY") ? low : high,
        pctFromPivot: +(((g.level - (g.label.startsWith("BUY") ? low : high)) / (g.label.startsWith("BUY") ? low : high)) * 100).toFixed(3),
        confluenceScore: score,
        grade,
        smcSignals: unique,
      };
    });

    // Live price dari TradingView candles
    let livePrice: number | null = null;
    try {
      const tvPrice = candles[candles.length - 1]?.close;
      if (tvPrice) livePrice = tvPrice;
    } catch { /* skip */ }

    return NextResponse.json({
      ok: true,
      meta: {
        symbol: "XAUUSD",
        timeframe: tf,
        candles: candles.length,
        source: "TradingView",
        gannVersion: "fixed-increment (0.125/0.175/0.250)",
      },
      inputs: { high, low },
      livePrice,
      results: results.sort((a, b) => (a.type === "SELL" ? 0 : 1) - (b.type === "SELL" ? 0 : 1)),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// ── GET with query params ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const high = Number(searchParams.get("high"));
  const low = Number(searchParams.get("low"));

  if (!high || !low || high <= 0 || low <= 0) {
    return NextResponse.json(
      { error: "Provide high & low", example: "/api/gann?high=4369.66&low=4306.11&tf=60" },
      { status: 400 }
    );
  }

  const tf = searchParams.get("tf") || "15m";
  const candles = await fetchTVCandles(tf, 500);
  if (candles.length < 50)
    return NextResponse.json({ error: "Need ≥50 candles" }, { status: 400 });

  const gannLevels = calcGann(high, low);
  const allSignals = [...detectFVG(candles), ...detectOB(candles), ...detectStructure(candles)];

  const results = gannLevels.map((g) => {
    const matched: string[] = [];
    for (const s of allSignals) {
      if (Math.abs(s.price - g.level) <= TOLERANCE) {
        matched.push(`${s.type} ${s.direction === "bullish" ? "↑" : "↓"}`);
      }
    }
    const unique = [...new Set(matched)];
    const score = Math.min(10, unique.length * 3 + (unique.length > 1 ? 2 : 0));
    return {
      label: g.label,
      type: g.label.startsWith("BUY") ? "BUY" : "SELL",
      level: g.level,
      pivot: g.label.startsWith("BUY") ? low : high,
      pctFromPivot: +(((g.level - (g.label.startsWith("BUY") ? low : high)) / (g.label.startsWith("BUY") ? low : high)) * 100).toFixed(3),
      confluenceScore: score,
      grade: score >= 7 ? "HIGH" : score >= 4 ? "MED" : "LOW",
      smcSignals: unique,
    };
  });

  return NextResponse.json({
    ok: true,
    meta: { symbol: "XAUUSD", timeframe: tf, candles: candles.length, source: "TradingView" },
    inputs: { high, low },
    results: results.sort((a, b) => (a.type === "SELL" ? 0 : 1) - (b.type === "SELL" ? 0 : 1)),
  });
}
