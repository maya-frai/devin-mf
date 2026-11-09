import { revalidatePath } from "next/cache";
import { can } from "./permissions";
import { getCurrentUser } from "./session";
import type { WriteResult } from "./types";
import type { User } from "./users";

// Every server action goes through this: can() first, then the write, then a refresh.
export async function guarded(
  permission: string,
  write: (user: User) => Promise<{ pending?: boolean } | void> | { pending?: boolean } | void,
): Promise<WriteResult> {
  const user = await getCurrentUser();
  if (!can(user, permission)) return { ok: false, error: "Not allowed" };
  try {
    const result = await write(user);
    revalidatePath("/", "layout");
    return { ok: true, pending: !!result?.pending };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
