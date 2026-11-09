import type { ToolDefinition } from "@/core/types";
import flags from "./flags";
import kyc from "./kyc";
import refunds from "./refunds";

// Every tool registers here. The sidebar, home page and /tools/<slug> read this list.
export const TOOLS: ToolDefinition[] = [refunds, kyc, flags];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.manifest.slug === slug);
}
