"use server";

import { revalidatePath } from "next/cache";
import { approve, reject } from "@/core/approvals";
import { getCurrentUser } from "@/core/session";
import { getTool } from "@/tools/registry";

export async function approveAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  const approval = approve(user, id);
  await getTool(approval.tool)?.onApproved?.(approval, user);
  revalidatePath("/", "layout");
}

export async function rejectAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  reject(user, id);
  revalidatePath("/", "layout");
}
