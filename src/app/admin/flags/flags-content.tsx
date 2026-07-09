"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Flag = {
  key: string;
  enabled: boolean;
  description: string | null;
  owner: string | null;
  rollout_pct: number;
  updated_at: string;
};

export function FlagsContent() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/flags", { cache: "no-store" });
    if (r.ok) setFlags((await r.json()).flags ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggle(f: Flag) {
    setBusy(f.key);
    const r = await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: f.key, enabled: !f.enabled }),
    });
    setBusy(null);
    if (r.ok) {
      toast.success(`${f.key} ${!f.enabled ? "on" : "off"}`);
      load();
    } else {
      toast.error("Failed: " + (await r.text()));
    }
  }

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {flags.map((f) => (
        <div key={f.key} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <div className="font-medium">{f.key}</div>
            <div className="text-xs text-muted-foreground">{f.description}</div>
            <div className="mt-1 text-xs text-muted-foreground">owner: {f.owner}</div>
          </div>
          <Button
            size="sm"
            variant={f.enabled ? "destructive" : "default"}
            disabled={busy === f.key}
            onClick={() => toggle(f)}
          >
            {f.enabled ? "Turn Off" : "Turn On"}
          </Button>
        </div>
      ))}
    </div>
  );
}

