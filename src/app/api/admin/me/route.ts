import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guard = await requireAdmin(user?.id);
  if (!guard.ok) return guard.response;
  return NextResponse.json({ id: user!.id, role: guard.role });
}
