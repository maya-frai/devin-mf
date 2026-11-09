import type { ToolManifest } from "@/core/types";

export const manifest: ToolManifest = {
  slug: "flags",
  name: "Feature Flags",
  description: "Toggle flags in dev and staging instantly. Prod changes need approval.",
  replaces: "Feature-flag admin (Power Apps)",
  uses: [
    { capability: "Roles", detail: "flags.view, flags.toggle, flags.approve", file: "core/permissions.ts" },
    { capability: "Audit", detail: "flags.changed, approval.requested", file: "tools/flags/logic.ts" },
    { capability: "Approvals", detail: "Every prod change (approver ≠ requester)", file: "core/approvals.ts" },
  ],
};
