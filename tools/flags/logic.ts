import { WORKFLOWS } from "@/config/workflows";
import { listApprovals, pendingApprovalFor, requestApproval } from "@/core/approvals";
import { logAudit } from "@/core/audit";
import { assertCan } from "@/core/permissions";
import { getRow, list, updateRow, type Row } from "@/core/store";
import type { User } from "@/core/users";

export const ENVS = WORKFLOWS.flags.environments;
export const needsApproval = (env: string) => WORKFLOWS.flags.needApproval.includes(env);
export type Env = (typeof ENVS)[number];
export type Flag = Row & { key: string; description: string; owner: string; rolloutPct: number; updatedAt: string } & Record<Env, boolean>;

const DAY = 86_400_000;
export const listFlags = () => list<Flag>("flags");
export const flagTarget = (flagId: string, part: Env | "rollout") => `flags/${flagId}/${part}`;
export const isStale = (f: Flag, now = Date.now()) => now - Date.parse(f.updatedAt) > 90 * DAY;

export function flagMetrics(now = Date.now()) {
  const flags = listFlags();
  return {
    total: flags.length,
    onInProd: flags.filter((f) => f.prod).length,
    pendingProd: listApprovals().filter((a) => a.tool === "flags" && a.status === "pending").length,
    changed7d: flags.filter((f) => now - Date.parse(f.updatedAt) < 7 * DAY).length,
  };
}

function requireReason(reason: string) {
  if (!reason?.trim()) throw new Error("A reason is required");
}

// Environments listed in config/workflows.ts needApproval go to an approver; the rest apply instantly.
export function setFlag(user: User, flagId: string, env: Env, enabled: boolean, reason: string) {
  assertCan(user, "flags.toggle");
  requireReason(reason);
  const flag = getRow<Flag>("flags", flagId);
  const target = flagTarget(flagId, env);
  if (pendingApprovalFor(target)) throw new Error("A change is already awaiting approval");

  if (needsApproval(env)) {
    const approval = requestApproval(user, {
      tool: "flags", action: "flags.prod_change", target, permission: "flags.approve", reason,
      summary: `Turn ${enabled ? "on" : "off"} in ${env}: ${flag.description}`, payload: { flagId, env, enabled, reason },
    });
    return { status: "pending_approval" as const, approvalId: approval.id, pending: true };
  }
  applyFlag(user, flagId, env, enabled, reason);
  return { status: "applied" as const, pending: false };
}

export function applyFlag(user: User, flagId: string, env: Env, enabled: boolean, reason: string) {
  const before = { [env]: getRow<Flag>("flags", flagId)[env] };
  updateRow<Flag>("flags", flagId, { [env]: enabled, updatedAt: new Date().toISOString() } as Partial<Flag>);
  logAudit({ actor: user, tool: "flags", action: "flags.changed", entityId: flagTarget(flagId, env), before, after: { [env]: enabled }, reason });
}

// Rollout % is a prod setting, so it follows the prod approval rule.
export function setRollout(user: User, flagId: string, rolloutPct: number, reason: string) {
  assertCan(user, "flags.toggle");
  requireReason(reason);
  if (!Number.isInteger(rolloutPct) || rolloutPct < 0 || rolloutPct > 100) throw new Error("Rollout must be 0–100%");
  const flag = getRow<Flag>("flags", flagId);
  const target = flagTarget(flagId, "rollout");
  if (pendingApprovalFor(target)) throw new Error("A rollout change is already awaiting approval");
  requestApproval(user, {
    tool: "flags", action: "flags.rollout_change", target, permission: "flags.approve", reason,
    summary: `Change prod rollout ${flag.rolloutPct}% → ${rolloutPct}%: ${flag.description}`, payload: { flagId, rolloutPct, reason },
  });
  return { pending: true };
}

export function applyRollout(user: User, flagId: string, rolloutPct: number, reason: string) {
  const before = { rolloutPct: getRow<Flag>("flags", flagId).rolloutPct };
  updateRow<Flag>("flags", flagId, { rolloutPct, updatedAt: new Date().toISOString() });
  logAudit({ actor: user, tool: "flags", action: "flags.rollout_changed", entityId: flagTarget(flagId, "rollout"), before, after: { rolloutPct }, reason });
}
