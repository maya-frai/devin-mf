import type { Sources } from "@/components/widgets/types";
import { listAudit } from "@/core/audit";
import { getRow } from "@/core/store";
import { flagMetrics, isStale, listFlags, type Flag } from "./logic";
import { FlagsPanel } from "./panel";

// Plain-language description of a prod change for non-engineers.
function describe(entityId: string, after: unknown) {
  const [, id, part] = entityId.split("/");
  const flag = getRow<Flag>("flags", id);
  const value = (after ?? {}) as Record<string, unknown>;
  if (part === "rollout") return `${flag.description}: now reaches ${value.rolloutPct}% of customers`;
  return `${flag.description}: turned ${value.prod ? "on" : "off"} for customers`;
}

export const flagSources: Sources = {
  metrics: {
    "flags.total": () => ({ label: "Total flags", value: flagMetrics().total }),
    "flags.onInProd": () => ({ label: "On in prod", value: flagMetrics().onInProd }),
    "flags.pendingProd": () => ({ label: "Pending prod changes", value: flagMetrics().pendingProd }),
    "flags.changed7d": () => ({ label: "Flags changed in 7 days", value: flagMetrics().changed7d }),
    "flags.stale": () => ({ label: "Stale flags (90+ days)", value: listFlags().filter((f) => isStale(f)).length }),
  },
  sources: {
    "flags.byOwner": () => [...new Set(listFlags().map((f) => f.owner))].map((o) => ({ label: o, value: listFlags().filter((f) => f.owner === o).length })),
    "flags.liveInProd": () =>
      listFlags().filter((f) => f.prod).map((f) => ({ id: f.id, title: f.description, subtitle: `On for ${f.rolloutPct}% of customers · owned by ${f.owner}` })),
    "flags.recentProd": () =>
      listAudit()
        .filter((e) => e.tool === "flags" && /\/(prod|rollout)$/.test(e.entityId) && e.action !== "approval.requested")
        .filter((e) => e.action === "flags.changed" || e.action === "flags.rollout_changed")
        .slice(0, 8)
        .map((e) => ({ id: e.id, at: e.at, actor: e.actor, text: describe(e.entityId, e.after), reason: e.reason, source: e.source })),
  },
  panels: { "flags.table": FlagsPanel },
};
