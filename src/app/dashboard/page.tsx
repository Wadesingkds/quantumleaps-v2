import { Suspense } from "react";
import { PremiumGate } from "@/components/premium-gate";
import { DashboardOverview } from "@/components/dashboard-overview";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <PremiumGate>
      <DashboardOverview />
    </PremiumGate>
  );
}
