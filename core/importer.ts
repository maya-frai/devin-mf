import { readFileSync } from "node:fs";
import { join } from "node:path";
import { IMPORT_MAP, IMPORT_SOURCE, type Convert } from "@/config/import-map";
import { WORKFLOWS } from "@/config/workflows";
import type { Row } from "@/data";
import { userIdByName } from "./users";

const DIR = join(process.cwd(), "data/imports/powerapps");

// Minimal CSV parser: commas, quoted fields and "" escapes.
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [[]];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const row = rows[rows.length - 1];
    if (quoted && ch === '"' && text[i + 1] === '"') {
      field += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (!quoted && (ch === "," || ch === "\n")) {
      row.push(field);
      field = "";
      if (ch === "\n") rows.push([]);
    } else if (quoted || ch !== "\r") {
      field += ch;
    }
  }
  if (field || rows.at(-1)!.length) rows.at(-1)!.push(field);
  const [header, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const CONVERT: Record<Convert, (v: string) => unknown> = {
  text: (v) => v,
  number: (v) => Number(v),
  money: (v) => Math.round(Number(v) * 100),
  bool: (v) => v === "Yes",
  date: (v) => (v ? new Date(v).toISOString() : undefined),
  json: (v) => (v ? JSON.parse(v) : undefined),
  user: (v) => userIdByName(v) ?? null,
  role: (v) => WORKFLOWS.powerAppsRoles[v] ?? v,
  factors: (v) => (v ? v.split("|").map((f) => ({ label: f.split(":")[0], points: Number(f.split(":")[1]) })) : []),
  hits: (v) => (v ? v.split("|").map((h) => ({ list: h.split(";")[0], name: h.split(";")[1], score: Number(h.split(";")[2]) })) : []),
};

function setPath(row: Record<string, unknown>, path: string, value: unknown) {
  const [head, key] = path.split(".");
  if (!key) row[head] = value;
  else row[head] = { ...(row[head] as object), [key]: value };
}

/** Reads every mapped export into rows keyed by target collection. */
export function importPowerApps(): Record<string, Row[]> {
  const out: Record<string, Row[]> = {};
  for (const table of IMPORT_MAP) {
    out[table.into] = parseCsv(readFileSync(join(DIR, table.file), "utf8")).map((raw) => {
      const row: Record<string, unknown> = table.into === "audit" ? { source: IMPORT_SOURCE } : {};
      for (const [field, spec] of Object.entries(table.fields)) {
        const { from, as } = typeof spec === "string" ? { from: spec, as: "text" as const } : spec;
        const value = typeof as === "string" ? CONVERT[as](raw[from] ?? "") : (as[raw[from]] ?? raw[from]);
        if (value !== undefined) setPath(row, field, value);
      }
      return row as Row;
    });
  }
  return out;
}
