"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/session";
import { setFlag, type Env } from "./logic";

export async function toggleFlagAction(flagId: string, env: Env, enabled: boolean) {
  const user = await getCurrentUser();
  setFlag(user, flagId, env, enabled);
  revalidatePath("/", "layout");
}
