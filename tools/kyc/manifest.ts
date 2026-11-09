import type { ToolManifest } from "@/core/types";

export const manifest: ToolManifest = {
  slug: "kyc",
  name: "KYC Review Queue",
  description: "Review identity cases by risk: approve, reject or escalate with a reason.",
  replaces: "KYC review queue (Power Apps)",
  uses: [
    { capability: "Roles", detail: "kyc.view, kyc.decide, pii.reveal", file: "core/permissions.ts" },
    { capability: "Audit", detail: "kyc.approved / rejected / escalated, pii.revealed", file: "tools/kyc/logic.ts" },
    { capability: "Masking", detail: "SSN and DOB masked; Reveal is audited", file: "core/mask.ts" },
    { capability: "Adapter", detail: "Mock KYC vendor: listCases, submitDecision", file: "adapters/kyc-vendor.ts" },
  ],
};
