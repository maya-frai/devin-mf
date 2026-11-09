import { Forbidden } from "@/components/forbidden";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANDS } from "@/config/brand";
import { CONNECTORS } from "@/config/connectors";
import { IMPORT_MAP } from "@/config/import-map";
import { ROLES } from "@/config/roles";
import { TERMINOLOGY } from "@/config/terminology";
import { VIEWS } from "@/config/views";
import { WORKFLOWS } from "@/config/workflows";
import { can } from "@/core/permissions";
import type { User } from "@/core/users";
import { codeUrl } from "@/lib/repo";
import { CustomizeForm } from "@/app/customize/customize-form";

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

// What drives the app, read-only, plus a prompt generator scoped to the right config file.
export function CustomizeSection({ user }: { user: User }) {
  if (!can(user, "platform.customize")) return <Forbidden user={user} action="platform.customize" />;
  return (
    <div className="space-y-6">
      <p className="text-sm font-medium">Everything here is in your repo. Change it yourself or ask Devin.</p>
      <Card>
        <CardHeader><CardTitle>What do you want to change?</CardTitle></CardHeader>
        <CardContent><CustomizeForm /></CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ConfigCard title="Brand presets" file="config/brand.ts" value={BRANDS} />
        <ConfigCard title="Terminology" file="config/terminology.ts" value={TERMINOLOGY} />
        <ConfigCard title="Workflows" file="config/workflows.ts" value={WORKFLOWS} />
        <ConfigCard title="Roles" file="config/roles.ts" value={ROLES} />
        <ConfigCard title="Views" file="config/views/index.ts" value={VIEWS} />
        <ConfigCard title="Connectors" file="config/connectors.ts" value={CONNECTORS} />
        <ConfigCard title="Power Apps import map" file="config/import-map.ts" value={IMPORT_MAP} />
      </div>
    </div>
  );
}
