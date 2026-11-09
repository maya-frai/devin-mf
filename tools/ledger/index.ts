import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { applyAdjustment, type Direction } from "./logic";
import { manifest } from "./manifest";
import Page from "./page";

const ledger: ToolDefinition = {
  manifest,
  build,
  Page,
  onApproved: (approval, approver) => {
    const p = approval.payload as { accountId: string; direction: Direction; amountCents: number; reason: string };
    applyAdjustment(approver, p.accountId, p.direction, p.amountCents, p.reason);
  },
};

export default ledger;
