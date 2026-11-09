"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { SortHead, TableFooter, TableToolbar, useTable } from "@/components/data-table";
import { GuardedButton } from "@/components/guarded-button";
import { useTerms } from "@/components/terms";
import { toastResult } from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { claimNextAction } from "./actions";

type Row = { id: string; customer: string; country: string; riskScore: number; band: string; slaLeft: number; status: string; assignee: string; assigneeName: string };
const BAND = { high: "destructive", medium: "default", low: "secondary" } as const;
const OPEN = ["open", "escalated"];

function Sla({ row }: { row: Row }) {
  if (!OPEN.includes(row.status)) return <span className="text-xs text-muted-foreground">—</span>;
  if (row.slaLeft < 0) return <Badge variant="destructive">{-row.slaLeft}h past SLA</Badge>;
  return <Badge variant="outline">{row.slaLeft}h left</Badge>;
}

export function QueueTable(props: { rows: Row[]; userId: string; canDecide: boolean; needs: string; mineByDefault?: boolean }) {
  const terms = useTerms();
  const [band, setBand] = useState("all");
  const [mine, setMine] = useState(!!props.mineByDefault);
  const [pending, start] = useTransition();
  const visible = props.rows.filter((r) => (band === "all" || r.band === band) && (!mine || r.assignee === props.userId));
  const t = useTable(visible, { search: ["id", "customer", "country"], status: "status", sort: "slaLeft", desc: false });

  return (
    <Card className="gap-0 py-0">
      <TableToolbar {...t} placeholder={`Search ${terms.case}, applicant or country`}>
        <select value={band} onChange={(e) => setBand(e.target.value)} className="h-8 rounded-lg border bg-background px-2 text-sm">
          <option value="all">All risk bands</option>
          {Object.keys(BAND).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Assigned to me
        </label>
        <div className="ml-auto">
          <GuardedButton size="sm" allowed={props.canDecide} needs={props.needs} disabled={pending}
            onClick={() => start(async () => void toastResult(await claimNextAction()))}>
            {terms.claimNext}
          </GuardedButton>
        </div>
      </TableToolbar>
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Case" k="id" sort={t.sort} onSort={t.toggleSort} className="pl-4" />
            <SortHead label="Applicant" k="customer" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Risk" k="riskScore" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="SLA" k="slaLeft" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Status" k="status" sort={t.sort} onSort={t.toggleSort} />
            <SortHead label="Assignee" k="assigneeName" sort={t.sort} onSort={t.toggleSort} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="pl-4 text-muted-foreground">Nothing matches. Clear the filters or claim the next one.</TableCell></TableRow>
          ) : t.rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="pl-4 font-mono text-xs"><Link href={`/tools/kyc?case=${r.id}`} className="underline">{r.id}</Link></TableCell>
              <TableCell>{r.customer} <span className="text-xs text-muted-foreground">{r.country}</span></TableCell>
              <TableCell><Badge variant={BAND[r.band as keyof typeof BAND]}>{r.band} · {r.riskScore}</Badge></TableCell>
              <TableCell><Sla row={r} /></TableCell>
              <TableCell><Badge variant="outline">{r.status.replaceAll("_", " ")}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{r.assigneeName || "Unassigned"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter shown={t.rows.length} total={t.total} more={t.more} />
    </Card>
  );
}
