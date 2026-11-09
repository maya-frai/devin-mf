"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyBuildAction } from "@/app/build/actions";
import { toast } from "@/components/toast";

// One-click customizations: Devin applies the request to this person's view and it shows up live.
export function SuggestChips({ tool, items }: { tool: string; items: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>();
  if (!items.length) return null;
  const apply = async (request: string) => {
    setBusy(request);
    const r = await applyBuildAction({ mode: "customize", tool, request });
    setBusy(undefined);
    if (r.ok) { toast(`Added to your view: ${r.summary}`); router.refresh(); } else toast(r.error, true);
  };
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Sparkles className="size-3.5 text-primary" />Suggested for your view</span>
      {items.map((t) => (
        <button key={t} type="button" disabled={!!busy} onClick={() => apply(t)}
          className="rounded-full border bg-card px-3 py-1 text-xs shadow-xs transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50">
          {busy === t ? "Applying…" : `+ ${t}`}
        </button>
      ))}
    </div>
  );
}

// Home "Suggested for you": customizations apply in one click and open the tool.
export function ApplySuggestion({ tool, text }: { tool: string; text: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy} className="text-left text-sm hover:text-primary disabled:opacity-50"
      onClick={async () => { setBusy(true); const r = await applyBuildAction({ mode: "customize", tool, request: text }); if (r.ok) router.push(r.href); else { setBusy(false); toast(r.error, true); } }}>
      {busy ? "Applying…" : text}
    </button>
  );
}
