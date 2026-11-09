import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES } from "@/config/roles";
import { WORKFLOWS } from "@/config/workflows";
import { POLICY, rolesFor } from "@/core/permissions";
import type { User } from "@/core/users";

const group = (action: string) => action.split(".")[0];

// What this person can do, what needs someone else, what they approve, and where the role comes from.
export function AccessSection({ user }: { user: User }) {
  const role = ROLES[user.role];
  const actions = Object.keys(POLICY);
  const groups = [...new Set(actions.map(group))];
  const approves = actions.filter((a) => (a.endsWith(".approve") || a.endsWith(".second_review")) && POLICY[a].includes(user.role));
  const powerApps = Object.entries(WORKFLOWS.powerAppsRoles).filter(([, r]) => r === user.role).map(([pa]) => pa);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Your role</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-medium">{user.name}, {role.title}</div>
            <div className="text-muted-foreground">{role.team} · app role <span className="font-mono">{user.role}</span></div>
            <div className="text-xs text-muted-foreground">Power Apps role: {powerApps.join(", ") || "none"} (mapped in config/workflows.ts)</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>You approve</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5 text-sm">
            {approves.length ? approves.map((a) => <Badge key={a} variant="outline">{a}</Badge>) : <p className="text-muted-foreground">Nothing. You request; others approve.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Needs someone else</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <div>Refunds over the limit → {WORKFLOWS.refunds.approverRole}</div>
            <div>High-risk KYC rejections → {WORKFLOWS.kyc.secondReviewerRole}</div>
            <div>{WORKFLOWS.flags.needApproval.join(", ")} flag changes → {WORKFLOWS.flags.approverRoles.join(" or ")}</div>
            <div>Ledger adjustments over the limit → {WORKFLOWS.ledger.approverRole}</div>
            <div>New system access → {rolesFor("access.approve")}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Everything you can and can&apos;t do</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g} className="text-sm">
              <div className="mb-1 font-medium capitalize">{g}</div>
              {actions.filter((a) => group(a) === g).map((a) => {
                const ok = POLICY[a].includes(user.role);
                return (
                  <div key={a} className={`flex justify-between gap-2 text-xs ${ok ? "" : "text-muted-foreground"}`}>
                    <span className="font-mono">{ok ? "✓" : "✗"} {a}</span>
                    {ok ? null : <span>needs {rolesFor(a)}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
