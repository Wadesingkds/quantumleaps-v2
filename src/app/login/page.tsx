"use client";

import { createClient } from "@/lib/supabase-browser";
import { GoogleIcon } from "@/components/icons";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
        </div>
      </header>

      {/* Centered login layout */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden border-b border-border/60">
        <div className="mx-auto w-full max-w-md px-6 py-20">
          {/* Login form */}
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

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Butuh akses?{" "}
              <Link href="/signup" className="font-semibold text-foreground hover:text-primary">
                Minta akses →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
