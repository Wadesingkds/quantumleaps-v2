import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/authz";
import { getAdminClient } from "@/lib/supabase-admin";
import { audit } from "@/lib/audit";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("feature_flags")
    .select("key, enabled, description, owner, rollout_pct, updated_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ flags: data ?? [] });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;

  const { key, enabled, rollout_pct } = await request.json().catch(() => ({}));
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const admin = getAdminClient();
  const { data: before } = await admin.from("feature_flags").select("*").eq("key", key).single();
  const update: Record<string, unknown> = { updated_by: user!.id, updated_at: new Date().toISOString() };
  if (typeof enabled === "boolean") update.enabled = enabled;
  if (typeof rollout_pct === "number") update.rollout_pct = rollout_pct;

  const { error } = await admin.from("feature_flags").update(update).eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit({
    actor_id: user!.id,
    action: "flag_update",
    target_type: "feature_flags",
    target_id: key,
    before,
    after: update,
  });

  return NextResponse.json({ ok: true });
}
