import type { Role } from "@/core/users";

// Every system the app (and Devin, when building) reads or writes, and what for.
// "needs_access" means a tool would use it but no one has granted access yet.
export type Connector = {
  id: string;
  name: string;
  example: string;
  kind: "API" | "Database" | "File import" | "Identity";
  status: "connected" | "needs_access";
  mock: boolean;
  file: string;
  scopes: string[];
  data: string[];
  uses: Record<string, "R" | "RW">; // tool slug -> read or read/write
  why: string;
  caresAbout: Role[];
};

export const CONNECTORS: Connector[] = [
  {
    id: "payments", name: "Payments processor", example: "PSP API", kind: "API", status: "connected", mock: true, file: "adapters/payments.ts",
    scopes: ["Read payments", "Create refunds (idempotency key)"], data: ["Financial", "Email"], uses: { refunds: "RW" },
    why: "Refunds are issued through the processor, once per idempotency key.", caresAbout: ["ops_analyst", "ops_lead", "finance", "eng_admin", "product_manager"],
  },
  {
    id: "kyc-vendor", name: "Identity verification vendor", example: "KYC/AML vendor API", kind: "API", status: "connected", mock: true, file: "adapters/kycVendor.ts",
    scopes: ["Read applicant cases", "Submit decisions", "Assign reviewers"], data: ["PII: SSN, date of birth", "Documents"], uses: { kyc: "RW" },
    why: "Cases, document checks and watchlist hits come from the vendor; decisions go back to it.", caresAbout: ["ops_analyst", "ops_lead", "eng_admin"],
  },
  {
    id: "dataverse", name: "Power Apps (Dataverse) exports", example: "CSV table exports", kind: "File import", status: "connected", mock: false, file: "config/import-map.ts",
    scopes: ["Read payments, refunds, cases, flags, approvals and audit history"], data: ["Financial", "PII", "Audit history"], uses: { refunds: "R", kyc: "R", flags: "R" },
    why: "Day-one data and in-flight approvals brought over from Power Apps.", caresAbout: ["ops_lead", "eng_admin", "finance", "ops_analyst", "product_manager"],
  },
  {
    id: "app-db", name: "App database", example: "In-memory store (demo); Postgres in production", kind: "Database", status: "connected", mock: true, file: "core/store.ts",
    scopes: ["Read and write app records", "Append-only audit log"], data: ["Everything the tools store"], uses: { refunds: "RW", kyc: "RW", flags: "RW", ledger: "RW" },
    why: "Where tools keep their records, approvals and the audit trail.", caresAbout: ["eng_admin", "ops_lead", "product_manager"],
  },
  {
    id: "ledger-db", name: "Core ledger database", example: "Postgres (read replica + adjustments API)", kind: "Database", status: "needs_access", mock: false, file: "tools/ledger/logic.ts",
    scopes: ["Read balances", "Post manual adjustments"], data: ["Financial"], uses: { ledger: "RW" },
    why: "Ledger Adjustments uses demo accounts until it can read and post to the real ledger.", caresAbout: ["finance", "ops_lead", "eng_admin", "ops_analyst"],
  },
  {
    id: "warehouse", name: "Finance data warehouse", example: "Snowflake (read-only)", kind: "Database", status: "needs_access", mock: false, file: "tools/refunds/sources.tsx",
    scopes: ["Read settled payment volume", "Read bank statement lines"], data: ["Financial"], uses: { refunds: "R" },
    why: "Reconciles the refund dashboard's monthly summary with accounting's numbers.", caresAbout: ["finance", "ops_lead"],
  },
  {
    id: "flag-service", name: "Feature flag service", example: "LaunchDarkly-style API", kind: "API", status: "needs_access", mock: false, file: "tools/flags/logic.ts",
    scopes: ["Read flags", "Change flags per environment"], data: ["Configuration"], uses: { flags: "RW" },
    why: "Feature Flags edits the app's copy of flags until it can drive the real flag service.", caresAbout: ["eng_admin", "ops_lead", "product_manager"],
  },
  {
    id: "sanctions", name: "Sanctions and PEP lists", example: "OFAC, UN, EU lists", kind: "API", status: "needs_access", mock: false, file: "adapters/kycVendor.ts",
    scopes: ["Screen names against lists"], data: ["PII: names"], uses: { kyc: "R" },
    why: "Direct re-screening for the sanctions hit review tool on the roadmap.", caresAbout: ["ops_analyst", "ops_lead"],
  },
  {
    id: "idp", name: "Identity provider", example: "Okta / Entra ID groups", kind: "Identity", status: "needs_access", mock: false, file: "core/session.ts",
    scopes: ["Read users and groups"], data: ["Employee directory"], uses: {},
    why: "Replaces the demo role switcher with real sign-in, mapping Power Apps security roles to app roles.", caresAbout: ["eng_admin", "ops_lead"],
  },
];
