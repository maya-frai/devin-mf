import { create, get, getRow, list, updateRow, type Row } from "@/core/store";

// Mock payments connector (replaces a Power Apps custom connector).
// TODO: swap for the real PSP client behind these same functions.
export type Payment = Row & {
  customer: string;
  email: string;
  amountCents: number;
  currency: string;
  method: string;
  createdAt: string;
  status: "settled" | "partially_refunded" | "refunded";
  refundedCents: number;
};

export function listPayments(): Payment[] {
  return list<Payment>("payments");
}

export function getPayment(id: string): Payment {
  return getRow<Payment>("payments", id);
}

// Refunds once per idempotency key: a retry with the same key returns the first result.
export async function refundPayment(paymentId: string, amountCents: number, idempotencyKey: string) {
  const seen = get<Row & { refundId: string }>("idempotency_keys", idempotencyKey);
  if (seen) return { refundId: seen.refundId, duplicate: true };

  const payment = getPayment(paymentId);
  const left = payment.amountCents - payment.refundedCents;
  if (amountCents > left) throw new Error("Amount is more than what's left to refund");
  const refundedCents = payment.refundedCents + amountCents;
  updateRow<Payment>("payments", paymentId, {
    refundedCents,
    status: refundedCents === payment.amountCents ? "refunded" : "partially_refunded",
  });
  const refundId = `re_${paymentId.slice(-4)}${Date.now().toString(36).slice(-4)}`;
  create("idempotency_keys", { id: idempotencyKey, refundId });
  return { refundId, duplicate: false };
}
