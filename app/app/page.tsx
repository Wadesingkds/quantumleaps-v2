"use client";

import { useState } from "react";
import { calculateSQ9, isValidSwing } from "@/lib/gann";
import { calculateAstroCycle, fmtSwingTime } from "@/lib/astro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { LivePrice } from "@/components/live-price";

type Tab = "sq9" | "astro";

export default function AppPage() {
  const [tab, setTab] = useState<Tab>("sq9");

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-gold">QUANTUM</span> Leaps
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex gap-1 font-mono text-xs">
          <button
            onClick={() => setTab("sq9")}
            className={`px-3 py-1.5 rounded ${tab === "sq9" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            SQ9
          </button>
          <button
            onClick={() => setTab("astro")}
            className={`px-3 py-1.5 rounded ${tab === "astro" ? "bg-gold text-background" : "text-muted-foreground hover:text-foreground"}`}
          >
            ASTRO
          </button>
          </div>
        </div>
      </div>

      {/* Live Price */}
      <div className="mb-6">
        <LivePrice />
      </div>

      {tab === "sq9" ? <SQ9Calculator /> : <AstroCycle />}
    </main>
  );
}

/* ── SQ9 Calculator ── */
function SQ9Calculator() {
  const [high, setHigh] = useState("");
  const [low, setLow] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateSQ9> | null>(null);
  const [error, setError] = useState("");

  function handleCalc() {
    const h = parseFloat(high);
    const l = parseFloat(low);
    if (!isValidSwing(h, l)) {
      setError("High harus > Low, keduanya > 0");
      return;
    }
    setError("");
    setResult(calculateSQ9(h, l));
  }

  function handleCopy() {
    if (!result) return;
    const text = [
      "═══ GANN SQ9 LEVELS ═══",
      "",
      "BUY:",
      ...result.buy.map((v, i) => `  B${i + 1}: ${v}`),
      "",
      "SELL:",
      ...result.sell.map((v, i) => `  S${i + 1}: ${v}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            SWING HIGH
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="3350.50"
            value={high}
            onChange={(e) => setHigh(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            SWING LOW
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="3320.00"
            value={low}
            onChange={(e) => setLow(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>

      {error && <p className="text-sm text-sell">{error}</p>}

      <Button
        onClick={handleCalc}
        className="w-full bg-gold text-background hover:bg-gold-light"
      >
        Hitung
      </Button>

      {result && (
        <div className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="font-mono text-xs text-muted-foreground">
              GANN SQUARE OF 9
            </p>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              Copy
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-mono text-buy mb-2">BUY LEVELS</p>
              {result.buy.map((v, i) => (
                <div key={i} className="flex justify-between font-mono text-sm py-1">
                  <span className="text-muted-foreground">B{i + 1}</span>
                  <span className="text-buy">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-mono text-sell mb-2">SELL LEVELS</p>
              {result.sell.map((v, i) => (
                <div key={i} className="flex justify-between font-mono text-sm py-1">
                  <span className="text-muted-foreground">S{i + 1}</span>
                  <span className="text-sell">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Astro Cycle ── */
function AstroCycle() {
  const [timeframe, setTimeframe] = useState("H1");
  const [swingDate, setSwingDate] = useState("");
  const [swingDir, setSwingDir] = useState<"high" | "low">("high");
  const [result, setResult] = useState<ReturnType<typeof calculateAstroCycle> | null>(null);
  const [now, setNow] = useState("");

  // ponytail: native Date, no library
  function handleSetNow() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setSwingDate(local);
  }

  function handleCalc() {
    if (!swingDate) return;
    setResult(calculateAstroCycle(timeframe, new Date(swingDate), swingDir));
    setNow(new Date().toLocaleString("id-ID"));
  }

  // Calculate days/hours until turn
  function getTimeUntilTurn(turnDate: string) {
    const diff = new Date(turnDate).getTime() - Date.now();
    if (diff < 0) {
      const past = Math.abs(diff);
      const d = Math.floor(past / 86400000);
      const h = Math.floor((past % 86400000) / 3600000);
      return { text: `${d}h ${h}j yang lalu`, isPast: true };
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return { text: `${d}h ${h}j lagi`, isPast: false };
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            TIMEFRAME
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm font-mono"
          >
            {["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            SWING TIME
          </label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={swingDate}
              onChange={(e) => setSwingDate(e.target.value)}
              className="font-mono flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetNow}
              className="font-mono text-xs shrink-0"
            >
              Sekarang
            </Button>
          </div>
        </div>
        <div>
          <label className="text-xs font-mono text-muted-foreground mb-1 block">
            SWING TYPE
          </label>
          <select
            value={swingDir}
            onChange={(e) => setSwingDir(e.target.value as "high" | "low")}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm font-mono"
          >
            <option value="high">HIGH</option>
            <option value="low">LOW</option>
          </select>
        </div>
      </div>

      <Button
        onClick={handleCalc}
        className="w-full bg-gold text-background hover:bg-gold-light"
      >
        Hitung Cycle
      </Button>

      {result && (
        <div className="border border-border rounded-lg p-4 font-mono text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cycle</span>
            <span>{result.cycleBars} bar</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durasi</span>
            <span>{result.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Turn Date</span>
            <span>{fmtSwingTime(new Date(result.nextTurnDate))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Countdown</span>
            <span className={getTimeUntilTurn(result.nextTurnDate).isPast ? "text-sell" : "text-buy"}>
              {getTimeUntilTurn(result.nextTurnDate).text}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prediksi</span>
            <span className={result.direction === "bullish" ? "text-buy" : "text-sell"}>
              {result.direction.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confidence</span>
            <span>{result.confidence}</span>
          </div>
          {now && (
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Dihitung: {now}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
