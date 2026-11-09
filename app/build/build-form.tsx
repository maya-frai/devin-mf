"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BuildContext, BuildRequest } from "@/lib/build-prompt";
import { BuildFlow } from "./build-flow";

type Suggestion = { mode: "new" | "customize"; tool?: string; text: string; name?: string };
const field = "rounded-lg border bg-background px-3 text-sm font-normal";

export function BuildForm(props: { ctx: BuildContext; suggestions: Suggestion[]; initialMode: "new" | "customize"; initialTool?: string; initialRequest?: string }) {
  const { ctx } = props;
  const [req, setReq] = useState<BuildRequest>({ mode: props.initialMode, tool: props.initialTool ?? ctx.tools[0]?.slug, name: props.initialMode === "new" && props.initialRequest?.includes(":") ? props.initialRequest.split(":")[0] : "", request: props.initialRequest ?? "" });
  const [done, setDone] = useState<BuildRequest | null>(null);
  const pick = (s: Suggestion) => { setReq({ ...req, mode: s.mode, tool: s.tool ?? req.tool, name: s.name ?? (s.mode === "new" ? s.text.split(":")[0] : ""), request: s.text }); setDone(null); };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(["new", "customize"] as const).map((m) => (
                <Button key={m} type="button" size="sm" variant={req.mode === m ? "default" : "outline"} onClick={() => setReq({ ...req, mode: m })}>
                  {m === "new" ? "New tool" : "Customize one of my tools"}
                </Button>
              ))}
            </div>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setDone(req); }}>
              {req.mode === "customize" ? (
                <label className="grid gap-1 text-sm font-medium">Tool
                  <select value={req.tool} onChange={(e) => setReq({ ...req, tool: e.target.value })} className={`${field} h-9`}>
                    {ctx.tools.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                  </select>
                </label>
              ) : (
                <label className="grid gap-1 text-sm font-medium">Tool name
                  <input required value={req.name} onChange={(e) => setReq({ ...req, name: e.target.value })} placeholder="Payout reconciliation" className={`${field} h-9`} />
                </label>
              )}
              <label className="grid gap-1 text-sm font-medium">What do you want?
                <textarea required rows={3} value={req.request} onChange={(e) => setReq({ ...req, request: e.target.value })}
                  placeholder="In your own words: who uses it, what they do, what needs approval" className={`${field} py-2`} />
              </label>
              <Button type="submit">Build it</Button>
            </form>
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">Ideas for a {ctx.user.title}</div>
              <div className="flex flex-wrap gap-2">
                {props.suggestions.map((s) => (
                  <button key={s.text} type="button" onClick={() => pick(s)} className="rounded-full border px-3 py-1 text-left text-xs hover:bg-accent">
                    {s.mode === "customize" ? `Customize ${ctx.tools.find((t) => t.slug === s.tool)?.name}: ` : "New: "}{s.text.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {done ? (
          <BuildFlow key={JSON.stringify(done)} req={done} ctx={ctx} />
        ) : null}
      </div>
      <Card className="h-fit lg:col-span-2">
        <CardHeader><CardTitle>What Devin will use</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div><div className="text-xs text-muted-foreground">You</div>{ctx.user.name}, {ctx.user.title} · {ctx.user.team} · <span className="font-mono">{ctx.user.role}</span></div>
          <div><div className="text-xs text-muted-foreground">Tools you use</div>{ctx.tools.map((t) => <Badge key={t.slug} variant="outline" className="mr-1">{t.name}</Badge>)}</div>
          <div>
            <div className="text-xs text-muted-foreground">Systems behind them</div>
            {ctx.connectors.map((c) => <div key={c.name} className="flex justify-between text-xs"><span>{c.name}</span><span className="text-muted-foreground">{c.access} · {c.status}</span></div>)}
          </div>
          <div><div className="text-xs text-muted-foreground">Rules it must follow</div>{ctx.rules.map((r) => <div key={r} className="text-xs">{r}</div>)}</div>
          <div><div className="text-xs text-muted-foreground">Controls kept in place</div>{ctx.controls.map((c) => <Badge key={c} variant="secondary" className="mr-1 mb-1">{c}</Badge>)}</div>
          <div><div className="text-xs text-muted-foreground">Permissions</div><div className="font-mono text-xs text-muted-foreground">{ctx.permissions.join(", ")}</div></div>
        </CardContent>
      </Card>
    </div>
  );
}
