"use client";

import { useState, useTransition } from "react";
import { revealPii } from "@/core/actions";
import type { PiiField } from "@/core/mask";
import { Button } from "@/components/ui/button";

// Receives only the masked value. The raw value is fetched on Reveal,
// which the server permission-checks and audits.
export function MaskedField(props: {
  collection: string;
  id: string;
  field: PiiField;
  masked: string;
  canReveal: boolean;
}) {
  const [value, setValue] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const reveal = () =>
    startTransition(async () => {
      const res = await revealPii(props.collection, props.id, props.field);
      setValue(res.value);
      setError(res.error);
    });

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      {value ?? props.masked}
      {props.canReveal && !value ? (
        <Button variant="ghost" size="xs" disabled={pending} onClick={reveal}>
          {error ?? "Reveal"}
        </Button>
      ) : null}
    </span>
  );
}
