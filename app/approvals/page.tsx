import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { blockedReason, listApprovals } from "@/core/approvals";
import { getCurrentUser } from "@/core/session";
import { getUser } from "@/core/users";
import { approveAction, rejectAction } from "./actions";

const STATUS_VARIANT = { pending: "default", approved: "secondary", rejected: "destructive" } as const;

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  const approvals = listApprovals();

  return (
    <div>
      <PageTitle
        title="Approvals"
        subtitle="Two-person rule: the approver must differ from the requester. Every decision is audited."
      />
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Request</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="pl-4 text-muted-foreground">
                  Nothing here yet. Refunds over $500 and prod flag changes land here.
                </TableCell>
              </TableRow>
            ) : (
              approvals.map((a) => {
                const blocked = blockedReason(user, a);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="pl-4 font-medium">{a.summary}</TableCell>
                    <TableCell className="text-muted-foreground">{a.tool}</TableCell>
                    <TableCell>{getUser(a.requestedBy)?.name ?? a.requestedBy}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
                      {a.decidedBy ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          by {getUser(a.decidedBy)?.name}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {a.status !== "pending" ? null : blocked ? (
                        <span className="text-xs text-muted-foreground">{blocked}</span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <form action={approveAction.bind(null, a.id)}>
                            <Button type="submit" size="sm">Approve</Button>
                          </form>
                          <form action={rejectAction.bind(null, a.id)}>
                            <Button type="submit" size="sm" variant="outline">Reject</Button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
