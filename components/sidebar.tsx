import Link from "next/link";
import { Plus } from "lucide-react";
import { ROLES } from "@/config/roles";
import { actionableBy } from "@/core/approvals";
import { listDrafts } from "@/core/drafts";
import { can } from "@/core/permissions";
import { getCurrentBrand, getCurrentUser, getTerms, toolName } from "@/core/session";
import { USERS } from "@/core/users";
import { TOOLS } from "@/tools/registry";
import { NavLink, type NavItem } from "./nav-link";

// Home, then the tools this role uses day to day, then the settings it cares about.
// Both lists and their order come from config/roles.ts; labels from config/terminology.ts.
export async function Sidebar() {
  const [user, brand, terms] = await Promise.all([getCurrentUser(), getCurrentBrand(), getTerms()]);
  const role = ROLES[user.role];
  const items: Record<string, NavItem | null> = {
    ...Object.fromEntries(TOOLS.map((t) => [t.manifest.slug, can(user, `${t.manifest.slug}.view`) ? { href: `/tools/${t.manifest.slug}`, label: toolName(terms, t.manifest.slug, t.manifest.name), icon: t.manifest.slug } : null])),
    approvals: { href: "/approvals", label: terms.approvals, icon: "approvals", badge: actionableBy(user).length },
    audit: can(user, "audit.view") ? { href: "/audit", label: terms.audit, icon: "audit" } : null,
  };
  const drafts: NavItem[] = listDrafts().filter((d) => d.role === user.role).map((d) => ({ href: `/tools/${d.id}`, label: d.spec.name, icon: "draft", tag: "Draft" }));
  const tools = [...role.sidebar.tools.map((id) => items[id]).filter((i): i is NavItem => !!i), ...drafts];
  const settings: NavItem[] = [
    { href: "/settings", label: "Overview", icon: "overview", exact: true },
    ...role.sidebar.settings.map((s) => ({ href: `/settings/${s}`, label: terms[s], icon: s })),
  ];
  const heading = "px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground";
  const name = USERS.find((u) => u.id === user.id)?.name ?? user.name;

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r bg-card px-3 py-4 text-sm">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2.5 font-semibold tracking-tight">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logo} alt="" className="size-6" />
        {brand.name}
      </Link>
      <nav className="mb-6"><NavLink href="/" label={terms.home} icon="home" exact /></nav>
      <div className="mb-1.5 flex items-center justify-between pr-1">
        <span className={heading}>{terms.tools}</span>
        {can(user, "tools.create") ? (
          <Link href="/build" title={terms.buildTool} aria-label={terms.buildTool}
            className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
            <Plus className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <nav className="mb-6 space-y-0.5">{tools.map((i) => <NavLink key={i.href} {...i} />)}</nav>
      <p className={`mb-1.5 ${heading}`}>{terms.settings}</p>
      <nav className="space-y-0.5">{settings.map((i) => <NavLink key={i.href} {...i} />)}</nav>
      <div className="mt-auto flex items-center gap-2.5 rounded-md border px-2.5 py-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{name[0]}</span>
        <div className="min-w-0 leading-tight">
          <div className="truncate font-medium">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{role.title}</div>
        </div>
      </div>
    </aside>
  );
}
