"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { WriteResult } from "@/core/types";
import { ReasonField } from "./fields";
import { toastResult } from "./toast";

// Confirms a write and collects the reason every write requires.
export function ReasonDialog(props: {
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  onConfirm: (reason: string) => Promise<WriteResult>;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [ownOpen, setOwnOpen] = useState(false);
  const open = props.open ?? ownOpen;
  const setOpen = props.onOpenChange ?? setOwnOpen;
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {props.trigger ? <DialogTrigger render={props.trigger} /> : null}
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const reason = String(new FormData(e.currentTarget).get("reason"));
            start(async () => {
              if (toastResult(await props.onConfirm(reason))) setOpen(false);
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            {props.description ? <DialogDescription>{props.description}</DialogDescription> : null}
          </DialogHeader>
          <ReasonField />
          <DialogFooter>
            <Button type="submit" disabled={pending}>{props.confirmLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
