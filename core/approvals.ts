import { logAudit } from "./audit";
import { can } from "./permissions";
import { db, newId } from "./store";
import type { Approval } from "./types";
import type { User } from "./users";

// Two-person approvals (replaces Power Automate approval flows).
export function requestApproval(
  user: User,
  req: Pick<Approval, "tool" | "action" | "target" | "summary" | "permission" | "payload">,
): Approval {
  const approval: Approval = {
    ...req,
    id: newId("apr"),
    status: "pending",
    requestedBy: user.id,
    requestedAt: new Date().toISOString(),
  };
  db().approvals.unshift(approval);
  logAudit(user, "approval.requested", req.target, { action: req.action, summary: req.summary });
  return approval;
}

// Returns why `user` can't decide, or null if they can.
export function blockedReason(user: User, approval: Approval): string | null {
  if (approval.status !== "pending") return "Already decided";
  if (approval.requestedBy === user.id) return "You can't approve your own request";
  if (!can(user, approval.permission)) return `Needs ${approval.permission}`;
  return null;
}

function decide(user: User, id: string, status: "approved" | "rejected"): Approval {
  const approval = db().approvals.find((a) => a.id === id);
  if (!approval) throw new Error(`Approval ${id} not found`);
  const blocked = blockedReason(user, approval);
  if (blocked) throw new Error(blocked);

  approval.status = status;
  approval.decidedBy = user.id;
  logAudit(user, `approval.${status}`, approval.target, { action: approval.action });
  return approval;
}

export const approve = (user: User, id: string) => decide(user, id, "approved");
export const reject = (user: User, id: string) => decide(user, id, "rejected");

export function listApprovals(): Approval[] {
  return db().approvals;
}

export function pendingApprovalFor(target: string): Approval | undefined {
  return db().approvals.find((a) => a.status === "pending" && a.target === target);
}
