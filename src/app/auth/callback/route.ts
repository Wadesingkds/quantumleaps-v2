import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
  // Response that carries refreshed auth cookies from Supabase.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

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

  // Forward refreshed auth cookies into the redirect response.
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    finalRes.cookies.set(name, value);
  });
  return finalRes;
}
