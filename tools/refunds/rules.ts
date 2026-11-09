import { WORKFLOWS } from "@/config/workflows";
import type { Role } from "@/core/users";

// Refund rules, shared by the server logic and the dialog's "completes now / needs approval" preview.
// Values come from config/workflows.ts.
export const AUTO_REFUND_LIMIT_CENTS = WORKFLOWS.refunds.autoApproveLimitCents;
export const ANALYST_DAILY_LIMIT_CENTS = WORKFLOWS.refunds.analystDailyLimitCents;
export const APPROVER_ROLE = WORKFLOWS.refunds.approverRole;
export const REFUND_REASONS = WORKFLOWS.refunds.reasons;

export function approvalNeeded(role: Role, amountCents: number, refundedTodayCents: number): "over_limit" | "daily_limit" | null {
  if (amountCents > AUTO_REFUND_LIMIT_CENTS) return "over_limit";
  if (role === "ops_analyst" && refundedTodayCents + amountCents > ANALYST_DAILY_LIMIT_CENTS) return "daily_limit";
  return null;
}

export const formatUsd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
