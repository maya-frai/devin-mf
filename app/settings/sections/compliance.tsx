import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTROLS, type Control } from "@/config/compliance";
import { ROLES } from "@/config/roles";
import type { User } from "@/core/users";
import { codeUrl } from "@/lib/repo";
import { evidence } from "../evidence";

function ControlCard({ control, value, detail }: { control: Control; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{control.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0 bg-success/10 text-success">Enforced</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">{control.how}</p>
        <div className="rounded-md bg-muted p-3">
          <div className="text-lg font-semibold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground">{detail}</div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {control.frameworks.map((f) => <Badge key={f} variant="outline">{f}</Badge>)}
          {control.enforcedIn.map((f) => (
            <a key={f} href={codeUrl(f)} target="_blank" rel="noreferrer" className="font-mono text-muted-foreground underline">{f}</a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ComplianceSection({ user }: { user: User }) {
  const ev = evidence(user);
  const mine = CONTROLS.filter((c) => c.caresAbout.includes(user.role));
  const rest = CONTROLS.filter((c) => !c.caresAbout.includes(user.role));
  const grid = (controls: Control[]) => (
    <div className="grid gap-4 lg:grid-cols-2">{controls.map((c) => <ControlCard key={c.id} control={c} {...ev[c.id]} />)}</div>
  );
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Most relevant to you as {ROLES[user.role].title}</h2>
        {grid(mine)}
      </section>
      {rest.length ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Also enforced</h2>
          {grid(rest)}
        </section>
      ) : null}
    </div>
  );
}
