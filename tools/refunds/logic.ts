import { getPayment, refundPayment } from "@/adapters/payments";
import { pendingApprovalFor, requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import { updateRow } from "@/core/store";
import type { User } from "@/core/users";

export const AUTO_REFUND_LIMIT_CENTS = 50_000; // $500

export const formatUsd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export type RefundResult =
  | { status: "refunded"; refundId: string }
  | { status: "pending_approval"; approvalId: string };

// Up to $500 refunds immediately. Above $500 needs an ops lead who isn't the requester.
export async function requestRefund(
  user: User,
  paymentId: string,
  reason: string,
): Promise<RefundResult> {
  assertCan(user, "refunds.request");
  if (!reason.trim()) throw new Error("A reason is required");
  const payment = getPayment(paymentId);
  const target = `payments/${paymentId}`;
  if (payment.status !== "settled") throw new Error("Payment is already refunded");
  if (pendingApprovalFor(target)) throw new Error("A refund is already awaiting approval");

  logAudit(user, "refunds.requested", target, { amount: payment.amountCents, reason });
  if (payment.amountCents <= AUTO_REFUND_LIMIT_CENTS) {
    return { status: "refunded", refundId: await completeRefund(user, paymentId, reason) };
  }
  const approval = requestApproval(user, {
    tool: "refunds",
    action: "refunds.issue",
    target,
    summary: `Refund ${formatUsd(payment.amountCents)} to ${payment.customer}: ${reason}`,
    permission: "refunds.approve",
    payload: { paymentId, reason },
  });
  return { status: "pending_approval", approvalId: approval.id };
}

export async function completeRefund(user: User, paymentId: string, reason: string) {
  const { refundId } = await refundPayment(paymentId);
  updateRow("payments", paymentId, { status: "refunded", refundId, refundReason: reason });
  logAudit(user, "refunds.issued", `payments/${paymentId}`, { refundId });
  return refundId;
}
