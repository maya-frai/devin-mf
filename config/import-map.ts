// How each Power Apps (Dataverse) export column maps onto the app's fields.
// core/importer.ts reads /data/imports/powerapps through this map at startup and on "Reset demo data".
/** Marks audit entries that came from the Dataverse audit export. */
export const IMPORT_SOURCE = "powerapps-import";

export type Convert = "text" | "number" | "money" | "bool" | "date" | "json" | "user" | "role" | "factors" | "hits";
export type FieldSpec = string | { from: string; as: Convert | Record<string, string> };
export type TableMap = { file: string; into: string; fields: Record<string, FieldSpec> };

export const IMPORT_MAP: TableMap[] = [
  {
    file: "payments.csv", into: "payments",
    fields: {
      id: "cr4f2_paymentid", customer: "cr4f2_customername", email: "emailaddress1", currency: "transactioncurrencyid", method: "cr4f2_paymentmethod",
      amountCents: { from: "cr4f2_amount", as: "money" }, refundedCents: { from: "cr4f2_refundedamount", as: "money" },
      status: { from: "statuscode", as: { "1": "settled", "100000001": "partially_refunded", "100000002": "refunded" } },
      createdAt: { from: "createdon", as: "date" },
    },
  },
  {
    file: "refunds.csv", into: "refunds",
    fields: {
      id: "cr4f2_refundid", paymentId: "cr4f2_paymentid", customer: "cr4f2_customername", reason: "cr4f2_reasoncode", notes: "cr4f2_notes",
      amountCents: { from: "cr4f2_amount", as: "money" }, approvalId: "cr4f2_approvalid",
      status: { from: "statuscode", as: { "100000000": "completed", "100000001": "pending_approval", "100000002": "rejected" } },
      requestedBy: { from: "createdby", as: "user" }, createdAt: { from: "createdon", as: "date" },
      decidedAt: { from: "cr4f2_decidedon", as: "date" }, decidedBy: { from: "cr4f2_decidedby", as: "user" },
    },
  },
  {
    file: "kyc_cases.csv", into: "kyc_cases",
    fields: {
      id: "cr4f2_casenumber", customer: "cr4f2_applicantname", country: "address1_country", ssn: "cr4f2_ssn", dob: "birthdate",
      riskScore: { from: "cr4f2_riskscore", as: "number" }, riskFactors: { from: "cr4f2_riskfactors", as: "factors" },
      "documents.id": "cr4f2_doc_id", "documents.selfie": "cr4f2_doc_selfie", "documents.address": "cr4f2_doc_address",
      watchlistHits: { from: "cr4f2_watchlisthits", as: "hits" },
      status: { from: "statuscode", as: { "1": "open", "100000001": "escalated", "100000002": "pending_second_review", "100000003": "approved", "100000004": "rejected" } },
      assignee: { from: "ownerid", as: "user" }, submittedAt: { from: "createdon", as: "date" },
      decidedAt: { from: "cr4f2_decidedon", as: "date" }, decidedBy: { from: "cr4f2_decidedby", as: "user" },
    },
  },
  {
    file: "feature_flags.csv", into: "flags",
    fields: {
      id: "cr4f2_flagid", key: "cr4f2_key", description: "cr4f2_description", owner: "cr4f2_owningteam",
      dev: { from: "cr4f2_dev", as: "bool" }, staging: { from: "cr4f2_staging", as: "bool" }, prod: { from: "cr4f2_prod", as: "bool" },
      rolloutPct: { from: "cr4f2_rolloutpercent", as: "number" }, updatedAt: { from: "modifiedon", as: "date" },
    },
  },
  {
    file: "approvals.csv", into: "approvals",
    fields: {
      id: "msdyn_flowapprovalid", tool: "cr4f2_tool", action: "cr4f2_action", target: "cr4f2_target", summary: "msdyn_title",
      permission: "cr4f2_permission", payload: { from: "cr4f2_payload", as: "json" }, reason: "cr4f2_reason",
      status: { from: "statuscode", as: { Pending: "pending", Approved: "approved", Rejected: "rejected" } },
      requestedBy: { from: "createdby", as: "user" }, requestedAt: { from: "createdon", as: "date" },
    },
  },
  {
    file: "audit_history.csv", into: "audit",
    fields: {
      id: "auditid", at: { from: "createdon", as: "date" }, actor: "userid", actorId: { from: "userid", as: "user" },
      role: { from: "cr4f2_securityrole", as: "role" }, action: "operation", entityId: "objectid", reason: "cr4f2_reason",
      tool: { from: "objecttypecode", as: { cr4f2_payment: "refunds", cr4f2_kyccase: "kyc", cr4f2_featureflag: "flags" } },
      before: { from: "changedata_before", as: "json" }, after: { from: "changedata_after", as: "json" },
    },
  },
];
