import { PageTitle } from "@/components/page-title";
import { getCurrentUser, getTerms } from "@/core/session";
import roadmap from "@/data/roadmap.json";
import { Launches } from "./launches";
import { RoadmapCard } from "./roadmap-card";

export default async function RoadmapPage() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const tools = roadmap.filter((r) => (r.roles ?? []).includes(user.role));
  return (
    <div className="space-y-10">
      <section>
        <PageTitle title={terms.roadmap} subtitle="Every feature on its way to customers, read live from feature flags." />
        <Launches />
      </section>
      <section>
        <h2 className="mb-1 text-lg font-semibold">Internal tools to build next</h2>
        <p className="mb-4 text-sm text-muted-foreground">Each card generates a ready-to-paste Devin prompt.</p>
        <div className="grid items-start gap-4 md:grid-cols-2">
          {(tools.length ? tools : roadmap).map((item) => <RoadmapCard key={item.name} item={item} />)}
        </div>
      </section>
    </div>
  );
}
