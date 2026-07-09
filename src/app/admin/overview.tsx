"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Stats = { totalUsers: number; proUsers: number; paymentFailures: number; scansToday: number };

export function OverviewContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !stats) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0 },
    { label: "Pro Users", value: stats?.proUsers ?? 0 },
    { label: "Scans Today", value: stats?.scansToday ?? 0 },
    { label: "Payment Failures", value: stats?.paymentFailures ?? 0, danger: (stats?.paymentFailures ?? 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className={`mt-2 font-mono text-2xl font-bold ${c.danger ? "text-red-500" : ""}`}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Quick actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the sidebar to manage users, view scan activity, edit settings, toggle feature flags, and review the audit log.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/users")}>
            Manage Users
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/logs")}>
            View Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
}
