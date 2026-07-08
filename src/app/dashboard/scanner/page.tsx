import { Suspense } from "react";
import { PremiumGate } from "@/components/premium-gate";
import { ScannerView } from "@/components/scanner-view";

export const dynamic = "force-dynamic";

export default function ScannerPage() {
  return (
    <PremiumGate>
      <ScannerView />
    </PremiumGate>
  );
}
