import { Suspense } from "react";
import { PricingPage } from "@/components/pricing-page";

export const dynamic = "force-dynamic";

export default function PricingRoute() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-muted-foreground">Memuat...</div>}>
      <PricingPage />
    </Suspense>
  );
}
