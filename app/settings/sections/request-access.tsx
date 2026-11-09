"use client";

import { GuardedButton } from "@/components/guarded-button";
import { ReasonDialog } from "@/components/reason-dialog";
import { requestAccessAction } from "../actions";

export function RequestAccess({ connectorId, name, allowed }: { connectorId: string; name: string; allowed: boolean }) {
  return (
    <ReasonDialog
      title={`Request access to ${name}`}
      description="This goes to an eng_admin or ops_lead for approval and is logged in the audit trail."
      confirmLabel="Send for approval"
      onConfirm={(reason) => requestAccessAction(connectorId, reason)}
      trigger={<GuardedButton size="sm" allowed={allowed} needs="any role">Request access</GuardedButton>}
    />
  );
}
