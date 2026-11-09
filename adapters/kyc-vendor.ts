import { getRow, list, updateRow, type Row } from "@/core/store";

// Mock KYC/AML vendor connector (identity, sanctions and PEP screening).
// TODO: swap for the real vendor SDK behind these same functions.
export type KycCase = Row & {
  customer: string;
  country: string;
  ssn: string;
  dob: string;
  documentType: string;
  riskScore: number;
  riskFactors: string[];
  status: "open" | "approved" | "rejected" | "escalated";
  submittedAt: string;
  decisionReason?: string;
};

export function listCases(): KycCase[] {
  return list<KycCase>("kyc_cases");
}

export function getCase(id: string): KycCase {
  return getRow<KycCase>("kyc_cases", id);
}

export async function submitDecision(id: string, status: KycCase["status"], reason: string) {
  return updateRow<KycCase>("kyc_cases", id, { status, decisionReason: reason });
}
