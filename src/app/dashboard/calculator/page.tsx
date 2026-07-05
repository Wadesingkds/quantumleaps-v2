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
  BarChart3,
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
      const res = await fetch(
        `/api/gann?high=${high}&low=${low}&tf=${timeframe}`
      );
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
    if (score >= 8) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 6) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }

  function getGradeColor(grade: string) {
    if (grade === "HIGH") return "text-green-400";
    if (grade === "MED") return "text-yellow-400";
    return "text-zinc-500";
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Calculator className="size-6 text-amber-500" />
          Gann Calculator
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Square of 9 levels + SMC confluence scoring
        </p>
      </div>

      {/* Input Form */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="pt-6">
          <form onSubmit={handleCalc} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Swing High</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2385.50"
                  value={swingHigh}
                  onChange={(e) => setSwingHigh(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Swing Low</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 2350.20"
                  value={swingLow}
                  onChange={(e) => setSwingLow(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Timeframe</Label>
                <Select value={timeframe} onValueChange={(v: string | null) => setTimeframe(v ?? "1h")}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {TIMEFRAMES.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2 size-4" />
              ) : (
                <Target className="mr-2 size-4" />
              )}
              Hitung Confluence
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <>
          {/* BUY Levels */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="size-4 text-green-400" />
                <span className="text-green-400">BUY Levels</span>
                <Badge variant="outline" className="text-xs text-zinc-500 border-zinc-700 ml-auto">
                  Pivot: {data.pivot}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-2 pr-4 font-medium">Level</th>
                      <th className="text-right py-2 px-4 font-medium">Harga</th>
                      <th className="text-right py-2 px-4 font-medium">%</th>
                      <th className="text-right py-2 px-4 font-medium">Score</th>
                      <th className="text-left py-2 pl-4 font-medium">SMC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results
                      .filter((r) => r.type === "BUY")
                      .map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                        >
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getScoreColor(r.confluenceScore)}`}
                            >
                              B{i + 1}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-100">
                            {r.level}
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400 font-mono">
                            {r.pctFromPivot}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-bold ${getGradeColor(r.grade)}`}
                            >
                              {r.confluenceScore}
                            </span>
                          </td>
                          <td className="py-3 pl-4">
                            {r.smcSignals.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {r.smcSignals.map((s, j) => (
                                  <Badge
                                    key={j}
                                    variant="outline"
                                    className="text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10"
                                  >
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SELL Levels */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="size-4 text-red-400" />
                <span className="text-red-400">SELL Levels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-2 pr-4 font-medium">Level</th>
                      <th className="text-right py-2 px-4 font-medium">Harga</th>
                      <th className="text-right py-2 px-4 font-medium">%</th>
                      <th className="text-right py-2 px-4 font-medium">Score</th>
                      <th className="text-left py-2 pl-4 font-medium">SMC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results
                      .filter((r) => r.type === "SELL")
                      .map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                        >
                          <td className="py-3 pr-4">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getScoreColor(r.confluenceScore)}`}
                            >
                              S{i + 1}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-zinc-100">
                            {r.level}
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400 font-mono">
                            {r.pctFromPivot}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-bold ${getGradeColor(r.grade)}`}
                            >
                              {r.confluenceScore}
                            </span>
                          </td>
                          <td className="py-3 pl-4">
                            {r.smcSignals.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {r.smcSignals.map((s, j) => (
                                  <Badge
                                    key={j}
                                    variant="outline"
                                    className="text-[10px] text-orange-400 border-orange-500/30 bg-orange-500/10"
                                  >
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>Score: <b className="text-green-400">8-10</b> HIGH</span>
            <span><b className="text-yellow-400">5-7</b> MED</span>
            <span><b className="text-zinc-400">1-4</b> LOW</span>
            <span className="ml-auto">TF: {data.timeframe}</span>
          </div>
        </>
      )}
    </div>
  );
}
