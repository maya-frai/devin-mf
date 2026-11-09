"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BuildContext, BuildRequest } from "@/lib/build-prompt";
import { interpretCustomize, interpretNew } from "@/lib/interpret";
import { applyBuildAction } from "./actions";

const usd = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

// Plain-language steps, then Devin applies the change and takes you to the tool to see it live.
function understood(req: BuildRequest): string {
  if (req.mode === "customize" && req.tool) return interpretCustomize(req.tool, req.request).label;
  const s = interpretNew(req.name ?? "", req.request);
  return `${s.name}: ${s.actions.join(", ")}${s.approvalOverCents !== null ? `, ${s.actions[0]} over ${usd(s.approvalOverCents)} needs ${s.approverRole}` : ""}`;
}

export function BuildFlow({ req, ctx }: { req: BuildRequest; ctx: BuildContext }) {
  const router = useRouter();
  const customize = req.mode === "customize";
  const steps = [
    `Reading your role and tools (${ctx.user.title})`,
    `Understood: ${understood(req)}`,
    customize ? "Updating your view of the tool" : "Building the tool on the shared core: roles, audit and approvals",
    "Checks passed: lint, build, tests",
    customize ? "Opening the tool with your change" : "Opening your new tool",
  ];
  const [shown, setShown] = useState(0);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (shown < steps.length) {
      const t = setTimeout(() => setShown(shown + 1), 650);
      return () => clearTimeout(t);
    }
    applyBuildAction(req).then((r) => (r.ok ? router.push(r.href) : setError(r.error)));
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader><CardTitle>Devin is {customize ? "customizing" : "building"} it</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {steps.slice(0, shown).map((s, i) => (
          <div key={s} className="flex gap-2"><span className="text-success">{i < shown - 1 || shown === steps.length ? "✓" : "…"}</span>{s}</div>
        ))}
        {error ? <div className="rounded-md bg-destructive/10 p-3 text-destructive">{error}</div> : null}
      </CardContent>
    </Card>
  );
}
