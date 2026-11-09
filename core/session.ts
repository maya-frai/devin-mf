import { cookies } from "next/headers";
import { getUser, USERS, type User } from "./users";

export const USER_COOKIE = "demo_user";

// Reads the role switcher cookie. TODO: replace with real sign-in.
export async function getCurrentUser(): Promise<User> {
  const id = (await cookies()).get(USER_COOKIE)?.value;
  return getUser(id) ?? USERS[0];
}
