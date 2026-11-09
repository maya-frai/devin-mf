import { listCases } from "@/adapters/kycVendor";
import { CONNECTORS } from "@/config/connectors";
import { WORKFLOWS } from "@/config/workflows";
import { connectorStatus } from "@/core/access";
import { listApprovals } from "@/core/approvals";
import { listAudit } from "@/core/audit";
import { IMPORT_SOURCE } from "@/config/import-map";
import { POLICY } from "@/core/permissions";
import type { User } from "@/core/users";
import { isOpen, slaHoursLeft } from "@/tools/kyc/logic";
import { formatUsd } from "@/tools/refunds/rules";
import { TOOLS } from "@/tools/registry";

export type Evidence = { value: string; detail: string };

// Live numbers from the app's own data that show each control working.
export function evidence(user: User): Record<string, Evidence> {
  const audit = listAudit();
  const writes = audit.filter((e) => !e.action.startsWith("pii.") && e.action !== "data.reset" && e.action !== "brand.switched");
  const withReason = writes.filter((e) => e.reason).length;
  const approvals = listApprovals();
  const count = (s: string) => approvals.filter((a) => a.status === s).length;
  const reveals = audit.filter((e) => e.action === "pii.revealed");
  const mine = Object.entries(POLICY).filter(([, roles]) => roles.includes(user.role)).length;
  const pastSla = listCases().filter((c) => isOpen(c) && slaHoursLeft(c) < 0).length;
  const live = CONNECTORS.filter((c) => connectorStatus(c) === "connected");

  return {
    audit: { value: `${audit.length} events`, detail: `${audit.filter((e) => e.source === IMPORT_SOURCE).length} imported from Power Apps · ${Math.round((withReason / Math.max(1, writes.length)) * 100)}% of writes carry a reason` },
    "two-person": { value: `${count("pending")} pending`, detail: `${count("approved")} approved, ${count("rejected")} rejected · requester can never approve (checked in code)` },
    "least-privilege": { value: `${mine} of ${Object.keys(POLICY).length} actions`, detail: `${user.role} can use ${TOOLS.filter((t) => POLICY[`${t.manifest.slug}.view`]?.includes(user.role)).length} of ${TOOLS.length} tools` },
    pii: { value: `${reveals.length} reveals`, detail: reveals.length ? `last by ${reveals[0].actor} on ${reveals[0].entityId}` : "No one has revealed PII yet" },
    limits: {
      value: `${formatUsd(WORKFLOWS.refunds.autoApproveLimitCents)} refunds`,
      detail: `daily cap ${formatUsd(WORKFLOWS.refunds.analystDailyLimitCents)} · ledger ${formatUsd(WORKFLOWS.ledger.approvalLimitCents)} · KYC SLA ${WORKFLOWS.kyc.slaHours}h, 2nd review above risk ${WORKFLOWS.kyc.highRiskThreshold}`,
    },
    "kyc-sla": { value: `${pastSla} past SLA`, detail: `${listCases().filter(isOpen).length} open cases` },
    change: { value: `${TOOLS.length} tools`, detail: "each built from a request and recorded in its build.json" },
    residency: { value: `${live.length} live connections`, detail: `${live.filter((c) => c.mock).length} are demo mocks · ${CONNECTORS.length - live.length} more need access` },
  };
}
