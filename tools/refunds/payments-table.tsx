"use client";

import { useState } from "react";
import { useTerms } from "@/components/terms";
import type { Payment } from "@/adapters/payments";
import { SortHead, TableFooter, TableToolbar, useTable } from "@/components/data-table";
import { GuardedButton } from "@/components/guarded-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditEvent } from "@/core/types";
import type { Role } from "@/core/users";
import type { Refund } from "./logic";
import { PaymentDrawer } from "./payment-drawer";
import { RefundDialog } from "./refund-dialog";
import { formatUsd } from "./rules";

type Row = Payment & { state: string };
export const STATE_BADGE = { settled: "outline", partially_refunded: "secondary", refunded: "secondary", pending_approval: "default" } as const;

export function PaymentsTable(props: {
  payments: Row[];
  refunds: Record<string, Refund[]>;
  audit: Record<string, AuditEvent[]>;
  canRequest: boolean;
  needs: string;
  role: Role;
  refundedTodayCents: number;
}) {
  const terms = useTerms();
  const t = useTable(props.payments, { search: ["id", "customer", "email"], status: "state", sort: "createdAt" });
  const [open, setOpen] = useState<Row | null>(null);
  const [refunding, setRefunding] = useState<Row | null>(null);
  const refundable = (p: Row) => p.state === "settled" || p.state === "partially_refunded";
  const refundButton = (p: Row) => (
    <GuardedButton size="xs" variant="outline" allowed={props.canRequest} needs={props.needs} disabled={!refundable(p)}
      onClick={(e) => { e.stopPropagation(); setRefunding(p); }}>
      {terms.requestRefund}
    </GuardedButton>
  );

  return (
    <Card className="gap-0 py-0">
      <TableToolbar {...t} placeholder={`Search ${terms.payments.toLowerCase()}, customer or email`} />
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Payment" k="id" sort={t.sort} onSort={t.toggleSort} className="pl-4" />
            <SortHead label="Customer" k="customer" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Amount" k="amountCents" sort={t.sort} onSort={t.toggleSort} className="text-right" />
            <SortHead label="Date" k="createdAt" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Status" k="state" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="" k="id" sort={{ key: "", desc: false }} onSort={() => {}} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="pl-4 text-muted-foreground">No payments match. Clear the search or status filter.</TableCell></TableRow>
          ) : t.rows.map((p) => (
            <TableRow key={p.id} onClick={() => setOpen(p)} className="cursor-pointer">
              <TableCell className="pl-4 font-mono text-xs">{p.id}</TableCell>
              <TableCell>{p.customer}</TableCell>
              <TableCell className="text-right tabular-nums">{formatUsd(p.amountCents)}</TableCell>
              <TableCell className="text-muted-foreground">{p.createdAt.slice(0, 10)}</TableCell>
              <TableCell><Badge variant={STATE_BADGE[p.state as keyof typeof STATE_BADGE]}>{p.state.replace("_", " ")}</Badge></TableCell>
              <TableCell className="pr-4 text-right">{refundButton(p)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter shown={t.rows.length} total={t.total} more={t.more} />
      <PaymentDrawer payment={open} refunds={open ? props.refunds[open.id] ?? [] : []} audit={open ? props.audit[open.id] ?? [] : []}
        onClose={() => setOpen(null)} action={open ? refundButton(open) : null} />
      <RefundDialog key={refunding?.id} payment={refunding} role={props.role} refundedTodayCents={props.refundedTodayCents} onClose={() => setRefunding(null)} />
    </Card>
  );
}
