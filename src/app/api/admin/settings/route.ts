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
  const { data, error } = await admin.from("app_settings").select("key, value, updated_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data ?? [] });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;

  const { key, value } = await request.json().catch(() => ({}));
  if (!key || typeof value === "undefined") {
    return NextResponse.json({ error: "key + value required" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: before } = await admin.from("app_settings").select("value").eq("key", key).single();
  const { error } = await admin
    .from("app_settings")
    .update({ value, updated_by: user!.id, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit({
    actor_id: user!.id,
    action: "settings_update",
    target_type: "app_settings",
    target_id: key,
    before,
    after: { value },
  });

  return NextResponse.json({ ok: true });
}
