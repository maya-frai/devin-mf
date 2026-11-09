import { logAudit } from "./audit";
import { assertCan } from "./permissions";
import { db, newId } from "./store";
import type { Approval, ApprovalStatus } from "./types";
import type { User } from "./users";

// Two-person approvals (replaces Power Automate approval flows).
export type ApprovalRequest = {
  tool: string;
  action: string;
  target: string;
  summary: string;
  payload?: Record<string, unknown>;
  /** Permission the approver needs. Defaults to "approvals.decide". */
  permission?: string;
};

export function requestApproval(user: User, req: ApprovalRequest): Approval {
  const approval: Approval = {
    id: newId("apr"),
    tool: req.tool,
    action: req.action,
    target: req.target,
    summary: req.summary,
    payload: req.payload ?? {},
    permission: req.permission ?? "approvals.decide",
    status: "pending",
    requestedBy: user.id,
    requestedAt: new Date().toISOString(),
  };
  db().approvals.unshift(approval);
  logAudit(user, "approval.requested", approval.id, {
    action: req.action,
    target: req.target,
  });
  return approval;
}

export function canDecide(user: User, approval: Approval): string | null {
  if (approval.status !== "pending") return "Already decided";
  if (approval.requestedBy === user.id) return "Approver must differ from requester";
  try {
    assertCan(user, approval.permission);
  } catch {
    return `Needs ${approval.permission}`;
  }
  return null;
}

function decide(user: User, id: string, status: ApprovalStatus): Approval {
  const approval = db().approvals.find((a) => a.id === id);
  if (!approval) throw new Error(`Approval ${id} not found`);
  const blocked = canDecide(user, approval);
  if (blocked) throw new Error(blocked);
  approval.status = status;
  approval.decidedBy = user.id;
  approval.decidedAt = new Date().toISOString();
  logAudit(user, `approval.${status}`, approval.id, {
    action: approval.action,
    target: approval.target,
    requestedBy: approval.requestedBy,
  });
  return approval;
}

export function approve(user: User, id: string): Approval {
  return decide(user, id, "approved");
}

export function reject(user: User, id: string): Approval {
  return decide(user, id, "rejected");
}

export function listApprovals(status?: ApprovalStatus): Approval[] {
  const all = db().approvals;
  return status ? all.filter((a) => a.status === status) : all;
}
