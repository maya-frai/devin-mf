import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { iconFor } from "@/components/icons";
import { PageTitle } from "@/components/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONNECTORS } from "@/config/connectors";
import { CONTROLS } from "@/config/compliance";
import { ROLES } from "@/config/roles";
import { connectorStatus } from "@/core/access";
import { POLICY } from "@/core/permissions";
import { getCurrentUser, getTerms } from "@/core/session";
import { evidence } from "./evidence";

const LIVE = ["connected", "granted"];

// Settings overview: what is already integrated and enforced for this person, one click from the details.
export default async function Settings() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const role = ROLES[user.role];
  const myTools = Object.keys(role.tools);
  const systems = CONNECTORS.filter((c) => c.caresAbout.includes(user.role) || myTools.some((t) => c.uses[t]));
  const live = systems.filter((c) => LIVE.includes(connectorStatus(c)));
  const controls = CONTROLS.filter((c) => c.caresAbout.includes(user.role));
  const ev = evidence(user);
  const allowed = Object.values(POLICY).filter((r) => r.includes(user.role)).length;
  const summary: Record<string, string> = {
    data: `${live.length} of ${systems.length} systems connected`,
    compliance: `${CONTROLS.length} controls enforced in code`,
    access: `${allowed} of ${Object.keys(POLICY).length} actions allowed for ${role.title}`,
    customize: "Brand, words, rules and views as config",
  };

  return (
    <div className="space-y-8">
      <PageTitle title={terms.settings} subtitle="Everything already integrated and enforced for you, and what Devin uses on your behalf." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {role.sidebar.settings.map((s) => {
          const Icon = iconFor(s);
          return (
            <Link key={s} href={`/settings/${s}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between"><Icon className="size-4 text-primary" /><ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" /></div>
                  <div className="font-medium">{terms[s]}</div>
                  <div className="text-sm text-muted-foreground">{summary[s]}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Integrated for your tools</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {systems.map((c) => {
              const ok = LIVE.includes(connectorStatus(c));
              return (
                <div key={c.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm">{c.name}</div><div className="truncate text-xs text-muted-foreground">{c.example}</div></div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ok ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{ok ? "Connected" : connectorStatus(c) === "requested" ? "Requested" : "Needs access"}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Enforced for you</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {controls.map((c) => (
              <div key={c.id} className="flex items-start gap-3 py-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <div className="min-w-0 flex-1"><div className="text-sm">{c.name}</div><div className="text-xs text-muted-foreground">{c.frameworks.join(" · ")}</div></div>
                <span className="shrink-0 text-xs font-medium tabular-nums">{ev[c.id]?.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
