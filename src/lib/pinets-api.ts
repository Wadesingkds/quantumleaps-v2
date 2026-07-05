// XAUUSD data + indicators via PineTS worker
const PINETS_URL = 'https://pinets.sayandaktau.web.id';

export type XauusdData = {
  symbol: string;
  timeframe: string;
  candles: number;
  price: { last: number; high24h: number; low24h: number } | null;
  indicators: {
    rsi: number[][];
    macd: number[][];
    atr: number[][];
    bollingerBands: number[][];
    ema: number[][];
  };
};

export async function fetchXauusdData(tf: string = '15m', limit: number = 200): Promise<XauusdData> {
  const resp = await fetch(`${PINETS_URL}/xauusd/indicators?tf=${tf}&limit=${limit}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) throw new Error(`PineTS API ${resp.status}`);
  return resp.json();
}
