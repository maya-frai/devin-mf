import customers from "./customers.json";

// Seed data for the in-memory store (replaces Dataverse tables).
// Shared tables live in /data. Each tool adds its own seed.json here.
export type Row = { id: string } & Record<string, unknown>;

export const seedCollections: Record<string, Row[]> = {
  customers,
};
