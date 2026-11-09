"use client";

import { undoCustomizationAction } from "@/app/build/actions";
import { toastResult } from "@/components/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Marks a widget added from the "+" builder, with the request that produced it and an Undo.
export function CustomizedTag({ id, label, request }: { id: string; label: string; request: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-xs">
      <Badge>Customized</Badge>
      <span className="truncate text-muted-foreground" title={request}>{label} · from “{request}”</span>
      <Button size="xs" variant="ghost" className="ml-auto" onClick={async () => toastResult(await undoCustomizationAction(id))}>Undo</Button>
    </div>
  );
}
