"use client";

import { useState } from "react";
import { PromptOutput } from "@/components/prompt-output";
import { Button } from "@/components/ui/button";
import { buildConfigPrompt, CONFIG_AREAS } from "@/lib/config-prompt";

export function CustomizeForm() {
  const [area, setArea] = useState(CONFIG_AREAS[0].id);
  const [request, setRequest] = useState("");
  const [prompt, setPrompt] = useState<string>();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setPrompt(buildConfigPrompt(area, request)); }}>
        <label className="grid gap-1 text-sm font-medium">
          Area
          <select value={area} onChange={(e) => setArea(e.target.value)} className="h-9 rounded-lg border bg-background px-2 text-sm font-normal">
            {CONFIG_AREAS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Change
          <textarea required rows={3} value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Raise the refund auto-approve limit to $750"
            className="rounded-lg border bg-background px-3 py-2 text-sm font-normal" />
        </label>
        <Button type="submit">Generate Devin prompt</Button>
      </form>
      {prompt ? <PromptOutput prompt={prompt} /> : null}
    </div>
  );
}
