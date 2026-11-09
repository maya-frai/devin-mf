import { db, newId } from "./store";
import type { AuditEvent } from "./types";
import type { User } from "./users";

// Append-only audit trail (replaces Dataverse auditing).
export function logAudit(
  user: User,
  action: string,
  target?: string,
  details?: Record<string, unknown>,
): AuditEvent {
  const event: AuditEvent = {
    id: newId("evt"),
    at: new Date().toISOString(),
    actorId: user.id,
    actorName: user.name,
    role: user.role,
    action,
    target,
    details,
  };
  db().audit.unshift(event);
  return event;
}

export function listAudit(): AuditEvent[] {
  return db().audit;
}
