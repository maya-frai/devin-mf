import { listPayments } from "@/adapters/payments";
import { AUTO_REFUND_LIMIT_CENTS, listRefunds, REFUND_REASONS, type Refund } from "./logic";

const DAY = 86_400_000;
const sum = (rows: { amountCents: number }[]) => rows.reduce((s, r) => s + r.amountCents, 0);
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};

// Dashboard numbers for the last 30 days.
export function refundStats(now = Date.now()) {
  const since = now - 30 * DAY;
  const payments = listPayments().filter((p) => Date.parse(p.createdAt) >= since);
  const refunds = listRefunds().filter((r) => Date.parse(r.createdAt) >= since);
  const by = (status: Refund["status"]) => refunds.filter((r) => r.status === status);
  const done = by("completed");
  const pending = by("pending_approval");
  const approveHours = done.filter((r) => r.decidedBy && r.decidedAt).map((r) => (Date.parse(r.decidedAt!) - Date.parse(r.createdAt)) / 3_600_000);

  const perDay = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(now - (29 - i) * DAY).toISOString().slice(0, 10);
    return { label: day.slice(5), value: done.filter((r) => r.createdAt.startsWith(day)).length };
  });
  const counts = new Map<string, number>();
  for (const r of refunds) counts.set(r.customer, (counts.get(r.customer) ?? 0) + 1);
  const customerCounts = [...counts].filter(([, n]) => n >= 3).map(([customer, count]) => ({ customer, count }));

  return {
    volume: sum(done),
    count: done.length,
    rate: sum(done) / Math.max(1, sum(payments)),
    average: done.length ? sum(done) / done.length : 0,
    pendingCents: sum(pending),
    pendingCount: pending.length,
    medianApproveHours: median(approveHours),
    perDay,
    byReason: REFUND_REASONS.map((label) => ({ label, value: refunds.filter((r) => r.reason === label).length })),
    byStatus: (["completed", "pending_approval", "rejected"] as const).map((s) => ({ label: s.replace("_", " "), value: by(s).length })),
    bigPending: pending.filter((r) => r.amountCents > AUTO_REFUND_LIMIT_CENTS),
    repeatCustomers: customerCounts,
  };
}
