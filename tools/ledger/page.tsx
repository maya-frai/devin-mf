import { RenderView } from "@/components/widgets/render-view";
import { getCurrentUser } from "@/core/session";

export default async function LedgerPage({ query }: { query: Record<string, string | undefined> }) {
  return <RenderView tool="ledger" user={await getCurrentUser()} query={query} />;
}
