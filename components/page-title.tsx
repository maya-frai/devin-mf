import { Badge } from "@/components/ui/badge";
import type { User } from "@/core/users";

// Every page header: app name, one-line description and the current user's role.
export function PageTitle({ title, subtitle, user }: { title: string; subtitle?: string; user?: User }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {user ? <Badge variant="outline">{user.name} · {user.role}</Badge> : null}
    </div>
  );
}
