import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/authz";
import { getAdminClient } from "@/lib/supabase-admin";

export async function GET(
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
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("payments")
    .select("id, order_id, amount, fee, payment_method, status, created_at, completed_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data ?? [] });
}
