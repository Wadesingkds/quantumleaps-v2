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
    return <TrendingUp className="size-4 text-signal-buy" />;
  if (signal.includes("short"))
    return <TrendingDown className="size-4 text-signal-sell" />;
  return <Minus className="size-4 text-muted-foreground" />;
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
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="size-8 text-primary" />
            COT Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Commitments of Traders — Institutional Smart Money Positioning
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border shadow-sm">
          <span className="text-xs font-medium text-muted-foreground px-2">History</span>
          <Select value={weeks} onValueChange={(v: string | null) => setWeeks(v ?? "12")}>
            <SelectTrigger className="w-24 bg-muted/30 border-border text-foreground font-mono text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="4">4W</SelectItem>
              <SelectItem value="8">8W</SelectItem>
              <SelectItem value="12">12W</SelectItem>
              <SelectItem value="26">26W</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
          <Loader2 className="animate-spin size-8 text-primary" />
          <p className="text-sm font-medium animate-pulse">Syncing with CFTC Public Records...</p>
        </div>
      )}

      {error && (
        <Card className="bg-signal-sell border-signal-sell">
          <CardContent className="pt-6 flex items-center gap-3 text-signal-sell">
            <div className="text-sm">
              <p className="font-semibold">Connection Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-accent w-fit px-3 py-1.5 rounded-full border border-border">
            <CalendarDays className="size-3 text-primary" />
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
                  <h2 className="text-lg font-semibold text-foreground">
                    {CATEGORY_LABELS[cat] || cat}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Card
                      key={item.symbol}
                      className="bg-card border-border hover:border-primary transition-all duration-300 group overflow-hidden shadow-sm hover:shadow-md"
                    >
                      <CardHeader className="pb-3 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-accent transition-colors border border-border">
                              <SignalIcon signal={item.signal} />
                            </div>
                            <div>
                              <CardTitle className="text-base text-foreground group-hover:text-primary transition-colors">
                                {item.display}
                              </CardTitle>
                              <p className="text-[10px] font-mono text-muted-foreground">
                                {item.symbol}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold border-border bg-muted/30"
                            style={{ color: item.color }}
                          >
                            {item.level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
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
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                              Z-Score (1Y)
                            </p>
                            <p className="text-sm font-mono font-bold text-foreground">
                              {item.zScore > 0 ? "+" : ""}
                              {item.zScore}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
                          <div className="space-y-0.5">
                            <p className="text-[9px] uppercase text-muted-foreground font-medium">
                              Weekly Δ
                            </p>
                            <p
                              className={`text-xs font-mono font-bold ${
                                item.weekChange > 0 ? "text-signal-buy" : "text-signal-sell"
                              }`}
                            >
                              {item.weekChange > 0 ? "▲" : "▼"}{" "}
                              {formatNum(Math.abs(item.weekChange))}
                            </p>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <p className="text-[9px] uppercase text-muted-foreground font-medium">
                              Monthly Δ
                            </p>
                            <p
                              className={`text-xs font-mono font-bold ${
                                item.monthChange > 0 ? "text-signal-buy" : "text-signal-sell"
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
          <div className="p-6 rounded-2xl bg-card border border-border mt-12 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Positioning Extremes Legend
            </h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-600" />
                <span className="text-xs text-foreground font-medium">Extreme Long (z ≥ 1.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-foreground font-medium">Long (z ≥ 0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-zinc-400" />
                <span className="text-xs text-foreground font-medium">Neutral Positioning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-400" />
                <span className="text-xs text-foreground font-medium">Short (z ≤ -0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-rose-600" />
                <span className="text-xs text-foreground font-medium">Extreme Short (z ≤ -1.5)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
