"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/session";
import type { FormState } from "@/core/types";
import { adjustBalance, type Direction } from "./logic";

export async function adjustBalanceAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    const user = await getCurrentUser();
    const amountCents = Math.round(Number(form.get("amount")) * 100);
    const result = adjustBalance(
      user,
      String(form.get("accountId")),
      form.get("direction") as Direction,
      amountCents,
      String(form.get("reason")),
    );
    revalidatePath("/", "layout");
    return result.status === "applied"
      ? { message: "Posted to the ledger." }
      : { message: "Over $1,000, so it went to an ops lead for approval." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
