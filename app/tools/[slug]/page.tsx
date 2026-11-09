import { notFound } from "next/navigation";
import { Forbidden } from "@/components/forbidden";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import { getTool } from "@/tools/registry";

export default async function ToolPage(props: PageProps<"/tools/[slug]">) {
  const { slug } = await props.params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const user = await getCurrentUser();
  const action = `${slug}.view`;
  if (!can(user, action)) return <Forbidden user={user} action={action} />;

  const { Page } = tool;
  return <Page />;
}
