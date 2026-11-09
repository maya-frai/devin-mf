import { pendingApprovalFor, requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import { getRow, list, updateRow, type Row } from "@/core/store";
import type { User } from "@/core/users";

export const APPROVAL_LIMIT_CENTS = 100_000; // $1,000

export type Direction = "debit" | "credit";
export type Account = Row & { name: string; type: string; currency: string; balanceCents: number; lastAdjustment?: string };

export const listAccounts = () => list<Account>("ledger_accounts");
export const formatUsd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

// Up to $1,000 posts immediately. Above $1,000 needs an ops lead who isn't the requester.
export function adjustBalance(user: User, accountId: string, direction: Direction, amountCents: number, reason: string) {
  assertCan(user, "ledger.adjust");
  if (direction !== "debit" && direction !== "credit") throw new Error("Choose debit or credit");
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new Error("Amount must be positive");
  if (!reason.trim()) throw new Error("A reason is required");
  const account = getRow<Account>("ledger_accounts", accountId);
  const target = `ledger_accounts/${accountId}`;
  if (pendingApprovalFor(target)) throw new Error("An adjustment is already awaiting approval");

  if (amountCents <= APPROVAL_LIMIT_CENTS) {
    applyAdjustment(user, accountId, direction, amountCents, reason);
    return { status: "applied" as const };
  }
  const approval = requestApproval(user, {
    tool: "ledger",
    action: "ledger.adjust",
    target,
    summary: `${direction === "credit" ? "Credit" : "Debit"} ${formatUsd(amountCents)} ${direction === "credit" ? "to" : "from"} ${account.name}: ${reason}`,
    permission: "ledger.approve",
    payload: { accountId, direction, amountCents, reason },
  });
  return { status: "pending_approval" as const, approvalId: approval.id };
}

export function applyAdjustment(user: User, accountId: string, direction: Direction, amountCents: number, reason: string) {
  const account = getRow<Account>("ledger_accounts", accountId);
  const delta = direction === "credit" ? amountCents : -amountCents;
  updateRow<Account>("ledger_accounts", accountId, {
    balanceCents: account.balanceCents + delta,
    lastAdjustment: `${direction} ${formatUsd(amountCents)}: ${reason}`,
  });
  logAudit(user, `ledger.${direction}`, `ledger_accounts/${accountId}`, { amount: amountCents, reason });
}
