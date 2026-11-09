import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { iconFor } from "@/components/icons";
import { ApplySuggestion } from "@/components/suggest-chips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkItem } from "@/components/widgets/work-queue";
import { KpiTiles } from "@/components/widgets/kpi-tile";
import { ROLES } from "@/config/roles";
import { actionableBy, listApprovals } from "@/core/approvals";
import { listDrafts } from "@/core/drafts";
import { can } from "@/core/permissions";
import { getCurrentUser, getTerms, toolName } from "@/core/session";
import { USERS } from "@/core/users";
import { TOOLS } from "@/tools/registry";
import { METRICS, SOURCES } from "@/tools/sources";

// One live number per tool for the "Your tools" cards.
const PULSE: Record<string, string> = { refunds: "refunds.pendingCount", kyc: "kyc.pastSla", flags: "flags.pendingProd", ledger: "ledger.totalBalance" };
const who = (id: string) => USERS.find((u) => u.id === id)?.name ?? id;

// Home: what's top of mind for this person, their tools, and ideas to make them their own.
export default async function Home() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const role = ROLES[user.role];
  const ctx = { user, query: {}, filters: {} };
  const kpis = role.home.kpis.map((m) => METRICS[m](ctx));
  const waiting = actionableBy(user);
  const mine = listApprovals().filter((a) => a.status === "pending" && a.requestedBy === user.id);
  const lists = role.home.attention.map((a) => ({ ...a, items: (SOURCES[a.source](ctx) as WorkItem[]).slice(0, 3) })).filter((l) => l.items.length);
  const tools = role.sidebar.tools.filter((s) => TOOLS.some((t) => t.manifest.slug === s) && can(user, `${s}.view`));
  const drafts = listDrafts().filter((d) => d.role === user.role);
  const hour = new Date().getHours();
  const caughtUp = !waiting.length && !mine.length && !lists.length;

  const row = (key: string, href: string, title: string, sub: string, badge?: string) => (
    <Link key={key} href={href} className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 hover:bg-muted">
      <div className="min-w-0"><div className="truncate text-sm">{title}</div><div className="truncate text-xs text-muted-foreground">{sub}</div></div>
      {badge ? <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{badge}</span> : null}
    </Link>
  );
  const group = (title: string, children: React.ReactNode) => (
    <div key={title}><div className="mb-1 px-3 text-xs font-medium text-muted-foreground">{title}</div><div className="divide-y">{children}</div></div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{role.title} · {role.team}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}, {user.name}</h1>
        </div>
        {can(user, "tools.create") ? <Button nativeButton={false} render={<Link href="/build" />}><Plus />{terms.buildTool}</Button> : null}
      </div>
      <KpiTiles metrics={kpis} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top of mind</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {caughtUp ? <p className="px-3 text-sm text-muted-foreground">You&apos;re all caught up. Nothing needs you right now.</p> : null}
            {waiting.length ? group(`${terms.waitingOnYou} (${waiting.length})`, waiting.slice(0, 4).map((a) => row(a.id, "/approvals", a.summary, `Requested by ${who(a.requestedBy)}`, "Review"))) : null}
            {mine.length ? group(`Your requests waiting on others (${mine.length})`, mine.slice(0, 3).map((a) => row(a.id, "/approvals", a.summary, "Pending approval", "Pending"))) : null}
            {lists.map((l) => group(l.title, l.items.map((i) => row(i.id, i.href ?? "/", i.title, i.subtitle ?? "", i.badge))))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" />Suggested for you</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {role.suggestions.map((s) => (
              <div key={s.text} className="rounded-md border p-3">
                <div className="mb-1 text-xs font-medium text-muted-foreground">{s.mode === "customize" ? `Customize ${toolName(terms, s.tool ?? "", s.tool ?? "")}` : "New tool"}</div>
                {s.mode === "customize" && s.tool ? <ApplySuggestion tool={s.tool} text={s.text} />
                  : <Link href={`/build?mode=new&request=${encodeURIComponent(s.text)}`} className="text-sm hover:text-primary">{s.text}</Link>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Your tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((slug) => {
            const t = TOOLS.find((x) => x.manifest.slug === slug)!;
            const Icon = iconFor(slug);
            const pulse = PULSE[slug] ? METRICS[PULSE[slug]](ctx) : undefined;
            return (
              <Link key={slug} href={`/tools/${slug}`} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="size-4.5" /></span>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div><div className="font-medium">{toolName(terms, slug, t.manifest.name)}</div><div className="line-clamp-2 text-sm text-muted-foreground">{t.manifest.description}</div></div>
                    {pulse ? <div className="text-xs text-muted-foreground"><span className="font-semibold text-foreground tabular-nums">{pulse.value}</span> {pulse.label.toLowerCase()}</div> : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          {drafts.map((d) => (
            <Link key={d.id} href={`/tools/${d.id}`}><Card className="h-full border-dashed"><CardContent className="space-y-1"><div className="text-xs uppercase text-muted-foreground">Draft</div><div className="font-medium">{d.spec.name}</div><div className="line-clamp-2 text-sm text-muted-foreground">{d.spec.request}</div></CardContent></Card></Link>
          ))}
        </div>
      </section>
    </div>
  );
}
