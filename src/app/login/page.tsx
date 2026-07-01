"use client";

import { createClient } from "@/lib/supabase-browser";
import { GoogleIcon } from "@/components/icons";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav — same as landing */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </span>
            QuantumLeaps
          </Link>
          <Link href="/signup" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Belum punya akun?
          </Link>
        </div>
      </header>

      {/* Asymmetric layout — like landing hero */}
      <section className="relative flex-1 overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1fr_1fr] md:py-28">
          {/* Left: Login form */}
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="mb-6 w-fit gap-1.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-buy" />
              Secure Login
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Masuk ke<br />
              <span className="text-primary">Dashboard</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Akses scanner confluence XAUUSD dan lihat riwayat analisis.
            </p>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="group flex w-full max-w-md items-center justify-center gap-3 rounded-lg border border-border bg-background px-6 py-3.5 text-sm font-medium shadow-sm transition-all hover:border-primary/50 hover:bg-muted hover:shadow disabled:opacity-50"
              >
                <GoogleIcon className="h-5 w-5" />
                {loading ? "Mengalihkan..." : "Lanjutkan dengan Google"}
                {!loading && <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>

              <p className="text-xs text-muted-foreground">
                Dengan masuk, kamu setuju dengan{" "}
                <Link href="/terms" className="font-medium text-primary hover:underline">Syarat Layanan</Link>
                {" "}dan{" "}
                <Link href="/privacy" className="font-medium text-primary hover:underline">Kebijakan Privasi</Link>
              </p>
            </div>

            <div className="mt-8 rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Belum punya akun?{" "}
                <Link href="/signup" className="font-semibold text-foreground hover:text-primary">
                  Daftar gratis →
                </Link>
              </p>
            </div>
          </div>

          {/* Right: Preview card — shows product value */}
          <div className="flex items-center">
            <div className="w-full rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold">Recent Confluence Scans</h3>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" /> Live
                </Badge>
              </div>

              <div className="space-y-3">
                {[
                  { pair: "XAUUSD", tf: "15M", level: "4,369.66", type: "sell", score: 8, trend: "down" },
                  { pair: "XAUUSD", tf: "1H", level: "4,306.11", type: "buy", score: 7, trend: "up" },
                  { pair: "XAUUSD", tf: "4H", level: "4,412.30", type: "sell", score: 6, trend: "down" },
                ].map((scan, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-medium">{scan.pair}</span>
                          <span className="text-xs text-muted-foreground">· {scan.tf}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${
                          scan.trend === "up" ? "text-signal-buy rotate-0" : "text-signal-sell rotate-180"
                        }`} />
                        <span className={`text-xs font-medium ${
                          scan.type === "buy" ? "text-signal-buy" : "text-signal-sell"
                        }`}>
                          {scan.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-lg font-semibold">{scan.level}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Score:</span>
                        <span className={`font-mono text-sm font-bold ${
                          scan.score >= 7 ? "text-signal-buy" : "text-primary"
                        }`}>
                          {scan.score}/10
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg bg-primary/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Masuk untuk akses penuh scanner + riwayat analisis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
