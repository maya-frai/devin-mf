"use client";

import { draftActAction } from "@/app/build/actions";
import { SortHead, TableFooter, TableToolbar, useTable } from "@/components/data-table";
import { ReasonDialog } from "@/components/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { DraftRow } from "@/core/drafts";

const usd = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function DraftTable({ slug, rows, actions, money }: { slug: string; rows: DraftRow[]; actions: string[]; money: boolean }) {
  const t = useTable(rows, { search: ["id", "subject", "owner"], status: "status", sort: money ? "amountCents" : "createdAt" });
  return (
    <Card className="gap-0 py-0">
      <TableToolbar {...t} />
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Record" k="id" sort={t.sort} onSort={t.toggleSort} className="pl-4" />
            <SortHead label="Subject" k="subject" sort={t.sort} onSort={t.toggleSort} />
            {money ? <SortHead label="Amount" k="amountCents" sort={t.sort} onSort={t.toggleSort} /> : null}
            <SortHead label="Owner" k="owner" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Status" k="status" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="" k="id" sort={{ key: "", desc: false }} onSort={() => {}} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="pl-4 font-mono text-xs">{r.id}</TableCell>
              <TableCell>{r.subject}</TableCell>
              {money ? <TableCell className="tabular-nums">{usd(r.amountCents)}</TableCell> : null}
              <TableCell className="text-muted-foreground">{r.owner}</TableCell>
              <TableCell><Badge variant="outline">{r.status}</Badge></TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex justify-end gap-1">
                  {actions.map((a) => (
                    <ReasonDialog key={a} title={`${cap(a)} ${r.subject}`} confirmLabel={cap(a)} onConfirm={(reason) => draftActAction(slug, r.id, a, reason)}
                      trigger={<Button size="xs" variant="outline" disabled={r.status !== "open"}>{cap(a)}</Button>} />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter shown={t.rows.length} total={t.total} more={t.more} />
    </Card>
  );
}
