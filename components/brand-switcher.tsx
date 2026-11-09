"use client";

import { useTransition } from "react";
import { setBrand } from "@/core/actions";

export function BrandSwitcher({ brands, current, label }: { brands: { id: string; name: string }[]; current: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select aria-label="Switch brand" className="h-8 rounded-lg border bg-background px-2" value={current} disabled={pending}
        onChange={(e) => start(() => setBrand(e.target.value))}>
        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </label>
  );
}
