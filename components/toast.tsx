"use client";

import { useEffect, useState } from "react";
import type { WriteResult } from "@/core/types";

type Toast = { id: number; text: string; error: boolean };
let push: ((text: string, error: boolean) => void) | undefined;

export const toast = (text: string, error = false) => push?.(text, error);

// Every write shows one of these two messages, or the error.
export function toastResult(result: WriteResult): boolean {
  if (!result.ok) toast(result.error, true);
  else toast(result.pending ? "Sent for approval" : "Logged to audit trail");
  return result.ok;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    push = (text, error) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, text, error }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    };
    return () => (push = undefined);
  }, []);
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rounded-lg px-4 py-2.5 text-sm shadow-lg ${t.error ? "bg-destructive text-white" : "bg-foreground text-background"}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
