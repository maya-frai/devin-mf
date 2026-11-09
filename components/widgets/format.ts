import type { Format } from "@/config/views/types";

// Fixed time zone so server and browser render the same text.
export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export function formatCell(value: unknown, format: Format = "text"): string {
  if (value === undefined || value === null || value === "") return "—";
  switch (format) {
    case "usd": return (Number(value) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
    case "pct": return `${(Number(value) * 100).toFixed(1)}%`;
    case "number": return Number(value).toLocaleString("en-US");
    case "date": return String(value).slice(0, 10);
    case "datetime": return when(String(value));
    case "badge": return String(value).replaceAll("_", " ");
    default: return String(value);
  }
}

// CSV export of whatever rows are currently filtered.
export function downloadCsv(filename: string, rows: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const cell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lines = [columns.map((c) => cell(c.label)).join(","), ...rows.map((r) => columns.map((c) => cell(r[c.key])).join(","))];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}
