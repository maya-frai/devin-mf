"use server";

import { revalidatePath } from "next/cache";
import { can, rolesFor } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import type { FormState } from "@/core/types";
import { adjustBalance, APPROVAL_LIMIT_CENTS, formatUsd, type Direction } from "./logic";

export async function adjustBalanceAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!can(user, "ledger.adjust")) return { error: "Not allowed" };
  try {
    const amountCents = Math.round(Number(form.get("amount")) * 100);
    const result = adjustBalance(user, String(form.get("accountId")), form.get("direction") as Direction, amountCents, String(form.get("reason")));
    revalidatePath("/", "layout");
    return result.status === "applied"
      ? { message: "Posted to the ledger." }
      : { message: `Over ${formatUsd(APPROVAL_LIMIT_CENTS)}, so it went to ${rolesFor("ledger.approve")} for approval.`, pending: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
