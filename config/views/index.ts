import { flagViews } from "./flags";
import { kycViews } from "./kyc";
import { refundViews } from "./refunds";
import type { View } from "./types";

export const VIEWS: Record<string, View> = {
  ...refundViews,
  ...kycViews,
  ...flagViews,
  "ledger/default": { widgets: [{ type: "Panel", panel: "ledger.main" }] },
};
