import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ToolDefinition } from "@/core/types";
import { codeUrl } from "@/lib/repo";

// What this tool reuses from the shared core, with links to the code.
export function PlatformView({ tool }: { tool: ToolDefinition }) {
  const { manifest, build } = tool;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Core capabilities used</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {manifest.uses.map((u) => (
            <div key={u.capability} className="flex items-start gap-3">
              <Badge variant="secondary" className="w-24">{u.capability}</Badge>
              <div className="text-sm">
                <div>{u.detail}</div>
                <a href={codeUrl(u.file)} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted-foreground underline">
                  {u.file}
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Build</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Minutes</span>{build.minutes}</div>
          <div className="flex justify-between"><span className="text-muted-foreground">ACUs</span>{build.acus ?? "—"}</div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pull request</span>
            {build.pr_url ? <a href={build.pr_url} target="_blank" rel="noreferrer" className="underline">View PR</a> : "—"}
          </div>
          <a href={codeUrl(`tools/${manifest.slug}/build.json`)} target="_blank" rel="noreferrer" className="block pt-2 font-mono text-xs text-muted-foreground underline">
            tools/{manifest.slug}/build.json
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
