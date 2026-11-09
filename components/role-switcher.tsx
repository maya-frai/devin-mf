"use client";

import { useTransition } from "react";
import { switchUser } from "@/core/actions";
import type { User } from "@/core/users";

export function RoleSwitcher({ users, currentId }: { users: User[]; currentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Signed in as</span>
      <select
        aria-label="Switch user"
        className="h-8 rounded-lg border bg-background px-2 font-medium disabled:opacity-50"
        value={currentId}
        disabled={pending}
        onChange={(e) => startTransition(() => switchUser(e.target.value))}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} · {u.role}
          </option>
        ))}
      </select>
    </label>
  );
}
