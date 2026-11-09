import { getPayment, listPayments, refundPayment } from "@/adapters/payments";
import { pendingApprovalFor, requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import { updateRow } from "@/core/store";
import type { User } from "@/core/users";

export const AUTO_REFUND_LIMIT_CENTS = 50_000; // $500
export const ANALYST_DAILY_LIMIT_CENTS = 200_000; // $2,000 of instant refunds per analyst per day
export const REFUND_REASONS = ["Customer request", "Duplicate charge", "Fraud", "Service issue", "Other"];

const today = () => new Date().toISOString().slice(0, 10);

export function refundedToday(user: User): number {
  return listPayments()
    .filter((p) => p.refundedBy === user.id && p.refundedOn === today())
    .reduce((sum, p) => sum + p.amountCents, 0);
}

export const formatUsd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export type RefundResult =
  | { status: "refunded"; refundId: string }
  | { status: "pending_approval"; approvalId: string; overDailyLimit: boolean };

// Up to $500 refunds immediately, until an analyst passes $2,000 in a day.
// Everything else needs an ops lead who isn't the requester.
export async function requestRefund(
  user: User,
  paymentId: string,
  reason: string,
): Promise<RefundResult> {
  assertCan(user, "refunds.request");
  if (!REFUND_REASONS.includes(reason)) throw new Error("Choose a reason from the list");
  const payment = getPayment(paymentId);
  const target = `payments/${paymentId}`;
  if (payment.status !== "settled") throw new Error("Payment is already refunded");
  if (pendingApprovalFor(target)) throw new Error("A refund is already awaiting approval");

  logAudit(user, "refunds.requested", target, { amount: payment.amountCents, reason });
  const overDailyLimit =
    user.role === "ops_analyst" && refundedToday(user) + payment.amountCents > ANALYST_DAILY_LIMIT_CENTS;
  if (payment.amountCents <= AUTO_REFUND_LIMIT_CENTS && !overDailyLimit) {
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
  return { status: "pending_approval", approvalId: approval.id, overDailyLimit };
}

export async function completeRefund(user: User, paymentId: string, reason: string) {
  const { refundId } = await refundPayment(paymentId);
  updateRow("payments", paymentId, {
    status: "refunded",
    refundId,
    refundReason: reason,
    refundedBy: user.id,
    refundedOn: today(),
  });
  logAudit(user, "refunds.issued", `payments/${paymentId}`, { refundId });
  return refundId;
}
