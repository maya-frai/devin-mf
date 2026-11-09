import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMPORT_MAP } from "@/config/import-map";
import { ROLES } from "@/config/roles";
import { VIEWS } from "@/config/views";
import { WORKFLOWS } from "@/config/workflows";
import { can } from "@/core/permissions";
import { getCurrentBrand, getCurrentUser, getTerms } from "@/core/session";
import { codeUrl } from "@/lib/repo";
import { CustomizeForm } from "./customize-form";

function ConfigCard({ title, file, value }: { title: string; file: string; value: unknown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <a href={codeUrl(file)} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted-foreground underline">{file}</a>
      </CardHeader>
      <CardContent>
        <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">{JSON.stringify(value, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}

export default async function CustomizePage() {
  const [user, brand, terms] = await Promise.all([getCurrentUser(), getCurrentBrand(), getTerms()]);
  if (!can(user, "platform.customize")) return <Forbidden user={user} action="platform.customize" />;
  return (
    <div className="space-y-6">
      <PageTitle title={terms.customize} subtitle="Everything here is in your repo. Change it yourself or ask Devin." user={user} />
      <Card>
        <CardHeader><CardTitle>What do you want to change?</CardTitle></CardHeader>
        <CardContent><CustomizeForm /></CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ConfigCard title={`Brand: ${brand.name}`} file="config/brand.ts" value={brand} />
        <ConfigCard title="Terminology" file="config/terminology.ts" value={terms} />
        <ConfigCard title="Workflows" file="config/workflows.ts" value={WORKFLOWS} />
        <ConfigCard title="Roles" file="config/roles.ts" value={ROLES} />
        <ConfigCard title="Views" file="config/views/index.ts" value={VIEWS} />
        <ConfigCard title="Power Apps import map" file="config/import-map.ts" value={IMPORT_MAP} />
      </div>
    </div>
  );
}
