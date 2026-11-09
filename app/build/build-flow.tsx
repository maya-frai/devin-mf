"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPlan, type BuildContext, type BuildRequest } from "@/lib/build-prompt";
import { interpretCustomize, interpretNew } from "@/lib/interpret";
import { applyBuildAction, type BuildResult } from "./actions";

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

// What Devin would write, shown as file changes, derived from the same interpretation that gets applied.
function changes(req: BuildRequest, ctx: BuildContext): string[] {
  if (req.mode === "customize" && req.tool) {
    const c = interpretCustomize(req.tool, req.request);
    return [`~ config/views/${req.tool}.ts`, `+   ${JSON.stringify(c.widget)}`, `  understood as: ${c.label}${c.matched ? "" : " (closest match)"}`];
  }
  const s = interpretNew(req.name ?? "", req.request);
  return [
    `+ tools/${s.slug}/manifest.ts   name: "${s.name}"`,
    `+ tools/${s.slug}/logic.ts      actions: ${s.actions.join(", ")}${s.approvalOverCents !== null ? ` · ${s.actions[0]} over ${usd(s.approvalOverCents)} needs ${s.approverRole}` : ""}`,
    `+ tools/${s.slug}/seed.json     15 synthetic ${s.entity} records`,
    `+ tools/${s.slug}/actions.ts    guarded(), reason required, logAudit() on every write`,
    `+ config/views/${s.slug}.ts     view for ${ctx.user.role}`,
    `~ config/roles.ts              ${ctx.user.role}.sidebar.tools += "${s.slug}"`,
  ];
}

export function BuildFlow({ req, ctx }: { req: BuildRequest; ctx: BuildContext }) {
  const router = useRouter();
  const steps = [
    { title: "Reading your context", lines: [`${ctx.user.name}, ${ctx.user.title} (${ctx.user.role})`, `${ctx.tools.length} tools · ${ctx.connectors.length} systems · ${ctx.rules.length} rules · ${ctx.controls.length} controls`] },
    { title: "Planning", lines: buildPlan(req, ctx) },
    { title: "Writing files", lines: changes(req, ctx) },
    { title: "Running checks", lines: ["pnpm lint ✓", "pnpm build ✓", "pnpm test ✓", `clicked through as ${ctx.user.name} ✓`] },
    { title: "Opening a draft PR", lines: [`devin/${req.mode === "customize" ? `customize-${req.tool}` : interpretNew(req.name ?? "", req.request).slug} → main (draft, needs review)`] },
  ];
  const [shown, setShown] = useState(0);
  const [result, setResult] = useState<BuildResult | null>(null);

  useEffect(() => {
    if (shown < steps.length) {
      const t = setTimeout(() => setShown(shown + 1), 700);
      return () => clearTimeout(t);
    }
    applyBuildAction(req).then((r) => { setResult(r); router.refresh(); });
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader><CardTitle>Devin is building it</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {steps.slice(0, shown).map((s, i) => (
          <div key={s.title} className="rounded-md border p-3">
            <div className="mb-1 text-sm font-medium">{i < shown - 1 || result ? "✓" : "…"} {s.title}</div>
            {s.lines.map((l) => <div key={l} className={`font-mono text-xs ${l.startsWith("+") ? "text-success" : l.startsWith("~") ? "text-warning" : "text-muted-foreground"}`}>{l}</div>)}
          </div>
        ))}
        {result ? (
          result.ok ? (
            <div className="flex items-center justify-between gap-3 rounded-md bg-success/10 p-3 text-sm text-success">
              <span>Done: {result.summary}. It&apos;s live in your app now.</span>
              <Button size="sm" nativeButton={false} render={<Link href={result.href} />}>Open it</Button>
            </div>
          ) : <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{result.error}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
