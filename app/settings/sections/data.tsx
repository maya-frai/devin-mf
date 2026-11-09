import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CONNECTORS } from "@/config/connectors";
import { ROLES } from "@/config/roles";
import { connectorStatus, type ConnectorStatus } from "@/core/access";
import { can } from "@/core/permissions";
import type { User } from "@/core/users";
import { codeUrl } from "@/lib/repo";
import { TOOLS } from "@/tools/registry";
import { RequestAccess } from "./request-access";

const STATUS: Record<ConnectorStatus, { label: string; className: string }> = {
  connected: { label: "Connected", className: "bg-success/10 text-success" },
  granted: { label: "Access granted", className: "bg-success/10 text-success" },
  requested: { label: "Access requested", className: "bg-warning/10 text-warning" },
  needs_access: { label: "Needs access", className: "bg-warning/10 text-warning" },
};

// Which systems this person's tools touch, how, and what Devin still needs access to.
export function DataSection({ user }: { user: User }) {
  const myTools = Object.keys(ROLES[user.role].tools);
  const relevant = CONNECTORS.filter((c) => c.caresAbout.includes(user.role) || myTools.some((t) => c.uses[t]));
  const name = (slug: string) => TOOLS.find((t) => t.manifest.slug === slug)?.manifest.name ?? slug;

  return (
    <div className="space-y-6">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-3"><CardTitle>Access map: your tools × systems</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">System</TableHead>
              {myTools.map((t) => <TableHead key={t}>{name(t)}</TableHead>)}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relevant.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-4">{c.name} <span className="text-xs text-muted-foreground">{c.kind}</span></TableCell>
                {myTools.map((t) => <TableCell key={t} className="font-mono text-xs">{c.uses[t] === "RW" ? "read/write" : c.uses[t] === "R" ? "read" : "—"}</TableCell>)}
                <TableCell><Badge variant="secondary" className={STATUS[connectorStatus(c)].className}>{STATUS[connectorStatus(c)].label}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {relevant.map((c) => {
          const status = connectorStatus(c);
          return (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{c.name}</CardTitle>
                    <div className="text-xs text-muted-foreground">{c.example}{c.mock ? " · demo mock" : ""}</div>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 ${STATUS[status].className}`}>{STATUS[status].label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{c.why}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.scopes.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                  {c.data.map((d) => <Badge key={d} variant="secondary">{d}</Badge>)}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <a href={codeUrl(c.file)} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted-foreground underline">{c.file}</a>
                  {status === "needs_access" ? <RequestAccess connectorId={c.id} name={c.name} allowed={can(user, "access.request")} /> : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
