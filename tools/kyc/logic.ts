import { getCase, submitDecision, type KycCase } from "@/adapters/kyc-vendor";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import type { User } from "@/core/users";

export const DECISIONS = { approve: "approved", reject: "rejected", escalate: "escalated" } as const;
export type Decision = keyof typeof DECISIONS;

export function byRisk(cases: KycCase[]): KycCase[] {
  return [...cases].sort((a, b) => b.riskScore - a.riskScore);
}

export async function decideCase(user: User, caseId: string, decision: Decision, reason: string) {
  assertCan(user, "kyc.decide");
  if (!(decision in DECISIONS)) throw new Error(`Unknown decision ${decision}`);
  if (!reason.trim()) throw new Error("A reason is required");
  const kycCase = getCase(caseId);
  if (kycCase.status === "approved" || kycCase.status === "rejected") {
    throw new Error("Case is already closed");
  }

  await submitDecision(caseId, DECISIONS[decision], reason);
  logAudit(user, `kyc.${DECISIONS[decision]}`, `kyc_cases/${caseId}`, { reason });
  return DECISIONS[decision];
}
