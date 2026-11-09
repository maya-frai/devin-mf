"use client";

import { useState } from "react";
import { PromptOutput } from "@/components/prompt-output";
import { Button } from "@/components/ui/button";
import { buildToolPrompt, type ToolRequest } from "@/lib/tool-prompt";

const FIELDS: { key: keyof Omit<ToolRequest, "capabilities">; label: string; placeholder: string }[] = [
  { key: "name", label: "Tool name", placeholder: "Manual ledger adjustment" },
  { key: "users", label: "Who uses it", placeholder: "Ops analysts; ops leads approve" },
  { key: "does", label: "What they do", placeholder: "Debit or credit an account with a reason" },
  { key: "sensitive", label: "Which actions are sensitive", placeholder: "Adjustments above $1,000 need approval" },
];

export function NewToolForm() {
  const [req, setReq] = useState<ToolRequest>({ name: "", users: "", does: "", sensitive: "" });
  const [prompt, setPrompt] = useState<string>();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPrompt(buildToolPrompt(req));
        }}
      >
        {FIELDS.map((f) => (
          <label key={f.key} className="grid gap-1 text-sm font-medium">
            {f.label}
            <input
              required={f.key === "name"}
              value={req[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => setReq({ ...req, [f.key]: e.target.value })}
              className="h-9 rounded-lg border bg-background px-3 text-sm font-normal"
            />
          </label>
        ))}
        <Button type="submit">Generate Devin prompt</Button>
      </form>
      {prompt ? <PromptOutput prompt={prompt} /> : null}
    </div>
  );
}
