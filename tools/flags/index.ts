import type { ToolDefinition } from "@/core/types";
import build from "./build.json";
import { applyFlag, type Env } from "./logic";
import { manifest } from "./manifest";
import Page from "./page";

const flags: ToolDefinition = {
  manifest,
  build,
  Page,
  onApproved: (approval, approver) => {
    const { flagId, env, enabled } = approval.payload as { flagId: string; env: Env; enabled: boolean };
    applyFlag(approver, flagId, env, enabled);
  },
};

export default flags;
