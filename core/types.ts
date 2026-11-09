import type { ReactNode } from "react";
import type { Role, User } from "./users";

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  actorId: string;
  role: Role;
  tool: string;
  action: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  /** "powerapps-import" for history brought over from Dataverse. */
  source?: string;
};

export type Approval = {
  id: string;
  tool: string;
  action: string;
  target: string;
  summary: string;
  /** Permission the approver needs, e.g. "refunds.approve". */
  permission: string;
  payload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  requestedAt: string;
  reason?: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionReason?: string;
};

export type Capability = "Roles" | "Audit" | "Approvals" | "Masking" | "Adapter";

export type ToolManifest = {
  slug: string;
  name: string;
  description: string;
  replaces: string;
  uses: { capability: Capability; detail: string; file: string }[];
};

export type BuildInfo = { minutes: number; acus: number | null; pr_url: string };

export type ToolDefinition = {
  manifest: ToolManifest;
  build: BuildInfo;
  Page: (props: { query: Record<string, string | undefined> }) => ReactNode | Promise<ReactNode>;
  /** Runs the real effect once an approval for this tool is approved. */
  onApproved?: (approval: Approval, approver: User) => void | Promise<void>;
  /** Optional cleanup when an approval is rejected. */
  onRejected?: (approval: Approval, approver: User) => void | Promise<void>;
};

/** What every write returns. The UI turns it into a toast. */
export type WriteResult = { ok: true; pending: boolean } | { ok: false; error: string };

/** Result shown by ActionForm after a server action. */
export type FormState = { message?: string; error?: string; pending?: boolean };
