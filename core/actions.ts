"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";
import { MASKABLE_FIELDS, type MaskableField } from "./mask";
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
  logAudit(user, "data.reset");
  revalidatePath("/", "layout");
}

export type RevealResult = { value: string } | { error: string };

export async function revealPii(
  collection: string,
  id: string,
  field: MaskableField,
): Promise<RevealResult> {
  if (!MASKABLE_FIELDS.includes(field)) return { error: `${field} is not PII` };
  const user = await getCurrentUser();
  if (!can(user, "pii.reveal")) {
    logAudit(user, "pii.reveal_denied", `${collection}/${id}`, { field });
    return { error: `${user.name} (${user.role}) cannot reveal PII` };
  }
  const value = getRow(collection, id)?.[field];
  if (typeof value !== "string") return { error: "Record not found" };
  logAudit(user, "pii.revealed", `${collection}/${id}`, { field });
  return { value };
}
