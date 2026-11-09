import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMPORT_SOURCE } from "@/config/import-map";
import { formatCell } from "./format";

export type FeedItem = { id: string; at: string; actor: string; text: string; reason?: string; source?: string };

export function ImportedTag({ source }: { source?: string }) {
  return source === IMPORT_SOURCE ? <Badge variant="secondary" className="ml-1">Imported</Badge> : null;
}

export function ActivityFeed({ title, items }: { title: string; items: FeedItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {items.length ? items.map((e) => (
          <div key={e.id} className="border-l-2 pl-3">
            <div>{e.text} · {e.actor}<ImportedTag source={e.source} /></div>
            <div className="text-xs text-muted-foreground">{formatCell(e.at, "datetime")}{e.reason ? ` · “${e.reason}”` : ""}</div>
          </div>
        )) : <p className="text-muted-foreground">No activity yet. Changes show up here as they happen.</p>}
      </CardContent>
    </Card>
  );
}
