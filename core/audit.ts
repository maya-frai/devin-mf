import { db, newId } from "./store";
import type { AuditEvent } from "./types";
import type { User } from "./users";

export type AuditInput = {
  actor: User;
  tool: string;
  action: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

// Append-only audit trail (replaces Dataverse auditing). Every write calls this.
export function logAudit({ actor, ...entry }: AuditInput): AuditEvent {
  const event: AuditEvent = {
    id: newId("evt"),
    at: new Date().toISOString(),
    actor: actor.name,
    actorId: actor.id,
    role: actor.role,
    ...entry,
  };
  db().audit.unshift(event);
  return event;
}

export function listAudit(): AuditEvent[] {
  return db().audit;
}

export function auditFor(entityId: string): AuditEvent[] {
  return db().audit.filter((e) => e.entityId === entityId || e.entityId.startsWith(`${entityId}/`));
}
