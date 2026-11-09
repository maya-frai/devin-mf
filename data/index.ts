import flags from "@/tools/flags/seed.json";
import kycCases from "@/tools/kyc/seed.json";
import payments from "@/tools/refunds/seed.json";

// Seed data for the in-memory store (replaces Dataverse tables).
// Each tool keeps its seed.json in its own folder and registers it here.
export type Row = { id: string } & Record<string, unknown>;

export const seedCollections: Record<string, Row[]> = {
  payments,
  kyc_cases: kycCases,
  flags,
};
