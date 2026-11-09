import type { Sources } from "@/components/widgets/types";
import { can, rolesFor } from "@/core/permissions";
import { getUser } from "@/core/users";
import { getPayment } from "@/adapters/payments";
import { ANALYST_DAILY_LIMIT_CENTS, formatUsd, listRefunds, refundedToday, type Refund } from "./logic";
import { PaymentsPanel, refundablePayments } from "./payments-panel";
import { RequestBar } from "./request-bar";
import { refundStats } from "./stats";

const requestRows = (rows: Refund[]) =>
  rows.map((r) => ({ id: r.id, createdAt: r.createdAt, customer: r.customer, amountCents: r.amountCents, reason: r.reason, status: r.status, requestedByName: getUser(r.requestedBy)?.name ?? r.requestedBy }));

function monthly() {
  const months: Record<string, { id: string; month: string; count: number; volumeCents: number; pendingCents: number; rejected: number }> = {};
  for (const r of listRefunds()) {
    const month = r.createdAt.slice(0, 7);
    const m = (months[month] ??= { id: month, month, count: 0, volumeCents: 0, pendingCents: 0, rejected: 0 });
    if (r.status === "completed") {
      m.count += 1;
      m.volumeCents += r.amountCents;
    }
    if (r.status === "pending_approval") m.pendingCents += r.amountCents;
    if (r.status === "rejected") m.rejected += 1;
  }
  return Object.values(months);
}

export const refundSources: Sources = {
  metrics: {
    "refunds.volume30d": () => { const s = refundStats(); return { label: "Refund volume (30 days)", value: formatUsd(s.volume), hint: `${s.count} refunds` }; },
    "refunds.count30d": () => ({ label: "Refunds (30 days)", value: refundStats().count }),
    "refunds.rate": () => ({ label: "Refund rate", value: `${(refundStats().rate * 100).toFixed(1)}%`, hint: "refunded $ of payment volume" }),
    "refunds.average": () => ({ label: "Average refund", value: formatUsd(refundStats().average) }),
    "refunds.pendingCents": () => { const s = refundStats(); return { label: "$ pending approval", value: formatUsd(s.pendingCents), hint: `${s.pendingCount} requests` }; },
    "refunds.pendingCount": () => ({ label: "Pending approvals", value: refundStats().pendingCount }),
    "refunds.medianApprove": () => ({ label: "Median time to approve", value: `${refundStats().medianApproveHours.toFixed(1)} h` }),
    "refunds.myOpen": ({ user }) => ({ label: "My open refund requests", value: listRefunds().filter((r) => r.requestedBy === user.id && r.status === "pending_approval").length }),
    "refunds.myToday": ({ user }) => ({ label: "My instant refunds today", value: formatUsd(refundedToday(user)), hint: `of ${formatUsd(ANALYST_DAILY_LIMIT_CENTS)} daily limit` }),
    "refunds.volumeMonth": () => {
      const month = new Date().toISOString().slice(0, 7);
      const done = listRefunds().filter((r) => r.status === "completed" && r.createdAt.startsWith(month));
      return { label: "Refund volume this month", value: formatUsd(done.reduce((s, r) => s + r.amountCents, 0)), hint: `${done.length} refunds` };
    },
  },
  sources: {
    "refunds.perDay": () => refundStats().perDay,
    "refunds.byReason": () => refundStats().byReason,
    "refunds.byStatus": () => refundStats().byStatus,
    "refunds.byMethod": () => {
      const done = listRefunds().filter((r) => r.status === "completed");
      return ["card", "ach"].map((m) => ({ label: m.toUpperCase(), value: done.filter((r) => getPayment(r.paymentId).method === m).length }));
    },
    "refunds.monthly": monthly,
    "refunds.myRequests": ({ user }) => requestRows(listRefunds().filter((r) => r.requestedBy === user.id)),
    "refunds.teamRequests": () => requestRows(listRefunds()),
    "refunds.needsAttention": () => {
      const s = refundStats();
      return [
        ...s.bigPending.map((r) => ({ id: r.id, title: `${r.customer} · ${formatUsd(r.amountCents)}`, subtitle: `Pending approval · ${r.reason}`, badge: "over limit", href: "/approvals" })),
        ...s.repeatCustomers.map((c) => ({ id: c.customer, title: c.customer, subtitle: `${c.count} refunds in 30 days`, badge: "repeat" })),
      ];
    },
  },
  panels: {
    "refunds.payments": PaymentsPanel,
    "refunds.requestBar": ({ ctx: { user } }) => (
      <RequestBar payments={refundablePayments().filter((p) => p.state === "settled" || p.state === "partially_refunded")}
        canRequest={can(user, "refunds.request")} needs={rolesFor("refunds.request")} role={user.role} refundedTodayCents={refundedToday(user)} />
    ),
  },
};
