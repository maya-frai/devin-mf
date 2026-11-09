"use client";

import Link from "next/link";
import { createElement } from "react";
import { usePathname } from "next/navigation";
import { iconFor } from "./icons";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: string; badge?: number; tag?: string; exact?: boolean };

export function NavLink({ href, label, icon, badge, tag, exact }: NavItem) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(`${href}/`);
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors",
      active ? "bg-accent font-medium text-accent-foreground" : "text-foreground/80 hover:bg-muted hover:text-foreground")}>
      {createElement(iconFor(icon), { className: cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground") })}
      <span className="flex-1 truncate">{label}</span>
      {badge ? <span className="rounded-full bg-primary px-1.5 text-[11px] font-medium leading-5 text-primary-foreground">{badge}</span> : null}
      {tag ? <span className="rounded-full border px-1.5 text-[10px] uppercase leading-4 text-muted-foreground">{tag}</span> : null}
    </Link>
  );
}
