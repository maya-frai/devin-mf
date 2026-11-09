import type { ReactNode } from "react";
import type { User } from "@/core/users";
import type { Metric } from "./kpi-tile";

export type ViewContext = { user: User; query: Record<string, string | undefined>; filters: Record<string, string> };

// What each tool registers in tools/<tool>/sources.tsx so views can use it by name.
export type Sources = {
  metrics?: Record<string, (ctx: ViewContext) => Metric>;
  sources?: Record<string, (ctx: ViewContext) => unknown>;
  panels?: Record<string, (props: { ctx: ViewContext }) => ReactNode | Promise<ReactNode>>;
};
