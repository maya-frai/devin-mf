import { listApprovals } from "@/core/approvals";
import { auditFor } from "@/core/audit";
import { can, rolesFor } from "@/core/permissions";
import type { ViewContext } from "@/components/widgets/types";
import { getUser } from "@/core/users";
import { FlagsTable, type FlagRow } from "./flags-table";
import { isStale, listFlags } from "./logic";

// Full technical view: environment toggles, rollout %, history.
export function FlagsPanel({ ctx: { user } }: { ctx: ViewContext }) {
  const approvals = listApprovals().filter((a) => a.tool === "flags");
  const rows: FlagRow[] = listFlags().map((f) => {
    const pending = (part: string) => approvals.find((a) => a.status === "pending" && a.target === `flags/${f.id}/${part}`);
    const lastProd = approvals.find((a) => a.target.startsWith(`flags/${f.id}/`) && a.action !== "flags.changed");
    return {
      ...f,
      stale: isStale(f),
      prodState: pending("prod") ? "pending approval" : f.prod ? "on" : "off",
      pendingProd: !!pending("prod"),
      pendingRollout: !!pending("rollout"),
      approval: lastProd ? { summary: lastProd.summary, status: lastProd.status, requestedBy: getUser(lastProd.requestedBy)?.name ?? lastProd.requestedBy } : null,
      history: auditFor(`flags/${f.id}`).map((e) => ({ id: e.id, at: e.at, actor: e.actor, action: e.action, part: e.entityId.split("/")[2], reason: e.reason ?? "", after: JSON.stringify(e.after ?? ""), source: e.source })),
    };
  });

  return <FlagsTable rows={rows} canToggle={can(user, "flags.toggle")} needs={rolesFor("flags.toggle")} />;
}
