import type { User } from "@/core/users";

// Every page header: title and a one-line description. (The signed-in user is in the header.)
export function PageTitle({ title, subtitle }: { title: string; subtitle?: string; user?: User }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}
