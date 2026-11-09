// Turns a plain-English request from the "+" builder into a plan and a Devin prompt that carries
// the person's context. Pure function: no API calls. Used by /build.
import { slugify } from "./tool-prompt";

export type BuildContext = {
  user: { name: string; role: string; title: string; team: string };
  tools: { slug: string; name: string; view: string }[];
  permissions: string[];
  connectors: { name: string; status: string; access: string }[];
  rules: string[];
  controls: string[];
};

export type BuildRequest = { mode: "new" | "customize"; tool?: string; name?: string; request: string };

export function buildPlan(req: BuildRequest, ctx: BuildContext): string[] {
  if (req.mode === "customize") {
    const tool = ctx.tools.find((t) => t.slug === req.tool);
    return [
      `config/views/${req.tool}.ts: change the "${tool?.view ?? "?"}" view`,
      `config/roles.ts: only if KPIs, filters or columns for ${ctx.user.role} change`,
      `tools/${req.tool}/sources.tsx: only if a new metric or data source is needed`,
    ];
  }
  const slug = slugify(req.name ?? "") || "<slug>";
  return [
    `tools/${slug}/: manifest, logic, actions, sources, page, index, build.json (docs/ADD_TOOL.md)`,
    `config/views/${slug}.ts: a view for ${ctx.user.role}`,
    `config/roles.ts: add the tool to ${ctx.user.role}'s sidebar and tools`,
    "core/permissions.ts, tools/registry.ts, tools/sources.tsx: register it",
    "config/connectors.ts: any new system it needs, marked needs_access until granted",
  ];
}

export function buildPrompt(req: BuildRequest, ctx: BuildContext): string {
  const target = req.mode === "customize"
    ? `Customize the existing "${ctx.tools.find((t) => t.slug === req.tool)?.name ?? req.tool}" tool for ${ctx.user.role}.`
    : `Build a new internal tool, "${req.name || "Untitled"}" (tools/${slugify(req.name ?? "") || "<slug>"}/), following docs/ADD_TOOL.md exactly.`;
  return [
    target,
    "",
    `Request from ${ctx.user.name} (${ctx.user.title}, ${ctx.user.team}): ${req.request.trim() || "<describe it>"}`,
    "",
    "Context to use:",
    `- Role: ${ctx.user.role}. Can: ${ctx.permissions.join(", ")}.`,
    `- Tools they use today: ${ctx.tools.map((t) => `${t.name} (${t.view})`).join(", ")}.`,
    `- Systems behind those tools: ${ctx.connectors.map((c) => `${c.name} [${c.access}, ${c.status}]`).join("; ") || "none"}.`,
    `- Business rules (config/workflows.ts): ${ctx.rules.join("; ")}.`,
    `- Controls that must keep holding: ${ctx.controls.join("; ")}.`,
    "",
    "Plan (touch only these unless you explain why):",
    ...buildPlan(req, ctx).map((p) => `- ${p}`),
    "",
    req.mode === "customize"
      ? "Prefer config changes over code. Keep other roles' views unchanged."
      : "Use /core for permissions, audit and approvals; every write needs a reason; synthetic data only; no new dependencies.",
    "If a system needs access that isn't granted, add it to config/connectors.ts as needs_access instead of faking it.",
    "Run pnpm lint && pnpm build, click through as this demo user, fill in build.json and open a PR.",
  ].join("\n");
}
