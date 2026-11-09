import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { setStatus } from "./logic";
import { manifest } from "./manifest";
import Page from "./page";

type Payload = { caseId: string; reason: string; notes: string; from: "open" | "escalated" };

const kyc: ToolDefinition = {
  manifest,
  build,
  Page,
  onApproved: (approval, approver) => {
    const p = approval.payload as Payload;
    return setStatus(approver, p.caseId, "rejected", p.reason, p.notes);
  },
  onRejected: (approval, approver) => {
    const p = approval.payload as Payload;
    return setStatus(approver, p.caseId, p.from, approval.decisionReason ?? "Second review declined");
  },
};

export default kyc;
