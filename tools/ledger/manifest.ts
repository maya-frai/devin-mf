import type { ToolManifest } from "@/core/types";

export const manifest: ToolManifest = {
  slug: "ledger",
  name: "Ledger Adjustments",
  description: "Debit or credit an account with a reason. Over $1,000 needs an ops lead's approval.",
  replaces: "Direct database edits",
  uses: [
    { capability: "Roles", detail: "ledger.view, ledger.adjust, ledger.approve", file: "core/permissions.ts" },
    { capability: "Audit", detail: "ledger.debit, ledger.credit, approval.requested", file: "tools/ledger/logic.ts" },
    { capability: "Approvals", detail: "Adjustments over $1,000 (approver ≠ requester)", file: "core/approvals.ts" },
  ],
};
