import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAdminClient } from "@/lib/supabase-admin";
import {
  createTransaction,
  checkoutUrl,
  simulatePayment,
  PRO_AMOUNT,
  PAKASIR_SLUG,
  isSandbox,
} from "@/lib/pakasir";

export const runtime = "nodejs";

function userIdShort(id: string): string {
  return id.replace(/-/g, "").slice(0, 8);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Idempotent: already Pro → return success, don't create new payment.
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, is_pro")
      .eq("id", user.id)
      .single();

    if (profile?.is_pro || profile?.tier === "pro" || profile?.tier === "admin") {
      return NextResponse.json({
        ok: true,
        alreadyPro: true,
        redirectUrl: "/dashboard?payment=already_pro",
      });
    }

    const method = "qris";
    const orderId = `QL-${Date.now()}-${userIdShort(user.id)}`;
    const amount = PRO_AMOUNT;

    const payment = await createTransaction(orderId, amount, method);

    const admin = getAdminClient();
    await admin.from("payments").insert({
      user_id: user.id,
      order_id: orderId,
      amount: payment.amount,
      fee: payment.fee ?? 0,
      payment_method: payment.payment_method,
      status: "pending",
      qr_string: payment.payment_number,
      expired_at: payment.expired_at,
    });

    const redirectUrl = checkoutUrl(orderId, amount);

    // Sandbox: auto-fire webhook so user becomes Pro immediately for testing.
    if (isSandbox()) {
      try {
        await simulatePayment(orderId, amount);
      } catch (e) {
        console.warn("[payment/create] sandbox simulate failed:", (e as Error).message);
      }
    }

    return NextResponse.json({
      ok: true,
      order_id: orderId,
      amount: payment.amount,
      fee: payment.fee ?? 0,
      total_payment: payment.total_payment,
      payment_method: payment.payment_method,
      payment_number: payment.payment_number,
      expired_at: payment.expired_at,
      is_sandbox: isSandbox(),
      redirectUrl,
    });
  } catch (err) {
    console.error("[payment/create]", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal error" },
      { status: 500 }
    );
  }
}
