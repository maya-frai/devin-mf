import { seedCollections, type Row } from "@/data";

export type { Row };
import type { Approval, AuditEvent } from "./types";

// In-memory stand-in for Dataverse, seeded from JSON. Reset or restart wipes it.
// TODO: swap for the client's real database behind these same functions.
type Db = { collections: Record<string, Row[]>; audit: AuditEvent[]; approvals: Approval[] };

const g = globalThis as unknown as { __db?: Db };

export function db(): Db {
  return (g.__db ??= {
    collections: structuredClone(seedCollections),
    audit: [],
    approvals: [],
  });
}

export function resetStore(): void {
  g.__db = undefined;
}

export function list<T extends Row>(collection: string): T[] {
  return (db().collections[collection] ?? []) as T[];
}

export function getRow<T extends Row>(collection: string, id: string): T {
  const row = list<T>(collection).find((r) => r.id === id);
  if (!row) throw new Error(`${collection}/${id} not found`);
  return row;
}

export function updateRow<T extends Row>(collection: string, id: string, patch: Partial<T>): T {
  return Object.assign(getRow<T>(collection, id), patch);
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
