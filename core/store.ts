import { freshSeed, type Row } from "@/data";
import type { Approval, AuditEvent } from "./types";

export type { Row };

// In-memory stand-in for Dataverse, seeded from JSON. Reset or restart wipes it.
// TODO: swap for the client's real database behind these same functions.
type Db = {
  collections: Record<string, Row[]>;
  audit: AuditEvent[];
  approvals: Approval[];
  recent: Record<string, string[]>;
  imported: { payments: number; cases: number; flags: number; history: number };
};

const g = globalThis as unknown as { __db?: Db };

export function db(): Db {
  if (!g.__db) {
    const seed = freshSeed();
    g.__db = {
      collections: seed.collections,
      approvals: seed.approvals as unknown as Approval[],
      audit: seed.audit as unknown as AuditEvent[],
      recent: {},
      imported: seed.imported,
    };
  }
  return g.__db;
}

export function resetStore(): void {
  g.__db = undefined;
}

export function list<T extends Row>(collection: string): T[] {
  return (db().collections[collection] ?? []) as T[];
}

export function get<T extends Row>(collection: string, id: string): T | undefined {
  return list<T>(collection).find((r) => r.id === id);
}

export function getRow<T extends Row>(collection: string, id: string): T {
  const row = get<T>(collection, id);
  if (!row) throw new Error(`${collection}/${id} not found`);
  return row;
}

export function create<T extends Row>(collection: string, row: T): T {
  (db().collections[collection] ??= []).unshift(row);
  return row;
}

export function remove(collection: string, id: string): void {
  db().collections[collection] = list(collection).filter((r) => r.id !== id);
}

export function updateRow<T extends Row>(collection: string, id: string, patch: Partial<T>): T {
  return Object.assign(getRow<T>(collection, id), patch);
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

// "Recent apps" on the home page, per user.
export function trackOpen(userId: string, slug: string): void {
  const recent = db().recent;
  recent[userId] = [slug, ...(recent[userId] ?? []).filter((s) => s !== slug)].slice(0, 3);
}

export const recentFor = (userId: string): string[] => db().recent[userId] ?? [];

export const importCounts = () => db().imported;
