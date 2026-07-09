import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin, type AdminRole } from "@/lib/authz";
import { getAdminClient } from "@/lib/supabase-admin";
import { audit } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { tier, reason } = body as {
    tier?: string;
    reason?: string;
  };

  const admin = getAdminClient();

  // capture before-state
  const { data: before } = await admin
    .from("profiles")
    .select("tier, is_admin")
    .eq("id", id)
    .single();

  const changes: Record<string, unknown> = {};
  if (tier && ["free", "pro", "admin"].includes(tier)) changes.tier = tier;

  // role change (tier=admin) is owner-only
  if (tier === "admin" && guard.role !== "owner") {
    return NextResponse.json({ error: "Owner only" }, { status: 403 });
  }

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await admin.from("profiles").update(changes).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit({
    actor_id: user!.id,
    action: "user_update",
    target_type: "profile",
    target_id: id,
    before,
    after: changes,
    reason,
  });

  return NextResponse.json({ ok: true, changes });
}
