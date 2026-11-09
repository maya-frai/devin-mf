import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatusSummary({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
        {items.map((i) => (
          <div key={i.label} className="rounded-md bg-muted p-3">
            <div className="text-xl font-semibold tabular-nums">{i.value}</div>
            <div className="text-xs capitalize text-muted-foreground">{i.label}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
