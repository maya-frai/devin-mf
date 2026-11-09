import type { ReactNode } from "react";
import type { Role, User } from "./users";

export type AuditEvent = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  role: Role;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  tool: string;
  action: string;
  target: string;
  summary: string;
  payload: Record<string, unknown>;
  permission: string;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: string;
  decidedBy?: string;
  decidedAt?: string;
};

export type ToolManifest = {
  slug: string;
  name: string;
  description: string;
  replaces: string;
};

export type BuildInfo = { minutes: number; acus: number; pr_url: string };

export type ToolDefinition = {
  manifest: ToolManifest;
  build: BuildInfo;
  Page: () => ReactNode | Promise<ReactNode>;
  onApproved?: (approval: Approval, approver: User) => void | Promise<void>;
};
