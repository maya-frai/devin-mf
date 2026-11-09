import { getRow, list, type Row } from "@/core/store";

// Mock payments connector (replaces a Power Apps custom connector).
// TODO: swap for the real PSP client behind these same functions.
export type Payment = Row & {
  customer: string;
  email: string;
  amountCents: number;
  currency: string;
  method: string;
  createdAt: string;
  status: "settled" | "refunded";
  refundId?: string;
  refundReason?: string;
};

export function listPayments(): Payment[] {
  return list<Payment>("payments");
}

export function getPayment(id: string): Payment {
  return getRow<Payment>("payments", id);
}

export async function refundPayment(id: string): Promise<{ refundId: string }> {
  getPayment(id);
  return { refundId: `re_${id.slice(-4)}${Date.now().toString(36).slice(-4)}` };
}
