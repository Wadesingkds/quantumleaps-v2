import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* Hero */}
        <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase mb-6">
          Gann Square of 9
        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          QUANTUM
          <br />
          <span className="text-gold">Leaps</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
          Proyeksi harga XAUUSD presisi.
          <br />
          Kalkulasi otomatis, entry lebih tajam.
        </p>

        {/* CTA */}
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 bg-gold text-background font-semibold text-lg px-8 py-4 rounded-lg hover:bg-gold-light transition-colors"
        >
          Mulai →
        </Link>

        {/* Value props */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-1">
              01
            </p>
            <p className="font-semibold mb-1">Square of 9</p>
            <p className="text-sm text-muted-foreground">
              Kalkulasi level buy/sell otomatis dari swing high/low
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-1">
              02
            </p>
            <p className="font-semibold mb-1">Astro Cycle</p>
            <p className="text-sm text-muted-foreground">
              Proyeksi 144-bar cycle untuk prediksi turn point
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted-foreground mb-1">
              03
            </p>
            <p className="font-semibold mb-1">Lifetime Access</p>
            <p className="text-sm text-muted-foreground">
              Bayar sekali, pakai selamanya. Tanpa langganan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pb-10 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Quantum Leaps</p>
        </div>
      </div>
    </main>
  );
}
