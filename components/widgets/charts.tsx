// Simple SVG charts. No chart library.
type Point = { label: string; value: number };

export function LineChart({ points, height = 140 }: { points: Point[]; height?: number }) {
  const w = 600;
  const max = Math.max(1, ...points.map((p) => p.value));
  const x = (i: number) => (i / Math.max(1, points.length - 1)) * (w - 20) + 10;
  const y = (v: number) => height - 20 - (v / max) * (height - 40);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img">
      <line x1="10" x2={w - 10} y1={height - 20} y2={height - 20} className="stroke-border" />
      <path d={path} fill="none" strokeWidth="2" className="stroke-primary" />
      {points.map((p, i) => (
        <circle key={p.label} cx={x(i)} cy={y(p.value)} r="2.5" className="fill-primary">
          <title>{`${p.label}: ${p.value}`}</title>
        </circle>
      ))}
      <text x="10" y={height - 4} className="fill-muted-foreground text-[10px]">{points[0]?.label}</text>
      <text x={w - 10} y={height - 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{points.at(-1)?.label}</text>
      <text x="10" y="12" className="fill-muted-foreground text-[10px]">max {max}</text>
    </svg>
  );
}

export function BarChart({ bars, format = String }: { bars: Point[]; format?: (v: number) => string }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="space-y-2">
      {bars.map((b) => (
        <div key={b.label} className="grid grid-cols-[8rem_1fr_4rem] items-center gap-2 text-xs">
          <span className="truncate text-muted-foreground">{b.label}</span>
          <div className="h-4 rounded bg-muted">
            <div className="h-4 rounded bg-primary" style={{ width: `${(b.value / max) * 100}%` }} />
          </div>
          <span className="text-right tabular-nums">{format(b.value)}</span>
        </div>
      ))}
    </div>
  );
}
