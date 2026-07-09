"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Setting = { key: string; value: Record<string, unknown>; updated_at: string };

export function SettingsContent() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/settings", { cache: "no-store" });
    if (r.ok) setSettings((await r.json()).settings ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggle(key: string, current: boolean) {
    setBusy(key);
    const r = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: { enabled: !current } }),
    });
    setBusy(null);
    if (r.ok) load();
    else alert("Failed: " + (await r.text()));
  }

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {settings.map((s) => {
        const enabled = (s.value as any)?.enabled;
        const amount = (s.value as any)?.amount;
        const perMin = (s.value as any)?.per_min;
        return (
          <div key={s.key} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <div className="font-medium">{s.key}</div>
              <div className="text-xs text-muted-foreground">
                {amount != null && `Rp ${amount.toLocaleString("id-ID")}`}
                {perMin != null && `${perMin}/min`}
                {typeof enabled === "boolean" && (enabled ? "enabled" : "disabled")}
              </div>
            </div>
            {typeof enabled === "boolean" && (
              <Button
                size="sm"
                variant={enabled ? "destructive" : "default"}
                disabled={busy === s.key}
                onClick={() => toggle(s.key, enabled)}
              >
                {enabled ? "Disable" : "Enable"}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
