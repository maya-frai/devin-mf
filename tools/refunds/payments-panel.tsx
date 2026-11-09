import { listPayments } from "@/adapters/payments";
import type { ViewContext } from "@/components/widgets/types";
import { pendingApprovalFor } from "@/core/approvals";
import { listAudit } from "@/core/audit";
import { can, rolesFor } from "@/core/permissions";
import type { AuditEvent } from "@/core/types";
import { listRefunds, refundedToday, type Refund } from "./logic";
import { PaymentsTable } from "./payments-table";

function groupBy<T>(rows: T[], key: (r: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const r of rows) (out[key(r)] ??= []).push(r);
  return out;
}

export function refundablePayments() {
  return listPayments().map((p) => ({ ...p, state: pendingApprovalFor(`payments/${p.id}`) ? "pending_approval" : p.status }));
}

// Payments search with detail drawer and the Request refund dialog.
export function PaymentsPanel({ ctx: { user } }: { ctx: ViewContext }) {
  const refunds = groupBy<Refund>(listRefunds(), (r) => r.paymentId);
  const audit = groupBy<AuditEvent>(listAudit().filter((e) => e.entityId.startsWith("payments/")), (e) => e.entityId.slice(9));
  return (
    <PaymentsTable
      payments={refundablePayments()}
      refunds={refunds}
      audit={audit}
      canRequest={can(user, "refunds.request")}
      needs={rolesFor("refunds.request")}
      role={user.role}
      refundedTodayCents={refundedToday(user)}
    />
  );
}
