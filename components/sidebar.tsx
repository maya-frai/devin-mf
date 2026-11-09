import Link from "next/link";
import { ROLES } from "@/config/roles";
import { actionableBy } from "@/core/approvals";
import { can } from "@/core/permissions";
import { getCurrentBrand, getCurrentUser, getTerms, toolName } from "@/core/session";
import { TOOLS } from "@/tools/registry";
import { Badge } from "@/components/ui/badge";

type Item = { href: string; label: string; badge?: number };

// Order and visibility come from config/roles.ts; labels from config/terminology.ts.
export async function Sidebar() {
  const [user, brand, terms] = await Promise.all([getCurrentUser(), getCurrentBrand(), getTerms()]);
  const tools: Record<string, Item> = Object.fromEntries(
    TOOLS.filter((t) => can(user, `${t.manifest.slug}.view`)).map((t) => [t.manifest.slug, { href: `/tools/${t.manifest.slug}`, label: toolName(terms, t.manifest.slug, t.manifest.name) }]),
  );
  const platform: Record<string, Item | null> = {
    approvals: { href: "/approvals", label: terms.approvals, badge: actionableBy(user).length },
    audit: can(user, "audit.view") ? { href: "/audit", label: terms.audit } : null,
    roadmap: { href: "/roadmap", label: terms.roadmap },
    "new-tool": can(user, "tools.create") ? { href: "/new-tool", label: terms.newTool } : null,
    customize: can(user, "platform.customize") ? { href: "/customize", label: terms.customize } : null,
  };
  const order = ROLES[user.role].sidebar;
  const pick = (from: Record<string, Item | null>) => order.map((id) => from[id]).filter((i): i is Item => !!i);

  const item = "flex items-center justify-between rounded-md px-3 py-1.5 hover:bg-accent hover:text-accent-foreground";
  const section = (title: string, items: Item[]) => (
    <>
      <p className="mb-1 px-3 text-xs font-medium uppercase text-muted-foreground">{title}</p>
      <nav className="mb-6 space-y-0.5">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={item}>
            {i.label} {i.badge ? <Badge>{i.badge}</Badge> : null}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <aside className="w-56 shrink-0 border-r bg-card p-4 text-sm">
      <Link href="/" className="mb-6 flex items-center gap-2 px-3 font-semibold tracking-tight">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logo} alt="" className="size-6" />
        {brand.name}
      </Link>
      <nav className="mb-4"><Link href="/" className={item}>{terms.home}</Link></nav>
      {section(terms.tools, pick(tools))}
      {section(terms.platform, pick(platform))}
    </aside>
  );
}
