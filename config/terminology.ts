// The client's own words for things. UI labels come from here, picked by the brand preset.
const base = {
  home: "Home", approvals: "Approvals", audit: "Audit Log", roadmap: "Roadmap", newTool: "New tool", customize: "Customize",
  tools: "Tools", platform: "Platform", settings: "Settings", buildTool: "Build or customize a tool", customizeTool: "Customize this tool",
  compliance: "Compliance & controls", data: "Data & connectors", access: "My access", signedInAs: "Signed in as", resetData: "Reset demo data", brand: "Brand",
  recentApps: "Recent apps", waitingOnYou: "Waiting on you", allApps: "All apps",
  refunds: "Refunds", refund: "refund", requestRefund: "Request refund", payments: "Payments", payment: "payment",
  kyc: "KYC Review Queue", cases: "Cases", case: "case", claimNext: "Claim next",
  flags: "Feature Flags", flag: "flag", flagsNoun: "flags", ledger: "Ledger Adjustments",
  approve: "Approve", reject: "Reject", escalate: "Escalate", exportCsv: "Export CSV",
};

export type Terms = typeof base;

export const TERMINOLOGY: Record<"default" | "alt", Terms> = {
  default: base,
  alt: {
    ...base,
    refunds: "Reversals", refund: "reversal", requestRefund: "Request reversal",
    kyc: "Applications Review", cases: "Applications", case: "application", claimNext: "Take next",
    flags: "Toggles", flag: "toggle", flagsNoun: "toggles", approvals: "Sign-offs", audit: "Change history",
  },
};
