"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PromptOutput({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-lg border bg-muted/50">
      <Button size="xs" variant="outline" onClick={copy} className="absolute right-2 top-2">
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="overflow-x-auto whitespace-pre-wrap p-4 pr-20 font-mono text-xs leading-relaxed">{prompt}</pre>
    </div>
  );
}
