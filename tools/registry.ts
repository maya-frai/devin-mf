import type { ToolDefinition } from "@/core/types";

// Every tool registers here. See docs/ADD_TOOL.md.
export const TOOLS: ToolDefinition[] = [];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.manifest.slug === slug);
}
