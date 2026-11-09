import { seedCollections, type Row } from "@/data";
import type { Approval, AuditEvent } from "./types";

// In-memory stand-in for Dataverse. Seeded from /data, wiped by Reset or restart.
// TODO: swap for the client's real database behind the same functions.
type Db = {
  collections: Record<string, Row[]>;
  audit: AuditEvent[];
  approvals: Approval[];
};

const g = globalThis as unknown as { __internalToolsDb?: Db };

function fresh(): Db {
  return { collections: structuredClone(seedCollections), audit: [], approvals: [] };
}

export function db(): Db {
  return (g.__internalToolsDb ??= fresh());
}

export function resetStore(): void {
  g.__internalToolsDb = fresh();
}

export function list<T extends Row>(collection: string): T[] {
  return (db().collections[collection] ?? []) as T[];
}

export function getRow<T extends Row>(collection: string, id: string): T | undefined {
  return list<T>(collection).find((r) => r.id === id);
}

export function updateRow<T extends Row>(
  collection: string,
  id: string,
  patch: Partial<T>,
): T {
  const row = getRow<T>(collection, id);
  if (!row) throw new Error(`${collection}/${id} not found`);
  Object.assign(row, patch);
  return row;
}

export function insertRow<T extends Row>(collection: string, row: T): T {
  (db().collections[collection] ??= []).unshift(row);
  return row;
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
