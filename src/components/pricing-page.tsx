"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function BuyProButton() {
  const { user, isPro, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleBuy() {
    if (!user) {
      router.push("/signup?redirect=/pricing");
      return;
    }
    if (isPro) {
      router.push("/dashboard");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/payment/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal membuat pembayaran");
        setBusy(false);
        return;
      }
      if (data.alreadyPro) {
        toast.success("Kamu sudah Premium! 🎉");
        router.push("/dashboard");
        return;
      }
      // Redirect to Pakasir hosted checkout
      window.location.href = data.redirectUrl;
    } catch (e) {
      toast.error("Terjadi kesalahan. Coba lagi.");
      setBusy(false);
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleBuy}
      disabled={busy || loading}
    >
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengalihkan...
        </>
      ) : isPro ? (
        <>
          Buka Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Minta Akses Pro — Rp500K/bulan
        </>
      )}
    </Button>
  );
}

export function PricingPage() {
  const { isPro, loading } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4 gap-1.5 py-1">
          <Sparkles className="h-3.5 w-3.5" /> Akses Premium
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Pilih akses sesuai kebutuhan.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Scanner XAUUSD dengan Gann + SMC. Bayar sekali, akses penuh 30 hari.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:max-w-3xl md:mx-auto">
        <Card className="p-8">
          <h3 className="text-lg font-semibold">Basic</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Akses awal untuk pengguna terpilih
          </p>
          <div className="mt-6">
            <span className="text-4xl font-bold tracking-tight">Beta</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Kalkulator confluence dasar",
              "3 konfigurasi tersimpan",
              "Data market terjadwal",
              "Timeframe M15—H1",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-8 w-full"
            onClick={() => (window.location.href = "/signup")}
          >
            Minta Akses
          </Button>
        </Card>

        <div className="relative">
          <Badge className="absolute -top-3 left-8">Populer</Badge>
          <Card className="h-full border-2 border-primary p-8">
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="mt-1 text-sm text-muted-foreground">Untuk trader aktif</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">Rp500K</span>
              <span className="text-sm text-muted-foreground">/bulan</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Semua fitur Basic",
                "Unlimited konfigurasi",
                "Data real-time tanpa delay",
                "Semua timeframe (M15—Daily)",
                "Alert harga & notifikasi",
                "History export PDF",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {!loading && isPro ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Buka Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <BuyProButton />
              )}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Pembayaran via QRIS · Pakasir
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
