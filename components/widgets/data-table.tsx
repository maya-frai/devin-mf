"use client";

import Link from "next/link";
import { SortHead, TableFooter, TableToolbar, useTable } from "@/components/data-table";
import { useTerms } from "@/components/terms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { Column } from "@/config/views/types";
import { downloadCsv, formatCell } from "./format";

type Row = Record<string, unknown> & { id?: string };

// Generic table: search, status filter, sorting, optional CSV export. Columns come from view config.
export function DataTable(props: {
  title?: string;
  rows: Row[];
  columns: Column[];
  search: string[];
  status?: string;
  sort: string;
  exportCsv?: boolean;
  initialStatus?: string;
}) {
  const terms = useTerms();
  const t = useTable(props.rows, { search: props.search, status: props.status, sort: props.sort, initialStatus: props.initialStatus });
  const cell = (row: Row, c: Column) => {
    const text = formatCell(row[c.key], c.format);
    if (c.format === "badge") return <Badge variant="outline">{text}</Badge>;
    if (c.link) return <Link className="underline" href={c.link.replace(/\{(\w+)\}/g, (_, k) => String(row[k]))}>{text}</Link>;
    return <span className={c.format === "mono" ? "font-mono text-xs" : undefined}>{text}</span>;
  };

  return (
    <Card className="gap-0 py-0">
      {props.title ? <CardHeader className="border-b py-3"><CardTitle>{props.title}</CardTitle></CardHeader> : null}
      <TableToolbar {...t} statuses={props.status ? t.statuses : undefined}>
        {props.exportCsv ? (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => downloadCsv(`${(props.title ?? "export").toLowerCase().replace(/\W+/g, "-")}.csv`, t.all, props.columns)}>
            {terms.exportCsv}
          </Button>
        ) : null}
      </TableToolbar>
      <Table>
        <TableHeader>
          <TableRow>
            {props.columns.map((c, i) => <SortHead key={c.key} label={c.label} k={c.key} sort={t.sort} onSort={t.toggleSort} className={i === 0 ? "pl-4" : undefined} />)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.rows.length === 0 ? (
            <TableRow><TableCell colSpan={props.columns.length} className="pl-4 text-muted-foreground">Nothing matches. Clear the search or filter.</TableCell></TableRow>
          ) : t.rows.map((row, i) => (
            <TableRow key={row.id ?? i}>
              {props.columns.map((c, j) => <TableCell key={c.key} className={j === 0 ? "pl-4" : undefined}>{cell(row, c)}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter shown={t.rows.length} total={t.total} more={t.more} />
    </Card>
  );
}
