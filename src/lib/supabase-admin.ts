import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Server-side ONLY (webhook, API routes).
// NEVER import this into client components.
// Return type is `any` to avoid strict table-type inference (project has no
// generated Database types, so `.from()` would infer `never`).

let cached: any = null;

export function getAdminClient(): any {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
