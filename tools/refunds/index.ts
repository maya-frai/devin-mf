import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { completeRefund } from "./logic";
import { manifest } from "./manifest";
import Page from "./page";

const refunds: ToolDefinition = {
  manifest,
  build,
  Page,
  onApproved: async (approval, approver) => {
    const { paymentId, reason } = approval.payload as { paymentId: string; reason: string };
    await completeRefund(approver, paymentId, reason);
  },
};

export default refunds;
