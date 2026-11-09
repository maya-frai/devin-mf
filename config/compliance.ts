import type { Role } from "@/core/users";

// The controls this app enforces, where in the code, and who cares most. Evidence is computed live.
export type Control = { id: string; name: string; how: string; frameworks: string[]; enforcedIn: string[]; caresAbout: Role[] };

export const CONTROLS: Control[] = [
  {
    id: "audit", name: "Complete audit trail", how: "Every write records who, what, before/after and why, including history imported from Power Apps.",
    frameworks: ["SOC 2 CC7.2", "BSA recordkeeping"], enforcedIn: ["core/audit.ts", "core/guard.ts"], caresAbout: ["ops_lead", "finance", "ops_analyst", "product_manager"],
  },
  {
    id: "two-person", name: "Two-person rule", how: "Money movement over limits, prod changes and high-risk rejections need an approver with the right role who isn't the requester.",
    frameworks: ["SOC 2 CC6.1", "SOX segregation of duties"], enforcedIn: ["core/approvals.ts"], caresAbout: ["finance", "ops_lead", "eng_admin"],
  },
  {
    id: "least-privilege", name: "Least-privilege roles", how: "Each role sees only the tools for its job; actions it can't take are disabled with the role needed.",
    frameworks: ["SOC 2 CC6.3"], enforcedIn: ["config/roles.ts", "core/permissions.ts"], caresAbout: ["eng_admin", "ops_lead", "product_manager"],
  },
  {
    id: "pii", name: "PII masked by default", how: "SSN shows last 4, date of birth shows year. Only business operations (ops_analyst), who review KYC, can reveal, and every reveal is logged.",
    frameworks: ["GLBA Safeguards Rule", "SOC 2 C1.1"], enforcedIn: ["core/pii.ts", "core/actions.ts"], caresAbout: ["ops_analyst", "ops_lead"],
  },
  {
    id: "limits", name: "Business limits from one config", how: "Refund, ledger and KYC rules live in one file, so the UI hints and the enforcement can't drift apart.",
    frameworks: ["Internal policy"], enforcedIn: ["config/workflows.ts"], caresAbout: ["finance", "ops_lead", "ops_analyst"],
  },
  {
    id: "kyc-sla", name: "KYC decisions within SLA", how: "Cases show time left against the SLA; breaches surface on the lead's view.",
    frameworks: ["BSA/AML CIP"], enforcedIn: ["tools/kyc/logic.ts"], caresAbout: ["ops_analyst", "ops_lead"],
  },
  {
    id: "change", name: "Reviewed changes only", how: "Devin changes tools and config through pull requests an engineer reviews; build.json records each one.",
    frameworks: ["SOC 2 CC8.1"], enforcedIn: ["docs/ADD_TOOL.md", "AGENTS.md"], caresAbout: ["eng_admin", "ops_lead", "product_manager"],
  },
  {
    id: "residency", name: "Data stays in your environment", how: "The app runs in your infrastructure; external systems are reached only through adapters listed under Data & connectors.",
    frameworks: ["Vendor risk"], enforcedIn: ["adapters/", "config/connectors.ts"], caresAbout: ["eng_admin", "finance", "product_manager"],
  },
];
