"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";
import type { PiiField } from "./mask";
import { can } from "./permissions";
import { getCurrentUser, USER_COOKIE } from "./session";
import { getRow, resetStore } from "./store";
import { getUser } from "./users";

export async function switchUser(id: string): Promise<void> {
  if (!getUser(id)) throw new Error(`Unknown user ${id}`);
  (await cookies()).set(USER_COOKIE, id);
  revalidatePath("/", "layout");
}

export async function resetData(): Promise<void> {
  const user = await getCurrentUser();
  resetStore();
  logAudit(user, "data.reset", "store");
  revalidatePath("/", "layout");
}

export async function revealPii(
  collection: string,
  id: string,
  field: PiiField,
): Promise<{ value?: string; error?: string }> {
  const user = await getCurrentUser();
  const target = `${collection}/${id}`;
  if (!["ssn", "dob"].includes(field)) return { error: "Not a PII field" };
  if (!can(user, "pii.reveal")) {
    logAudit(user, "pii.reveal_denied", target, { field });
    return { error: "Not permitted" };
  }
  logAudit(user, "pii.revealed", target, { field });
  return { value: String(getRow(collection, id)[field]) };
}
