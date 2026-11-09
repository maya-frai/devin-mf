import { RenderView } from "@/components/widgets/render-view";
import { getCurrentUser } from "@/core/session";

// Views per role: config/roles.ts and config/views/flags.ts.
export default async function FlagsPage({ query }: { query: Record<string, string | undefined> }) {
  return <RenderView tool="flags" user={await getCurrentUser()} query={query} />;
}
