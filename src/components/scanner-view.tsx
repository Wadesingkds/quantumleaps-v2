'use client';

import { useEffect, useState } from 'react';

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
  levels: Level[];
  timestamp: string;
  source: string;
};

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

export function ScannerView() {
  const [data, setData] = useState<ConfluenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tf, setTf] = useState('15m');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/confluence?tf=${tf}`);
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
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Confluence Scanner</h1>
            <p className="text-gray-400 text-sm mt-1">PineTS + Gann Square of 9</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-black rounded font-medium hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? 'Scanning...' : 'Refresh'}
          </button>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-2 mb-6">
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                tf === t ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Price + Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 rounded p-4">
                <div className="text-gray-400 text-xs">Price</div>
                <div className="text-2xl font-bold">${fmt(data.price)}</div>
              </div>
              <div className="bg-gray-900 rounded p-4">
                <div className="text-gray-400 text-xs">Trend</div>
                <div className={`text-lg font-bold ${
                  data.trend === 'BULLISH' ? 'text-green-400' :
                  data.trend === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                }`}>{data.trend}</div>
              </div>
              <div className="bg-gray-900 rounded p-4">
                <div className="text-gray-400 text-xs">RSI</div>
                <div className={`text-lg font-bold ${
                  data.rsi != null && data.rsi < 30 ? 'text-green-400' :
                  data.rsi != null && data.rsi > 70 ? 'text-red-400' : 'text-white'
                }`}>{fmt(data.rsi)}</div>
              </div>
              <div className="bg-gray-900 rounded p-4">
                <div className="text-gray-400 text-xs">ATR</div>
                <div className="text-lg font-bold">{fmt(data.atr, 3)}</div>
              </div>
            </div>

            {/* EMA + MACD */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 rounded p-4">
                <div className="text-gray-400 text-xs mb-2">EMA</div>
                <div className="flex gap-4 text-sm">
                  <span>9: {fmt(data.ema?.ema9)}</span>
                  <span>21: {fmt(data.ema?.ema21)}</span>
                  <span>50: {fmt(data.ema?.ema50)}</span>
                </div>
              </div>
              <div className="bg-gray-900 rounded p-4">
                <div className="text-gray-400 text-xs mb-2">MACD</div>
                <div className="flex gap-4 text-sm">
                  <span>Line: {fmt(data.macd?.line, 4)}</span>
                  <span>Signal: {fmt(data.macd?.signal, 4)}</span>
                  <span className={data.macd?.histogram != null && data.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}>
                    Hist: {fmt(data.macd?.histogram, 4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Confluence Levels */}
            <div className="bg-gray-900 rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="font-medium">Confluence Levels</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-xs">
                    <th className="px-4 py-2 text-left">Level</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.levels.map((lv, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="px-4 py-3 font-mono">${lv.level.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          lv.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>{lv.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-800 rounded">
                            <div
                              className={`h-full rounded ${lv.score >= 7 ? 'bg-green-500' : lv.score >= 4 ? 'bg-yellow-500' : 'bg-gray-600'}`}
                              style={{ width: `${lv.score * 10}%` }}
                            />
                          </div>
                          <span className="text-sm">{lv.score}/10</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {((lv.level - data.price) / data.price * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Meta */}
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>{data.candles} candles • {data.source}</span>
              <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
