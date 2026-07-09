"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Log = {
  id: number;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  before: unknown;
  after: unknown;
  reason: string | null;
  created_at: string;
};

export function LogsContent() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs?limit=100", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLogs(d?.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">Audit Trail</h2>
        <p className="text-xs text-muted-foreground">Every risky admin action is recorded here.</p>
      </div>
      <div className="divide-y divide-border">
        {logs.map((l) => (
          <div key={l.id} className="flex items-start justify-between gap-4 p-4 text-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {l.action}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {l.target_type}
                  {l.target_id ? `:${l.target_id.slice(0, 8)}` : ""}
                </span>
              </div>
              {l.reason && <div className="mt-1 text-xs text-muted-foreground">reason: {l.reason}</div>}
              {(l.before !== null || l.after !== null) && (
                <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-2 font-mono text-xs text-muted-foreground">
                  {JSON.stringify({ before: l.before, after: l.after }, null, 1)}
                </pre>
              )}
            </div>
            <div className="shrink-0 text-right font-mono text-xs text-muted-foreground">
              {new Date(l.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No audit logs yet</div>
        )}
      </div>
    </div>
  );
}
