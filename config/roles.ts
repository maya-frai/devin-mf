import type { Role } from "@/core/users";

// Per role: home layout, landing page, sidebar order, visible tools, and which view of each tool.
// A tool's view lives in config/views/. kpis, filters and columns override that view's defaults.
export type ToolConfig = { view: string; kpis?: string[]; filters?: Record<string, string>; columns?: string[] };
export type RoleConfig = {
  landing: string;
  home: { kpis: string[] };
  sidebar: string[]; // tool slugs and platform pages, in order
  tools: Partial<Record<string, ToolConfig>>;
};

export const ROLES: Record<Role, RoleConfig> = {
  ops_analyst: {
    landing: "/",
    home: { kpis: ["refunds.myOpen", "kyc.myClaimed", "kyc.pastSla"] },
    sidebar: ["refunds", "ledger", "kyc", "approvals", "roadmap"],
    tools: { refunds: { view: "refunds/analyst" }, ledger: { view: "ledger/default" }, kyc: { view: "kyc/analyst" } },
  },
  ops_lead: {
    landing: "/approvals",
    home: { kpis: ["approvals.waitingOnMe", "approvals.pendingCents", "kyc.pastSla"] },
    sidebar: ["approvals", "refunds", "kyc", "flags", "ledger", "audit", "roadmap", "new-tool"],
    tools: { refunds: { view: "refunds/lead" }, kyc: { view: "kyc/lead" }, flags: { view: "flags/lead" }, ledger: { view: "ledger/default" } },
  },
  kyc_reviewer: {
    landing: "/tools/kyc",
    home: { kpis: ["kyc.myQueue", "kyc.pastSla", "kyc.decidedToday"] },
    sidebar: ["kyc", "approvals", "audit"],
    tools: { kyc: { view: "kyc/reviewer", filters: { assignee: "me" } } },
  },
  eng_admin: {
    landing: "/",
    home: { kpis: ["flags.pendingProd", "flags.changed7d", "flags.stale"] },
    sidebar: ["flags", "approvals", "audit", "customize", "new-tool", "roadmap"],
    tools: { flags: { view: "flags/admin" } },
  },
  finance: {
    landing: "/tools/refunds",
    home: { kpis: ["refunds.volumeMonth", "refunds.rate", "refunds.pendingCents"] },
    sidebar: ["refunds", "approvals"],
    tools: { refunds: { view: "refunds/finance" } },
  },
};
