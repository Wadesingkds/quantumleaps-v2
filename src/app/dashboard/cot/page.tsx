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
  AlertTriangle,
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
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
}

function SignalIcon({ signal }: { signal: string }) {
  if (signal.includes("long"))
    return <TrendingUp className="size-4 text-green-400" />;
  if (signal.includes("short"))
    return <TrendingDown className="size-4 text-red-400" />;
  return <Minus className="size-4 text-zinc-500" />;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 32;
  const w = data.length * 4;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  metals: "🪙 Metals",
  energy: "🛢️ Energy",
  index: "📊 Indices",
  rates: "📈 Rates",
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="size-6 text-blue-500" />
            COT Report
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Commitments of Traders — smart money positioning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={weeks} onValueChange={(v: string | null) => setWeeks(v ?? "12")}>
            <SelectTrigger className="w-24 bg-zinc-800 border-zinc-700 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="4">4W</SelectItem>
              <SelectItem value="8">8W</SelectItem>
              <SelectItem value="12">12W</SelectItem>
              <SelectItem value="26">26W</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <Loader2 className="animate-spin mr-2 size-4" />
          Loading CFTC data...
        </div>
      )}

      {error && (
        <Card className="bg-red-950/30 border-red-800/50">
          <CardContent className="pt-6 flex items-center gap-2 text-red-400">
            <AlertTriangle className="size-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* As of */}
          <p className="text-xs text-zinc-600">
            Data as of {data.asOf} · {data.contractCount} contracts ·{" "}
            {data.weeks}W lookback
          </p>

          {Object.entries(data.categories).map(([cat, items]) => (
            <Card key={cat} className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-zinc-300">
                  {CATEGORY_LABELS[cat] || cat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_100px_80px_80px_80px_100px] gap-2 text-[11px] text-zinc-500 font-medium pb-2 border-b border-zinc-800">
                    <span>Contract</span>
                    <span className="text-right">Net Spec</span>
                    <span className="text-right">Z-Score</span>
                    <span className="text-right">1W Δ</span>
                    <span className="text-right">1M Δ</span>
                    <span className="text-right">Trend</span>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.symbol}
                      className="grid grid-cols-[1fr_100px_80px_80px_80px_100px] gap-2 items-center py-2.5 border-b border-zinc-800/50 hover:bg-zinc-800/20"
                    >
                      <div className="flex items-center gap-2">
                        <SignalIcon signal={item.signal} />
                        <div>
                          <span className="text-sm font-medium text-zinc-100">
                            {item.display}
                          </span>
                          <span className="text-[10px] text-zinc-600 ml-1.5">
                            {item.symbol}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className="font-mono text-sm font-medium"
                          style={{ color: item.color }}
                        >
                          {formatNum(item.net)}
                        </span>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono border-zinc-700"
                          style={{ color: item.color, borderColor: item.color + "40" }}
                        >
                          {item.zScore > 0 ? "+" : ""}
                          {item.zScore}
                        </Badge>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-mono ${
                            item.weekChange > 0
                              ? "text-green-400"
                              : item.weekChange < 0
                              ? "text-red-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {item.weekChange > 0 ? "+" : ""}
                          {formatNum(item.weekChange)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-mono ${
                            item.monthChange > 0
                              ? "text-green-400"
                              : item.monthChange < 0
                              ? "text-red-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {item.monthChange > 0 ? "+" : ""}
                          {formatNum(item.monthChange)}
                        </span>
                      </div>

                      <div className="text-right">
                        <MiniSparkline
                          data={item.series.map((s) => s.net)}
                          color={item.color}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-2">
            <span>
              <span className="text-green-400">●</span> Extreme Long (z ≥ 1.5)
            </span>
            <span>
              <span className="text-green-300">●</span> Long (z ≥ 0.5)
            </span>
            <span>
              <span className="text-zinc-400">●</span> Neutral
            </span>
            <span>
              <span className="text-red-300">●</span> Short (z ≤ -0.5)
            </span>
            <span>
              <span className="text-red-400">●</span> Extreme Short (z ≤ -1.5)
            </span>
          </div>
        </>
      )}
    </div>
  );
}
