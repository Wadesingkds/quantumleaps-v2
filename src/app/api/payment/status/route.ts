import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

// Returns current user's premium status. Frontend polls this after returning
// from Pakasir hosted checkout (webhook race condition).
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ is_pro: false, logged_in: false });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, is_pro")
      .eq("id", user.id)
      .single();

    const isPro =
      !!profile?.is_pro || profile?.tier === "pro" || profile?.tier === "admin";

    return NextResponse.json({
      is_pro: isPro,
      logged_in: true,
      tier: profile?.tier ?? "free",
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
