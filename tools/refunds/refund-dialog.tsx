"use client";

import { useState, useTransition } from "react";
import type { Payment } from "@/adapters/payments";
import { NotesField, NumberField, SelectField } from "@/components/fields";
import { toastResult } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTerms } from "@/components/terms";
import type { Role } from "@/core/users";
import { requestRefundAction } from "./actions";
import { ANALYST_DAILY_LIMIT_CENTS, approvalNeeded, APPROVER_ROLE, AUTO_REFUND_LIMIT_CENTS, formatUsd, REFUND_REASONS } from "./rules";

const PREVIEW = {
  over_limit: `Needs ${APPROVER_ROLE} approval: over ${formatUsd(AUTO_REFUND_LIMIT_CENTS)}.`,
  daily_limit: `Needs ${APPROVER_ROLE} approval: over your ${formatUsd(ANALYST_DAILY_LIMIT_CENTS)} daily limit.`,
};

export function RefundDialog(props: { payment: Payment | null; role: Role; refundedTodayCents: number; onClose: () => void }) {
  const terms = useTerms();
  const p = props.payment;
  const left = p ? p.amountCents - p.refundedCents : 0;
  const [amount, setAmount] = useState((left / 100).toFixed(2));
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [pending, start] = useTransition();
  const cents = Math.round(Number(amount) * 100);
  const valid = cents > 0 && cents <= left;
  const why = valid ? approvalNeeded(props.role, cents, props.refundedTodayCents) : null;

  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && props.onClose()}>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            start(async () => {
              const result = await requestRefundAction({
                paymentId: p!.id, amountCents: cents, reason: String(form.get("reason")), notes: String(form.get("notes") ?? ""), idempotencyKey,
              });
              if (toastResult(result)) props.onClose();
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{terms.requestRefund}</DialogTitle>
            <DialogDescription>{p?.id} · {p?.customer} · {formatUsd(left)} refundable</DialogDescription>
          </DialogHeader>
          <NumberField name="amount" label="Amount (USD)" min={0.01} max={left / 100} value={amount} onChange={(e) => setAmount(e.target.value)}
            rangeText={`Enter between $0.01 and ${formatUsd(left)}`} />
          <SelectField name="reason" label="Reason" placeholder="Choose a reason" options={REFUND_REASONS.map((r) => ({ value: r, label: r }))} />
          <NotesField />
          {valid ? (
            <p className={`rounded-md px-3 py-2 text-sm ${why ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
              {why ? PREVIEW[why] : "Completes immediately."}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>{why ? "Send for approval" : "Refund now"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
