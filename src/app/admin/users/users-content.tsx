"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserRow = {
  id: string;
  email: string | null;
  tier: string;
  is_pro: boolean;
  is_admin: boolean;
  created_at: string;
};

type Payment = {
  id: string;
  order_id: string;
  amount: number;
  fee: number;
  payment_method: string;
  status: string;
  created_at: string;
};

export function UsersContent() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [paymentsFor, setPaymentsFor] = useState<{ email: string; rows: Payment[] } | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [u, me] = await Promise.all([
      fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : { users: [] })),
      fetch("/api/admin/me", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { id: null })).catch(() => ({ id: null })),
    ]);
    setUsers(u.users ?? []);
    setMyId(me.id ?? null);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateTier(id: string, tier: string) {
    setBusy(true);
    const reason = prompt("Reason for tier change?");
    if (reason === null) {
      setBusy(false);
      return;
    }
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, reason }),
    });
    setBusy(false);
    if (r.ok) {
      setEditing(null);
      load();
    } else {
      alert("Failed: " + (await r.text()));
    }
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`DELETE user ${email}? This removes their profile + auth account. Cannot be undone.`)) return;
    const reason = prompt("Reason for deletion?");
    if (reason === null) return;
    setBusy(true);
    const r = await fetch(`/api/admin/users/${id}?reason=${encodeURIComponent(reason)}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) load();
    else alert("Failed: " + (await r.text()));
  }

  async function viewPayments(id: string, email: string) {
    setPaymentsLoading(true);
    setPaymentsFor({ email, rows: [] });
    const r = await fetch(`/api/admin/users/${id}/payments`, { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setPaymentsFor({ email, rows: d.payments ?? [] });
    }
    setPaymentsLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Cari email..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-sm font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.tier === "pro" || u.tier === "admin" ? "default" : "secondary"} className="uppercase">
                    {u.tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase">
                    {u.is_admin ? "admin" : "active"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => viewPayments(u.id, u.email ?? u.id)}>
                      Payments
                    </Button>
                    {editing === u.id ? (
                      <>
                        <Button size="sm" disabled={busy} onClick={() => updateTier(u.id, "pro")}>
                          Make Pro
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => updateTier(u.id, "free")}>
                          Make Free
                        </Button>
                        {myId !== u.id && (
                          <Button size="sm" variant="secondary" disabled={busy} onClick={() => updateTier(u.id, "admin")}>
                            Make Admin
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(u.id)}>
                        Manage
                      </Button>
                    )}
                    {myId !== u.id && (
                      <Button size="sm" variant="destructive" disabled={busy} onClick={() => deleteUser(u.id, u.email ?? u.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paymentsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPaymentsFor(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Payments — {paymentsFor.email}</h3>
              <Button size="sm" variant="ghost" onClick={() => setPaymentsFor(null)}>
                Close
              </Button>
            </div>
            {paymentsLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : paymentsFor.rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payments</div>
            ) : (
              <div className="space-y-2">
                {paymentsFor.rows.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono text-xs">{p.order_id}</span>
                      <Badge variant={p.status === "completed" ? "default" : "secondary"} className="uppercase">
                        {p.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Rp {p.amount.toLocaleString("id-ID")} · {p.payment_method} · {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
