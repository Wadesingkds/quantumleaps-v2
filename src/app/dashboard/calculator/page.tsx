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
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// M1–M30 timeframes (all minutes)
const TIMEFRAMES = Array.from({ length: 30 }, (_, i) => ({
  value: `${i + 1}m`,
  label: `M${i + 1}`,
}));

type SwingDir = "HIGH" | "LOW";

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

function AlertIcon(props: any) {
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

export default function CalculatorPage() {
  const [swingPrice, setSwingPrice] = useState("");
  const [swingDir, setSwingDir] = useState<SwingDir>("HIGH");
  const [timeframe, setTimeframe] = useState("5m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<GannResponse | null>(null);

  const TF_MAP: Record<string, string> = {
    "1m": "1m", "3m": "3m", "5m": "5m", "10m": "10m", "15m": "15m",
    "20m": "20m", "25m": "25m", "30m": "30m",
  };

  async function handleCalc(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(swingPrice);
    if (!price || price <= 0) {
      setError("Masukkan harga swing yang valid");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const tf = TF_MAP[timeframe] || "5m";
      const res = await fetch(`/api/gann?swingPrice=${price}&swingDir=${swingDir}&tf=${tf}`);
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

  function getScoreStyle(score: number) {
    if (score >= 8) return { bg: "bg-signal-buy", text: "text-signal-buy", border: "border-signal-buy" };
    if (score >= 6) return { bg: "bg-accent", text: "text-primary", border: "border-border" };
    return { bg: "bg-muted/30", text: "text-muted-foreground", border: "border-border" };
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Calculator className="size-8 text-primary" />
          Gann Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Institutional price levels via Gann Square of 9 + Smart Money Confluence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCalc} className="space-y-5">
                <div className="space-y-4">
                  {/* Direction toggle */}
                  <div className="space-y-2">
                    <Label className="text-foreground text-xs font-bold uppercase tracking-tighter">
                      Swing Type
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSwingDir("HIGH")}
                        className={`h-11 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                          swingDir === "HIGH"
                            ? "bg-signal-sell border-signal-sell text-foreground shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:border-signal-sell"
                        }`}
                      >
                        <ArrowUp className="size-4" />
                        Swing HIGH
                      </button>
                      <button
                        type="button"
                        onClick={() => setSwingDir("LOW")}
                        className={`h-11 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                          swingDir === "LOW"
                            ? "bg-signal-buy border-signal-buy text-foreground shadow-sm"
                            : "bg-card border-border text-muted-foreground hover:border-signal-buy"
                        }`}
                      >
                        <ArrowDown className="size-4" />
                        Swing LOW
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground text-xs font-bold uppercase tracking-tighter">
                      {swingDir === "HIGH" ? "Swing High Price" : "Swing Low Price"}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={swingDir === "HIGH" ? "e.g. 3385.50" : "e.g. 3320.20"}
                      value={swingPrice}
                      onChange={(e) => setSwingPrice(e.target.value)}
                      className="bg-muted/30 border-border text-foreground font-mono h-11 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground text-xs font-bold uppercase tracking-tighter">
                      Timeframe
                    </Label>
                    <Select value={timeframe} onValueChange={(v: string | null) => setTimeframe(v ?? "5m")}>
                      <SelectTrigger className="bg-muted/30 border-border text-foreground h-11 font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-[280px]">
                        {TIMEFRAMES.map((tf) => (
                          <SelectItem
                            key={tf.value}
                            value={tf.value}
                            className="focus:bg-accent focus:text-white font-mono"
                          >
                            {tf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {error && (
                  <div className="bg-signal-sell border border-signal-sell p-3 rounded-lg text-signal-sell text-xs font-medium flex items-center gap-2">
                    <AlertIcon className="size-3.5" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12  font-bold text-sm transition-all duration-300 shadow-sm"
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

          <div className="p-4 rounded-xl border border-border bg-muted/30 text-[10px] text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="size-3 text-primary" />
              <span>Data source: Binance PAXGUSDT · 500 bars</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-3 text-primary" />
              <span>Confluence logic v2.4 (Institutional)</span>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8 space-y-6">
          {!data ? (
            <div className="h-full min-h-[400px] rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="size-16 rounded-full bg-accent border border-border flex items-center justify-center">
                <Calculator className="size-8 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Belum ada data perhitungan</p>
                <p className="text-muted-foreground text-xs mt-1 max-w-[280px]">
                  Pilih tipe swing (High/Low) + masukkan harga + timeframe M1–M30.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card border border-border p-3.5 rounded-xl space-y-1 shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                    <Target className="size-3 text-primary" />
                    Swing
                  </p>
                  <p className="text-base font-mono font-bold text-foreground">
                    {data.swingHigh === data.swingLow
                      ? data.swingHigh
                      : `${data.swingHigh} / ${data.swingLow}`}
                  </p>
                </div>
                <div className="bg-card border border-border p-3.5 rounded-xl space-y-1 shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                    <Sparkles className="size-3 text-primary" />
                    Pivot
                  </p>
                  <p className="text-base font-mono font-bold text-foreground">
                    {data.pivot.toFixed(2)}
                  </p>
                </div>
                <div className="bg-card border border-border p-3.5 rounded-xl space-y-1 shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-primary" />
                    Range
                  </p>
                  <p className="text-base font-mono font-bold text-foreground">
                    {Math.abs(data.swingHigh - data.swingLow).toFixed(2)}
                  </p>
                </div>
                <div className="bg-card border border-border p-3.5 rounded-xl space-y-1 shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                    <Clock className="size-3 text-primary" />
                    TF
                  </p>
                  <p className="text-base font-mono font-bold text-foreground">
                    {data.timeframe.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* BUY Section */}
              {data.results.some((r) => r.type === "BUY") && (
                <section className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="size-4 text-signal-buy" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                      Potential Buy Zones
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid gap-3">
                    {data.results
                      .filter((r) => r.type === "BUY")
                      .map((r, i) => (
                        <ResultRow
                          key={`b${i}`}
                          r={r}
                          idx={i}
                          colorClass="emerald"
                          style={getScoreStyle(r.confluenceScore)}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* SELL Section */}
              {data.results.some((r) => r.type === "SELL") && (
                <section className="space-y-3 pt-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="size-4 text-signal-sell" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                      Potential Sell Zones
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid gap-3">
                    {data.results
                      .filter((r) => r.type === "SELL")
                      .map((r, i) => (
                        <ResultRow
                          key={`s${i}`}
                          r={r}
                          idx={i}
                          colorClass="rose"
                          style={getScoreStyle(r.confluenceScore)}
                        />
                      ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  r,
  idx,
  colorClass,
  style,
}: {
  r: GannResult;
  idx: number;
  colorClass: string;
  style: { bg: string; text: string; border: string };
}) {
  return (
    <div
      className={`relative overflow-hidden bg-card border ${style.border} rounded-xl p-4 flex items-center gap-4 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          r.grade === "HIGH"
            ? "bg-signal-buy0"
            : r.grade === "MED"
            ? "bg-accent"
            : "bg-muted"
        }`}
      />

      <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center font-mono font-bold text-xs text-muted-foreground border border-border uppercase">
        {r.type[0]}
        {idx + 1}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-lg font-mono font-bold text-foreground tracking-tight">
            {r.level.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded border border-border">
            {r.pctFromPivot > 0 ? "+" : ""}
            {r.pctFromPivot.toFixed(3)}%
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {r.smcSignals.length > 0 ? (
            r.smcSignals.map((s, j) => (
              <Badge
                key={j}
                variant="outline"
                className={`text-[9px] font-bold py-0 h-4 ${
                  colorClass === "emerald"
                    ? "border-signal-buy bg-signal-buy text-signal-buy"
                    : "border-signal-sell bg-signal-sell text-signal-sell"
                } uppercase tracking-tighter`}
              >
                {s}
              </Badge>
            ))
          ) : (
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic">
              No Confluence Found
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-1">
        <div
          className={`px-3 py-1 rounded-full border ${style.border} ${style.bg} text-[11px] font-black font-mono tracking-tighter ${style.text}`}
        >
          SC {r.confluenceScore}
          <span className="opacity-50 ml-0.5 text-[9px]">/10</span>
        </div>
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${
            r.grade === "HIGH"
              ? "text-signal-buy"
              : r.grade === "MED"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {r.grade} Quality
        </span>
      </div>
    </div>
  );
}
