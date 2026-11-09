import { RenderView } from "@/components/widgets/render-view";
import { getCurrentUser } from "@/core/session";

// What each role sees is set in config/roles.ts and config/views/refunds.ts.
export default async function RefundsPage({ query }: { query: Record<string, string | undefined> }) {
  return <RenderView tool="refunds" user={await getCurrentUser()} query={query} />;
}
