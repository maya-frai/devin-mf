import { ActionForm } from "@/components/action-form";
import { ReasonField, SelectField } from "@/components/fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pendingApprovalFor } from "@/core/approvals";
import { can, rolesFor } from "@/core/permissions";
import type { ViewContext } from "@/components/widgets/types";
import { adjustBalanceAction } from "./actions";
import { APPROVAL_LIMIT_CENTS, formatUsd, listAccounts } from "./logic";

export function LedgerPanel({ ctx: { user } }: { ctx: ViewContext }) {
  const accounts = listAccounts().map((a) => ({ ...a, pending: !!pendingApprovalFor(`ledger_accounts/${a.id}`) }));

  return (
    <div className="space-y-6">
      {can(user, "ledger.adjust") ? (
        <Card>
          <CardHeader>
            <CardTitle>Post an adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={adjustBalanceAction}>
              <SelectField
                name="accountId"
                label="Account"
                options={accounts.filter((a) => !a.pending).map((a) => ({ value: a.id, label: `${a.id} · ${a.name}` }))}
              />
              <SelectField
                name="direction"
                label="Type"
                options={[{ value: "credit", label: "Credit" }, { value: "debit", label: "Debit" }]}
              />
              <label className="grid gap-1 text-xs text-muted-foreground">
                Amount (USD)
                <input name="amount" type="number" min="0.01" step="0.01" required className="h-8 w-32 rounded-lg border bg-background px-2 text-sm" />
              </label>
              <ReasonField />
              <Button type="submit">Post adjustment</Button>
            </ActionForm>
            <p className="mt-3 text-xs text-muted-foreground">
              Up to {formatUsd(APPROVAL_LIMIT_CENTS)} posts immediately. Above that needs approval from {rolesFor("ledger.approve")}, never the requester.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Account</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Last adjustment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="pl-4 font-mono text-xs">{a.id}</TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell className="text-muted-foreground">{a.type}</TableCell>
                <TableCell className="text-right tabular-nums">{formatUsd(a.balanceCents)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {a.pending ? <Badge>Awaiting approval</Badge> : (a.lastAdjustment ?? "—")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
