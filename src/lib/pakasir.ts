// Pakasir payment gateway helper.
// Docs: https://pakasir.com/p/docs (updated 03 Jul 2026)
// IMPORTANT: api_key is server-side only — never import into client code.

const PAKASIR_BASE = "https://app.pakasir.com";

export const PAKASIR_SLUG = process.env.PAKASIR_SLUG || "quantum-leaps";
export const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY || "";
// sandbox | production. Sandbox auto-fires webhook via /api/paymentsimulation.
export const PAKASIR_MODE = process.env.PAKASIR_MODE || "production";
export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://quantumleaps.biz.id";

export const PRO_AMOUNT = 500000; // Rp 500.000 / bulan

export type PakasirPayment = {
  project: string;
  order_id: string;
  amount: number;
  fee: number;
  total_payment: number;
  payment_method: string;
  payment_number: string; // QRIS string or VA number
  expired_at: string;
};

export async function createTransaction(
  orderId: string,
  amount: number,
  method = "qris"
): Promise<PakasirPayment> {
  const res = await fetch(`${PAKASIR_BASE}/api/transactioncreate/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: PAKASIR_SLUG,
      order_id: orderId,
      amount,
      api_key: PAKASIR_API_KEY,
    }),
  });
  const data = await res.json();
  if (!data.payment) {
    throw new Error("Pakasir transactioncreate failed: " + JSON.stringify(data));
  }
  return data.payment as PakasirPayment;
}

// Hosted checkout URL. User lands here; Pakasir handles QR/VA UI.
export function checkoutUrl(orderId: string, amount: number): string {
  const redirect = `${WEBSITE_URL}/dashboard?payment=success&order_id=${encodeURIComponent(
    orderId
  )}`;
  return `${PAKASIR_BASE}/pay/${encodeURIComponent(
    PAKASIR_SLUG
  )}/${amount}?order_id=${encodeURIComponent(orderId)}&redirect=${encodeURIComponent(
    redirect
  )}`;
}

// Sandbox-only: trigger webhook server-side so user becomes Pro immediately.
export async function simulatePayment(
  orderId: string,
  amount: number
): Promise<void> {
  if (PAKASIR_MODE !== "sandbox") return;
  await fetch(`${PAKASIR_BASE}/api/paymentsimulation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: PAKASIR_SLUG,
      order_id: orderId,
      amount,
      api_key: PAKASIR_API_KEY,
    }),
  });
}

export async function cancelTransaction(
  orderId: string,
  amount: number
): Promise<void> {
  await fetch(`${PAKASIR_BASE}/api/transactioncancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project: PAKASIR_SLUG,
      order_id: orderId,
      amount,
      api_key: PAKASIR_API_KEY,
    }),
  });
}

// Verify a completed payment directly with Pakasir (don't trust webhook blindly).
export async function verifyTransaction(
  orderId: string,
  amount: number
): Promise<boolean> {
  const url = `${PAKASIR_BASE}/api/transactiondetail?project=${encodeURIComponent(
    PAKASIR_SLUG
  )}&amount=${amount}&order_id=${encodeURIComponent(orderId)}&api_key=${PAKASIR_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.transaction?.status === "completed";
}

export function isSandbox(): boolean {
  return PAKASIR_MODE === "sandbox";
}
