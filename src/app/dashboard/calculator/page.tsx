"use client";

import { Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Loader2,
  Zap,
  Activity,
  ArrowDown,
  ArrowUp,
  RefreshCw,
} from "lucide-react";
import { PremiumGate } from "@/components/premium-gate";

type GannLevel = {
  label: string;
  type: "BUY" | "SELL";
  level: number;
  pivot: number;
  pctFromPivot: number;
  confluenceScore: number;
  grade: string;
  smcSignals: string[];
};

type ApiResponse = {
  ok: boolean;
  meta: { symbol: string; timeframe: string; candles: number; source: string; gannVersion?: string };
  inputs: { high: number; low: number };
  livePrice: number | null;
  results: GannLevel[];
};

const TIMEFRAMES = [
  { value: "1m", label: "1 menit" },
  { value: "5m", label: "5 menit" },
  { value: "15m", label: "15 menit" },
  { value: "30m", label: "30 menit" },
  { value: "60", label: "1 jam" },
  { value: "240", label: "4 jam" },
];

function fmt(n: number | null | undefined, d = 2): string {
  return n != null ? n.toFixed(d) : "—";
}

function GannCalculatorContent() {
  const [high, setHigh] = useState("4369.66");
  const [low, setLow] = useState("4306.11");
  const [tf, setTf] = useState("15m");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchCalc(h: string, l: string, t: string) {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/gann?high=${Number(h)}&low=${Number(l)}&tf=${t}`);
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error || "Gagal fetch");
      }
      const d = await r.json();
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (high && low) fetchCalc(high, low, tf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCalc() {
    if (!high || !low) return;
    fetchCalc(high, low, tf);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Gann Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Hitung level support/resistance Gann Square of 9 + LuxAlgo confluence scanner.
        </p>
      </div>

      {/* Input Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-[1fr_1fr_auto_auto] items-end">
            {/* High */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-signal-sell" /> Swing High
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="4369.66"
                value={high}
                onChange={(e) => setHigh(e.target.value)}
                className="font-mono font-bold text-lg h-11"
              />
            </div>

            {/* Low */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <TrendingDown className="size-3.5 text-signal-buy" /> Swing Low
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="4306.11"
                value={low}
                onChange={(e) => setLow(e.target.value)}
                className="font-mono font-bold text-lg h-11"
              />
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Timeframe
              </Label>
              <Select
                value={tf}
                onValueChange={(value: string | null, _details: any) => {
                  if (value) setTf(value);
                }}
              >
                <SelectTrigger className="w-28 h-11 font-mono font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calculate */}
            <Button onClick={handleCalc} disabled={loading || !high || !low} className="h-11 px-6" size="lg">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="pt-6 flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-sm font-medium">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && (
        <>
          {/* Live Price */}
          {data.livePrice && (
            <div className="flex items-center gap-2 text-2xl font-mono font-bold tracking-tight">
              <Activity className="size-5 text-primary" />
              <span className="text-primary text-sm uppercase font-bold tracking-widest mr-1">Live</span>
              ${fmt(data.livePrice)}
              <span className="text-xs text-muted-foreground font-normal font-sans ml-auto">
                {data.meta.symbol} · {data.meta.timeframe} · {data.meta.candles} candles · {data.meta.source}
              </span>
            </div>
          )}

          {/* Results Table */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Target className="size-3.5 text-primary" />
                Confluence Levels — Gann Square of 9 (Fixed-Increment)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold border-b border-border">
                    <th className="px-6 py-3 text-left">Label</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-right">Level</th>
                    <th className="px-6 py-3 text-right">From Pivot</th>
                    <th className="px-6 py-3 text-center">Score</th>
                    <th className="px-6 py-3 text-left">SMC Signals</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((lv, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                        lv.grade === "HIGH" ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-foreground text-sm">
                        {lv.label}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            lv.type === "BUY"
                              ? "border-green-500/30 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400"
                              : "border-red-500/30 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {lv.type === "BUY" ? <ArrowUp className="inline size-3 mr-1" /> : <ArrowDown className="inline size-3 mr-1" />}
                          {lv.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-right text-foreground">
                        ${fmt(lv.level)}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-right text-muted-foreground">
                        {lv.pctFromPivot >= 0 ? "+" : ""}{lv.pctFromPivot.toFixed(2)}%
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                lv.confluenceScore >= 7
                                  ? "bg-emerald-500"
                                  : lv.confluenceScore >= 4
                                  ? "bg-amber-500"
                                  : "bg-zinc-300 dark:bg-zinc-600"
                              }`}
                              style={{ width: `${lv.confluenceScore * 10}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-mono font-bold min-w-[3ch] text-right ${
                              lv.confluenceScore >= 7
                                ? "text-emerald-600 dark:text-emerald-400"
                                : lv.confluenceScore >= 4
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {lv.confluenceScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {lv.smcSignals.length > 0 ? (
                            lv.smcSignals.map((s, j) => (
                              <Badge key={j} variant="secondary" className="text-[10px] font-mono">
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Input: H <b className="text-foreground">${fmt(data.inputs.high)}</b> ·
                  L <b className="text-foreground">${fmt(data.inputs.low)}</b>
                </span>
                <span>
                  Formula: {data.meta.gannVersion || "Fixed-increment"}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function GannCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-muted-foreground">Memuat...</div>}>
      <PremiumGate>
        <GannCalculatorContent />
      </PremiumGate>
    </Suspense>
  );
}
