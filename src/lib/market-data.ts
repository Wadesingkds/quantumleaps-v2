// XAUUSD candlestick data via Binance PAXGUSDT (gold-backed token)
// No proxy needed — Binance works from datacenter IPs

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const BINANCE_URL = "https://api.binance.com/api/v3/klines";
const SYMBOL = "PAXGUSDT"; // PAX Gold — tracks XAUUSD

const TF_MAP: Record<string, string> = {
  "15M": "15m",
  "1H": "1h",
  "4H": "4h",
  "D": "1d",
};

const LIMIT_MAP: Record<string, number> = {
  "15M": 200,  // ~2 days
  "1H": 200,   // ~8 days
  "4H": 200,   // ~33 days
  "D": 365,    // ~1 year
};

// In-memory cache
const cache = new Map<string, { data: Candle[]; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchCandles(timeframe: string): Promise<Candle[]> {
  const cached = cache.get(timeframe);
  if (cached && cached.expires > Date.now()) return cached.data;

  const interval = TF_MAP[timeframe] || "15m";
  const limit = LIMIT_MAP[timeframe] || 200;
  const url = `${BINANCE_URL}?symbol=${SYMBOL}&interval=${interval}&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API ${res.status}`);

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("No data from Binance");

  const candles: Candle[] = data.map((k: any[]) => ({
    time: Math.floor(k[0] / 1000), // ms → seconds
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],
    volume: +k[5],
  }));

  cache.set(timeframe, { data: candles, expires: Date.now() + CACHE_TTL });
  return candles;
}
