import Link from "next/link";
import { notFound } from "next/navigation";
import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { PlatformView } from "@/components/platform-view";
import { can } from "@/core/permissions";
import { DraftToolView } from "@/components/drafts/draft-tool-view";
import { ImportBanner } from "@/components/import-banner";
import { customWidgets, getDraft } from "@/core/drafts";
import { SuggestChips } from "@/components/suggest-chips";
import { ROLES } from "@/config/roles";
import { interpretCustomize, suggestionsFor } from "@/lib/interpret";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getTerms, toolName } from "@/core/session";
import { importCounts, trackOpen } from "@/core/store";
import { cn } from "@/lib/utils";
import { getTool } from "@/tools/registry";

export default async function ToolPage(props: PageProps<"/tools/[slug]">) {
  const { slug } = await props.params;
  const query = (await props.searchParams) as Record<string, string | undefined>;
  const { view } = query;
  const tool = getTool(slug);
  const draft = tool ? undefined : getDraft(slug);
  if (draft) return <DraftToolView draft={draft} user={await getCurrentUser()} />;
  if (!tool) notFound();

  const user = await getCurrentUser();
  if (!can(user, `${slug}.view`)) return <Forbidden user={user} action={`${slug}.view`} />;

  trackOpen(user.id, slug);
  const terms = await getTerms();
  const n = importCounts();
  const imported = `Imported from Power Apps: ${n.payments} ${terms.payments.toLowerCase()}, ${n.cases} ${terms.cases.toLowerCase()}, ${n.flags} ${terms.flagsNoun}, ${n.history} history entries`;
  const platform = view === "platform";
  const tab = (active: boolean) =>
    cn("border-b-2 px-1 pb-2", active ? "border-foreground font-medium" : "border-transparent text-muted-foreground");
  const { Page } = tool;
  const applied = new Set(customWidgets(user.role, slug).map((c) => c.label));
  const ideas = [...ROLES[user.role].suggestions.filter((s) => s.mode === "customize" && s.tool === slug).map((s) => s.text), ...suggestionsFor(slug)];
  const fresh = can(user, "tools.create") && ROLES[user.role].tools[slug]
    ? [...new Map(ideas.map((t) => [interpretCustomize(slug, t).label, t])).entries()].filter(([label]) => !applied.has(label)).map(([, t]) => t).slice(0, 4)
    : [];

  return (
    <div>
      <ImportBanner text={imported} />
      <PageTitle title={toolName(terms, slug, tool.manifest.name)} subtitle={tool.manifest.description} user={user} />
      <nav className="mb-6 flex gap-6 border-b text-sm">
        <Link href={`/tools/${slug}`} className={tab(!platform)}>Tool</Link>
        <Link href={`/tools/${slug}?view=platform`} className={tab(platform)}>Platform view</Link>
        {can(user, "tools.create") ? (
          <Button size="xs" variant="outline" className="mb-2 ml-auto" nativeButton={false} render={<Link href={`/build?mode=customize&tool=${slug}`} />}>
            {terms.customizeTool}
          </Button>
        ) : null}
      </nav>
      {platform ? <PlatformView tool={tool} /> : <><SuggestChips tool={slug} items={fresh} /><Page query={query} /></>}
    </div>
  );
}
