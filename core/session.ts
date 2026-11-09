import { cookies } from "next/headers";
import { getUser, USERS, type User } from "./users";

export const USER_COOKIE = "demo_user";

// Fake sign-in: the header role switcher sets this cookie. TODO: real IdP.
export async function getCurrentUser(): Promise<User> {
  const id = (await cookies()).get(USER_COOKIE)?.value;
  return getUser(id) ?? USERS[0];
}
