import type { ToolManifest } from "@/core/types";

export const manifest: ToolManifest = {
  slug: "kyc",
  name: "KYC Review Queue",
  description: "Review identity cases by risk and SLA. High-risk rejections need a second reviewer.",
  replaces: "KYC review queue (Power Apps)",
  uses: [
    { capability: "Roles", detail: "kyc.view, kyc.decide, pii.reveal", file: "core/permissions.ts" },
    { capability: "Audit", detail: "kyc.approved / rejected / escalated, pii.revealed", file: "tools/kyc/logic.ts" },
    { capability: "Approvals", detail: "Rejecting risk > 80 needs a second reviewer (ops_lead)", file: "core/approvals.ts" },
    { capability: "Masking", detail: "SSN to last 4, DOB to year; Reveal is audited", file: "core/pii.ts" },
    { capability: "Adapter", detail: "Mock KYC vendor: listCases, submitDecision, assignCase", file: "adapters/kycVendor.ts" },
  ],
};
