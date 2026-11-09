"use client";

import { useState } from "react";
import { SortHead, TableFooter, TableToolbar, useTable } from "@/components/data-table";
import { RoleTip } from "@/components/guarded-button";
import { ReasonDialog } from "@/components/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleFlagAction } from "./actions";
import { FlagDrawer } from "./flag-drawer";
import { WORKFLOWS } from "@/config/workflows";
import type { Tweak } from "@/lib/interpret";
import type { Env, Flag } from "./logic";

const ENVS = WORKFLOWS.flags.environments;
const needsApproval = (env: string) => WORKFLOWS.flags.needApproval.includes(env);

export type FlagRow = Flag & {
  stale: boolean;
  prodState: string;
  pendingProd: boolean;
  pendingRollout: boolean;
  approval: { summary: string; status: string; requestedBy: string } | null;
  history: { id: string; at: string; actor: string; action: string; part: string; reason: string; after: string; source?: string }[];
};

export function FlagsTable({ rows, canToggle, needs, tweak }: { rows: FlagRow[]; canToggle: boolean; needs: string; tweak?: Tweak }) {
  const t = useTable(rows, { search: ["key", "description", "owner"], status: "prodState", sort: "key", desc: false });
  // Customizations from the "+" builder: pin a team's flags first, highlight stale ones.
  const pinned = tweak?.pinOwner ? [...t.rows].sort((a, b) => Number(b.owner === tweak.pinOwner) - Number(a.owner === tweak.pinOwner)) : t.rows;
  const [change, setChange] = useState<{ flag: FlagRow; env: Env; enabled: boolean } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const drawerFlag = rows.find((r) => r.id === open) ?? null;

  const toggle = (flag: FlagRow, env: Env) => {
    if (needsApproval(env) && flag.pendingProd) return <Badge>Pending approval</Badge>;
    return (
      <RoleTip allowed={canToggle} needs={needs}>
        <Switch checked={flag[env]} disabled={!canToggle} onCheckedChange={(enabled) => setChange({ flag, env, enabled })} />
      </RoleTip>
    );
  };

  return (
    <Card className="gap-0 py-0">
      <TableToolbar {...t} placeholder="Search flag, description or owner" />
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Flag" k="key" sort={t.sort} onSort={t.toggleSort} className="pl-4" />
            <SortHead label="Owner" k="owner" sort={t.sort} onSort={t.toggleSort} />
            {ENVS.map((env) => <TableHead key={env} className="capitalize">{env}</TableHead>)}
            <SortHead label="Updated" k="updatedAt" sort={t.sort} onSort={t.toggleSort} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.rows.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="pl-4 text-muted-foreground">No flags match. Clear the search or status filter.</TableCell></TableRow>
          ) : pinned.map((f) => (
            <TableRow key={f.id} className={tweak?.highlightStale && f.stale ? "bg-warning/10" : undefined}>
              <TableCell className="pl-4">
                <button type="button" onClick={() => setOpen(f.id)} className="font-mono text-xs underline">{f.key}</button>
                {f.stale ? <Badge variant="outline" className="ml-2">stale</Badge> : null}
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">{f.owner}</TableCell>
              <TableCell>{toggle(f, "dev")}</TableCell>
              <TableCell>{toggle(f, "staging")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">{toggle(f, "prod")}<span className="text-xs tabular-nums text-muted-foreground">{f.rolloutPct}%</span></div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{f.updatedAt.slice(0, 10)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableFooter shown={t.rows.length} total={t.total} more={t.more} />
      <ReasonDialog
        open={!!change}
        onOpenChange={(o) => !o && setChange(null)}
        title={change ? `Turn ${change.enabled ? "on" : "off"} ${change.flag.key} in ${change.env}` : ""}
        description={change && needsApproval(change.env) ? `${change.env} changes go to an approver (${WORKFLOWS.flags.approverRoles.join(" or ")}).` : "Applies immediately."}
        confirmLabel={change && needsApproval(change.env) ? "Send for approval" : "Apply"}
        onConfirm={(reason) => toggleFlagAction(change!.flag.id, change!.env, change!.enabled, reason)}
      />
      <FlagDrawer flag={drawerFlag} onClose={() => setOpen(null)} canToggle={canToggle} needs={needs} />
    </Card>
  );
}
