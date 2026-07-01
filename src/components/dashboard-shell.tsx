"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Activity, History, LogOut, Menu, Settings, X, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Scanner", href: "/dashboard", icon: Activity, active: true },
  { label: "History", href: "/history", icon: History },
  { label: "Account", href: "/account", icon: Settings },
];

type Level = {
  type: "buy" | "sell";
  price: string;
  score: number;
  signals: string[];
};

// ponytail: mock data — replace with /api/confluence when backend wired
const mockLevels: Level[] = [
  { type: "sell", price: "4,369.66", score: 8, signals: ["FVG", "OB", "BOS"] },
  { type: "buy", price: "4,306.11", score: 6, signals: ["FVG", "CHoCH"] },
  { type: "sell", price: "4,412.30", score: 5, signals: ["OB"] },
  { type: "buy", price: "4,285.00", score: 3, signals: ["FVG"] },
];

function scoreColor(score: number) {
  if (score >= 7) return "text-signal-buy";
  if (score >= 4) return "text-primary";
  return "text-muted-foreground";
}

export function DashboardShell() {
  const [swingHigh, setSwingHigh] = useState("");
  const [swingLow, setSwingLow] = useState("");
  const [tf, setTf] = useState("15M");
  const [auto, setAuto] = useState(true);
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState<Level[]>(mockLevels);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // ponytail: replace with fetch('/api/confluence?high=...&low=...&tf=...')
    setTimeout(() => {
      setLevels(mockLevels);
      setLoading(false);
    }, 800);
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
          </span>
          QuantumLeaps
        </div>
        <nav className="flex-1 space-y-1 p-4">{navList}</nav>
        <div className="border-t border-border p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" render={<Link href="/login" />}>
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
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
                </span>
                QuantumLeaps
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">{navList}</nav>
            <div className="border-t border-border p-4">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" render={<Link href="/login" />}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar — mobile */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold md:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-buy" /> XAUUSD Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden font-mono text-xs md:inline-flex">Free</Badge>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" render={<Link href="/login" />}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Scanner</h1>
              <p className="mt-1 text-sm text-muted-foreground">Gann Square of 9 + SMC Confluence</p>
            </div>

            {/* Input form */}
            <form onSubmit={handleScan} className="rounded-xl border border-border bg-card p-3 md:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="high">Swing High</Label>
                  <Input id="high" value={swingHigh} onChange={(e) => setSwingHigh(e.target.value)} placeholder="4,400.00" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low">Swing Low</Label>
                  <Input id="low" value={swingLow} onChange={(e) => setSwingLow(e.target.value)} placeholder="4,280.00" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Timeframe</Label>
                  <Tabs value={tf} onValueChange={setTf}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="15M">15M</TabsTrigger>
                      <TabsTrigger value="1H">1H</TabsTrigger>
                      <TabsTrigger value="4H">4H</TabsTrigger>
                      <TabsTrigger value="D">D</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <button
                    type="button"
                    onClick={() => setAuto(!auto)}
                    className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      auto ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" /> Auto
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={loading} className="sm:w-auto w-full">
                  {loading ? "Mengambil data..." : "Hitung Confluence"}
                </Button>
                <Button type="button" variant="outline" className="sm:w-auto w-full">Simpan Config</Button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {[
                { label: "Trend", value: "Bullish", color: "text-signal-buy" },
                { label: "TF", value: tf, color: "text-foreground" },
                { label: "Candles", value: "248", color: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-card p-4">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`mt-1 font-mono text-lg font-semibold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Results table */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold">Level Confluence</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-signal-buy" /> High (7+)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Med (4-6)</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Low (1-3)</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                <div className="grid grid-cols-[60px_1fr_auto] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground md:hidden">
                  <span>Level</span>
                  <span>Price</span>
                  <span className="text-right">Score</span>
                </div>
                <div className="hidden grid-cols-[80px_1fr_1fr_100px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
                  <span>Level</span>
                  <span>Price</span>
                  <span>Signals</span>
                  <span className="text-right">Score</span>
                </div>
                {levels.map((lvl, i) => (
                  <Fragment key={i}>
                  {/* mobile row */}
                  <div className="grid grid-cols-[60px_1fr_auto] items-start gap-2 px-3 py-2.5 text-sm md:hidden">
                    <Badge variant={lvl.type === "sell" ? "destructive" : "secondary"} className="w-fit uppercase">
                      {lvl.type}
                    </Badge>
                    <div className="min-w-0">
                      <span className="font-mono font-medium">{lvl.price}</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {lvl.signals.map((s) => (
                          <Badge key={s} variant="outline" className="font-mono text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <span className={`text-right font-mono text-base font-bold ${scoreColor(lvl.score)}`}>
                      {lvl.score}<span className="text-xs text-muted-foreground">/10</span>
                    </span>
                  </div>
                  {/* desktop row */}
                  <div className="hidden grid-cols-[80px_1fr_1fr_100px] items-center gap-4 px-4 py-3 text-sm md:grid">
                    <Badge variant={lvl.type === "sell" ? "destructive" : "secondary"} className="w-fit uppercase">
                      {lvl.type}
                    </Badge>
                    <span className="font-mono font-medium">{lvl.price}</span>
                    <div className="flex flex-wrap gap-1">
                      {lvl.signals.map((s) => (
                        <Badge key={s} variant="outline" className="font-mono text-[10px]">{s}</Badge>
                      ))}
                    </div>
                    <span className={`text-right font-mono text-lg font-bold ${scoreColor(lvl.score)}`}>
                      {lvl.score}<span className="text-xs text-muted-foreground">/10</span>
                    </span>
                  </div>
                  </Fragment>
                ))}
              </div>
              <Separator />
              <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Data XAUUSD live dari TradingView · Cache 5 menit
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
