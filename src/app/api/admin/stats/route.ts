import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/authz";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;

  const admin = getAdminClient();
  const [users, pro, payFail] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).or("tier.eq.pro,is_pro.eq.true"),
    admin.from("payments").select("id", { count: "exact", head: true }).eq("status", "failed"),
  ]);

  // scans today — derive from payments/created or a scans table if present
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const scansToday = await admin
    .from("payments")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    proUsers: pro.count ?? 0,
    paymentFailures: payFail.count ?? 0,
    scansToday: scansToday.count ?? 0,
  });
}
