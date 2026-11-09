import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed } from "@/components/widgets/activity-feed";
import { KpiTiles } from "@/components/widgets/kpi-tile";
import { listAudit } from "@/core/audit";
import { canUseDraft, draftRows, recordView, type DraftTool } from "@/core/drafts";
import { Adoption } from "./adoption";
import type { User } from "@/core/users";
import { DraftTable } from "./draft-table";

const usd = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

// A tool the "+" builder created from a plain-English request, running on the shared core.
export function DraftToolView({ draft, user }: { draft: DraftTool; user: User }) {
  if (!canUseDraft(user, draft)) return <Forbidden user={user} action={`${draft.id}.view`} />;
  recordView(user, draft.id);
  const { spec } = draft;
  const rows = draftRows(draft.id);
  const rule = spec.approvalOverCents !== null ? `${spec.actions[0]} over ${usd(spec.approvalOverCents)} needs ${spec.approverRole}` : "no approval rule";
  const events = listAudit().filter((e) => e.entityId.startsWith(`draft_${draft.id}/`) || e.entityId === `tools/${draft.id}`).slice(0, 8)
    .map((e) => ({ id: e.id, at: e.at, actor: e.actor, text: e.action, reason: e.reason }));
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/30 bg-accent p-3 text-sm text-accent-foreground">
        <Badge className="mr-2">{draft.status === "published" ? "Published" : draft.status === "pilot" ? "Pilot" : draft.status === "in_review" ? "In review" : "Draft"}</Badge>Built by Devin from: “{spec.request}”. Running on the shared core; the real code ships through the PR.
      </div>
      <PageTitle title={spec.name} subtitle={`Actions: ${spec.actions.join(", ")} · ${rule} · every action needs a reason and is audited`} user={user} />
      <Adoption draft={draft} user={user} />
      <KpiTiles metrics={[
        { label: "Records", value: rows.length },
        { label: "Open", value: rows.filter((r) => r.status === "open").length },
        { label: "Pending approval", value: rows.filter((r) => r.status === "pending approval").length },
        ...(spec.money ? [{ label: "Total amount", value: usd(rows.reduce((s, r) => s + r.amountCents, 0)) }] : []),
      ]} />
      <DraftTable slug={draft.id} rows={rows} actions={spec.actions} money={spec.money} />
      <ActivityFeed title="Activity" items={events} />
    </div>
  );
}
