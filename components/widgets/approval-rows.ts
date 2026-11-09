import { blockedReason, listApprovals } from "@/core/approvals";
import type { User } from "@/core/users";
import { getUser } from "@/core/users";

export type ApprovalRow = {
  id: string;
  tool: string;
  summary: string;
  status: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  decidedBy: string;
  blocked: string | null;
};

const name = (id?: string) => (id ? (getUser(id)?.name ?? id) : "");

/** Approvals shaped for ApprovalList, with why the current user can't decide (if they can't). */
export function approvalRows(user: User, tool?: string, pendingOnly = true): ApprovalRow[] {
  return listApprovals()
    .filter((a) => (!tool || a.tool === tool) && (!pendingOnly || a.status === "pending"))
    .map((a) => ({
      id: a.id, tool: a.tool, summary: a.summary, status: a.status, requestedBy: name(a.requestedBy), requestedAt: a.requestedAt,
      reason: a.reason ?? "", decidedBy: name(a.decidedBy), blocked: a.status === "pending" ? blockedReason(user, a) : null,
    }));
}
