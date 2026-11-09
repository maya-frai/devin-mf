"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/session";
import type { FormState } from "@/core/types";
import { requestRefund } from "./logic";

export async function requestRefundAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    const user = await getCurrentUser();
    const result = await requestRefund(user, String(form.get("paymentId")), String(form.get("reason")));
    revalidatePath("/", "layout");
    return result.status === "refunded"
      ? { message: `Refunded instantly (${result.refundId}).` }
      : result.overDailyLimit
        ? { message: "Over your $2,000 daily limit, so it went to an ops lead for approval." }
        : { message: "Over $500, so it went to an ops lead for approval." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
