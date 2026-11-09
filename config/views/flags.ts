import type { View } from "./types";

export const flagViews: Record<string, View> = {
  // Engineering: the full technical view.
  "flags/admin": {
    widgets: [
      { type: "KpiTiles", metrics: ["flags.total", "flags.onInProd", "flags.pendingProd", "flags.changed7d"] },
      { type: "Panel", panel: "flags.table" },
    ],
  },
  // Ops lead: plain language. What customers have, what's waiting, what changed. No keys, no dev/staging.
  "flags/lead": {
    widgets: [
      { type: "ApprovalList", title: "Prod changes to approve", tool: "flags" },
      { type: "WorkQueue", title: "Turned on for customers", source: "flags.liveInProd", empty: "Nothing is turned on in prod.", width: "half" },
      { type: "ActivityFeed", title: "Recent prod changes", source: "flags.recentProd", width: "half" },
    ],
  },
};
