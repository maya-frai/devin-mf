"use client";

import { useState } from "react";
import { GuardedButton } from "@/components/guarded-button";
import { ReasonDialog } from "@/components/reason-dialog";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { ImportedTag } from "@/components/widgets/activity-feed";
import { rolloutAction } from "./actions";
import { when } from "@/components/widgets/format";
import type { FlagRow } from "./flags-table";
import { WORKFLOWS } from "@/config/workflows";

const ENVS = WORKFLOWS.flags.environments;


export function FlagDrawer({ flag, onClose, canToggle, needs }: { flag: FlagRow | null; onClose: () => void; canToggle: boolean; needs: string }) {
  const [pct, setPct] = useState<number | null>(null);
  const value = pct ?? flag?.rolloutPct ?? 0;
  const close = () => { setPct(null); onClose(); };

  return (
    <Sheet open={!!flag} onOpenChange={(o) => !o && close()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-mono">{flag?.key}</SheetTitle>
          <SheetDescription>{flag?.description} · owner {flag?.owner}</SheetDescription>
        </SheetHeader>
        {flag ? (
          <div className="space-y-6 px-4 pb-6 text-sm">
            <section className="space-y-3">
              <h3 className="font-medium">Prod rollout: {value}%</h3>
              <Slider value={[value]} min={0} max={100} step={5} disabled={!canToggle || flag.pendingRollout}
                onValueChange={(v) => setPct(Array.isArray(v) ? v[0] : v)} />
              <ReasonDialog
                title={`Set ${flag.key} rollout to ${value}%`}
                description="Rollout is a prod setting, so it needs approval."
                confirmLabel="Send for approval"
                onConfirm={(reason) => rolloutAction(flag.id, value, reason)}
                trigger={<GuardedButton size="sm" allowed={canToggle} needs={needs} disabled={flag.pendingRollout || value === flag.rolloutPct}>
                  {flag.pendingRollout ? "Rollout change pending" : "Request rollout change"}
                </GuardedButton>}
              />
            </section>
            <section>
              <h3 className="mb-2 font-medium">Prod approval</h3>
              {flag.approval ? (
                <div className="rounded-md border p-2">
                  <div className="flex justify-between gap-2"><span>{flag.approval.summary}</span><Badge variant="outline">{flag.approval.status}</Badge></div>
                  <div className="text-xs text-muted-foreground">Requested by {flag.approval.requestedBy}</div>
                </div>
              ) : <p className="text-muted-foreground">No prod change requested this session.</p>}
            </section>
            <section className="space-y-3">
              <h3 className="font-medium">Change history</h3>
              {[...ENVS, "rollout"].map((part) => {
                const items = flag.history.filter((h) => h.part === part);
                return (
                  <div key={part}>
                    <div className="text-xs font-medium uppercase text-muted-foreground">{part}</div>
                    {items.length ? items.map((h) => (
                      <div key={h.id} className="text-xs">{when(h.at)} · {h.actor} · <span className="font-mono">{h.action}</span> {h.after}{h.reason ? ` · “${h.reason}”` : ""}<ImportedTag source={h.source} /></div>
                    )) : <p className="text-xs text-muted-foreground">No changes yet.</p>}
                  </div>
                );
              })}
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
