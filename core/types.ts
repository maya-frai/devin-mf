import type { ReactNode } from "react";
import type { Role, User } from "./users";

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  role: Role;
  action: string;
  target: string;
  details?: Record<string, unknown>;
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
  decidedBy?: string;
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
  Page: () => ReactNode | Promise<ReactNode>;
  /** Runs the real effect once an approval for this tool is approved. */
  onApproved?: (approval: Approval, approver: User) => void | Promise<void>;
};

/** Result shown by tool forms after a server action. */
export type FormState = { message?: string; error?: string };
