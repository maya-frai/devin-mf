// Turns a short tool request into a Devin prompt. Used by /new-tool and /roadmap.
export type ToolRequest = {
  name: string;
  users: string;
  does: string;
  sensitive: string;
  capabilities?: string[];
};

export const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function buildToolPrompt(req: ToolRequest): string {
  const slug = slugify(req.name) || "<slug>";
  return [
    `Build a new internal tool in this repo: "${req.name}" (tools/${slug}/).`,
    "",
    "Follow docs/ADD_TOOL.md exactly: folder layout, manifest, core functions, approvals, build.json and the done checklist.",
    "",
    `Who uses it: ${req.users || "TBD"}`,
    `What they do: ${req.does || "TBD"}`,
    `Sensitive actions: ${req.sensitive || "none"}`,
    req.capabilities?.length ? `Core capabilities: ${req.capabilities.join(", ")}` : "",
    "",
    "Rules: gate every action with assertCan(), audit every mutation with logAudit(), and route sensitive actions through requestApproval() (the approver must differ from the requester).",
    "Use synthetic seed data (15–30 rows), mask any SSN/DOB, add no new dependencies and keep files under ~150 lines.",
    `When done, list the tool on the home page via tools/registry.ts, fill in tools/${slug}/build.json and open a PR.`,
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");
}
