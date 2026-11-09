// Turns "What do you want to change?" into a Devin prompt scoped to one config file. Used by /customize.
export const CONFIG_AREAS = [
  { id: "brand", label: "Brand (colors, logo, font, density)", file: "config/brand.ts" },
  { id: "terminology", label: "Terminology (labels and words)", file: "config/terminology.ts" },
  { id: "workflows", label: "Workflows (limits, SLAs, approvers, reason codes)", file: "config/workflows.ts" },
  { id: "roles", label: "Roles (home KPIs, sidebar, which view per tool)", file: "config/roles.ts" },
  { id: "views", label: "Views (widgets on a tool page)", file: "config/views/" },
  { id: "imports", label: "Power Apps import mapping", file: "config/import-map.ts" },
];

export function buildConfigPrompt(areaId: string, request: string): string {
  const area = CONFIG_AREAS.find((a) => a.id === areaId) ?? CONFIG_AREAS[0];
  return [
    `Change this app's configuration: ${request.trim() || "<describe the change>"}`,
    "",
    `Edit only ${area.file} (${area.label}). Keep its TypeScript types valid.`,
    "Do not change components, /core or tool code. If the change can't be made in config alone, stop and explain what code would need to change.",
    "Then run pnpm lint && pnpm build, check the change in the running app as an affected demo user, and open a PR with a before/after note.",
  ].join("\n");
}
