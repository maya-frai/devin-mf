import Link from "next/link";
import { resetData } from "@/core/actions";
import { listApprovals } from "@/core/approvals";
import { getCurrentUser } from "@/core/session";
import { USERS } from "@/core/users";
import { TOOLS } from "@/tools/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "./role-switcher";

export async function AppHeader() {
  const user = await getCurrentUser();
  const pending = listApprovals("pending").length;
  const links: { href: string; label: string; count?: number }[] = [
    ...TOOLS.map((t) => ({ href: `/tools/${t.manifest.slug}`, label: t.manifest.name })),
    { href: "/approvals", label: "Approvals", count: pending },
    { href: "/audit", label: "Audit Log" },
  ];

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Internal Tools
        </Link>
        <nav className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-1.5 hover:text-foreground">
              {l.label}
              {l.count ? <Badge>{l.count}</Badge> : null}
            </Link>
          ))}
        </nav>
        <form action={resetData}>
          <Button type="submit" variant="outline" size="sm">
            Reset data
          </Button>
        </form>
        <RoleSwitcher users={USERS} currentId={user.id} />
      </div>
    </header>
  );
}
