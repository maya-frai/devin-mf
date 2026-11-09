// Reads a plain-English request with simple keyword rules (no model, no API calls) and turns it into
// either a draft tool spec or a view customization. Used by the "+" builder to show the result live.
import type { Widget } from "@/config/views/types";
import { slugify } from "./tool-prompt";

export type DraftSpec = {
  slug: string;
  name: string;
  entity: string;
  actions: string[];
  approvalOverCents: number | null;
  approverRole: string | null;
  money: boolean;
  request: string;
};
export type Tweak = { pinOwner?: string; highlightStale?: boolean };
export type Customization = { tool: string; widget?: Widget; tweak?: Tweak; label: string; matched: boolean };

const CATALOG: { tool: string; match: RegExp; label: string; widget: Widget }[] = [
  { tool: "refunds", match: /limit|used today|today/i, label: "KPI: my instant refunds today vs. daily limit", widget: { type: "KpiTiles", metrics: ["refunds.myToday"] } },
  { tool: "refunds", match: /method|card|ach/i, label: "Chart: refunds by payment method", widget: { type: "BarChart", title: "Refunds by payment method", source: "refunds.byMethod" } },
  { tool: "refunds", match: /reason/i, label: "Chart: refunds by reason", widget: { type: "BarChart", title: "Refunds by reason", source: "refunds.byReason" } },
  { tool: "refunds", match: /day|trend|over time/i, label: "Chart: refunds per day", widget: { type: "LineChart", title: "Refunds per day", source: "refunds.perDay" } },
  { tool: "kyc", match: /document|missing/i, label: "KPI: open cases with missing documents", widget: { type: "KpiTiles", metrics: ["kyc.docsMissing"] } },
  { tool: "kyc", match: /escalat/i, label: "Queue: escalated cases", widget: { type: "WorkQueue", title: "Escalations", source: "kyc.escalations", empty: "No escalated cases." } },
  { tool: "kyc", match: /sla|breach|late/i, label: "Queue: cases past SLA", widget: { type: "WorkQueue", title: "SLA breaches", source: "kyc.slaBreaches", empty: "No cases past SLA." } },
  { tool: "kyc", match: /outcome|decision|reviewer|trend/i, label: "Chart: decisions by outcome", widget: { type: "BarChart", title: "Decisions by outcome", source: "kyc.byOutcome" } },
  { tool: "flags", match: /owner|team|platform/i, label: "Chart: flags by owning team", widget: { type: "BarChart", title: "Flags by owning team", source: "flags.byOwner" } },
  { tool: "flags", match: /stale|old|unused/i, label: "KPI: stale flags", widget: { type: "KpiTiles", metrics: ["flags.stale"] } },
  { tool: "flags", match: /prod|live|customer/i, label: "List: what's on for customers", widget: { type: "WorkQueue", title: "Turned on for customers", source: "flags.liveInProd", empty: "Nothing is on in prod." } },
  { tool: "ledger", match: /.*/, label: "KPI: total balance across accounts", widget: { type: "KpiTiles", metrics: ["ledger.totalBalance"] } },
];

export function interpretCustomize(tool: string, request: string): Customization {
  // Changes to the flags table itself: pin a team's flags first, highlight stale ones.
  if (tool === "flags" && /sort|first|pin|highlight/i.test(request)) {
    const pinOwner = request.match(/(\w+)\s+team/i)?.[1]?.toLowerCase();
    const highlightStale = /stale|highlight/i.test(request);
    const parts = [pinOwner ? `${pinOwner} team's flags first` : "", highlightStale ? "stale flags highlighted" : ""].filter(Boolean);
    return { tool, tweak: { pinOwner, highlightStale }, label: `Flags table: ${parts.join(", ")}`, matched: true };
  }
  const options = CATALOG.filter((c) => c.tool === tool);
  const hit = options.find((c) => c.match.test(request));
  const pick = hit ?? options[0];
  return { tool, widget: pick.widget, label: pick.label, matched: !!hit };
}

// One-click ideas for a tool's view, phrased as requests the builder understands.
export const suggestionsFor = (tool: string): string[] =>
  CATALOG.filter((c) => c.tool === tool).map((c) => c.label.replace(/^\w+: /, "")).map((t) => t[0].toUpperCase() + t.slice(1));

const VERBS = ["approve", "reject", "escalate", "match", "flag", "clear", "confirm", "resolve", "assign", "close", "review"];
const ROLE_WORDS: [RegExp, string][] = [
  [/finance|controller|accounting/i, "finance"],
  [/engineer|system owner|admin/i, "eng_admin"],
  [/product manager|\bpm\b/i, "product_manager"],
  [/business ops|operations analyst/i, "ops_analyst"],
  [/lead|manager|head|supervisor/i, "ops_lead"],
];

// "approve" also matches approves/approved/approving, "flag" matches flagged/flagging; not "approval".
const verbAt = (text: string, v: string) => {
  const stem = v.endsWith("e") ? v.slice(0, -1) : v;
  const ing = v.endsWith("e") ? `${stem}ing` : /[aeiou][bdgmnpt]$/.test(v) ? `${v}${v.at(-1)}ing|${v}${v.at(-1)}ed` : `${v}ing`;
  return text.search(new RegExp(`\\b(?:${v}|${v}s|${stem}ed|${ing})\\b`, "i"));
};

export function interpretNew(name: string, request: string): DraftSpec {
  const text = `${name} ${request}`;
  const amount = text.match(/(?:over|above|more than|exceeding|>)\s*\$\s?([\d,]+(?:\.\d+)?)\s*(k)?/i);
  // The approval rule applies to the action named in the same sentence as the amount; it goes first.
  const clause = amount ? text.split(/[.;\n]/).find((c) => c.includes(amount[0])) ?? "" : "";
  const gated = VERBS.map((v) => [v, verbAt(clause, v)] as const).filter(([, i]) => i >= 0).sort((x, y) => x[1] - y[1])[0]?.[0];
  const found = VERBS.map((v) => [v, verbAt(text, v)] as const).filter(([, i]) => i >= 0).sort((x, y) => x[1] - y[1]).map(([v]) => v);
  const actions = [...new Set([...(gated ? [gated] : []), ...found])].slice(0, 3);
  const approvalOverCents = amount ? Math.round(Number(amount[1].replace(/,/g, "")) * (amount[2] ? 1000 : 1) * 100) : null;
  const approverRole = ROLE_WORDS.find(([re]) => re.test(request))?.[1] ?? (approvalOverCents ? "ops_lead" : null);
  const entity = (name.trim().split(/\s+/)[0] || "item").toLowerCase().replace(/s$/, "");
  return {
    slug: slugify(name) || "new-tool",
    name: name.trim() || "New tool",
    entity,
    actions: actions.length ? actions : ["approve", "reject"],
    approvalOverCents,
    approverRole,
    money: /\$|amount|payout|refund|payment|balance|fee|chargeback|dispute/i.test(text),
    request: request.trim(),
  };
}

export const pastTense = (verb: string) => (verb === "flag" ? "flagged" : verb.endsWith("e") ? `${verb}d` : `${verb}ed`);
