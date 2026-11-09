import { cookies } from "next/headers";
import { getBrand } from "@/config/brand";
import { TERMINOLOGY, type Terms } from "@/config/terminology";
import { getUser, USERS, type User } from "./users";

export const USER_COOKIE = "demo_user";
export const BRAND_COOKIE = "demo_brand";

// Fake sign-in: the header role switcher sets this cookie. TODO: real IdP.
export async function getCurrentUser(): Promise<User> {
  const id = (await cookies()).get(USER_COOKIE)?.value;
  return getUser(id) ?? USERS[0];
}

export async function getCurrentBrand() {
  return getBrand((await cookies()).get(BRAND_COOKIE)?.value);
}

export async function getTerms(): Promise<Terms> {
  return TERMINOLOGY[(await getCurrentBrand()).terminology];
}

/** A tool's display name in the client's words, e.g. "Refunds" or "Reversals". */
export const toolName = (terms: Terms, slug: string, fallback: string) => (terms as Record<string, string>)[slug] ?? fallback;
