import { pendingApprovalFor, requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import { getRow, list, updateRow, type Row } from "@/core/store";
import type { User } from "@/core/users";

export const ENVS = ["dev", "staging", "prod"] as const;
export type Env = (typeof ENVS)[number];
export type Flag = Row & { key: string; description: string; owner: string } & Record<Env, boolean>;

export const listFlags = () => list<Flag>("flags");
export const flagTarget = (flagId: string, env: Env) => `flags/${flagId}/${env}`;

// Dev and staging change instantly. Prod changes need approval from someone else.
export function setFlag(user: User, flagId: string, env: Env, enabled: boolean) {
  assertCan(user, "flags.toggle");
  const flag = getRow<Flag>("flags", flagId);
  const target = flagTarget(flagId, env);
  if (pendingApprovalFor(target)) throw new Error("A change is already awaiting approval");

  if (env === "prod") {
    const approval = requestApproval(user, {
      tool: "flags",
      action: "flags.prod_change",
      target,
      summary: `Turn ${enabled ? "ON" : "OFF"} ${flag.key} in prod`,
      permission: "flags.approve",
      payload: { flagId, env, enabled },
    });
    return { status: "pending_approval" as const, approvalId: approval.id };
  }
  applyFlag(user, flagId, env, enabled);
  return { status: "applied" as const };
}

export function applyFlag(user: User, flagId: string, env: Env, enabled: boolean) {
  updateRow<Flag>("flags", flagId, { [env]: enabled } as Partial<Flag>);
  logAudit(user, "flags.changed", flagTarget(flagId, env), { enabled });
}
