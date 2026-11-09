"use server";

import { approve, listApprovals, reject } from "@/core/approvals";
import { guarded } from "@/core/guard";
import { getTool } from "@/tools/registry";

// The permission checked is the one the approval asks for, e.g. "refunds.approve".
const permissionFor = (id: string) => listApprovals().find((a) => a.id === id)?.permission ?? "unknown";

// Approving runs the original action (the tool's onApproved), which logs it.
export async function approveAction(id: string, reason: string) {
  return guarded(permissionFor(id), async (user) => {
    const approval = approve(user, id, reason);
    await getTool(approval.tool)?.onApproved?.(approval, user);
  });
}

export async function rejectAction(id: string, reason: string) {
  return guarded(permissionFor(id), async (user) => {
    const approval = reject(user, id, reason);
    await getTool(approval.tool)?.onRejected?.(approval, user);
  });
}
