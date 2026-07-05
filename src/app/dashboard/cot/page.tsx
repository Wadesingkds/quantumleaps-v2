"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  CalendarDays,
} from "lucide-react";

interface CotItem {
  symbol: string;
  display: string;
  category: string;
  asOf: string;
  net: number;
  zScore: number;
  level: string;
  signal: string;
  color: string;
  weekChange: number;
  monthChange: number;
  mean: number;
  stdev: number;
  series: { date: string; net: number; long: number; short: number; oi: number }[];
}

interface CotData {
  ok: boolean;
  weeks: number;
  lookback: number;
  asOf: string;
  categories: Record<string, CotItem[]>;
  contractCount: number;
}

function formatNum(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
}

function SignalIcon({ signal }: { signal: string }) {
  if (signal.includes("long"))
    return <TrendingUp className="size-4 text-emerald-600" />;
  if (signal.includes("short"))
    return <TrendingDown className="size-4 text-rose-600" />;
  return <Minus className="size-4 text-zinc-400" />;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 120;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="inline-block overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  metals: "🪙 Metals & Gold",
  energy: "🛢️ Energy Sector",
  index: "📊 Equity Indices",
  rates: "📈 Rates & Bonds",
};

export default function CotPage() {
  const [weeks, setWeeks] = useState("12");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<CotData | null>(null);

  async function fetchCot(w: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/cot?weeks=${w}&lookback=52`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCot(weeks);
  }, [weeks]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <BarChart3 className="size-8 text-amber-500" />
            COT Report
          </h1>
          <p className="text-zinc-500 text-sm">
            Commitments of Traders — Institutional Smart Money Positioning
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm">
          <span className="text-xs font-medium text-zinc-500 px-2">History</span>
          <Select value={weeks} onValueChange={(v: string | null) => setWeeks(v ?? "12")}>
            <SelectTrigger className="w-24 bg-zinc-50 border-zinc-200 text-zinc-900 font-mono text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200">
              <SelectItem value="4">4W</SelectItem>
              <SelectItem value="8">8W</SelectItem>
              <SelectItem value="12">12W</SelectItem>
              <SelectItem value="26">26W</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
          <Loader2 className="animate-spin size-8 text-amber-500" />
          <p className="text-sm font-medium animate-pulse">Syncing with CFTC Public Records...</p>
        </div>
      )}

      {error && (
        <Card className="bg-rose-50 border-rose-200">
          <CardContent className="pt-6 flex items-center gap-3 text-rose-700">
            <div className="text-sm">
              <p className="font-semibold">Connection Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 bg-amber-50 w-fit px-3 py-1.5 rounded-full border border-amber-100">
            <CalendarDays className="size-3 text-amber-600" />
            Update as of:{" "}
            {new Date(data.asOf).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <div className="grid gap-8">
            {Object.entries(data.categories).map(([cat, items]) => (
              <section key={cat} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {CATEGORY_LABELS[cat] || cat}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Card
                      key={item.symbol}
                      className="bg-white border-zinc-200 hover:border-amber-300 transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md"
                    >
                      <CardHeader className="pb-3 border-b border-zinc-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-amber-50 transition-colors border border-zinc-100">
                              <SignalIcon signal={item.signal} />
                            </div>
                            <div>
                              <CardTitle className="text-base text-zinc-900 group-hover:text-amber-600 transition-colors">
                                {item.display}
                              </CardTitle>
                              <p className="text-[10px] font-mono text-zinc-400">
                                {item.symbol}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold border-zinc-200 bg-zinc-50"
                            style={{ color: item.color }}
                          >
                            {item.level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                              Net Position
                            </p>
                            <p
                              className="text-xl font-mono font-bold tracking-tight"
                              style={{ color: item.color }}
                            >
                              {formatNum(item.net)}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                              Z-Score (1Y)
                            </p>
                            <p className="text-sm font-mono font-bold text-zinc-700">
                              {item.zScore > 0 ? "+" : ""}
                              {item.zScore}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                          <div className="space-y-0.5">
                            <p className="text-[9px] uppercase text-zinc-500 font-medium">
                              Weekly Δ
                            </p>
                            <p
                              className={`text-xs font-mono font-bold ${
                                item.weekChange > 0 ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {item.weekChange > 0 ? "▲" : "▼"}{" "}
                              {formatNum(Math.abs(item.weekChange))}
                            </p>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <p className="text-[9px] uppercase text-zinc-500 font-medium">
                              Monthly Δ
                            </p>
                            <p
                              className={`text-xs font-mono font-bold ${
                                item.monthChange > 0 ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {item.monthChange > 0 ? "▲" : "▼"}{" "}
                              {formatNum(Math.abs(item.monthChange))}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-center h-10">
                          <MiniSparkline
                            data={item.series.map((s) => s.net)}
                            color={item.color}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Legend */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200 mt-12 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Positioning Extremes Legend
            </h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-600" />
                <span className="text-xs text-zinc-700 font-medium">Extreme Long (z ≥ 1.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-700 font-medium">Long (z ≥ 0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-zinc-400" />
                <span className="text-xs text-zinc-700 font-medium">Neutral Positioning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-400" />
                <span className="text-xs text-zinc-700 font-medium">Short (z ≤ -0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-600" />
                <span className="text-xs text-zinc-700 font-medium">Extreme Short (z ≤ -1.5)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
