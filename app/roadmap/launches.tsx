import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { listFlags, type Flag } from "@/tools/flags/logic";

// Product roadmap, read straight from feature flags: where each feature is on its way to customers.
const STAGES = [
  { id: "planned", title: "Planned", hint: "Off everywhere" },
  { id: "testing", title: "In testing", hint: "On in dev or staging" },
  { id: "rolling", title: "Rolling out", hint: "Partly on in prod" },
  { id: "live", title: "Live", hint: "On for all customers" },
] as const;
const stage = (f: Flag) => (f.prod ? (f.rolloutPct >= 100 ? "live" : "rolling") : f.staging || f.dev ? "testing" : "planned");

export function Launches() {
  const flags = listFlags();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((s) => {
        const items = flags.filter((f) => stage(f) === s.id);
        return (
          <div key={s.id} className="rounded-xl bg-muted/50 p-3">
            <div className="mb-3 flex items-baseline justify-between px-1">
              <div><div className="text-sm font-medium">{s.title}</div><div className="text-xs text-muted-foreground">{s.hint}</div></div>
              <span className="text-xs tabular-nums text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((f) => (
                <Link key={f.id} href={`/tools/flags?q=${f.key}`}>
                  <Card className="mb-2 transition-shadow hover:shadow-md">
                    <CardContent className="space-y-2 text-sm">
                      <div>{f.description}</div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{f.owner}</span>
                        {s.id === "rolling" ? <span className="tabular-nums">{f.rolloutPct}% of customers</span> : null}
                      </div>
                      {s.id === "rolling" ? <div className="h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${f.rolloutPct}%` }} /></div> : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
