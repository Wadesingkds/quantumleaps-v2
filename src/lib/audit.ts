import { getAdminClient } from "@/lib/supabase-admin";

type AuditEvent = {
  actor_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

// Best-effort audit write. Failures are logged server-side but do NOT block
// the primary action (so a logging outage can't break admin ops).
export async function audit(event: AuditEvent): Promise<void> {
  try {
    const admin = getAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_id: event.actor_id,
      action: event.action,
      target_type: event.target_type ?? null,
      target_id: event.target_id ?? null,
      before: event.before ?? null,
      after: event.after ?? null,
      reason: event.reason ?? null,
    });
  } catch (e) {
    console.error("[audit] failed to write log:", e);
  }
}
