import type { Role } from "@/core/users";

// The client's business rules. Tools read these instead of hardcoding them.
export const WORKFLOWS = {
  refunds: {
    autoApproveLimitCents: 50_000, // $500
    analystDailyLimitCents: 200_000, // $2,000 of instant refunds per analyst per day
    approverRole: "ops_lead" as Role,
    reasons: ["Customer request", "Duplicate charge", "Fraud", "Service issue", "Other"],
  },
  kyc: {
    slaHours: 48,
    highRiskThreshold: 80, // rejecting above this needs a second reviewer
    secondReviewerRole: "ops_lead" as Role, // acts as compliance lead
    reasons: ["Documents verified", "Document mismatch", "Watchlist match confirmed", "Watchlist false positive", "Needs senior review", "Other"],
  },
  flags: {
    environments: ["dev", "staging", "prod"] as const,
    needApproval: ["prod"] as string[],
    approverRoles: ["ops_lead", "eng_admin"] as Role[],
  },
  ledger: {
    approvalLimitCents: 100_000, // $1,000
    approverRole: "ops_lead" as Role,
  },
  // Power Apps security roles -> app roles, used when importing Dataverse history.
  powerAppsRoles: {
    "Ops Analyst - Refunds": "ops_analyst",
    "Ops Lead - Refunds": "ops_lead",
    "Product Manager": "product_manager",
    "System Administrator": "eng_admin",
    "Finance - Read Only": "finance",
  } as Record<string, Role>,
};
