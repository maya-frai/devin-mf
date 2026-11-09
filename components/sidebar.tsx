import Link from "next/link";
import { listApprovals } from "@/core/approvals";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import { TOOLS } from "@/tools/registry";
import { Badge } from "@/components/ui/badge";

// Built from tools/registry.ts. Tools the current role can't view are hidden.
export async function Sidebar() {
  const user = await getCurrentUser();
  const tools = TOOLS.filter((t) => can(user, `${t.manifest.slug}.view`));
  const pending = listApprovals().filter((a) => a.status === "pending").length;

  const item = "flex items-center justify-between rounded-md px-3 py-1.5 hover:bg-muted";
  return (
    <aside className="w-56 shrink-0 border-r bg-background p-4 text-sm">
      <Link href="/" className="mb-6 block px-3 font-semibold tracking-tight">
        Internal Tools
      </Link>
      <p className="mb-1 px-3 text-xs font-medium uppercase text-muted-foreground">Tools</p>
      <nav className="mb-6 space-y-0.5">
        {tools.map((t) => (
          <Link key={t.manifest.slug} href={`/tools/${t.manifest.slug}`} className={item}>
            {t.manifest.name}
          </Link>
        ))}
        {tools.length === 0 ? <p className="px-3 text-muted-foreground">None for your role</p> : null}
      </nav>
      <p className="mb-1 px-3 text-xs font-medium uppercase text-muted-foreground">Platform</p>
      <nav className="space-y-0.5">
        <Link href="/approvals" className={item}>
          Approvals {pending ? <Badge>{pending}</Badge> : null}
        </Link>
        <Link href="/audit" className={item}>
          Audit Log
        </Link>
        <Link href="/roadmap" className={item}>
          Roadmap
        </Link>
        {can(user, "tools.create") ? (
          <Link href="/new-tool" className={item}>
            New tool
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}
