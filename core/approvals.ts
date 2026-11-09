import { logAudit } from "./audit";
import { can } from "./permissions";
import { db, newId } from "./store";
import type { Approval } from "./types";
import type { User } from "./users";

type ApprovalRequest = Pick<Approval, "tool" | "action" | "target" | "summary" | "permission" | "payload" | "reason">;

// Two-person approvals (replaces Power Automate approval flows).
export function requestApproval(user: User, req: ApprovalRequest): Approval {
  const approval: Approval = {
    ...req,
    id: newId("apr"),
    status: "pending",
    requestedBy: user.id,
    requestedAt: new Date().toISOString(),
  };
  db().approvals.unshift(approval);
  logAudit({ actor: user, tool: req.tool, action: "approval.requested", entityId: req.target, after: { summary: req.summary }, reason: req.reason });
  return approval;
}

// Returns why `user` can't decide, or null if they can.
export function blockedReason(user: User, approval: Approval): string | null {
  if (approval.status !== "pending") return "Already decided";
  if (approval.requestedBy === user.id) return "You can't approve your own request";
  if (!can(user, approval.permission)) return `Needs ${approval.permission}`;
  return null;
}

function decide(user: User, id: string, status: "approved" | "rejected", reason?: string): Approval {
  const approval = db().approvals.find((a) => a.id === id);
  if (!approval) throw new Error(`Approval ${id} not found`);
  const blocked = blockedReason(user, approval);
  if (blocked) throw new Error(blocked);
  if (!reason?.trim()) throw new Error("A reason is required");

  Object.assign(approval, { status, decidedBy: user.id, decidedAt: new Date().toISOString(), decisionReason: reason });
  logAudit({ actor: user, tool: approval.tool, action: `approval.${status}`, entityId: approval.target, before: { status: "pending" }, after: { status }, reason });
  return approval;
}

export const approve = (user: User, id: string, reason?: string) => decide(user, id, "approved", reason);
export const reject = (user: User, id: string, reason?: string) => decide(user, id, "rejected", reason);

export function listApprovals(): Approval[] {
  return db().approvals;
}

export function pendingApprovalFor(target: string): Approval | undefined {
  return db().approvals.find((a) => a.status === "pending" && a.target === target);
}

export function actionableBy(user: User): Approval[] {
  return db().approvals.filter((a) => !blockedReason(user, a));
}
