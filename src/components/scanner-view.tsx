'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Zap,
} from 'lucide-react';

type Level = {
  level: number;
  score: number;
  type: 'BUY' | 'SELL';
  signals: string[];
};

type ConfluenceData = {
  symbol: string;
  timeframe: string;
  price: number;
  trend: string;
  candles: number;
  rsi: number | null;
  macd: { line: number | null; signal: number | null; histogram: number | null };
  atr: number | null;
  ema: { ema9: number | null; ema21: number | null; ema50: number | null };
  bb: { basis: number | null; upper: number | null; lower: number | null };
  levels: Level[];
  timestamp: string;
  source: string;
};

const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
];

export function ScannerView() {
  const [data, setData] = useState<ConfluenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tf, setTf] = useState('15m');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Client-side fetch from Binance PAXG (HTTPS, no mixed content)
      const kRes = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${tf}&limit=200`
      );
      if (!kRes.ok) throw new Error(`Binance ${kRes.status}`);
      const raw = await kRes.json();
      const candles = raw.map((k: number[]) => ({
        time: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4],
      }));

      const res = await fetch('/api/confluence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tf, candles }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tf]);

  const fmt = (n: number | null | undefined, d = 2) => n != null ? n.toFixed(d) : '—';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <Activity className="size-8 text-amber-500" />
            Confluence Scanner
          </h1>
          <p className="text-zinc-500 text-sm">
            XAUUSD live confluence via Gann Square of 9 + Technical Indicators
          </p>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold shadow-sm"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 size-4" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          {loading ? 'Scanning...' : 'Refresh'}
        </Button>
      </div>

      {/* Timeframe selector */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm w-fit">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTf(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
              tf === t.value
                ? 'bg-amber-500 text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <Card className="bg-rose-50 border-rose-200">
          <CardContent className="pt-6 flex items-center gap-3 text-rose-700">
            <div className="text-sm">
              <p className="font-semibold">Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Price + Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardContent className="pt-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Price</p>
                <p className="text-2xl font-mono font-bold text-zinc-900">${fmt(data.price)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardContent className="pt-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Trend</p>
                <p className={`text-lg font-bold ${
                  data.trend === 'BULLISH' ? 'text-emerald-600' :
                  data.trend === 'BEARISH' ? 'text-rose-600' : 'text-amber-600'
                }`}>{data.trend}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardContent className="pt-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">RSI</p>
                <p className={`text-lg font-mono font-bold ${
                  data.rsi != null && data.rsi < 30 ? 'text-emerald-600' :
                  data.rsi != null && data.rsi > 70 ? 'text-rose-600' : 'text-zinc-900'
                }`}>{fmt(data.rsi)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardContent className="pt-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">ATR</p>
                <p className="text-lg font-mono font-bold text-zinc-900">{fmt(data.atr, 3)}</p>
              </CardContent>
            </Card>
          </div>

          {/* EMA + MACD + BB */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">EMA</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 text-sm font-mono">
                <span className="text-zinc-700">9: <b className="text-zinc-900">{fmt(data.ema?.ema9)}</b></span>
                <span className="text-zinc-700">21: <b className="text-zinc-900">{fmt(data.ema?.ema21)}</b></span>
                <span className="text-zinc-700">50: <b className="text-zinc-900">{fmt(data.ema?.ema50)}</b></span>
              </CardContent>
            </Card>
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">MACD</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 text-sm font-mono">
                <span className="text-zinc-700">L: <b className="text-zinc-900">{fmt(data.macd?.line, 4)}</b></span>
                <span className="text-zinc-700">S: <b className="text-zinc-900">{fmt(data.macd?.signal, 4)}</b></span>
                <span className={data.macd?.histogram != null && data.macd.histogram > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  H: <b>{fmt(data.macd?.histogram, 4)}</b>
                </span>
              </CardContent>
            </Card>
            <Card className="bg-white border-zinc-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bollinger Bands</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 text-sm font-mono">
                <span className="text-zinc-700">B: <b className="text-zinc-900">{fmt(data.bb?.basis)}</b></span>
                <span className="text-zinc-700">U: <b className="text-zinc-900">{fmt(data.bb?.upper)}</b></span>
                <span className="text-zinc-700">L: <b className="text-zinc-900">{fmt(data.bb?.lower)}</b></span>
              </CardContent>
            </Card>
          </div>

          {/* Confluence Levels */}
          <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                <Target className="size-3.5 text-amber-500" />
                Confluence Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <table className="w-full">
                <thead>
                  <tr className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-100">
                    <th className="px-6 py-3 text-left">Level</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Score</th>
                    <th className="px-6 py-3 text-left">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.levels.map((lv, i) => (
                    <tr key={i} className="border-b border-zinc-50 hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-bold text-zinc-900">${lv.level.toFixed(2)}</td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            lv.type === 'BUY'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-rose-200 bg-rose-50 text-rose-700'
                          }`}
                        >
                          {lv.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                lv.score >= 7 ? 'bg-emerald-500' : lv.score >= 4 ? 'bg-amber-500' : 'bg-zinc-300'
                              }`}
                              style={{ width: `${lv.score * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono font-bold text-zinc-700">{lv.score}/10</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-mono text-zinc-500">
                        {((lv.level - data.price) / data.price * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Meta */}
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{data.candles} candles · {data.source}</span>
            <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
          </div>
        </>
      )}
    </div>
  );
}
