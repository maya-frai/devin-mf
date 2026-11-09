"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Actions a role can't perform stay visible but disabled, with a tooltip naming the role needed.
export function RoleTip({ allowed, needs, children }: { allowed: boolean; needs: string; children: ReactNode }) {
  if (allowed) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent>Needs {needs}</TooltipContent>
    </Tooltip>
  );
}

export function GuardedButton({ allowed, needs, disabled, ...props }: ComponentProps<typeof Button> & { allowed: boolean; needs: string }) {
  return (
    <RoleTip allowed={allowed} needs={needs}>
      <Button {...props} disabled={disabled || !allowed} />
    </RoleTip>
  );
}
