"use client";

import { createClient } from "@/lib/supabase-browser";
import { GoogleIcon } from "@/components/icons";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
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
          <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Sudah punya akun?
          </Link>
        </div>
      </header>

      {/* Asymmetric layout */}
      <section className="relative flex-1 overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1fr_1fr] md:py-28">
          {/* Left: Signup form */}
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="mb-6 w-fit gap-1.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Gratis Selamanya
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Mulai Analisis<br />
              <span className="text-primary">Confluence</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Daftar sekarang dan dapatkan akses ke scanner XAUUSD dengan teknologi Gann + SMC.
            </p>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="group flex w-full max-w-md items-center justify-center gap-3 rounded-lg border border-border bg-background px-6 py-3.5 text-sm font-medium shadow-sm transition-all hover:border-primary/50 hover:bg-muted hover:shadow disabled:opacity-50"
              >
                <GoogleIcon className="h-5 w-5" />
                {loading ? "Mengalihkan..." : "Daftar dengan Google"}
                {!loading && <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>

              <p className="text-xs text-muted-foreground">
                Dengan mendaftar, kamu setuju dengan{" "}
                <Link href="/terms" className="font-medium text-primary hover:underline">Syarat Layanan</Link>
                {" "}dan{" "}
                <Link href="/privacy" className="font-medium text-primary hover:underline">Kebijakan Privasi</Link>
              </p>
            </div>

            {/* Feature list */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Scanner Gratis</p>
                  <p className="text-xs text-muted-foreground">Akses unlimited untuk timeframe 15M, 1H, 4H, Daily</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Data Real-Time</p>
                  <p className="text-xs text-muted-foreground">Candle data langsung dari TradingView, cache 5 menit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Riwayat Scan</p>
                  <p className="text-xs text-muted-foreground">Simpan dan review analisis confluence sebelumnya</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Value prop card */}
          <div className="flex items-center">
            <div className="w-full rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-5">
                <h3 className="font-semibold">Apa yang Kamu Dapatkan</h3>
                <p className="mt-1 text-sm text-muted-foreground">Free tier sudah lebih dari cukup untuk trading harian</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gann Square of 9</p>
                      <p className="text-xs text-muted-foreground">Level matematis support/resistance</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">SMC Confluence</p>
                      <p className="text-xs text-muted-foreground">FVG, OB, BOS, CHoCH detection</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Multi-Timeframe</p>
                      <p className="text-xs text-muted-foreground">Scalping hingga swing trading</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-primary/5 p-4">
                <p className="text-xs font-medium text-foreground">💎 Upgrade ke Pro</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rp500K/bulan · Auto-scan · Custom alert · API access
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
