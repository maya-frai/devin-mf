import { PageTitle } from "@/components/page-title";
import roadmap from "@/data/roadmap.json";
import { RoadmapCard } from "./roadmap-card";

export default function RoadmapPage() {
  return (
    <div>
      <PageTitle
        title="Roadmap"
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
