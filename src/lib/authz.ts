import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";

export type AdminRole = "owner" | "admin";

// Owner = tier 'admin' (full). Admin = is_admin true (limited).
// Returns the caller's role, or null if not an admin at all.
export async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("tier, is_admin")
    .eq("id", userId)
    .single();
  if (!data) return null;
  if (data.tier === "admin") return "owner";
  if (data.is_admin === true) return "admin";
  return null;
}

// Guard for API routes. Pass required role. Owner satisfies any requirement.
export async function requireAdmin(
  userId: string | undefined,
  required: AdminRole = "admin"
): Promise<{ ok: true; role: AdminRole } | { ok: false; response: NextResponse }> {
  if (!userId) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = await getAdminRole(userId);
  if (!role) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (required === "owner" && role !== "owner") {
    return { ok: false, response: NextResponse.json({ error: "Owner only" }, { status: 403 }) };
  }
  return { ok: true, role };
}
