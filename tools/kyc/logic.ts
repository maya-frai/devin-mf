import { assignCase, getCase, listCases, submitDecision, type KycCase, type KycStatus } from "@/adapters/kycVendor";
import { WORKFLOWS } from "@/config/workflows";
import { requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import type { User } from "@/core/users";

export const DECISIONS = { approve: "approved", reject: "rejected", escalate: "escalated" } as const;
export type Decision = keyof typeof DECISIONS;
export const KYC_REASONS = WORKFLOWS.kyc.reasons;
export const SECOND_REVIEW_RISK = WORKFLOWS.kyc.highRiskThreshold;
export const SECOND_REVIEWER_ROLE = WORKFLOWS.kyc.secondReviewerRole;
export const SLA_HOURS = WORKFLOWS.kyc.slaHours;

const HOUR = 3_600_000;
const entity = (id: string) => `kyc_cases/${id}`;
export const isOpen = (c: KycCase) => c.status === "open" || c.status === "escalated";
export const riskBand = (score: number) => (score >= 70 ? "high" : score >= 40 ? "medium" : "low");
export const slaHoursLeft = (c: KycCase, now = Date.now()) => SLA_HOURS - (now - Date.parse(c.submittedAt)) / HOUR;

export function queueMetrics(cases: KycCase[], now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  const week = cases.filter((c) => c.decidedAt && now - Date.parse(c.decidedAt) < 7 * 24 * HOUR);
  return {
    open: cases.filter(isOpen).length,
    pastSla: cases.filter((c) => isOpen(c) && slaHoursLeft(c, now) < 0).length,
    decidedToday: cases.filter((c) => c.decidedAt?.startsWith(today)).length,
    approvalRate: week.length ? week.filter((c) => c.status === "approved").length / week.length : 0,
  };
}

// Rejecting a high-risk case needs a second reviewer (never the requester). Rules: config/workflows.ts.
export async function decideCase(user: User, caseId: string, decision: Decision, reason: string, notes = "") {
  assertCan(user, "kyc.decide");
  if (!(decision in DECISIONS)) throw new Error(`Unknown decision ${decision}`);
  if (!KYC_REASONS.includes(reason)) throw new Error("Choose a reason from the list");
  const kycCase = getCase(caseId);
  if (!isOpen(kycCase)) throw new Error("Case is not open");

  if (decision === "reject" && kycCase.riskScore > SECOND_REVIEW_RISK) {
    requestApproval(user, {
      tool: "kyc", action: "kyc.reject", target: entity(caseId), permission: "kyc.second_review", reason,
      summary: `Reject ${kycCase.customer} (risk ${kycCase.riskScore}): ${reason}`, payload: { caseId, reason, notes, from: kycCase.status },
    });
    await setStatus(user, caseId, "pending_second_review", reason, notes);
    return { pending: true };
  }
  await setStatus(user, caseId, DECISIONS[decision], reason, notes);
  return { pending: false };
}

export async function setStatus(user: User, caseId: string, status: KycStatus, reason: string, notes = "") {
  const before = { status: getCase(caseId).status };
  await submitDecision(caseId, status, user.id);
  logAudit({ actor: user, tool: "kyc", action: `kyc.${status}`, entityId: entity(caseId), before, after: { status, notes: notes || undefined }, reason });
}

export async function claimNext(user: User) {
  assertCan(user, "kyc.decide");
  const next = listCases().filter((c) => isOpen(c) && !c.assignee).sort((a, b) => b.riskScore - a.riskScore)[0];
  if (!next) throw new Error("No unclaimed cases left");
  await assignCase(next.id, user.id);
  logAudit({ actor: user, tool: "kyc", action: "kyc.claimed", entityId: entity(next.id), before: { assignee: null }, after: { assignee: user.id }, reason: "Claim next (highest risk)" });
  return next.id;
}
