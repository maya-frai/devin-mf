"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adoptDraftAction, requestPublishAction } from "@/app/build/actions";
import { toastResult } from "@/components/toast";
import { Button } from "@/components/ui/button";

function ActionButton({ label, run, variant }: { label: string; run: () => Promise<Parameters<typeof toastResult>[0]>; variant?: "outline" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button size="sm" variant={variant} disabled={busy} onClick={async () => { setBusy(true); if (toastResult(await run())) router.refresh(); setBusy(false); }}>
      {busy ? "…" : label}
    </Button>
  );
}

export const AdoptButton = ({ slug }: { slug: string }) => <ActionButton label="Adopt for me" run={() => adoptDraftAction(slug)} />;
export const PublishButton = ({ slug }: { slug: string }) => <ActionButton label="Request review to publish" run={() => requestPublishAction(slug)} />;
