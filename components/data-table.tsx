"use client";

import { useMemo, useState, type ReactNode } from "react";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Search, status filter, sorting and "show more" for every table.
export function useTable<T extends Record<string, unknown>>(
  rows: T[],
  opts: { search: (keyof T)[]; status?: keyof T; sort: keyof T; desc?: boolean; pageSize?: number; initialStatus?: string },
) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(opts.initialStatus ?? "all");
  const [sort, setSort] = useState<{ key: keyof T; desc: boolean }>({ key: opts.sort, desc: opts.desc ?? true });
  const [limit, setLimit] = useState(opts.pageSize ?? 25);

  const statuses = useMemo(() => (opts.status ? [...new Set(rows.map((r) => String(r[opts.status!])))] : []), [rows, opts.status]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows
      .filter((r) => !q || opts.search.some((k) => String(r[k] ?? "").toLowerCase().includes(q)))
      .filter((r) => status === "all" || String(r[opts.status!]) === status)
      .sort((a, b) => {
        const [x, y] = [a[sort.key], b[sort.key]];
        const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""));
        return sort.desc ? -cmp : cmp;
      });
  }, [rows, query, status, sort, opts.search, opts.status]);

  const toggleSort = (key: keyof T) => setSort((s) => ({ key, desc: s.key === key ? !s.desc : true }));
  const more = filtered.length > limit ? () => setLimit((l) => l + 25) : undefined;
  return { rows: filtered.slice(0, limit), all: filtered, total: filtered.length, query, setQuery, status, setStatus, statuses, sort, toggleSort, more };
}

export function TableToolbar(props: {
  query: string;
  setQuery: (q: string) => void;
  status?: string;
  setStatus?: (s: string) => void;
  statuses?: string[];
  placeholder?: string;
  children?: ReactNode;
}) {
  const cls = "h-8 rounded-lg border bg-background px-2 text-sm";
  return (
    <div className="flex flex-wrap items-center gap-2 border-b p-3">
      <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} placeholder={props.placeholder ?? "Search"} className={`${cls} w-64`} />
      {props.statuses?.length ? (
        <select value={props.status} onChange={(e) => props.setStatus?.(e.target.value)} className={cls}>
          <option value="all">All statuses</option>
          {props.statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
      ) : null}
      {props.children}
    </div>
  );
}

export function SortHead<K>(props: { label: string; k: K; sort: { key: K; desc: boolean }; onSort: (k: K) => void; className?: string }) {
  const arrow = props.sort.key === props.k ? (props.sort.desc ? " ↓" : " ↑") : "";
  return (
    <TableHead className={props.className}>
      <button type="button" onClick={() => props.onSort(props.k)} className="hover:text-foreground">
        {props.label}{arrow}
      </button>
    </TableHead>
  );
}

export function TableFooter({ shown, total, more }: { shown: number; total: number; more?: () => void }) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
      <span>Showing {shown} of {total}</span>
      {more ? <Button size="xs" variant="outline" onClick={more}>Show more</Button> : null}
    </div>
  );
}
