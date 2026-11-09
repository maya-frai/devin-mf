"use client";

import { approveAction, rejectAction } from "@/app/approvals/actions";
import { ReasonDialog } from "@/components/reason-dialog";
import { useTerms } from "@/components/terms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApprovalRow } from "./approval-rows";
import { formatCell } from "./format";

// Approve / reject with a reason. The requester sees why they can't decide their own request.
export function ApprovalList({ title, rows, empty }: { title: string; rows: ApprovalRow[]; empty?: string }) {
  const terms = useTerms();
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rows.length ? rows.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            <div className="min-w-0">
              <div className="font-medium">{a.summary}</div>
              <div className="text-xs text-muted-foreground">
                {a.tool} · requested by {a.requestedBy} · {formatCell(a.requestedAt, "datetime")}{a.reason ? ` · “${a.reason}”` : ""}
              </div>
            </div>
            {a.status !== "pending" ? (
              <Badge variant="outline">{a.status}{a.decidedBy ? ` by ${a.decidedBy}` : ""}</Badge>
            ) : a.blocked ? (
              <span className="text-xs text-muted-foreground">{a.blocked}</span>
            ) : (
              <div className="flex gap-2">
                <ReasonDialog title={`${terms.approve}: ${a.summary}`} confirmLabel={terms.approve} onConfirm={(reason) => approveAction(a.id, reason)}
                  trigger={<Button size="sm">{terms.approve}</Button>} />
                <ReasonDialog title={`${terms.reject}: ${a.summary}`} confirmLabel={terms.reject} onConfirm={(reason) => rejectAction(a.id, reason)}
                  trigger={<Button size="sm" variant="outline">{terms.reject}</Button>} />
              </div>
            )}
          </div>
        )) : <p className="text-muted-foreground">{empty ?? "Nothing waiting. New requests land here."}</p>}
      </CardContent>
    </Card>
  );
}
