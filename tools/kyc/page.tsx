import { RenderView } from "@/components/widgets/render-view";
import { getCurrentUser } from "@/core/session";
import { CaseView } from "./case-view";

// Queue views per role: config/roles.ts and config/views/kyc.ts. The case page is shared.
export default async function KycPage({ query }: { query: Record<string, string | undefined> }) {
  const user = await getCurrentUser();
  if (query.case) return <CaseView id={query.case} user={user} />;
  return <RenderView tool="kyc" user={user} query={query} />;
}
