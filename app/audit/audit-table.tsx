"use client";

import { useState } from "react";
import { SortHead, TableFooter, TableToolbar, useTable } from "@/components/data-table";
import { useTerms } from "@/components/terms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ImportedTag } from "@/components/widgets/activity-feed";
import { downloadCsv, formatCell } from "@/components/widgets/format";
import type { AuditEvent } from "@/core/types";

type Row = AuditEvent & { change: string };
const select = "h-8 rounded-lg border bg-background px-2 text-sm";
const CSV_COLUMNS = ["at", "actor", "role", "tool", "action", "entityId", "change", "reason", "source"].map((key) => ({ key, label: key }));

// Filters by tool, user and date, plus search, sort and CSV export of the filtered rows.
export function AuditTable({ rows }: { rows: Row[] }) {
  const terms = useTerms();
  const [tool, setTool] = useState("all");
  const [actor, setActor] = useState("all");
  const [since, setSince] = useState("");
  const options = (key: "tool" | "actor") => [...new Set(rows.map((r) => r[key]))].sort();
  const visible = rows.filter((r) => (tool === "all" || r.tool === tool) && (actor === "all" || r.actor === actor) && (!since || r.at.slice(0, 10) >= since));
  const t = useTable(visible, { search: ["action", "entityId", "reason", "actor"], sort: "at" });

  return (
    <Card className="gap-0 py-0">
      <TableToolbar {...t} placeholder="Search action, record or reason">
        <select value={tool} onChange={(e) => setTool(e.target.value)} className={select}>
          <option value="all">All tools</option>
          {options("tool").map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={actor} onChange={(e) => setActor(e.target.value)} className={select}>
          <option value="all">All users</option>
          {options("actor").map((o) => <option key={o}>{o}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Since <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className={select} />
        </label>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => downloadCsv("audit-log.csv", t.all, CSV_COLUMNS)}>{terms.exportCsv}</Button>
      </TableToolbar>
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Time" k="at" sort={t.sort} onSort={t.toggleSort} className="pl-4" />
            <SortHead label="Who" k="actor" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Tool" k="tool" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Action" k="action" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Record" k="entityId" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Change" k="change" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Reason" k="reason" sort={t.sort} onSort={t.toggleSort} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.rows.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="pl-4 text-muted-foreground">No events match. Clear the filters.</TableCell></TableRow>
          ) : t.rows.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="pl-4 text-xs">{formatCell(e.at, "datetime")}</TableCell>
              <TableCell>{e.actor} <Badge variant="outline">{e.role}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{e.tool}</TableCell>
              <TableCell className="font-mono text-xs">{e.action}<ImportedTag source={e.source} /></TableCell>
              <TableCell className="font-mono text-xs">{e.entityId}</TableCell>
              <TableCell className="max-w-56 truncate font-mono text-xs text-muted-foreground" title={e.change}>{e.change}</TableCell>
              <TableCell className="max-w-48 truncate text-xs" title={e.reason}>{e.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter shown={t.rows.length} total={t.total} more={t.more} />
    </Card>
  );
}
