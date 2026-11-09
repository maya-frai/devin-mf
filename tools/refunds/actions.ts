"use server";

import { guarded } from "@/core/guard";
import { requestRefund, type RefundInput } from "./logic";

export async function requestRefundAction(input: RefundInput) {
  return guarded("refunds.request", async (user) => {
    const result = await requestRefund(user, input);
    return { pending: result.status === "pending_approval" };
  });
}
