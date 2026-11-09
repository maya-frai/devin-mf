"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/core/session";
import type { FormState } from "@/core/types";
import { decideCase, type Decision } from "./logic";

export async function decideCaseAction(_: FormState, form: FormData): Promise<FormState> {
  try {
    const user = await getCurrentUser();
    const caseId = String(form.get("caseId"));
    const status = await decideCase(user, caseId, form.get("decision") as Decision, String(form.get("reason")));
    revalidatePath("/", "layout");
    return { message: `${caseId} ${status}.` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
