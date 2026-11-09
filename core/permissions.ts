import type { Role, User } from "./users";

// Single source of truth for who can do what (replaces Power Apps security roles).
// Tools add their own "<tool>.<verb>" actions here. Unknown actions are denied.
export const POLICY: Record<string, Role[]> = {
  "audit.view": ["ops_lead", "kyc_reviewer", "eng_admin"],
  "approvals.decide": ["ops_lead", "eng_admin"],
  "pii.reveal": ["ops_lead", "kyc_reviewer"],
};

export function can(user: User, action: string): boolean {
  return POLICY[action]?.includes(user.role) ?? false;
}

export function assertCan(user: User, action: string): void {
  if (!can(user, action)) {
    throw new Error(`${user.name} (${user.role}) is not allowed to ${action}`);
  }
}
