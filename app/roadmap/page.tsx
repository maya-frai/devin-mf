import { PageTitle } from "@/components/page-title";
import { getCurrentUser, getTerms } from "@/core/session";
import roadmap from "@/data/roadmap.json";
import { RoadmapCard } from "./roadmap-card";

export default async function RoadmapPage() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  return (
    <div>
      <PageTitle
        title={terms.roadmap}
        user={user}
        subtitle="The next tools to build. Each card generates a ready-to-paste Devin prompt."
      />
      <div className="grid items-start gap-4 md:grid-cols-2">
        {roadmap.map((item) => (
          <RoadmapCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}
