"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Calculator, Home, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Scanner", href: "/dashboard/scanner", icon: Activity },
  { label: "Calculator", href: "/dashboard/calculator", icon: Calculator },
  { label: "COT Report", href: "/dashboard/cot", icon: BarChart3 },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </span>
      QuantumLeaps
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <Nav />
        <div className="absolute bottom-0 w-full border-t border-border p-4">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" render={<Link href="/auth/signout" />}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:hidden">
          <Logo />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close menu" />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-border px-6">
                <Logo />
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Nav onNavigate={() => setOpen(false)} />
              <div className="mt-auto border-t border-border p-4">
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" render={<Link href="/auth/signout" />}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
