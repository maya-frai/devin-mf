"use server";

import { guarded } from "@/core/guard";
import { claimNext, decideCase, type Decision } from "./logic";

export async function decideCaseAction(input: { caseId: string; decision: Decision; reason: string; notes: string }) {
  return guarded("kyc.decide", (user) => decideCase(user, input.caseId, input.decision, input.reason, input.notes));
}

export async function claimNextAction() {
  return guarded("kyc.decide", async (user) => {
    await claimNext(user);
  });
}
