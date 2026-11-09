"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// "Imported from Power Apps: ..." with counts computed by the importer. Dismissible per session.
export function ImportBanner({ text }: { text: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-accent px-4 py-2 text-sm text-accent-foreground">
      <span>{text}</span>
      <Button size="xs" variant="ghost" onClick={() => setHidden(true)}>Dismiss</Button>
    </div>
  );
}
