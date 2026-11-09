import { listPayments } from "@/adapters/payments";
import { ActionForm } from "@/components/action-form";
import { ReasonField, SelectField } from "@/components/fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pendingApprovalFor } from "@/core/approvals";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import { requestRefundAction } from "./actions";
import { formatUsd } from "./logic";

export default async function RefundsPage() {
  const user = await getCurrentUser();
  const payments = listPayments().map((p) => ({
    ...p,
    pending: !!pendingApprovalFor(`payments/${p.id}`),
  }));
  const refundable = payments.filter((p) => p.status === "settled" && !p.pending);

  return (
    <div className="space-y-6">
      {can(user, "refunds.request") ? (
        <Card>
          <CardHeader>
            <CardTitle>Request a refund</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={requestRefundAction}>
              <SelectField
                name="paymentId"
                label="Payment"
                options={refundable.map((p) => ({
                  value: p.id,
                  label: `${p.id} · ${p.customer} · ${formatUsd(p.amountCents)}`,
                }))}
              />
              <ReasonField />
              <Button type="submit">Request refund</Button>
            </ActionForm>
            <p className="mt-3 text-xs text-muted-foreground">
              Up to $500 completes immediately. Above $500 needs approval from an ops lead other
              than the requester.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Payment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="pl-4 font-mono text-xs">{p.id}</TableCell>
                <TableCell>{p.customer}</TableCell>
                <TableCell className="text-right tabular-nums">{formatUsd(p.amountCents)}</TableCell>
                <TableCell className="uppercase text-muted-foreground">{p.method}</TableCell>
                <TableCell className="text-muted-foreground">{p.createdAt}</TableCell>
                <TableCell>
                  {p.pending ? (
                    <Badge>Awaiting approval</Badge>
                  ) : p.status === "refunded" ? (
                    <Badge variant="secondary" title={p.refundReason}>Refunded</Badge>
                  ) : (
                    <Badge variant="outline">Settled</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
