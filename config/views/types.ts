// A view is a list of widgets from components/widgets, each fed by a named data source.
// Sources, metrics and panels are registered per tool in tools/<tool>/sources.ts.
export type Format = "text" | "mono" | "number" | "usd" | "pct" | "date" | "datetime" | "badge";
export type Column = { key: string; label: string; format?: Format; link?: string /* e.g. "/tools/kyc?case={id}" */ };
export type Width = "full" | "half";

export type Widget =
  | { type: "KpiTiles"; metrics: string[] }
  | { type: "LineChart"; title: string; source: string; width?: Width }
  | { type: "BarChart"; title: string; source: string; width?: Width }
  | { type: "StatusSummary"; title: string; source: string; width?: Width }
  | { type: "WorkQueue"; title: string; source: string; empty: string; width?: Width }
  | { type: "ActivityFeed"; title: string; source: string; width?: Width }
  | { type: "ApprovalList"; title: string; tool: string; width?: Width }
  | {
      type: "DataTable";
      title?: string;
      source: string;
      columns: Column[];
      search: string[];
      status?: string;
      sort: string;
      exportCsv?: boolean;
      main?: boolean; // role overrides for columns and filters apply to this table
      width?: Width;
    }
  | { type: "Panel"; panel: string; width?: Width };

export type View = { widgets: Widget[] };
