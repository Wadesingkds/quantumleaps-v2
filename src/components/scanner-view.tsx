"use client";

import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Activity, LogOut, Menu, Settings, X, Zap, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type Level = {
  type: "buy" | "sell";
  price: string;
  score: number;
  signals: string[];
};

type ScanResult = {
  swing_high: number;
  swing_low: number;
  timeframe: string;
  trend: string;
  candle_count: number;
  last_price: number;
  levels: Level[];
  timestamp: string;
};

function scoreColor(score: number) {
  if (score >= 7) return "text-signal-buy";
  if (score >= 4) return "text-primary";
  return "text-muted-foreground";
}

export function ScannerView() {
  const [tf, setTf] = useState("15M");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Scanner", href: "/dashboard/scanner", icon: Activity, active: true },
    { label: "Account", href: "/dashboard/account", icon: Settings },
  ];

  // Auto-scan on mount
  useEffect(() => {
    handleScan();
  }, []);

  function handleScan() {
    setLoading(true);
    setError(null);

    fetch(`/api/confluence?tf=${tf}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResult(data.data);
        } else {
          setError(data.error || "Scan failed");
        }
      })
      .catch((err) => {
        setError(err.message || "Network error");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const navList = navItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        item.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  ));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
            </svg>
          </span>
          QuantumLeaps
        </div>
        <nav className="flex-1 space-y-1 p-4">{navList}</nav>
        <div className="border-t border-border p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" render={<Link href="/auth/signout" />}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-6 font-bold tracking-tight">
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  </svg>
                </span>
                QuantumLeaps
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">{navList}</nav>
            <div className="border-t border-border p-4">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" render={<Link href="/auth/signout" />}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold md:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-buy" /> XAUUSD Live
            </span>
            {result?.last_price && (
              <span className="font-mono font-medium text-foreground">${result.last_price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden font-mono text-xs md:inline-flex">Free</Badge>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" render={<Link href="/auth/signout" />}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Scanner</h1>
              <p className="mt-1 text-sm text-muted-foreground">Gann Square of 9 + SMC Confluence — Live Data</p>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-border bg-card p-3 md:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="space-y-2 flex-1">
                  <Label>Timeframe</Label>
                  <Tabs value={tf} onValueChange={setTf}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="15M">15M</TabsTrigger>
                      <TabsTrigger value="1H">1H</TabsTrigger>
                      <TabsTrigger value="4H">4H</TabsTrigger>
                      <TabsTrigger value="D">Daily</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <Button onClick={handleScan} disabled={loading} className="sm:w-auto w-full">
                  {loading ? "Scanning..." : "Scan Confluence"}
                </Button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-destructive">{error}</p>
              )}
            </div>

            {/* Stats */}
            {result && (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Trend</div>
                  <div className={`mt-1 flex items-center gap-1 font-mono text-lg font-semibold ${
                    result.trend === "Bullish" ? "text-signal-buy" : result.trend === "Bearish" ? "text-signal-sell" : "text-foreground"
                  }`}>
                    {result.trend === "Bullish" && <TrendingUp className="h-4 w-4" />}
                    {result.trend === "Bearish" && <TrendingDown className="h-4 w-4" />}
                    {result.trend}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Last Price</div>
                  <div className="mt-1 font-mono text-lg font-semibold">${result.last_price.toFixed(2)}</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Swing Range</div>
                  <div className="mt-1 font-mono text-sm font-semibold">
                    {result.swing_low.toFixed(0)} — {result.swing_high.toFixed(0)}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">Candles</div>
                  <div className="mt-1 font-mono text-lg font-semibold">{result.candle_count}</div>
                </div>
              </div>
            )}

            {/* Results table */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold">Confluence Levels</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-signal-buy" /> High (7+)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Med (4-6)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Low (1-3)</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Fetching live data + calculating confluence...
                  </div>
                </div>
              ) : result?.levels && result.levels.length > 0 ? (
                <div className="divide-y divide-border">
                  {/* Header */}
                  <div className="hidden grid-cols-[80px_1fr_1fr_100px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
                    <span>Level</span>
                    <span>Price</span>
                    <span>Signals</span>
                    <span className="text-right">Score</span>
                  </div>
                  {/* Rows */}
                  {result.levels.map((lvl, i) => (
                    <Fragment key={i}>
                      {/* mobile */}
                      <div className="grid grid-cols-[60px_1fr_auto] items-start gap-2 px-3 py-2.5 text-sm md:hidden">
                        <Badge variant={lvl.type === "sell" ? "destructive" : "secondary"} className="w-fit uppercase">{lvl.type}</Badge>
                        <div className="min-w-0">
                          <span className="font-mono font-medium">${lvl.price}</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {lvl.signals.map((s) => <Badge key={s} variant="outline" className="font-mono text-[10px]">{s}</Badge>)}
                          </div>
                        </div>
                        <span className={`text-right font-mono text-base font-bold ${scoreColor(lvl.score)}`}>{lvl.score}<span className="text-xs text-muted-foreground">/10</span></span>
                      </div>
                      {/* desktop */}
                      <div className="hidden grid-cols-[80px_1fr_1fr_100px] items-center gap-4 px-4 py-3 text-sm md:grid">
                        <Badge variant={lvl.type === "sell" ? "destructive" : "secondary"} className="w-fit uppercase">{lvl.type}</Badge>
                        <span className="font-mono font-medium">${lvl.price}</span>
                        <div className="flex flex-wrap gap-1">
                          {lvl.signals.map((s) => <Badge key={s} variant="outline" className="font-mono text-[10px]">{s}</Badge>)}
                        </div>
                        <span className={`text-right font-mono text-lg font-bold ${scoreColor(lvl.score)}`}>{lvl.score}<span className="text-xs text-muted-foreground">/10</span></span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  {error ? "Error loading data" : "No confluence levels detected"}
                </div>
              )}

              <Separator />
              <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {result ? (
                  <>Live XAUUSD data via Yahoo Finance · Gann Square of 9 + SMC · {result.levels.length} levels detected</>
                ) : (
                  <>Click "Scan Confluence" to analyze live market data</>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom tab bar — mobile */}
      <nav className="sticky bottom-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              item.active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
