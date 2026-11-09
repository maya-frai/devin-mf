import { ROLES } from "@/config/roles";
import { WORKFLOWS } from "@/config/workflows";
import type { Role, User } from "./users";

const viewers = (tool: string) => (Object.keys(ROLES) as Role[]).filter((r) => ROLES[r].tools[tool]);

// Who can do what. One table for every tool (replaces Power Apps security roles).
// Who sees a tool comes from config/roles.ts; who approves comes from config/workflows.ts.
export const POLICY: Record<string, Role[]> = {
  "refunds.view": viewers("refunds"),
  "refunds.request": ["ops_analyst", "ops_lead"],
  "refunds.approve": [WORKFLOWS.refunds.approverRole],

  "kyc.view": viewers("kyc"),
  "kyc.decide": ["kyc_reviewer"],
  "kyc.second_review": [WORKFLOWS.kyc.secondReviewerRole],
  "kyc.export": ["ops_lead"],
  "pii.reveal": ["kyc_reviewer"],

  "flags.view": viewers("flags"),
  "flags.toggle": ["eng_admin"],
  "flags.approve": WORKFLOWS.flags.approverRoles,

  "ledger.view": viewers("ledger"),
  "ledger.adjust": ["ops_analyst", "ops_lead"],
  "ledger.approve": [WORKFLOWS.ledger.approverRole],

  "audit.view": ["ops_lead", "kyc_reviewer", "eng_admin"],
  "tools.create": ["eng_admin", "ops_lead"],
  "platform.customize": ["eng_admin"],
  "brand.switch": ["eng_admin"],
};

export function can(user: User, action: string): boolean {
  return POLICY[action]?.includes(user.role) ?? false;
}

export function assertCan(user: User, action: string): void {
  if (!can(user, action)) throw new Error("Not allowed");
}

/** For disabled-button tooltips: "Needs ops_lead". */
export const rolesFor = (action: string): string => (POLICY[action] ?? []).join(" or ");
