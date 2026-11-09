import { getPayment, refundPayment } from "@/adapters/payments";
import { pendingApprovalFor, requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import { create, getRow, list, newId, updateRow, type Row } from "@/core/store";
import type { User } from "@/core/users";
import { approvalNeeded, formatUsd, REFUND_REASONS } from "./rules";

export * from "./rules";

export type Refund = Row & {
  paymentId: string;
  customer: string;
  amountCents: number;
  reason: string;
  notes: string;
  status: "completed" | "pending_approval" | "rejected";
  requestedBy: string;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  approvalId?: string;
};

export type RefundInput = { paymentId: string; amountCents?: number; reason: string; notes?: string; idempotencyKey?: string };

export const listRefunds = () => list<Refund>("refunds");
const today = () => new Date().toISOString().slice(0, 10);

/** Instant (unapproved) refunds this user completed today. */
export function refundedToday(user: User): number {
  return listRefunds()
    .filter((r) => r.requestedBy === user.id && r.status === "completed" && !r.decidedBy && r.createdAt.startsWith(today()))
    .reduce((sum, r) => sum + r.amountCents, 0);
}

export async function requestRefund(user: User, input: RefundInput) {
  assertCan(user, "refunds.request");
  if (!REFUND_REASONS.includes(input.reason)) throw new Error("Choose a reason from the list");
  const payment = getPayment(input.paymentId);
  const left = payment.amountCents - payment.refundedCents;
  const amountCents = input.amountCents ?? left;
  if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > left) {
    throw new Error(`Amount must be between $0.01 and ${formatUsd(left)}`);
  }
  const target = `payments/${payment.id}`;
  if (pendingApprovalFor(target)) throw new Error("A refund is already awaiting approval");

  const why = approvalNeeded(user.role, amountCents, refundedToday(user));
  const refund = create<Refund>("refunds", {
    id: newId("rf"), paymentId: payment.id, customer: payment.customer, amountCents, reason: input.reason,
    notes: input.notes ?? "", status: "pending_approval", requestedBy: user.id, createdAt: new Date().toISOString(),
  });
  logAudit({ actor: user, tool: "refunds", action: "refunds.requested", entityId: target, after: { refund: refund.id, amountCents }, reason: input.reason });

  if (!why) {
    await completeRefund(user, refund.id, input.idempotencyKey ?? refund.id);
    return { status: "refunded" as const };
  }
  const approval = requestApproval(user, {
    tool: "refunds", action: "refunds.issue", target, permission: "refunds.approve", payload: { refundId: refund.id },
    summary: `Refund ${formatUsd(amountCents)} to ${payment.customer}: ${input.reason}`, reason: input.reason,
  });
  updateRow<Refund>("refunds", refund.id, { approvalId: approval.id });
  return { status: "pending_approval" as const, approvalId: approval.id, overDailyLimit: why === "daily_limit" };
}

export async function completeRefund(user: User, refundId: string, idempotencyKey: string, approved = false) {
  const refund = getRow<Refund>("refunds", refundId);
  const payment = getPayment(refund.paymentId);
  const before = { status: payment.status, refundedCents: payment.refundedCents };
  await refundPayment(refund.paymentId, refund.amountCents, idempotencyKey);
  updateRow<Refund>("refunds", refundId, { status: "completed", decidedAt: new Date().toISOString(), ...(approved ? { decidedBy: user.id } : {}) });
  logAudit({
    actor: user, tool: "refunds", action: "refunds.issued", entityId: `payments/${refund.paymentId}`,
    before, after: { status: payment.status, refundedCents: payment.refundedCents }, reason: refund.reason,
  });
}

export function rejectRefund(user: User, refundId: string) {
  const refund = getRow<Refund>("refunds", refundId);
  updateRow<Refund>("refunds", refundId, { status: "rejected", decidedAt: new Date().toISOString(), decidedBy: user.id });
  logAudit({ actor: user, tool: "refunds", action: "refunds.rejected", entityId: `payments/${refund.paymentId}`, before: { status: "pending_approval" }, after: { status: "rejected" }, reason: refund.reason });
}
