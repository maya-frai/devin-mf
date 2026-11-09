import Link from "next/link";
import { notFound } from "next/navigation";
import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { PlatformView } from "@/components/platform-view";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import { cn } from "@/lib/utils";
import { getTool } from "@/tools/registry";

export default async function ToolPage(props: PageProps<"/tools/[slug]">) {
  const { slug } = await props.params;
  const { view } = await props.searchParams;
  const tool = getTool(slug);
  if (!tool) notFound();

  const user = await getCurrentUser();
  if (!can(user, `${slug}.view`)) return <Forbidden user={user} action={`${slug}.view`} />;

  const platform = view === "platform";
  const tab = (active: boolean) =>
    cn("border-b-2 px-1 pb-2", active ? "border-foreground font-medium" : "border-transparent text-muted-foreground");
  const { Page } = tool;

  return (
    <div>
      <PageTitle title={tool.manifest.name} subtitle={tool.manifest.description} />
      <nav className="mb-6 flex gap-6 border-b text-sm">
        <Link href={`/tools/${slug}`} className={tab(!platform)}>Tool</Link>
        <Link href={`/tools/${slug}?view=platform`} className={tab(platform)}>Platform view</Link>
      </nav>
      {platform ? <PlatformView tool={tool} /> : <Page />}
    </div>
  );
}
