import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { can } from "@/core/permissions";
import { getCurrentUser, getTerms } from "@/core/session";
import { NewToolForm } from "./new-tool-form";

export default async function NewToolPage() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  if (!can(user, "tools.create")) return <Forbidden user={user} action="tools.create" />;

  return (
    <div>
      <PageTitle
        title={terms.newTool}
        user={user}
        subtitle="Describe the tool in plain English. Paste the generated prompt into Devin; it follows docs/ADD_TOOL.md."
      />
      <NewToolForm />
    </div>
  );
}
