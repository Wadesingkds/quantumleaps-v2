"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  Zap,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const TIMEFRAMES = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
];

interface GannResult {
  type: "BUY" | "SELL";
  level: number;
  pivot: number;
  pctFromPivot: number;
  rawScore: number;
  smcSignals: string[];
  smcBonus: number;
  confluenceScore: number;
  grade: "HIGH" | "MED" | "LOW";
}

interface GannResponse {
  swingHigh: number;
  swingLow: number;
  pivot: number;
  timeframe: string;
  results: GannResult[];
}

export default function CalculatorPage() {
  const [swingHigh, setSwingHigh] = useState("");
  const [swingLow, setSwingLow] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<GannResponse | null>(null);

  const BINANCE_TF: Record<string, string> = {
    "15m": "15m", "1h": "1h", "4h": "4h", "1d": "1d",
  };

  async function handleCalc(e: React.FormEvent) {
    e.preventDefault();
    const high = parseFloat(swingHigh);
    const low = parseFloat(swingLow);
    if (!high || !low || high <= low) {
      setError("Swing High harus lebih besar dari Swing Low");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tf = BINANCE_TF[timeframe] || "1h";
      const kRes = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${tf}&limit=200`
      );
      if (!kRes.ok) throw new Error(`Binance ${kRes.status}`);
      const raw = await kRes.json();
      const candles = raw.map((k: number[]) => ({
        time: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4],
      }));

      const res = await fetch("/api/gann", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ high, low, candles }),
      });
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

  function getScoreColor(score: number) {
    if (score >= 8) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 6) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-zinc-800/50 text-zinc-400 border-zinc-700/50";
  }

  function getGradeBg(grade: string) {
    if (grade === "HIGH") return "bg-emerald-500/10";
    if (grade === "MED") return "bg-amber-500/10";
    return "bg-transparent";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Calculator className="size-8 text-amber-500" />
          Gann Calculator
        </h1>
        <p className="text-zinc-400 text-sm">
          Institutional price levels via Gann Square of 9 + Smart Money Confluence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-zinc-800/30 pb-4 border-b border-zinc-800">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Sparkles className="size-3.5 text-amber-500" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCalc} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">Swing High</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="High price..."
                      value={swingHigh}
                      onChange={(e) => setSwingHigh(e.target.value)}
                      className="bg-zinc-950/50 border-zinc-800 text-white font-mono h-11 focus:ring-amber-500/50 focus:border-amber-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">Swing Low</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Low price..."
                      value={swingLow}
                      onChange={(e) => setSwingLow(e.target.value)}
                      className="bg-zinc-950/50 border-zinc-800 text-white font-mono h-11 focus:ring-amber-500/50 focus:border-amber-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">Timeframe</Label>
                    <Select value={timeframe} onValueChange={(v: string | null) => setTimeframe(v ?? "1h")}>
                      <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {TIMEFRAMES.map((tf) => (
                          <SelectItem key={tf.value} value={tf.value} className="focus:bg-amber-500 focus:text-black">
                            {tf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {error && (
                  <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg text-rose-400 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="size-3.5" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-all duration-300 shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2 size-4" />
                  ) : (
                    <Target className="mr-2 size-4" />
                  )}
                  {loading ? "Calculating..." : "Hitung Confluence"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 text-[10px] text-zinc-500 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="size-3 text-amber-500/50" />
              <span>Data source: Binance PAXGUSDT</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-3 text-amber-500/50" />
              <span>Confluence logic v2.4 (Institutional)</span>
            </div>
          </div>
        </div>

        {/* Right: Results Content */}
        <div className="lg:col-span-8 space-y-6">
          {!data ? (
            <div className="h-full min-h-[400px] rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="size-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Calculator className="size-8 text-zinc-700" />
              </div>
              <div>
                <p className="text-zinc-400 font-medium">Belum ada data perhitungan</p>
                <p className="text-zinc-600 text-xs mt-1 max-w-[240px]">Masukkan Swing High & Low untuk menemukan zona confluence institusional.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Pivot", value: data.pivot.toFixed(2), icon: Target },
                  { label: "Range", value: (data.swingHigh - data.swingLow).toFixed(2), icon: Sparkles },
                  { label: "Levels", value: data.results.length, icon: ChevronRight },
                ].map((s, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                      <s.icon className="size-3 text-amber-500/70" />
                      {s.label}
                    </p>
                    <p className="text-base font-mono font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* BUY Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-4 text-emerald-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Potential Buy Zones</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
                </div>
                <div className="grid gap-3">
                  {data.results.filter(r => r.type === "BUY").map((r, i) => (
                    <ResultRow key={i} r={r} idx={i} colorClass="emerald" scoreColor={getScoreColor(r.confluenceScore)} />
                  ))}
                </div>
              </section>

              {/* SELL Section */}
              <section className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="size-4 text-rose-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Potential Sell Zones</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
                </div>
                <div className="grid gap-3">
                  {data.results.filter(r => r.type === "SELL").map((r, i) => (
                    <ResultRow key={i} r={r} idx={i} colorClass="rose" scoreColor={getScoreColor(r.confluenceScore)} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ r, idx, colorClass, scoreColor }: { r: GannResult, idx: number, colorClass: string, scoreColor: string }) {
  return (
    <div className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all duration-300">
      {/* Grade Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${r.grade === 'HIGH' ? 'bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.4)]' : r.grade === 'MED' ? 'bg-amber-500' : 'bg-transparent'}`} />
      
      <div className="w-10 h-10 rounded-lg bg-zinc-950/50 flex items-center justify-center font-mono font-bold text-xs text-zinc-500 border border-zinc-800 group-hover:bg-zinc-800 transition-colors uppercase">
        {r.type[0]}{idx + 1}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-lg font-mono font-bold text-white tracking-tight">{r.level.toLocaleString()}</span>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
            {r.pctFromPivot > 0 ? "+" : ""}{r.pctFromPivot.toFixed(3)}%
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {r.smcSignals.length > 0 ? (
            r.smcSignals.map((s, j) => (
              <Badge key={j} variant="outline" className={`text-[9px] font-bold py-0 h-4 border-${colorClass}-500/30 bg-${colorClass}-500/10 text-${colorClass}-400 uppercase tracking-tighter`}>
                {s}
              </Badge>
            ))
          ) : (
            <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest italic">No Confluence Found</span>
          )}
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-1">
        <div className={`px-3 py-1 rounded-full border text-[11px] font-black font-mono tracking-tighter ${scoreColor}`}>
          SC {r.confluenceScore}<span className="opacity-40 ml-0.5 text-[9px]">/10</span>
        </div>
        <span className={`text-[10px] font-bold tracking-widest uppercase ${r.grade === 'HIGH' ? 'text-emerald-400' : r.grade === 'MED' ? 'text-amber-500' : 'text-zinc-600'}`}>
          {r.grade} Quality
        </span>
      </div>
    </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
