import type { Role } from "@/core/users";

// Per role: who they are in the org, landing page, home KPIs, sidebar (tools they use, settings they
// care about, in order), which view of each tool, and ideas for the "+" builder.
// A tool's view lives in config/views/. kpis, filters and columns override that view's defaults.
export type ToolConfig = { view: string; kpis?: string[]; filters?: Record<string, string>; columns?: string[] };
export type SettingsSection = "compliance" | "data" | "access" | "customize";
export type Suggestion = { mode: "new" | "customize"; tool?: string; text: string };
export type RoleConfig = {
  title: string;
  team: string;
  landing: string;
  home: { kpis: string[] };
  sidebar: { tools: string[]; settings: SettingsSection[] }; // tool slugs plus "approvals" and "audit"
  tools: Partial<Record<string, ToolConfig>>;
  suggestions: Suggestion[];
};

export const ROLES: Record<Role, RoleConfig> = {
  ops_analyst: {
    title: "Payments Operations Analyst",
    team: "Operations",
    landing: "/",
    home: { kpis: ["refunds.myOpen", "kyc.myClaimed", "kyc.pastSla"] },
    sidebar: { tools: ["refunds", "ledger", "kyc", "approvals"], settings: ["access", "data", "compliance"] },
    tools: { refunds: { view: "refunds/analyst" }, ledger: { view: "ledger/default" }, kyc: { view: "kyc/analyst" } },
    suggestions: [
      { mode: "customize", tool: "refunds", text: "Show how much of my $2,000 daily instant-refund limit I've used today" },
      { mode: "new", text: "Chargeback evidence tracker: collect receipts and emails for each dispute before the deadline" },
    ],
  },
  ops_lead: {
    title: "Head of Operations",
    team: "Operations & Compliance",
    landing: "/approvals",
    home: { kpis: ["approvals.waitingOnMe", "approvals.pendingCents", "kyc.pastSla"] },
    sidebar: { tools: ["approvals", "refunds", "kyc", "flags", "ledger", "audit"], settings: ["compliance", "access", "data"] },
    tools: { refunds: { view: "refunds/lead" }, kyc: { view: "kyc/lead" }, flags: { view: "flags/lead" }, ledger: { view: "ledger/default" } },
    suggestions: [
      { mode: "customize", tool: "kyc", text: "Add an SLA trend chart per reviewer to my team view" },
      { mode: "new", text: "Weekly ops review: one page with refund volume, KYC SLA breaches and pending approvals, exportable for the exec meeting" },
    ],
  },
  kyc_reviewer: {
    title: "KYC Analyst",
    team: "Compliance",
    landing: "/tools/kyc",
    home: { kpis: ["kyc.myQueue", "kyc.pastSla", "kyc.decidedToday"] },
    sidebar: { tools: ["kyc", "approvals", "audit"], settings: ["compliance", "access", "data"] },
    tools: { kyc: { view: "kyc/reviewer", filters: { assignee: "me" } } },
    suggestions: [
      { mode: "customize", tool: "kyc", text: "Add a 'documents missing' filter to my queue and show it as a chip" },
      { mode: "new", text: "Sanctions hit review: compare the customer with the watchlist entry side by side and clear or confirm with a second reviewer" },
    ],
  },
  eng_admin: {
    title: "Staff Engineer, Platform",
    team: "Engineering",
    landing: "/",
    home: { kpis: ["flags.pendingProd", "flags.changed7d", "flags.stale"] },
    sidebar: { tools: ["flags", "approvals", "audit"], settings: ["data", "customize", "access", "compliance"] },
    tools: { flags: { view: "flags/admin" } },
    suggestions: [
      { mode: "customize", tool: "flags", text: "Sort flags owned by the platform team first and highlight stale ones" },
      { mode: "new", text: "Internal access requests: engineers request production access with a reason and expiry; system owners approve" },
    ],
  },
  finance: {
    title: "Finance Controller",
    team: "Finance",
    landing: "/tools/refunds",
    home: { kpis: ["refunds.volumeMonth", "refunds.rate", "refunds.pendingCents"] },
    sidebar: { tools: ["refunds", "approvals", "audit"], settings: ["compliance", "data", "access"] },
    tools: { refunds: { view: "refunds/finance" } },
    suggestions: [
      { mode: "customize", tool: "refunds", text: "Add refunds by payment method (card vs ACH) to my dashboard" },
      { mode: "new", text: "Payout reconciliation: match payouts to the bank statement and flag breaks over $50" },
    ],
  },
};
