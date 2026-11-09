import type { Metric } from "@/components/widgets/kpi-tile";
import type { Sources, ViewContext } from "@/components/widgets/types";
import { actionableBy, listApprovals } from "@/core/approvals";
import { flagSources } from "./flags/sources";
import { kycSources } from "./kyc/sources";
import { ledgerSources } from "./ledger/sources";
import { refundSources } from "./refunds/sources";
import { formatUsd, listRefunds } from "./refunds/logic";

// Cross-tool metrics for home pages.
const platform: Sources = {
  metrics: {
    "approvals.waitingOnMe": ({ user }) => ({ label: "Approvals waiting on me", value: actionableBy(user).length }),
    "approvals.pendingCents": () => {
      const pendingRefunds = listRefunds().filter((r) => r.status === "pending_approval").reduce((s, r) => s + r.amountCents, 0);
      const pendingLedger = listApprovals()
        .filter((a) => a.status === "pending" && a.tool === "ledger")
        .reduce((s, a) => s + Number(a.payload.amountCents ?? 0), 0);
      return { label: "$ pending approval", value: formatUsd(pendingRefunds + pendingLedger), hint: "refunds and ledger adjustments" };
    },
  },
};

const all = [platform, refundSources, kycSources, flagSources, ledgerSources];
export const METRICS: Record<string, (ctx: ViewContext) => Metric> = Object.assign({}, ...all.map((s) => s.metrics ?? {}));
export const SOURCES: NonNullable<Sources["sources"]> = Object.assign({}, ...all.map((s) => s.sources ?? {}));
export const PANELS: NonNullable<Sources["panels"]> = Object.assign({}, ...all.map((s) => s.panels ?? {}));
