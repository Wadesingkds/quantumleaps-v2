import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPaths = ["/dashboard"];
const adminPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAdmin) return NextResponse.next();

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[middleware] user:", user?.id ?? "NULL");

  // No user → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    console.log("[middleware] admin profile:", JSON.stringify(profile));
    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Premium gate: free users (logged in) → /pricing
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, is_pro")
    .eq("id", user.id)
    .single();

  console.log(
    "[middleware] profile:",
    JSON.stringify(profile),
    "err:",
    profileError?.message ?? "none"
  );

  const isPro =
    profile?.is_pro || profile?.tier === "pro" || profile?.tier === "admin";

  console.log("[middleware] isPro:", isPro);

  if (!isPro) {
    const url = request.nextUrl.clone();
    url.pathname = "/pricing";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
