import Link from "next/link";
import { Plus } from "lucide-react";
import { ROLES } from "@/config/roles";
import { actionableBy } from "@/core/approvals";
import { can } from "@/core/permissions";
import { getCurrentBrand, getCurrentUser, getTerms, toolName } from "@/core/session";
import { TOOLS } from "@/tools/registry";
import { Badge } from "@/components/ui/badge";

type Item = { href: string; label: string; badge?: number };

// Home, then the tools this role uses day to day, then the settings it cares about.
// Both lists and their order come from config/roles.ts; labels from config/terminology.ts.
export async function Sidebar() {
  const [user, brand, terms] = await Promise.all([getCurrentUser(), getCurrentBrand(), getTerms()]);
  const role = ROLES[user.role];
  const items: Record<string, Item | null> = {
    ...Object.fromEntries(TOOLS.map((t) => [t.manifest.slug, can(user, `${t.manifest.slug}.view`) ? { href: `/tools/${t.manifest.slug}`, label: toolName(terms, t.manifest.slug, t.manifest.name) } : null])),
    approvals: { href: "/approvals", label: terms.approvals, badge: actionableBy(user).length },
    audit: can(user, "audit.view") ? { href: "/audit", label: terms.audit } : null,
  };
  const tools = role.sidebar.tools.map((id) => items[id]).filter((i): i is Item => !!i);
  const settings = role.sidebar.settings.map((s) => ({ href: `/settings/${s}`, label: terms[s] }));

  const item = "flex items-center justify-between rounded-md px-3 py-1.5 hover:bg-accent hover:text-accent-foreground";
  const heading = "px-3 text-xs font-medium uppercase text-muted-foreground";
  const list = (entries: Item[]) => (
    <nav className="mb-6 space-y-0.5">
      {entries.map((i) => (
        <Link key={i.href} href={i.href} className={item}>
          {i.label} {i.badge ? <Badge>{i.badge}</Badge> : null}
        </Link>
      ))}
    </nav>
  );

  return (
    <aside className="w-60 shrink-0 border-r bg-card p-4 text-sm">
      <Link href="/" className="mb-1 flex items-center gap-2 px-3 font-semibold tracking-tight">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logo} alt="" className="size-6" />
        {brand.name}
      </Link>
      <p className="mb-5 px-3 text-xs text-muted-foreground">{role.title}</p>
      <nav className="mb-5"><Link href="/" className={item}>{terms.home}</Link></nav>
      <div className="mb-1 flex items-center justify-between pr-1">
        <span className={heading}>{terms.tools}</span>
        {can(user, "tools.create") ? (
          <Link href="/build" title={terms.buildTool} aria-label={terms.buildTool}
            className="flex size-6 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <Plus className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {list(tools)}
      <p className={`mb-1 ${heading}`}>{terms.settings}</p>
      {list(settings)}
    </aside>
  );
}
