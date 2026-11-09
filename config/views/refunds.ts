import type { View } from "./types";

const requestColumns = [
  { key: "createdAt", label: "Requested", format: "datetime" as const },
  { key: "customer", label: "Customer" },
  { key: "amountCents", label: "Amount", format: "usd" as const },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status", format: "badge" as const },
];

export const refundViews: Record<string, View> = {
  // Finance: money in and out, ready to hand to accounting. No request buttons.
  "refunds/finance": {
    widgets: [
      { type: "KpiTiles", metrics: ["refunds.volume30d", "refunds.rate", "refunds.average", "refunds.pendingCents"] },
      { type: "LineChart", title: "Refunds per day", source: "refunds.perDay", width: "half" },
      { type: "BarChart", title: "Refunds by reason", source: "refunds.byReason", width: "half" },
      {
        type: "DataTable", title: "Monthly summary", source: "refunds.monthly", search: ["month"], sort: "month", exportCsv: true, main: true,
        columns: [
          { key: "month", label: "Month" },
          { key: "count", label: "Refunds", format: "number" },
          { key: "volumeCents", label: "Refunded", format: "usd" },
          { key: "pendingCents", label: "Pending", format: "usd" },
          { key: "rejected", label: "Rejected", format: "number" },
        ],
      },
    ],
  },
  // Analyst: do the work first. No company-wide financials.
  "refunds/analyst": {
    widgets: [
      { type: "Panel", panel: "refunds.requestBar" },
      { type: "DataTable", title: "My recent requests", source: "refunds.myRequests", search: ["customer", "reason"], status: "status", sort: "createdAt", main: true, columns: requestColumns },
      { type: "Panel", panel: "refunds.payments" },
    ],
  },
  // Lead: approvals first, then what needs attention, then team metrics.
  "refunds/lead": {
    widgets: [
      { type: "ApprovalList", title: "Pending refund approvals", tool: "refunds" },
      { type: "WorkQueue", title: "Needs attention", source: "refunds.needsAttention", empty: "Nothing needs attention right now.", width: "half" },
      { type: "StatusSummary", title: "Refunds by status (30 days)", source: "refunds.byStatus", width: "half" },
      { type: "KpiTiles", metrics: ["refunds.count30d", "refunds.volume30d", "refunds.pendingCount", "refunds.medianApprove", "refunds.rate"] },
      { type: "DataTable", title: "Team requests", source: "refunds.teamRequests", search: ["customer", "reason", "requestedByName"], status: "status", sort: "createdAt", main: true,
        columns: [...requestColumns, { key: "requestedByName", label: "Requested by" }] },
    ],
  },
};
