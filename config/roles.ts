import type { Role } from "@/core/users";

// Per role: who they are in the org, home page, sidebar (tools they use, settings they care about,
// in order), which view of each tool, and ideas for the "+" builder.
// A tool's view lives in config/views/. kpis, filters and columns override that view's defaults.
export type ToolConfig = { view: string; kpis?: string[]; filters?: Record<string, string>; columns?: string[] };
export type SettingsSection = "compliance" | "data" | "access" | "customize";
export type Suggestion = { mode: "new" | "customize"; tool?: string; text: string };
export type RoleConfig = {
  title: string;
  team: string;
  landing: string;
  // Home: KPI row, and lists (sources in tools/*/sources.tsx) that belong in "Top of mind".
  home: { kpis: string[]; attention: { source: string; title: string }[] };
  sidebar: { tools: string[]; settings: SettingsSection[] }; // tool slugs plus "approvals" and "audit"
  tools: Partial<Record<string, ToolConfig>>;
  suggestions: Suggestion[];
};

export const ROLES: Record<Role, RoleConfig> = {
  eng_admin: {
    title: "Staff Engineer, Platform",
    team: "Engineering",
    landing: "/",
    home: { kpis: ["flags.pendingProd", "flags.changed7d", "flags.stale"], attention: [] },
    sidebar: { tools: ["flags", "approvals", "audit"], settings: ["data", "access", "compliance", "customize"] },
    tools: { flags: { view: "flags/admin" } },
    suggestions: [
      { mode: "customize", tool: "flags", text: "Sort flags owned by the platform team first and highlight stale ones" },
      { mode: "new", text: "Internal access requests: engineers request production access with a reason and expiry; system owners approve" },
    ],
  },
  finance: {
    title: "Finance Analyst",
    team: "Finance",
    landing: "/",
    home: { kpis: ["refunds.volumeMonth", "refunds.pendingCents", "ledger.totalBalance"], attention: [{ source: "refunds.needsAttention", title: "Large refunds waiting" }] },
    sidebar: { tools: ["refunds", "ledger", "approvals", "audit"], settings: ["compliance", "data", "access"] },
    tools: { refunds: { view: "refunds/finance" }, ledger: { view: "ledger/default" } },
    suggestions: [
      { mode: "customize", tool: "refunds", text: "Add refunds by payment method (card vs ACH) to my dashboard" },
      { mode: "new", text: "Payout reconciliation: match payouts to the bank statement and flag breaks over $50" },
    ],
  },
  ops_analyst: {
    title: "Business Operations Analyst",
    team: "Business Operations",
    landing: "/",
    home: { kpis: ["refunds.myOpen", "kyc.myQueue", "kyc.pastSla"], attention: [{ source: "kyc.slaBreaches", title: "Cases past SLA" }] },
    sidebar: { tools: ["refunds", "kyc", "approvals"], settings: ["access", "data", "compliance"] },
    tools: { refunds: { view: "refunds/analyst" }, kyc: { view: "kyc/reviewer", filters: { assignee: "me" } } },
    suggestions: [
      { mode: "customize", tool: "refunds", text: "Show how much of my $2,000 daily instant-refund limit I've used today" },
      { mode: "customize", tool: "kyc", text: "Show how many of my open cases are missing documents" },
      { mode: "new", text: "Chargeback evidence tracker: collect receipts and emails for each dispute before the deadline" },
    ],
  },
  product_manager: {
    title: "Product Manager, Payments",
    team: "Product",
    landing: "/",
    home: { kpis: ["flags.onInProd", "flags.pendingProd", "refunds.rate"], attention: [{ source: "flags.liveInProd", title: "Live for customers" }] },
    sidebar: { tools: ["flags", "refunds", "kyc"], settings: ["data", "access", "compliance"] },
    tools: { flags: { view: "flags/lead" }, refunds: { view: "refunds/finance" }, kyc: { view: "kyc/analyst" } },
    suggestions: [
      { mode: "customize", tool: "refunds", text: "Add refunds by reason so I can spot product issues" },
      { mode: "customize", tool: "flags", text: "Show what's turned on for customers in prod" },
      { mode: "new", text: "Launch tracker: each feature's flag, owner, prod rollout and support notes; launches over 50% need ops lead sign-off" },
    ],
  },
  ops_lead: {
    title: "Head of Operations & Compliance",
    team: "Operations & Compliance",
    landing: "/",
    home: {
      kpis: ["approvals.waitingOnMe", "approvals.pendingCents", "kyc.pastSla"],
      attention: [{ source: "kyc.escalations", title: "Escalated KYC cases" }, { source: "refunds.needsAttention", title: "Refunds needing attention" }],
    },
    sidebar: { tools: ["approvals", "refunds", "kyc", "ledger", "flags", "audit"], settings: ["compliance", "access", "data"] },
    tools: { refunds: { view: "refunds/lead" }, kyc: { view: "kyc/lead" }, flags: { view: "flags/lead" }, ledger: { view: "ledger/default" } },
    suggestions: [
      { mode: "customize", tool: "kyc", text: "Add a list of cases past SLA to my team view" },
      { mode: "new", text: "Weekly ops review: refund volume, KYC SLA breaches and pending approvals on one page, exportable for the exec meeting" },
    ],
  },
};
