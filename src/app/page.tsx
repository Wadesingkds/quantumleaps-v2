import Link from "next/link";
import { ArrowRight, ArrowUpRight, Activity, Layers, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    icon: Layers,
    name: "Gann Square of 9",
    desc: "Level harga matematis dari metode Gann. Identifikasi zona support dan resistance yang diamati trader institusional.",
  },
  {
    icon: Activity,
    name: "SMC Confluence",
    desc: "Fair Value Gap, Order Block, Break of Structure, dan Change of Character — auto-detect dan di-score melawan level Gann.",
  },
  {
    icon: Clock,
    name: "Multi-Timeframe",
    desc: "Analisis dari scalping 15 menit hingga swing harian. Setiap timeframe hitung ulang confluence dengan data candle fresh dari TradingView.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Nav */}
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
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/#fitur" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Fitur</Link>
            <Link href="/#cara-kerja" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Cara Kerja</Link>
            <Link href="/#harga" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Harga</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" render={<Link href="/login" />} className="hidden sm:inline-flex">
              Masuk
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Daftar Gratis <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — asymmetric, not centered */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="mb-6 w-fit gap-1.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-buy" />
              XAUUSD Live · Data TradingView
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Temukan Level<br />
              <span className="text-primary">Confluence</span><br />
              Sebelum Pasar Bergerak
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Gann Square of 9 bertemu Smart Money Concepts. Input swing level, dapatkan zona confluence grade institusional dengan sinyal FVG, Order Block, BOS, dan CHoCH.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/signup" />}>
                Mulai Analisis <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/dashboard" />}>
                Buka Dashboard
              </Button>
            </div>
          </div>

          {/* Preview card — shows actual product, not generic illustration */}
          <div className="flex items-center">
            <div className="w-full rounded-xl border border-border bg-card p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <span className="font-mono text-xs text-muted-foreground">XAUUSD · M15</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-signal-buy">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-buy" /> Live
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-signal-sell/30 bg-signal-sell p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Sell Level</span>
                    <span className="font-mono text-lg font-semibold">4,369.66</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-[10px]">FVG</Badge>
                      <Badge variant="secondary" className="text-[10px]">OB</Badge>
                      <Badge variant="secondary" className="text-[10px]">BOS</Badge>
                    </div>
                    <span className="ml-auto font-mono text-sm font-bold text-foreground">8/10</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[80%] rounded-full bg-signal-sell/70" />
                  </div>
                </div>
                <div className="rounded-lg border border-signal-buy/30 bg-signal-buy p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Buy Level</span>
                    <span className="font-mono text-lg font-semibold">4,306.11</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-[10px]">FVG</Badge>
                      <Badge variant="secondary" className="text-[10px]">CHoCH</Badge>
                    </div>
                    <span className="ml-auto font-mono text-sm font-bold text-foreground">6/10</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[60%] rounded-full bg-signal-buy/70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars — numbered, not generic grid */}
      <section id="fitur" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono text-sm text-primary">01 — Dibangun untuk Presisi</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Tiga pilar analisis institusional, jadi satu tool.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.name} className="bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{p.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — not a generic "3 steps" card grid */}
      <section id="cara-kerja" className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono text-sm text-primary">02 — Cara Kerja</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Dari swing level ke zona confluence, dalam hitungan detik.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "Input", desc: "Masukkan swing high dan swing low XAUUSD. Pilih timeframe — dari M15 sampai Daily." },
              { step: "Analisis", desc: "Engine hitung level Gann, scan FVG/OB/BOS/CHoCH dari candle TradingView, score confluence per level." },
              { step: "Eksekusi", desc: "Dapat zona buy/sell dengan grade 1—10. Alert harga, simpan config, log history." },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-primary/30">0{i + 1}</span>
                  <h3 className="text-xl font-semibold">{s.step}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — honest, not 3-tier vanity */}
      <section id="harga" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-2xl">
            <span className="font-mono text-sm text-primary">03 — Harga</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Mulai gratis. Upgrade saat butuh.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 md:max-w-3xl">
            <div className="rounded-xl border border-border bg-card p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted-foreground">Selamanya gratis</p>
              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight">Rp0</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Kalkulator confluence dasar", "3 konfigurasi tersimpan", "Data real-time (delay 15 menit)", "Timeframe M15—H1"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" render={<Link href="/signup" />}>
                Daftar Gratis
              </Button>
            </div>
            <div className="relative rounded-xl border-2 border-primary bg-card p-8">
              <Badge className="absolute -top-3 left-8">Populer</Badge>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">Untuk trader aktif</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">Rp500K</span>
                <span className="text-sm text-muted-foreground">/bulan</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Semua fitur Free", "Unlimited konfigurasi", "Data real-time tanpa delay", "Semua timeframe (M15—Daily)", "Alert harga & notifikasi", "History export PDF"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" render={<Link href="/signup" />}>
                Upgrade ke Pro <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Siap menemukan edge Anda?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Tanpa kartu kredit. Tanpa commit. Hanya analisis.
          </p>
          <Button size="lg" className="mt-8" render={<Link href="/dashboard" />}>
            Buka Dashboard <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
            </span>
            QuantumLeaps
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span className="font-mono text-xs">© 2026 QuantumLeaps</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
