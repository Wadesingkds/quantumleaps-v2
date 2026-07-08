"use client"

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Activity, BarChart3, Calculator, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const actions = [
  {
    title: "Confluence Scanner",
    desc: "Scan XAUUSD dengan Gann + indikator teknikal.",
    href: "/dashboard/scanner",
    icon: Activity,
    cta: "Buka Scanner",
  },
  {
    title: "Gann Calculator",
    desc: "Hitung level Gann + SMC dari swing high/low.",
    href: "/dashboard/calculator",
    icon: Calculator,
    cta: "Buka Calculator",
  },
  {
    title: "COT Report",
    desc: "Lihat positioning futures dari data CFTC.",
    href: "/dashboard/cot",
    icon: BarChart3,
    cta: "Buka COT",
  },
];

export function DashboardOverview() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Pembayaran berhasil! Akses Pro sudah aktif. 🎉");
      // Clear query param so refresh doesn't re-trigger
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Pilih tool analisis XAUUSD.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Card key={action.href} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.desc}</p>
              </div>
              <action.icon className="h-5 w-5 shrink-0 text-primary" />
            </div>
            <Button className="mt-4 w-full" render={<Link href={action.href} />}>
              <Zap className="mr-2 h-4 w-4" /> {action.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
