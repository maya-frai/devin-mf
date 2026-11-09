import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiTiles } from "@/components/widgets/kpi-tile";
import { ROLES } from "@/config/roles";
import { actionableBy } from "@/core/approvals";
import { can } from "@/core/permissions";
import { getCurrentUser, getTerms, toolName } from "@/core/session";
import { recentFor } from "@/core/store";
import { TOOLS } from "@/tools/registry";
import { METRICS } from "@/tools/sources";

const CORE_APPS = ["refunds", "kyc", "flags"];

export default async function Home() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const apps = TOOLS.filter((t) => can(user, `${t.manifest.slug}.view`));
  const bySlug = (slug: string) => apps.find((t) => t.manifest.slug === slug);
  const recent = recentFor(user.id).map(bySlug).filter((t) => !!t);
  const shortcuts = recent.length ? recent : CORE_APPS.map(bySlug).filter((t) => !!t);
  const kpis = ROLES[user.role].home.kpis.map((m) => METRICS[m]({ user, query: {}, filters: {} }));
  const waiting = actionableBy(user).length;
  const hour = new Date().getHours();

  const appCard = (t: (typeof TOOLS)[number]) => (
    <Link key={t.manifest.slug} href={`/tools/${t.manifest.slug}`}>
      <Card className="h-full transition-colors hover:bg-accent">
        <CardHeader>
          <CardTitle>{toolName(terms, t.manifest.slug, t.manifest.name)}</CardTitle>
          <CardDescription>{t.manifest.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      <PageTitle title={`Good ${hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}, ${user.name}`} subtitle={`You're signed in as ${user.role}.`} user={user} />
      <KpiTiles metrics={kpis} />
      <section>
        <h2 className="mb-3 text-lg font-semibold">{terms.recentApps}</h2>
        <div className="grid gap-4 sm:grid-cols-3">{shortcuts.map(appCard)}</div>
      </section>
      <Link href="/approvals" className="block">
        <Card className="transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle>{terms.waitingOnYou}: {waiting}</CardTitle>
            <CardDescription>{waiting ? `${waiting} approval${waiting === 1 ? "" : "s"} you can act on.` : "Nothing needs your sign-off right now."}</CardDescription>
          </CardHeader>
        </Card>
      </Link>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{terms.allApps}</h2>
        <div className="grid gap-3 sm:grid-cols-4">{apps.map(appCard)}</div>
      </section>
    </div>
  );
}
