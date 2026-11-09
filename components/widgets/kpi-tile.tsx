import { Card, CardContent } from "@/components/ui/card";

export type Metric = { label: string; value: string | number; hint?: string };

export function KpiTile({ label, value, hint }: Metric) {
  return (
    <Card className="py-4">
      <CardContent className="space-y-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

export function KpiTiles({ metrics }: { metrics: Metric[] }) {
  const cols = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" }[metrics.length] ?? "lg:grid-cols-4";
  return <div className={`grid gap-3 sm:grid-cols-2 ${cols}`}>{metrics.map((m) => <KpiTile key={m.label} {...m} />)}</div>;
}
