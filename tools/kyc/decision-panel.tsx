"use client";

import { useRef, useTransition } from "react";
import { NotesField, SelectField } from "@/components/fields";
import { GuardedButton } from "@/components/guarded-button";
import { toastResult } from "@/components/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decideCaseAction } from "./actions";
import { WORKFLOWS } from "@/config/workflows";
import type { Decision } from "./logic";

const KYC_REASONS = WORKFLOWS.kyc.reasons;

export function DecisionPanel(props: { caseId: string; open: boolean; needsSecond: string | null; canDecide: boolean; needs: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const decide = (decision: Decision) => {
    if (!form.current?.reportValidity()) return;
    const data = new FormData(form.current);
    start(async () => {
      const result = await decideCaseAction({ caseId: props.caseId, decision, reason: String(data.get("reason")), notes: String(data.get("notes") ?? "") });
      if (toastResult(result)) form.current?.reset();
    });
  };
  const button = (decision: Decision, label: string, variant: "default" | "destructive" | "outline") => (
    <GuardedButton type="button" variant={variant} allowed={props.canDecide} needs={props.needs} disabled={!props.open || pending} onClick={() => decide(decision)}>
      {label}
    </GuardedButton>
  );

  return (
    <Card>
      <CardHeader><CardTitle>Decision</CardTitle></CardHeader>
      <CardContent>
        <form ref={form} className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <SelectField name="reason" label="Reason" placeholder="Choose a reason" options={KYC_REASONS.map((r) => ({ value: r, label: r }))} />
          <NotesField />
          <div className="flex gap-2">
            {button("approve", "Approve", "default")}
            {button("reject", "Reject", "destructive")}
            {button("escalate", "Escalate", "outline")}
          </div>
          {props.needsSecond ? (
            <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">{props.needsSecond}</p>
          ) : null}
          {!props.open ? <p className="text-sm text-muted-foreground">This case is closed or waiting on a second review.</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
