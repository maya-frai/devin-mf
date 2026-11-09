import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { completeRefund, rejectRefund } from "./logic";
import { manifest } from "./manifest";
import Page from "./page";

const refundId = (payload: Record<string, unknown>) => String(payload.refundId);

const refunds: ToolDefinition = {
  manifest,
  build,
  Page,
  onApproved: (approval, approver) => completeRefund(approver, refundId(approval.payload), `approval:${approval.id}`, true),
  onRejected: (approval, approver) => rejectRefund(approver, refundId(approval.payload)),
};

export default refunds;
