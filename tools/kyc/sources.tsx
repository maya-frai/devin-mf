import { listCases, type KycCase } from "@/adapters/kycVendor";
import type { Sources } from "@/components/widgets/types";
import { listAudit } from "@/core/audit";
import { can, rolesFor } from "@/core/permissions";
import { getUser } from "@/core/users";
import { isOpen, queueMetrics, riskBand, slaHoursLeft } from "./logic";
import { QueueTable } from "./queue-table";

const DAY = 86_400_000;
const name = (id?: string | null) => (id ? (getUser(id)?.name ?? id) : "");
const decided = (c: KycCase) => c.status === "approved" || c.status === "rejected";
const caseItem = (c: KycCase, subtitle: string) => ({ id: c.id, title: `${c.customer} · risk ${c.riskScore}`, subtitle, badge: c.status.replaceAll("_", " "), href: `/tools/kyc?case=${c.id}` });

function decisionReason(c: KycCase) {
  return listAudit().find((e) => e.entityId === `kyc_cases/${c.id}` && e.action === `kyc.${c.status}`)?.reason ?? "";
}

export const kycSources: Sources = {
  metrics: {
    "kyc.open": () => ({ label: "Open cases", value: queueMetrics(listCases()).open }),
    "kyc.pastSla": () => ({ label: "Cases past SLA", value: queueMetrics(listCases()).pastSla }),
    "kyc.decidedToday": () => ({ label: "Decided today", value: queueMetrics(listCases()).decidedToday }),
    "kyc.approvalRate": () => ({ label: "Approval rate (7 days)", value: `${Math.round(queueMetrics(listCases()).approvalRate * 100)}%` }),
    "kyc.myQueue": ({ user }) => ({ label: "My queue", value: listCases().filter((c) => isOpen(c) && c.assignee === user.id).length }),
    "kyc.myClaimed": ({ user }) => ({ label: "My claimed KYC cases", value: listCases().filter((c) => isOpen(c) && c.assignee === user.id).length }),
  },
  sources: {
    "kyc.throughput": () => {
      const week = listCases().filter((c) => decided(c) && c.decidedAt && Date.now() - Date.parse(c.decidedAt) < 7 * DAY);
      const by: Record<string, { id: string; reviewer: string; decided: number; approved: number; rejected: number }> = {};
      for (const c of week) {
        const r = (by[c.decidedBy ?? "?"] ??= { id: c.decidedBy ?? "?", reviewer: name(c.decidedBy), decided: 0, approved: 0, rejected: 0 });
        r.decided += 1;
        r[c.status as "approved" | "rejected"] += 1;
      }
      return Object.values(by);
    },
    "kyc.byOutcome": () => (["approved", "rejected", "escalated", "pending_second_review"] as const).map((s) => ({ label: s.replaceAll("_", " "), value: listCases().filter((c) => c.status === s).length })),
    "kyc.slaBreaches": () => listCases().filter((c) => isOpen(c) && slaHoursLeft(c) < 0).map((c) => caseItem(c, `${Math.round(-slaHoursLeft(c))}h past SLA · ${name(c.assignee) || "unassigned"}`)),
    "kyc.escalations": () => listCases().filter((c) => c.status === "escalated").map((c) => caseItem(c, `Escalated · ${name(c.assignee) || "unassigned"}`)),
    "kyc.decisions": () => listCases().filter(decided).map((c) => ({ id: c.id, customer: c.customer, outcome: c.status, decidedByName: name(c.decidedBy), decidedAt: c.decidedAt, reason: decisionReason(c) })),
    "kyc.statusLookup": () => listCases().map((c) => ({ id: c.id, customer: c.customer, status: c.status, submittedAt: c.submittedAt })),
  },
  panels: {
    "kyc.queue": ({ ctx: { user, filters } }) => {
      const rows = listCases().map((c) => ({
        id: c.id, customer: c.customer, country: c.country, riskScore: c.riskScore, band: riskBand(c.riskScore), slaLeft: Math.round(slaHoursLeft(c)),
        status: c.status, assignee: c.assignee ?? "", assigneeName: name(c.assignee),
      }));
      return <QueueTable rows={rows} userId={user.id} canDecide={can(user, "kyc.decide")} needs={rolesFor("kyc.decide")} mineByDefault={filters.assignee === "me"} />;
    },
  },
};
