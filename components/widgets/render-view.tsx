import { ROLES } from "@/config/roles";
import { VIEWS } from "@/config/views";
import type { Widget } from "@/config/views/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customWidgets } from "@/core/drafts";
import type { User } from "@/core/users";
import { METRICS, PANELS, SOURCES } from "@/tools/sources";
import { ActivityFeed, type FeedItem } from "./activity-feed";
import { ApprovalList } from "./approval-list";
import { CustomizedTag } from "./customized-tag";
import { approvalRows } from "./approval-rows";
import { BarChart, LineChart } from "./charts";
import { DataTable } from "./data-table";
import { KpiTiles } from "./kpi-tile";
import { StatusSummary } from "./status-summary";
import type { ViewContext } from "./types";
import { WorkQueue, type WorkItem } from "./work-queue";

type Point = { label: string; value: number };
const data = <T,>(source: string, ctx: ViewContext) => (SOURCES[source]?.(ctx) ?? []) as T;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>;
}

// Renders the view config/roles.ts picks for this role and tool, from config/views.
export function RenderView({ tool, user, query }: { tool: string; user: User; query: Record<string, string | undefined> }) {
  const cfg = ROLES[user.role].tools[tool];
  const view = cfg && VIEWS[cfg.view];
  if (!cfg || !view) return <p className="text-muted-foreground">No view configured for {user.role}. Add one in config/roles.ts.</p>;
  const ctx: ViewContext = { user, query, filters: cfg.filters ?? {} };
  const firstKpis = view.widgets.findIndex((w) => w.type === "KpiTiles");

  const render = (w: Widget, i: number) => {
    switch (w.type) {
      case "KpiTiles":
        return <KpiTiles metrics={(i === firstKpis && cfg.kpis ? cfg.kpis : w.metrics).map((m) => METRICS[m](ctx))} />;
      case "LineChart":
        return <ChartCard title={w.title}><LineChart points={data<Point[]>(w.source, ctx)} /></ChartCard>;
      case "BarChart":
        return <ChartCard title={w.title}><BarChart bars={data<Point[]>(w.source, ctx)} /></ChartCard>;
      case "StatusSummary":
        return <StatusSummary title={w.title} items={data<Point[]>(w.source, ctx)} />;
      case "WorkQueue":
        return <WorkQueue title={w.title} items={data<WorkItem[]>(w.source, ctx)} empty={w.empty} />;
      case "ActivityFeed":
        return <ActivityFeed title={w.title} items={data<FeedItem[]>(w.source, ctx)} />;
      case "ApprovalList":
        return <ApprovalList title={w.title} rows={approvalRows(user, w.tool)} />;
      case "DataTable": {
        const columns = w.main && cfg.columns ? w.columns.filter((c) => cfg.columns!.includes(c.key)) : w.columns;
        return <DataTable {...w} columns={columns} rows={data<Record<string, unknown>[]>(w.source, ctx)} initialStatus={w.main ? cfg.filters?.status : undefined} />;
      }
      case "Panel": {
        const Panel = PANELS[w.panel];
        return Panel ? <Panel ctx={ctx} /> : null;
      }
    }
  };

  // Widgets added from the "+" builder for this role come first, marked "Customized".
  const custom = customWidgets(user.role, tool);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {custom.map((c) => (
        <div key={c.id} className="rounded-xl p-2 ring-2 ring-primary/40 lg:col-span-2">
          <CustomizedTag id={c.id} label={c.label} request={c.request} />
          {c.widget ? render(c.widget, -1) : null}
        </div>
      ))}
      {view.widgets.map((w, i) => (
        <div key={i} className={"width" in w && w.width === "half" ? undefined : "lg:col-span-2"}>{render(w, i)}</div>
      ))}
    </div>
  );
}
