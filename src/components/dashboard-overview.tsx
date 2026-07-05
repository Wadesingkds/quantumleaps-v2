"use client";

import Link from "next/link";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardOverview() {
  const stats = [
    { label: "Scans Today", value: "24", change: "+12%", trend: "up" },
    { label: "Win Rate", value: "68%", change: "+5%", trend: "up" },
    { label: "Avg Score", value: "6.8", change: "-0.2", trend: "down" },
  ];

  const recentScans = [
    { pair: "XAUUSD", tf: "15M", signal: "SELL", score: 8, time: "2 min ago" },
    { pair: "XAUUSD", tf: "1H", signal: "BUY", score: 7, time: "15 min ago" },
    { pair: "XAUUSD", tf: "4H", signal: "SELL", score: 6, time: "1 hour ago" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview statistik dan aktivitas scanner</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <TrendingUp
                className={`h-8 w-8 ${
                  stat.trend === "up"
                    ? "text-signal-buy rotate-0"
                    : "text-signal-sell rotate-180"
                }`}
              />
            </div>
            <p
              className={`mt-2 text-sm ${
                stat.trend === "up" ? "text-signal-buy" : "text-signal-sell"
              }`}
            >
              {stat.change} dari kemarin
            </p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Scanner Confluence</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Hitung level confluence XAUUSD dengan Gann + SMC
              </p>
            </div>
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <Button className="mt-4 w-full" render={<Link href="/dashboard/scanner" />}>
            <Zap className="mr-2 h-4 w-4" /> Buka Scanner
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Recent Activity</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {recentScans.length} scan dalam 24 jam terakhir
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {recentScans.map((scan, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{scan.pair}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {scan.tf}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={scan.signal === "BUY" ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    {scan.signal}
                  </Badge>
                  <span className="font-mono text-sm font-bold text-signal-buy">
                    {scan.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
