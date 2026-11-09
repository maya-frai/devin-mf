import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type WorkItem = { id: string; title: string; subtitle?: string; badge?: string; href?: string };

export function WorkQueue({ title, items, empty }: { title: string; items: WorkItem[]; empty: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {items.length ? items.map((item) => {
          const body = (
            <div className="flex items-start justify-between gap-3 rounded-md border p-2 hover:bg-muted/50">
              <div>
                <div>{item.title}</div>
                {item.subtitle ? <div className="text-xs text-muted-foreground">{item.subtitle}</div> : null}
              </div>
              {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
            </div>
          );
          return item.href ? <Link key={item.id} href={item.href} className="block">{body}</Link> : <div key={item.id}>{body}</div>;
        }) : <p className="text-muted-foreground">{empty}</p>}
      </CardContent>
    </Card>
  );
}
