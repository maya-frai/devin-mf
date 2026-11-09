import type { View } from "./types";

export const kycViews: Record<string, View> = {
  // Reviewer: my queue sorted by SLA and risk, Claim next, and the case page.
  "kyc/reviewer": {
    widgets: [
      { type: "KpiTiles", metrics: ["kyc.myQueue", "kyc.pastSla", "kyc.decidedToday", "kyc.approvalRate"] },
      { type: "Panel", panel: "kyc.queue" },
    ],
  },
  // Lead (compliance): team throughput, breaches, outcomes, escalations and an auditor export.
  "kyc/lead": {
    widgets: [
      { type: "KpiTiles", metrics: ["kyc.open", "kyc.pastSla", "kyc.decidedToday", "kyc.approvalRate"] },
      { type: "ApprovalList", title: "Second reviews waiting", tool: "kyc" },
      {
        type: "DataTable", title: "Throughput per reviewer (7 days)", source: "kyc.throughput", search: ["reviewer"], sort: "decided", width: "half",
        columns: [
          { key: "reviewer", label: "Reviewer" },
          { key: "decided", label: "Decided", format: "number" },
          { key: "approved", label: "Approved", format: "number" },
          { key: "rejected", label: "Rejected", format: "number" },
        ],
      },
      { type: "BarChart", title: "Decisions by outcome", source: "kyc.byOutcome", width: "half" },
      { type: "WorkQueue", title: "SLA breaches", source: "kyc.slaBreaches", empty: "No cases past SLA.", width: "half" },
      { type: "WorkQueue", title: "Escalations", source: "kyc.escalations", empty: "No escalated cases.", width: "half" },
      {
        type: "DataTable", title: "Decisions (for auditors)", source: "kyc.decisions", search: ["id", "customer", "decidedByName", "reason"], status: "outcome",
        sort: "decidedAt", exportCsv: true, main: true,
        columns: [
          { key: "id", label: "Case", format: "mono", link: "/tools/kyc?case={id}" },
          { key: "customer", label: "Applicant" },
          { key: "outcome", label: "Outcome", format: "badge" },
          { key: "decidedByName", label: "Decided by" },
          { key: "decidedAt", label: "When", format: "datetime" },
          { key: "reason", label: "Reason" },
        ],
      },
    ],
  },
  // Analyst: read-only status lookup. No PII.
  "kyc/analyst": {
    widgets: [
      {
        type: "DataTable", title: "Case status lookup", source: "kyc.statusLookup", search: ["id", "customer"], status: "status", sort: "submittedAt", main: true,
        columns: [
          { key: "id", label: "Case", format: "mono" },
          { key: "customer", label: "Applicant" },
          { key: "status", label: "Status", format: "badge" },
          { key: "submittedAt", label: "Submitted", format: "datetime" },
        ],
      },
    ],
  },
};
