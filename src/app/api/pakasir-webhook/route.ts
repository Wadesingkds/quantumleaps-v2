import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { verifyTransaction, PAKASIR_SLUG, isSandbox } from "@/lib/pakasir";

export const runtime = "nodejs";

// Simple in-memory rate limit (per process). Free tier has no webhook signing.
const hits = new Map<string, number[]>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > 30; // max 30/min per IP
}

const ALLOWED_STATUSES = [
  "pending",
  "completed",
  "expired",
  "failed",
  "cancelled",
];

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }

    const body = (await request.json()) as {
      order_id?: string;
      status?: string;
      project?: string;
      payment_method?: string;
      completed_at?: string;
    };

    const { order_id, status, project, payment_method, completed_at } = body;

    // Schema validation
    if (typeof order_id !== "string" || !order_id.startsWith("QL-")) {
      return NextResponse.json({ error: "Invalid order_id" }, { status: 400 });
    }
    if (!ALLOWED_STATUSES.includes(status || "")) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    // Cross-project spoofing defense
    if (project !== undefined && project !== PAKASIR_SLUG) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 });
    }

    const admin = getAdminClient();
    const payments = admin.from("payments") as any;

    // Non-completed: just record status
    if (status !== "completed") {
      await payments
        .update({ status })
        .eq("order_id", order_id);
      return NextResponse.json({ ok: true });
    }

    const { data: payment } = await payments
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (payment.status === "completed") {
      return NextResponse.json({ ok: true, status: "already_processed" });
    }

    // Verify with Pakasir (don't trust webhook blindly).
    // In sandbox mode, skip external verification (no real transaction exists).
    if (!isSandbox()) {
      const verified = await verifyTransaction(order_id, payment.amount);
      if (!verified) {
        return NextResponse.json(
          { error: "Payment not verified by Pakasir" },
          { status: 400 }
        );
      }
    }

    const completedAt = completed_at || new Date().toISOString();

    await payments
      .update({
        status: "completed",
        payment_method: payment_method || payment.payment_method,
        completed_at: completedAt,
      })
      .eq("order_id", order_id);

    await admin
      .from("profiles")
      .update({
        is_pro: true,
        tier: "pro",
        pro_activated_at: completedAt,
        pro_order_id: order_id,
        updated_at: completedAt,
      })
      .eq("id", payment.user_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[pakasir-webhook]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal error" },
      { status: 500 }
    );
  }
}
