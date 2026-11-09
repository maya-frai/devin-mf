"use client";

import { useState, useTransition } from "react";
import { revealPii } from "@/core/actions";
import { mask, type MaskableField } from "@/core/mask";
import { Button } from "@/components/ui/button";

// Shows SSN/DOB masked. Reveal is permission-checked and audited on the server.
// The raw value never reaches the browser until Reveal succeeds.
export function MaskedField(props: {
  collection: string;
  id: string;
  field: MaskableField;
  last4?: string;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const masked = props.field === "ssn" ? `***-**-${props.last4 ?? "****"}` : mask("dob", "");

  function onReveal() {
    startTransition(async () => {
      const res = await revealPii(props.collection, props.id, props.field);
      if ("value" in res) setValue(res.value);
      else setError(res.error);
    });
  }

  return (
    <span className="inline-flex items-center gap-2 font-mono text-sm">
      {value ?? masked}
      {value ? null : (
        <Button variant="ghost" size="xs" disabled={pending} onClick={onReveal} title={error ?? undefined}>
          {error ? "Not permitted" : "Reveal"}
        </Button>
      )}
    </span>
  );
}
