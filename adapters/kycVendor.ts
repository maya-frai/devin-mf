import { getRow, list, updateRow, type Row } from "@/core/store";

// Mock KYC/AML vendor connector (identity, documents, sanctions and PEP screening).
// TODO: swap for the real vendor SDK behind these same functions.
export type DocCheck = "passed" | "failed" | "missing";
export type KycStatus = "open" | "escalated" | "pending_second_review" | "approved" | "rejected";

export type KycCase = Row & {
  customer: string;
  country: string;
  ssn: string;
  dob: string;
  riskScore: number;
  riskFactors: { label: string; points: number }[];
  documents: { id: DocCheck; selfie: DocCheck; address: DocCheck };
  watchlistHits: { list: string; name: string; score: number }[];
  status: KycStatus;
  assignee: string | null;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
};

export function listCases(): KycCase[] {
  return list<KycCase>("kyc_cases");
}

export function getCase(id: string): KycCase {
  return getRow<KycCase>("kyc_cases", id);
}

export async function submitDecision(id: string, status: KycStatus, userId: string) {
  const decided = status === "approved" || status === "rejected";
  return updateRow<KycCase>("kyc_cases", id, {
    status,
    ...(decided ? { decidedAt: new Date().toISOString(), decidedBy: userId } : {}),
  });
}

export async function assignCase(id: string, userId: string) {
  return updateRow<KycCase>("kyc_cases", id, { assignee: userId });
}
