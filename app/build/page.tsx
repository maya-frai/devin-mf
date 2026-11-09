import { PageTitle } from "@/components/page-title";
import { CONTROLS } from "@/config/compliance";
import { CONNECTORS } from "@/config/connectors";
import { ROLES } from "@/config/roles";
import { WORKFLOWS } from "@/config/workflows";
import { connectorStatus } from "@/core/access";
import { POLICY } from "@/core/permissions";
import { getCurrentUser, getTerms, toolName } from "@/core/session";
import roadmap from "@/data/roadmap.json";
import type { BuildContext } from "@/lib/build-prompt";
import { formatUsd } from "@/tools/refunds/rules";
import { TOOLS } from "@/tools/registry";
import { BuildForm } from "./build-form";

// The "+" in the sidebar: build a new tool or customize one, using this person's role and context.
export default async function BuildPage(props: PageProps<"/build">) {
  const q = (await props.searchParams) as Record<string, string | undefined>;
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const role = ROLES[user.role];
  const tools = Object.entries(role.tools).map(([slug, cfg]) => ({
    slug, view: cfg!.view, name: toolName(terms, slug, TOOLS.find((t) => t.manifest.slug === slug)?.manifest.name ?? slug),
  }));
  const used = CONNECTORS.filter((c) => tools.some((t) => c.uses[t.slug]));
  const ctx: BuildContext = {
    user: { name: user.name, role: user.role, title: role.title, team: role.team },
    tools,
    permissions: Object.entries(POLICY).filter(([, roles]) => roles.includes(user.role)).map(([a]) => a),
    connectors: used.map((c) => ({
      name: c.name, status: connectorStatus(c).replace("_", " "),
      access: tools.map((t) => c.uses[t.slug]).includes("RW") ? "read/write" : "read",
    })),
    rules: [
      `refunds over ${formatUsd(WORKFLOWS.refunds.autoApproveLimitCents)} need ${WORKFLOWS.refunds.approverRole}`,
      `KYC SLA ${WORKFLOWS.kyc.slaHours}h; rejecting risk > ${WORKFLOWS.kyc.highRiskThreshold} needs ${WORKFLOWS.kyc.secondReviewerRole}`,
      `${WORKFLOWS.flags.needApproval.join("/")} flag changes need ${WORKFLOWS.flags.approverRoles.join(" or ")}`,
      `ledger adjustments over ${formatUsd(WORKFLOWS.ledger.approvalLimitCents)} need ${WORKFLOWS.ledger.approverRole}`,
    ],
    controls: CONTROLS.filter((c) => c.caresAbout.includes(user.role)).map((c) => c.name),
  };
  const ideas = roadmap.filter((r) => (r.roles ?? []).includes(user.role)).map((r) => ({ mode: "new" as const, text: `${r.name}: ${r.problem}`, name: r.name }));

  return (
    <div>
      <PageTitle title={terms.buildTool} subtitle="Describe it in plain English. Devin uses your role, your tools and the systems behind them." user={user} />
      <BuildForm ctx={ctx} suggestions={[...role.suggestions, ...ideas]} initialMode={q.mode === "customize" ? "customize" : "new"} initialTool={q.tool} initialRequest={q.request} />
    </div>
  );
}
