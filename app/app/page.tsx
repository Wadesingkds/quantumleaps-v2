"use client";

import { useState } from "react";
import { calculateSQ9, isValidPrice } from "@/lib/gann";
import { calculateAstroCycle, fmtSwingTime } from "@/lib/astro";
import { ThemeToggle } from "@/components/theme-toggle";
import { LivePrice } from "@/components/live-price";

type Tab = "sq9" | "astro";

export default function AppPage() {
  const [tab, setTab] = useState<Tab>("sq9");

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-[#D4AF37]">QUANTUM</span> Leaps
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 font-mono text-xs">
            <button
              onClick={() => setTab("sq9")}
              className={`px-3 py-1.5 rounded ${tab === "sq9" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"}`}
            >
              SQ9
            </button>
            <button
              onClick={() => setTab("astro")}
              className={`px-3 py-1.5 rounded ${tab === "astro" ? "bg-[#D4AF37] text-black" : "text-zinc-400 hover:text-white"}`}
            >
              ASTRO
            </button>
          </div>
          <ThemeToggle />
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
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"high" | "low">("high");
  const [result, setResult] = useState<ReturnType<typeof calculateSQ9> | null>(null);
  const [error, setError] = useState("");

  function handleCalc() {
    console.log("[SQ9] calc", { price, type });
    const p = parseFloat(price);
    if (!isValidPrice(p)) {
      setError(`Input invalid: "${price}". Masukkan harga > 0.`);
      setResult(null);
      return;
    }
    setError("");
    const r = calculateSQ9(p, type);
    console.log("[SQ9] result", r);
    setResult(r);
  }

  function handleCopy() {
    if (!result) return;
    const lines = [
      "═══ QUANTUM Leaps — Gann SQ9 ═══",
      `Type: ${result.type.toUpperCase()} ${result.base}`,
      "",
      result.label + ":",
      ...result.levels.map((v, i) => `  ${result.type === "high" ? "B" : "S"}${i + 1}: ${v}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono text-zinc-400 mb-1 block">
            SWING PRICE
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="3350.50"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-base font-mono text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-zinc-400 mb-1 block">
            SWING TYPE
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "high" | "low")}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-base font-mono text-white focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="high">HIGH — Buy levels above</option>
            <option value="low">LOW — Sell levels below</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 font-mono">{error}</p>}

      <button
        type="button"
        onClick={handleCalc}
        className="w-full bg-[#D4AF37] hover:bg-[#F0D060] text-black font-medium py-2 rounded-md"
      >
        Hitung
      </button>

      {result && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900">
          <div className="flex justify-between items-center mb-4">
            <p className="font-mono text-xs text-zinc-400">
              GANN SQ9 · {result.type.toUpperCase()} {result.base}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-[#D4AF37] hover:text-[#F0D060] font-mono"
            >
              Copy
            </button>
          </div>

          <div>
            <p className={`text-xs font-mono mb-2 ${result.type === "high" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {result.label}
            </p>
            {result.levels.map((v: number, i: number) => (
              <div key={i} className="flex justify-between font-mono text-sm py-1">
                <span className="text-zinc-500">{result.type === "high" ? `B${i + 1}` : `S${i + 1}`}</span>
                <span className={`font-bold ${result.type === "high" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{v}</span>
              </div>
            ))}
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

  function handleSetNow() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setSwingDate(local);
  }

  function handleCalc() {
    console.log("[Astro] calc", { timeframe, swingDate, swingDir });
    if (!swingDate) {
      alert("Pilih swing time dulu");
      return;
    }
    const r = calculateAstroCycle(timeframe, new Date(swingDate), swingDir);
    console.log("[Astro] result", r);
    setResult(r);
    setNow(new Date().toLocaleString("id-ID"));
  }

  function getTimeUntilTurn(turnDate: string) {
    const diff = new Date(turnDate).getTime() - Date.now();
    if (diff < 0) {
      const past = Math.abs(diff);
      const d = Math.floor(past / 86400000);
      const h = Math.floor((past % 86400000) / 36000000);
      return { text: `${d}h ${h}j yang lalu`, isPast: true };
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 36000000);
    return { text: `${d}h ${h}j lagi`, isPast: false };
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-mono text-zinc-400 mb-1 block">
            TIMEFRAME
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono text-white"
          >
            {["M1", "M5", "M15", "M30", "H1", "H4", "D1"].map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono text-zinc-400 mb-1 block">
            SWING TIME
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={swingDate}
              onChange={(e) => setSwingDate(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono text-white"
            />
            <button
              type="button"
              onClick={handleSetNow}
              className="font-mono text-xs px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md shrink-0"
            >
              Sekarang
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-mono text-zinc-400 mb-1 block">
            SWING TYPE
          </label>
          <select
            value={swingDir}
            onChange={(e) => setSwingDir(e.target.value as "high" | "low")}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm font-mono text-white"
          >
            <option value="high">HIGH</option>
            <option value="low">LOW</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalc}
        className="w-full bg-[#D4AF37] hover:bg-[#F0D060] text-black font-medium py-2 rounded-md"
      >
        Hitung Cycle
      </button>

      {result && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900 font-mono text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-400">Cycle</span>
            <span>{result.cycleBars} bar</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Durasi</span>
            <span>{result.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Turn Date</span>
            <span>{fmtSwingTime(new Date(result.nextTurnDate))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Countdown</span>
            <span className={getTimeUntilTurn(result.nextTurnDate).isPast ? "text-red-500" : "text-green-500"}>
              {getTimeUntilTurn(result.nextTurnDate).text}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Prediksi</span>
            <span className={result.direction === "bullish" ? "text-green-500" : "text-red-500"}>
              {result.direction.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Confidence</span>
            <span>{result.confidence}</span>
          </div>
          {now && (
            <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-700">
              Dihitung: {now}
            </p>
          )}
        </div>
      )}
    </div>
  );
}