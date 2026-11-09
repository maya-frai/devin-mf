import { CONNECTORS, type Connector } from "@/config/connectors";
import { pendingApprovalFor, requestApproval } from "./approvals";
import { logAudit } from "./audit";
import { assertCan } from "./permissions";
import { create, get } from "./store";
import type { Approval } from "./types";
import type { User } from "./users";

export type ConnectorStatus = "connected" | "granted" | "requested" | "needs_access";
const target = (id: string) => `connectors/${id}`;

export function connectorStatus(c: Connector): ConnectorStatus {
  if (c.status === "connected") return "connected";
  if (get("access_grants", c.id)) return "granted";
  return pendingApprovalFor(target(c.id)) ? "requested" : "needs_access";
}

// Asking for access is itself a two-person approval, and it's audited.
export function requestAccess(user: User, connectorId: string, reason: string) {
  assertCan(user, "access.request");
  const c = CONNECTORS.find((x) => x.id === connectorId);
  if (!c) throw new Error("Unknown connector");
  if (!reason.trim()) throw new Error("A reason is required");
  if (connectorStatus(c) !== "needs_access") throw new Error("Access is already granted or requested");
  requestApproval(user, {
    tool: "platform", action: "access.grant", target: target(c.id), permission: "access.approve", reason,
    summary: `Grant access to ${c.name} (${c.scopes.join(", ")}) for ${user.name}`, payload: { connectorId: c.id },
  });
  return { pending: true };
}

export function grantAccess(approval: Approval, approver: User) {
  const id = String(approval.payload.connectorId);
  create("access_grants", { id, grantedBy: approver.id, grantedAt: new Date().toISOString() });
  logAudit({ actor: approver, tool: "platform", action: "access.granted", entityId: target(id), before: { status: "needs_access" }, after: { status: "granted" }, reason: approval.decisionReason });
}
