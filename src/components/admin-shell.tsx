"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, History, Shield, Users, BarChart3, Key, Settings, LogOut, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: Shield, active: true },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Scans", href: "/admin/scans", icon: BarChart3 },
  { label: "API Keys", href: "/admin/keys", icon: Key },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// ponytail: mock data — replace with /api/admin/* when backend wired
const stats = [
  { label: "Total Users", value: "1,248" },
  { label: "Pro Users", value: "89" },
  { label: "Total Scans", value: "15,432" },
  { label: "Scans Today", value: "328" },
];

const users = [
  { id: 1, email: "budi@gmail.com", joined: "2026-06-01", plan: "pro", lastSign: "2 jam lalu", status: "active" },
  { id: 2, email: "siti@gmail.com", joined: "2026-06-15", plan: "free", lastSign: "1 hari lalu", status: "active" },
  { id: 3, email: "agus@gmail.com", joined: "2026-06-20", plan: "free", lastSign: "5 hari lalu", status: "inactive" },
  { id: 4, email: "rina@gmail.com", joined: "2026-06-28", plan: "pro", lastSign: "30 menit lalu", status: "active" },
];

const scans = [
  { id: 1, user: "budi@gmail.com", tf: "15M", score: 8, entry: "Sell 4,369.66" },
  { id: 2, user: "rina@gmail.com", tf: "1H", score: 6, entry: "Buy 4,306.11" },
  { id: 3, user: "siti@gmail.com", tf: "4H", score: 5, entry: "Sell 4,412.30" },
];

export function AdminShell() {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navList = adminNav.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        item.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <item.icon className="h-4 w-4" />
      {item.label}
    </Link>
  ));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-3.5 w-3.5" />
          </span>
          Admin
        </div>
        <nav className="flex-1 space-y-1 p-4">{navList}</nav>
        <div className="space-y-1 border-t border-border p-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <Activity className="h-4 w-4" /> Back to App
          </Link>
          <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-6 font-bold tracking-tight">
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-3.5 w-3.5" />
                </span>
                Admin
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 p-4">{navList}</nav>
            <div className="space-y-1 border-t border-border p-4">
              <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                <Activity className="h-4 w-4" /> Back to App
              </Link>
              <Link href="/login" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogOut className="h-4 w-4" /> Sign Out
              </Link>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage users, scans, API keys, and settings.</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Shield className="h-3 w-3" /> Admin
          </Badge>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="scans">Scans</TabsTrigger>
              </TabsList>
            </Tabs>

            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="mt-2 font-mono text-2xl font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h2 className="font-semibold">Recent Scans</h2>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>TF</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Best Entry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scans.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                          <TableCell className="text-sm">{s.user}</TableCell>
                          <TableCell><Badge variant="outline" className="font-mono">{s.tf}</Badge></TableCell>
                          <TableCell className={`font-mono font-bold ${s.score >= 7 ? "text-signal-buy" : s.score >= 4 ? "text-primary" : "text-muted-foreground"}`}>{s.score}/10</TableCell>
                          <TableCell className="font-mono text-sm">{s.entry}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Cari user..." className="pl-9" />
                  </div>
                  <Button variant="outline" size="sm">Refresh</Button>
                </div>
                <div className="rounded-xl border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{u.id}</TableCell>
                          <TableCell className="text-sm font-medium">{u.email}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{u.joined}</TableCell>
                          <TableCell>
                            <Badge variant={u.plan === "pro" ? "default" : "secondary"} className="uppercase">
                              {u.plan}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.lastSign}</TableCell>
                          <TableCell>
                            <Badge variant={u.status === "active" ? "outline" : "secondary"} className="gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-signal-buy" : "bg-muted-foreground"}`} />
                              {u.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {tab === "scans" && (
              <div className="rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>TF</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Best Entry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                        <TableCell className="text-sm">{s.user}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono">{s.tf}</Badge></TableCell>
                        <TableCell className={`font-mono font-bold ${s.score >= 7 ? "text-signal-buy" : s.score >= 4 ? "text-primary" : "text-muted-foreground"}`}>{s.score}/10</TableCell>
                        <TableCell className="font-mono text-sm">{s.entry}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
