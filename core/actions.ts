"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BRANDS } from "@/config/brand";
import { ROLES } from "@/config/roles";
import { logAudit } from "./audit";
import type { PiiField } from "./pii";
import { can } from "./permissions";
import { BRAND_COOKIE, getCurrentUser, USER_COOKIE } from "./session";
import { getRow, resetStore } from "./store";
import { getUser } from "./users";

// Switching user lands on that role's landing page (config/roles.ts).
export async function switchUser(id: string): Promise<void> {
  const user = getUser(id);
  if (!user) throw new Error(`Unknown user ${id}`);
  (await cookies()).set(USER_COOKIE, id);
  revalidatePath("/", "layout");
  redirect(ROLES[user.role].landing);
}

export async function setBrand(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!can(user, "brand.switch") || !BRANDS.some((b) => b.id === id)) return;
  (await cookies()).set(BRAND_COOKIE, id);
  logAudit({ actor: user, tool: "platform", action: "brand.switched", entityId: "config/brand", after: { brand: id } });
  revalidatePath("/", "layout");
}

export async function resetData(): Promise<void> {
  const user = await getCurrentUser();
  resetStore();
  logAudit({ actor: user, tool: "platform", action: "data.reset", entityId: "store" });
  revalidatePath("/", "layout");
}

export async function revealPii(tool: string, collection: string, id: string, field: PiiField) {
  const user = await getCurrentUser();
  const entityId = `${collection}/${id}`;
  if (field !== "ssn" && field !== "dob") return { error: "Not a PII field" };
  if (!can(user, "pii.reveal")) {
    logAudit({ actor: user, tool, action: "pii.reveal_denied", entityId, after: { field } });
    return { error: "Not allowed" };
  }
  logAudit({ actor: user, tool, action: "pii.revealed", entityId, after: { field } });
  return { value: String(getRow(collection, id)[field]) };
}
