import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAudit } from "@/core/audit";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!can(user, "audit.view")) return <Forbidden user={user} action="audit.view" />;
  const events = listAudit();

  return (
    <div>
      <PageTitle title="Audit Log" subtitle="Every sensitive action across all tools, newest first." />
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Time</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="pl-4 text-muted-foreground">
                  No events yet.
                </TableCell>
              </TableRow>
            ) : (
              events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="pl-4 font-mono text-xs">
                    {new Date(e.at).toLocaleTimeString("en-US")}
                  </TableCell>
                  <TableCell>
                    {e.actorName} <Badge variant="outline">{e.role}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.action}</TableCell>
                  <TableCell className="font-mono text-xs">{e.target ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                    {e.details ? JSON.stringify(e.details) : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
