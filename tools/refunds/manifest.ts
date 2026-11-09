import type { ToolManifest } from "@/core/types";

export const manifest: ToolManifest = {
  slug: "refunds",
  name: "Refunds",
  description: "Request refunds with a reason. Over $500 needs an ops lead's approval.",
  replaces: "Refunds dashboard (Power Apps)",
  uses: [
    { capability: "Roles", detail: "refunds.view, refunds.request, refunds.approve", file: "core/permissions.ts" },
    { capability: "Audit", detail: "refunds.requested, refunds.issued", file: "tools/refunds/logic.ts" },
    { capability: "Approvals", detail: "Refunds over $500 (approver ≠ requester)", file: "core/approvals.ts" },
    { capability: "Adapter", detail: "Mock payments: listPayments, refundPayment", file: "adapters/payments.ts" },
  ],
};
