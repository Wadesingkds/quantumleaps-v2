import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Only allow internal, absolute-path redirects (no protocol-relative //evil.com)
function safeRedirect(target: string | null, fallback = "/dashboard"): string {
  if (!target) return fallback;
  // Must start with single slash and NOT // (protocol-relative)
  if (target.startsWith("/") && !target.startsWith("//")) return target;
  return fallback;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedRedirect = safeRedirect(requestUrl.searchParams.get("redirect"));

  let redirect = requestedRedirect;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Upsert profile on first login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email!,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      // Pro/Admin users should land on the dashboard, not pricing.
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier, is_pro")
        .eq("id", user.id)
        .single();

      if (profile?.is_pro || profile?.tier === "pro" || profile?.tier === "admin") {
        redirect = "/dashboard";
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${redirect}`);
}
