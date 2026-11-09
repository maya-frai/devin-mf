"use client";

import { useState } from "react";
import type { Payment } from "@/adapters/payments";
import { GuardedButton } from "@/components/guarded-button";
import { useTerms } from "@/components/terms";
import { Card, CardContent } from "@/components/ui/card";
import type { Role } from "@/core/users";
import { RefundDialog } from "./refund-dialog";
import { formatUsd } from "./rules";

// The analyst's first action: find a payment, request a refund.
export function RequestBar(props: { payments: Payment[]; canRequest: boolean; needs: string; role: Role; refundedTodayCents: number }) {
  const terms = useTerms();
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<Payment | null>(null);
  const match = props.payments.find((p) => p.id === query.trim());

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3">
        <GuardedButton allowed={props.canRequest} needs={props.needs} disabled={!match} onClick={() => setPayment(match ?? null)}>
          {terms.requestRefund}
        </GuardedButton>
        <input list="refundable-payments" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Type a ${terms.payment} ID, e.g. pay_1005`}
          className="h-8 w-72 rounded-lg border bg-background px-2 text-sm" />
        <datalist id="refundable-payments">
          {props.payments.map((p) => <option key={p.id} value={p.id}>{`${p.customer} · ${formatUsd(p.amountCents - p.refundedCents)}`}</option>)}
        </datalist>
        <span className="text-xs text-muted-foreground">{match ? `${match.customer} · ${formatUsd(match.amountCents - match.refundedCents)} refundable` : "Pick a payment to start."}</span>
        <RefundDialog key={payment?.id} payment={payment} role={props.role} refundedTodayCents={props.refundedTodayCents} onClose={() => setPayment(null)} />
      </CardContent>
    </Card>
  );
}
