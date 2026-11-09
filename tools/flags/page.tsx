import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pendingApprovalFor } from "@/core/approvals";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import { toggleFlagAction } from "./actions";
import { ENVS, flagTarget, listFlags, type Env, type Flag } from "./logic";

function FlagCell({ flag, env, canToggle }: { flag: Flag; env: Env; canToggle: boolean }) {
  const on = flag[env];
  if (pendingApprovalFor(flagTarget(flag.id, env))) return <Badge>Awaiting approval</Badge>;
  if (!canToggle) return <Badge variant={on ? "secondary" : "outline"}>{on ? "On" : "Off"}</Badge>;
  return (
    <form action={toggleFlagAction.bind(null, flag.id, env, !on)}>
      <Button type="submit" size="xs" variant={on ? "default" : "outline"} className="w-24">
        {env === "prod" ? `${on ? "On" : "Off"} · request` : on ? "On" : "Off"}
      </Button>
    </form>
  );
}

export default async function FlagsPage() {
  const user = await getCurrentUser();
  const canToggle = can(user, "flags.toggle");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Dev and staging toggle instantly. Prod changes go to the Approvals inbox.
      </p>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Flag</TableHead>
              <TableHead>Owner</TableHead>
              {ENVS.map((env) => (
                <TableHead key={env} className="capitalize">{env}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {listFlags().map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="pl-4">
                  <div className="font-mono text-xs">{flag.key}</div>
                  <div className="text-xs text-muted-foreground">{flag.description}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{flag.owner}</TableCell>
                {ENVS.map((env) => (
                  <TableCell key={env}>
                    <FlagCell flag={flag} env={env} canToggle={canToggle} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
