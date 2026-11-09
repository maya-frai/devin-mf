"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import type { FormState } from "@/core/types";
import { toast } from "./toast";

// Small wrapper so every tool form shows the server action's result the same way.
export function ActionForm(props: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(props.action, {});
  useEffect(() => {
    if (state.error) toast(state.error, true);
    else if (state.message) toast(state.pending ? "Sent for approval" : "Logged to audit trail");
  }, [state]);
  return (
    <form action={formAction} className="flex flex-wrap items-start gap-3">
      <fieldset disabled={pending} className="contents">
        {props.children}
      </fieldset>
      {state.message ? <p className="w-full text-sm text-emerald-700">{state.message}</p> : null}
      {state.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
