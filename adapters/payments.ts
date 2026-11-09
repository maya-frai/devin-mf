// Mock payments connector (replaces a Power Apps custom connector).
// TODO: swap for the real PSP client; keep the same function signatures.
export type RefundResult = { refundId: string; status: "succeeded" | "failed" };

export async function issueRefund(input: {
  paymentId: string;
  amountCents: number;
  currency: string;
}): Promise<RefundResult> {
  const ok = input.amountCents > 0;
  return {
    refundId: `re_${input.paymentId.slice(-4)}${Date.now().toString(36).slice(-4)}`,
    status: ok ? "succeeded" : "failed",
  };
}
