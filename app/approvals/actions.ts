"use server";

import { grantAccess } from "@/core/access";
import { draftHandler } from "@/core/drafts";
import { approve, listApprovals, reject } from "@/core/approvals";
import type { ToolDefinition } from "@/core/types";
import { guarded } from "@/core/guard";
import { getTool } from "@/tools/registry";

// The permission checked is the one the approval asks for, e.g. "refunds.approve".
// Platform requests (e.g. connector access) are handled by core, tool requests by the tool.
const handlerFor = (tool: string): Pick<ToolDefinition, "onApproved" | "onRejected"> | undefined =>
  tool === "platform" ? { onApproved: grantAccess } : tool.startsWith("draft:") ? draftHandler : getTool(tool);

const permissionFor = (id: string) => listApprovals().find((a) => a.id === id)?.permission ?? "unknown";

// Approving runs the original action (the tool's onApproved), which logs it.
export async function approveAction(id: string, reason: string) {
  return guarded(permissionFor(id), async (user) => {
    const approval = approve(user, id, reason);
    await handlerFor(approval.tool)?.onApproved?.(approval, user);
  });
}

export async function rejectAction(id: string, reason: string) {
  return guarded(permissionFor(id), async (user) => {
    const approval = reject(user, id, reason);
    await handlerFor(approval.tool)?.onRejected?.(approval, user);
  });
}
