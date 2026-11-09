import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { applyFlag, applyRollout, type Env } from "./logic";
import { manifest } from "./manifest";
import Page from "./page";

type Payload = { flagId: string; env: Env; enabled: boolean; rolloutPct: number; reason: string };

const flags: ToolDefinition = {
  manifest,
  build,
  Page,
  onApproved: (approval, approver) => {
    const p = approval.payload as Payload;
    if (approval.action === "flags.rollout_change") applyRollout(approver, p.flagId, p.rolloutPct, p.reason);
    else applyFlag(approver, p.flagId, p.env, p.enabled, p.reason);
  },
};

export default flags;
