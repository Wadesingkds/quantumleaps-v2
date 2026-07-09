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
  status: string | null;
  created_at: string;
};

export function UsersContent() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`, { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      setUsers(d.users ?? []);
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
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
              <TableHead>Action</TableHead>
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
                  {editing === u.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" disabled={busy} onClick={() => updateTier(u.id, "pro")}>
                        Make Pro
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => updateTier(u.id, "free")}>
                        Make Free
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(u.id)}>
                      Manage
                    </Button>
                  )}
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
    </div>
  );
}
