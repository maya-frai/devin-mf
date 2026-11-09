import type { Role, User } from "./users";

// Who can do what. One table for every tool (replaces Power Apps security roles).
export const POLICY: Record<string, Role[]> = {
  "refunds.view": ["ops_analyst", "ops_lead"],
  "refunds.request": ["ops_analyst", "ops_lead"],
  "refunds.approve": ["ops_lead"],

  "kyc.view": ["kyc_reviewer", "ops_lead"],
  "kyc.decide": ["kyc_reviewer"],
  "pii.reveal": ["kyc_reviewer"],

  "flags.view": ["eng_admin", "ops_lead"],
  "flags.toggle": ["eng_admin"],
  "flags.approve": ["eng_admin", "ops_lead"],

  "ledger.view": ["ops_analyst", "ops_lead"],
  "ledger.adjust": ["ops_analyst", "ops_lead"],
  "ledger.approve": ["ops_lead"],

  "audit.view": ["ops_lead", "kyc_reviewer", "eng_admin"],
  "tools.create": ["eng_admin", "ops_lead"],
};

export function can(user: User, action: string): boolean {
  return POLICY[action]?.includes(user.role) ?? false;
}

export function assertCan(user: User, action: string): void {
  if (!can(user, action)) throw new Error(`${user.name} cannot ${action}`);
}
