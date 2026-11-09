import type { Sources } from "@/components/widgets/types";
import { formatUsd, listAccounts } from "./logic";
import { LedgerPanel } from "./panel";

export const ledgerSources: Sources = {
  metrics: {
    "ledger.totalBalance": () => ({ label: "Total balance across accounts", value: formatUsd(listAccounts().reduce((s, a) => s + a.balanceCents, 0)), hint: `${listAccounts().length} accounts` }),
  },
  panels: { "ledger.main": LedgerPanel },
};
