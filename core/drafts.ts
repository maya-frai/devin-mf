import type { Widget } from "@/config/views/types";
import { WORKFLOWS } from "@/config/workflows";
import { interpretNew, pastTense, type Customization, type DraftSpec, type Tweak } from "@/lib/interpret";
import { requestApproval } from "./approvals";
import { listAudit, logAudit } from "./audit";
import { create, get, getRow, list, remove, updateRow, type Row } from "./store";
import type { Approval } from "./types";
import { USERS, type Role, type User } from "./users";

// What the "+" builder produces live: draft tools and per-role view customizations, stored like any
// other data and audited. Devin turns them into real code through the generated prompt and a PR.
// Lifecycle: draft (builder only) -> pilot (teammates adopted it) -> in_review -> published (whole role).
export type DraftStatus = "draft" | "pilot" | "in_review" | "published";
export type DraftTool = Row & {
  spec: DraftSpec; role: Role; createdBy: string; createdAt: string;
  status: DraftStatus; adoptedBy: string[]; viewers: string[]; opens: number;
};
export type DraftRow = Row & { subject: string; amountCents: number; status: string; owner: string; createdAt: string };
export type CustomWidget = Row & { role: Role; tool: string; widget?: Widget; tweak?: Tweak; label: string; request: string; createdBy: string };

const NAMES = ["Harper Quinn", "Mateo Silva", "Zoe Laurent", "Arjun Mehta", "Chloe Dubois", "Noah Fischer", "Amara Eze", "Liam Byrne"];
// One tool per role, built by a teammate, so every role has something to adopt from its home page.
const SEEDS = [
  { by: "omar", name: "Payout reconciliation", request: "Match payouts to the bank statement and flag breaks. Matching payouts over $500 needs ops lead approval." },
  { by: "sam", name: "Internal access requests", request: "Approve or reject production access requests with an expiry. Approving access over $0 needs ops lead approval." },
  { by: "jordan", name: "Chargeback evidence tracker", request: "Review disputes, attach evidence and resolve each one before the deadline. Resolving disputes over $500 needs ops lead approval." },
  { by: "leo", name: "Launch checklist", request: "Review each launch, confirm support and docs are ready, and flag blockers." },
  { by: "maria", name: "Weekly ops review", request: "Review refund volume, SLA breaches and pending approvals each week, and close each item once discussed." },
];
function seedDrafts() {
  if (get("draft_meta", "seeded")) return;
  create("draft_meta", { id: "seeded" });
  for (const s of SEEDS) {
    const by = USERS.find((u) => u.id === s.by);
    if (by) updateRow<DraftTool>("draft_tools", createDraft(by, interpretNew(s.name, s.request)), { opens: 6 });
  }
}
export const listDrafts = () => { seedDrafts(); return list<DraftTool>("draft_tools"); };
export const getDraft = (slug: string) => get<DraftTool>("draft_tools", slug);
export const draftRows = (slug: string) => list<DraftRow>(`draft_${slug}`);
export const customWidgets = (role: Role, tool: string) => list<CustomWidget>("custom_widgets").filter((c) => c.role === role && c.tool === tool);

export function createDraft(user: User, spec: DraftSpec): string {
  let slug = spec.slug;
  for (let n = 2; getDraft(slug); n++) slug = `${spec.slug}-${n}`;
  create<DraftTool>("draft_tools", { id: slug, spec: { ...spec, slug }, role: user.role, createdBy: user.id, createdAt: new Date().toISOString(), status: "draft", adoptedBy: [], viewers: [user.id], opens: 0 });
  for (let i = 0; i < 15; i++) {
    create<DraftRow>(`draft_${slug}`, {
      id: `${spec.entity.slice(0, 3)}_${101 + i}`, subject: `${spec.entity[0].toUpperCase()}${spec.entity.slice(1)} for ${NAMES[i % NAMES.length]}`,
      amountCents: spec.money ? ((i * 7919) % 180_000) + 1_200 : 0, status: "open", owner: USERS[i % USERS.length].name,
      createdAt: new Date(Date.now() - i * 3_600_000 * 5).toISOString(),
    });
  }
  logAudit({ actor: user, tool: "platform", action: "tool.drafted", entityId: `tools/${slug}`, after: { name: spec.name, actions: spec.actions, approvalOverCents: spec.approvalOverCents }, reason: spec.request });
  return slug;
}

export function addCustomization(user: User, c: Customization, request: string) {
  const row = create<CustomWidget>("custom_widgets", { id: `cw_${Date.now().toString(36)}`, role: user.role, tool: c.tool, widget: c.widget, tweak: c.tweak, label: c.label, request, createdBy: user.id });
  logAudit({ actor: user, tool: "platform", action: "tool.customized", entityId: `config/views/${c.tool}`, after: { role: user.role, widget: c.label }, reason: request });
  return row;
}

export function removeCustomization(user: User, id: string) {
  const row = getRow<CustomWidget>("custom_widgets", id);
  remove("custom_widgets", id);
  logAudit({ actor: user, tool: "platform", action: "tool.customization_undone", entityId: `config/views/${row.tool}`, before: { widget: row.label }, reason: "Undo" });
}

export const usesDraft = (user: User, d: DraftTool) =>
  d.createdBy === user.id || d.adoptedBy.includes(user.id) || (d.status === "published" && d.role === user.role);

export function recordView(user: User, slug: string) {
  const d = getDraft(slug);
  if (d) updateRow<DraftTool>("draft_tools", slug, { opens: d.opens + 1, viewers: d.viewers.includes(user.id) ? d.viewers : [...d.viewers, user.id] });
}

// Usage decides adoption: how many people use it and how many real actions they've taken.
export function usage(d: DraftTool) {
  const actions = listAudit().filter((e) => (e.tool === d.id || e.tool === `draft:${d.id}`) && e.entityId !== `tools/${d.id}`).length;
  const users = 1 + d.adoptedBy.length;
  const teammates = USERS.filter((u) => u.role === d.role).length;
  const { minAdopters, minActions } = WORKFLOWS.adoption;
  return { opens: d.opens, viewers: d.viewers.length, actions, users, teammates, ready: users >= minAdopters && actions >= minActions };
}

export function adoptDraft(user: User, slug: string) {
  const d = getDraft(slug);
  if (!d || d.role !== user.role) throw new Error("Only teammates in the same role can adopt this tool");
  if (usesDraft(user, d)) throw new Error("Already in your tools");
  updateRow<DraftTool>("draft_tools", slug, { adoptedBy: [...d.adoptedBy, user.id], status: d.status === "draft" ? "pilot" : d.status });
  logAudit({ actor: user, tool: "platform", action: "tool.adopted", entityId: `tools/${slug}`, after: { adoptedBy: [...d.adoptedBy, user.id] }, reason: "Adopted from team home" });
}

export function requestPublish(user: User, slug: string) {
  const d = getDraft(slug);
  if (!d || !usesDraft(user, d)) throw new Error("Not allowed");
  if (d.status === "in_review" || d.status === "published") throw new Error(`Already ${d.status.replace("_", " ")}`);
  const u = usage(d);
  if (!u.ready) throw new Error(`Needs ${WORKFLOWS.adoption.minAdopters} people and ${WORKFLOWS.adoption.minActions} actions first`);
  requestApproval(user, {
    tool: `draft:${slug}`, action: "tool.publish", target: `tools/${slug}`, permission: `role:${WORKFLOWS.adoption.publishApproverRole}`,
    reason: `${u.users} people, ${u.actions} actions in pilot`, payload: { slug, publish: true },
    summary: `Publish "${d.spec.name}" as a permanent ${d.role} tool (${u.users} people, ${u.actions} actions)`,
  });
  updateRow<DraftTool>("draft_tools", slug, { status: "in_review" });
}

export const canUseDraft = (user: User, d: DraftTool) => d.role === user.role || user.role === "ops_lead" || user.role === "eng_admin";

// The first action needs approval above the amount the request named, from the role it named.
export function draftAct(user: User, slug: string, rowId: string, verb: string, reason: string) {
  const draft = getDraft(slug);
  if (!draft || !canUseDraft(user, draft)) throw new Error("Not allowed");
  if (!reason.trim()) throw new Error("A reason is required");
  const row = getRow<DraftRow>(`draft_${slug}`, rowId);
  if (row.status !== "open") throw new Error(`Already ${row.status}`);
  const { spec } = draft;
  if (spec.approvalOverCents !== null && verb === spec.actions[0] && row.amountCents > spec.approvalOverCents) {
    requestApproval(user, {
      tool: `draft:${slug}`, action: `${slug}.${verb}`, target: `draft_${slug}/${rowId}`, permission: `role:${spec.approverRole ?? "ops_lead"}`, reason,
      summary: `${verb[0].toUpperCase()}${verb.slice(1)} ${row.subject} ($${(row.amountCents / 100).toFixed(2)}) in ${spec.name}`, payload: { slug, rowId, verb },
    });
    updateRow<DraftRow>(`draft_${slug}`, rowId, { status: "pending approval" });
    return { pending: true };
  }
  applyDraftAct(user, slug, rowId, verb, reason);
  return { pending: false };
}

export function applyDraftAct(user: User, slug: string, rowId: string, verb: string, reason: string) {
  const before = { status: getRow<DraftRow>(`draft_${slug}`, rowId).status };
  updateRow<DraftRow>(`draft_${slug}`, rowId, { status: pastTense(verb) });
  logAudit({ actor: user, tool: slug, action: `${slug}.${verb}`, entityId: `draft_${slug}/${rowId}`, before, after: { status: pastTense(verb) }, reason });
}

const payload = (a: Approval) => a.payload as { slug: string; rowId: string; verb: string; publish?: boolean };
export const draftHandler = {
  onApproved: (a: Approval, u: User) => {
    const p = payload(a);
    if (!p.publish) return applyDraftAct(u, p.slug, p.rowId, p.verb, a.decisionReason ?? "");
    updateRow<DraftTool>("draft_tools", p.slug, { status: "published" });
    logAudit({ actor: u, tool: "platform", action: "tool.published", entityId: `tools/${p.slug}`, after: { status: "published" }, reason: a.decisionReason ?? "Reviewed" });
  },
  onRejected: (a: Approval) => {
    const p = payload(a);
    if (p.publish) updateRow("draft_tools", p.slug, { status: "pilot" });
    else updateRow(`draft_${p.slug}`, p.rowId, { status: "open" });
  },
};
