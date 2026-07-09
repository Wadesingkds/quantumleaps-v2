import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/authz";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const admin = getAdminClient();

  let query = admin
    .from("profiles")
    .select("id, email, tier, is_pro, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) query = query.ilike("email", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data ?? [] });
}
