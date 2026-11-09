import type { ToolManifest } from "@/core/types";

export const manifest: ToolManifest = {
  slug: "flags",
  name: "Feature Flags",
  description: "Toggle flags per environment. Dev and staging apply instantly; prod and rollout changes need approval.",
  replaces: "Feature-flag admin (Power Apps)",
  uses: [
    { capability: "Roles", detail: "flags.view, flags.toggle, flags.approve", file: "core/permissions.ts" },
    { capability: "Audit", detail: "flags.changed, flags.rollout_changed (before/after + reason)", file: "tools/flags/logic.ts" },
    { capability: "Approvals", detail: "Prod toggles and rollout % (ops_lead or eng_admin, approver ≠ requester)", file: "core/approvals.ts" },
  ],
};
