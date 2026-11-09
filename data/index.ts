import { importPowerApps } from "@/core/importer";
import ledgerAccounts from "@/tools/ledger/seed.json";

// Data for the in-memory store (replaces Dataverse tables): Power Apps exports from
// /data/imports/powerapps (see config/import-map.ts), plus JSON seeds for tools built here.
export type Row = { id: string } & Record<string, unknown>;

// Seed timestamps were written relative to SEED_NOW. Shift them so the demo always looks current.
const SEED_NOW = Date.parse("2026-11-09T21:00:00.000Z");
const DATE_KEYS = ["at", "createdAt", "submittedAt", "decidedAt", "updatedAt", "requestedAt"];

function rebase(rows: Row[], shift: number): Row[] {
  return rows.map((row) => {
    const copy: Row = structuredClone(row);
    for (const key of DATE_KEYS) {
      if (typeof copy[key] === "string") copy[key] = new Date(Date.parse(copy[key] as string) + shift).toISOString();
    }
    return copy;
  });
}

export function freshSeed() {
  const shift = Date.now() - SEED_NOW;
  const { approvals, audit, ...tables } = importPowerApps();
  const collections: Record<string, Row[]> = { ...tables, ledger_accounts: ledgerAccounts };
  return {
    collections: Object.fromEntries(Object.entries(collections).map(([name, rows]) => [name, rebase(rows, shift)])),
    approvals: rebase(approvals, shift),
    audit: rebase(audit, shift),
    imported: { payments: tables.payments.length, cases: tables.kyc_cases.length, flags: tables.flags.length, history: audit.length },
  };
}
