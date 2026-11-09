"use client";

import { when } from "@/components/widgets/format";
import { Fragment, type ReactNode } from "react";
import type { Payment } from "@/adapters/payments";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AuditEvent } from "@/core/types";
import { getUser } from "@/core/users";
import type { Refund } from "./logic";
import { formatUsd } from "./rules";


export function PaymentDrawer(props: { payment: Payment | null; refunds: Refund[]; audit: AuditEvent[]; onClose: () => void; action: ReactNode }) {
  const p = props.payment;
  const details = p ? [
    ["Customer", p.customer], ["Email", p.email], ["Amount", formatUsd(p.amountCents)], ["Refunded", formatUsd(p.refundedCents)],
    ["Method", p.method.toUpperCase()], ["Date", p.createdAt.slice(0, 10)], ["Status", p.status.replace("_", " ")],
  ] : [];
  return (
    <Sheet open={!!p} onOpenChange={(o) => !o && props.onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{p?.id}</SheetTitle>
          <SheetDescription>Payment details, refund history and audit trail</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6 text-sm">
          <dl className="grid grid-cols-2 gap-y-1.5">
            {details.map(([k, v]) => (<Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></Fragment>))}
          </dl>
          {props.action}
          <section>
            <h3 className="mb-2 font-medium">Refund history</h3>
            {props.refunds.length ? props.refunds.map((r) => (
              <div key={r.id} className="mb-2 rounded-md border p-2">
                <div className="flex justify-between"><span>{formatUsd(r.amountCents)} · {r.reason}</span><Badge variant="outline">{r.status.replace("_", " ")}</Badge></div>
                <div className="text-xs text-muted-foreground">{when(r.createdAt)} by {getUser(r.requestedBy)?.name ?? r.requestedBy}{r.notes ? ` · ${r.notes}` : ""}</div>
              </div>
            )) : <p className="text-muted-foreground">No refunds yet. Use Request refund to start one.</p>}
          </section>
          <section>
            <h3 className="mb-2 font-medium">Audit entries</h3>
            {props.audit.length ? props.audit.map((e) => (
              <div key={e.id} className="mb-1.5 text-xs">
                <span className="font-mono">{e.action}</span> · {e.actor} · {when(e.at)}{e.reason ? ` · “${e.reason}”` : ""}
              </div>
            )) : <p className="text-muted-foreground">No audit entries in this session yet. Writes to this payment appear here.</p>}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
