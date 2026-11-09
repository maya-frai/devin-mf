import type { Widget } from "@/config/views/types";
import { pastTense, type Customization, type DraftSpec, type Tweak } from "@/lib/interpret";
import { requestApproval } from "./approvals";
import { logAudit } from "./audit";
import { create, get, getRow, list, remove, updateRow, type Row } from "./store";
import type { Approval } from "./types";
import { USERS, type Role, type User } from "./users";

// What the "+" builder produces live: draft tools and per-role view customizations, stored like any
// other data and audited. Devin turns them into real code through the generated prompt and a PR.
export type DraftTool = Row & { spec: DraftSpec; role: Role; createdBy: string; createdAt: string };
export type DraftRow = Row & { subject: string; amountCents: number; status: string; owner: string; createdAt: string };
export type CustomWidget = Row & { role: Role; tool: string; widget?: Widget; tweak?: Tweak; label: string; request: string; createdBy: string };

const NAMES = ["Harper Quinn", "Mateo Silva", "Zoe Laurent", "Arjun Mehta", "Chloe Dubois", "Noah Fischer", "Amara Eze", "Liam Byrne"];
export const listDrafts = () => list<DraftTool>("draft_tools");
export const getDraft = (slug: string) => get<DraftTool>("draft_tools", slug);
export const draftRows = (slug: string) => list<DraftRow>(`draft_${slug}`);
export const customWidgets = (role: Role, tool: string) => list<CustomWidget>("custom_widgets").filter((c) => c.role === role && c.tool === tool);

export function createDraft(user: User, spec: DraftSpec): string {
  let slug = spec.slug;
  for (let n = 2; getDraft(slug); n++) slug = `${spec.slug}-${n}`;
  create<DraftTool>("draft_tools", { id: slug, spec: { ...spec, slug }, role: user.role, createdBy: user.id, createdAt: new Date().toISOString() });
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

const payload = (a: Approval) => a.payload as { slug: string; rowId: string; verb: string };
export const draftHandler = {
  onApproved: (a: Approval, u: User) => applyDraftAct(u, payload(a).slug, payload(a).rowId, payload(a).verb, a.decisionReason ?? ""),
  onRejected: (a: Approval) => void updateRow(`draft_${payload(a).slug}`, payload(a).rowId, { status: "open" }),
};
