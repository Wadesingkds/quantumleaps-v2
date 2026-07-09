"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// Client-side premium gate. Renders children only when user is Pro.
// Redirects free users to /pricing. Defense-in-depth alongside middleware.
//
// NOTE: intentionally avoids useSearchParams() to prevent the Next.js
// "useSearchParams should be wrapped in a Suspense boundary" runtime crash.
// Payment-return detection reads window.location.search instead (client-only).
export function PremiumGate({ children }: { children: React.ReactNode }) {
  const { user, isPro, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [paymentReturn, setPaymentReturn] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);

  // Read ?payment=success from URL on mount (client-only, no Suspense needed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("payment");
    if (p === "success" || p === "already_pro") {
      setPaymentReturn(true);
      setReturnOrderId(sp.get("order_id"));
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isPro) {
      router.replace(`/pricing?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, isPro, pathname, router]);

  // Poll for webhook after returning from Pakasir
  useEffect(() => {
    if (!paymentReturn) return;
    let attempts = 0;
    const max = returnOrderId ? 10 : 5;
    const timer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/payment/status");
        const data = await res.json();
        if (data.is_pro) {
          clearInterval(timer);
          toast.success("🎉 Pembayaran berhasil! Selamat datang di Premium.");
          window.history.replaceState({}, "", pathname);
          return;
        }
      } catch {
        /* ignore */
      }
      if (attempts >= max) {
        clearInterval(timer);
        toast.error("Pembayaran tertunda. Klik 'Cek Status' untuk refresh.");
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [paymentReturn, returnOrderId, pathname]);

  if (loading || !isPro) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memeriksa status akses...</p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
