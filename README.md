# devin-internal-tools

A small shared core in your own repo, plus Devin building each tool from a plain-English request,
can replace an internal tool platform like Microsoft Power Apps. This proof of concept runs a fictional
fintech's ("Ledgerline") internal tools on that core, branded, in their words, with their Power Apps data
already imported, and a different view of each tool per role.

## Run it

```bash
pnpm install && pnpm dev
```

Open http://localhost:3000. Requires Node 20+ and pnpm (`corepack enable`). Tests: `pnpm test`.

## How the platform maps to this repo

| Power Apps capability     | Here                                                   | Code                                |
| ------------------------- | ------------------------------------------------------ | ----------------------------------- |
| Power Apps builder        | Devin builds each tool from a plain-English request    | `docs/ADD_TOOL.md`                  |
| Dataverse                 | In-memory store loaded from Power Apps CSV exports, with a Reset button | `core/store.ts`, `core/importer.ts`, `data/` |
| Security roles / sign-in  | Role switcher + `can(user, action)`                    | `core/permissions.ts`               |
| Dataverse auditing        | `logAudit()` + Audit Log page                          | `core/audit.ts`, `/audit`           |
| Power Automate approvals  | `requestApproval()` / `approve()` + Approvals inbox    | `core/approvals.ts`, `/approvals`   |
| Connectors                | Small mock adapters (payments with idempotency keys, KYC vendor) | `adapters/`             |
| Field-level security      | SSN to last 4, DOB to year; Reveal only for ops_analyst (who reviews KYC), audited | `core/pii.ts`            |
| Model-driven views, charts | Shared widgets composed by per-role view configs      | `components/widgets/`, `config/views/` |
| Governance / admin center | Repo conventions + the ADD_TOOL playbook               | `AGENTS.md`, `docs/ADD_TOOL.md`     |

## Demo roles

Switch user in the header. Each role lands on its own page and sees its own view of each tool
(`config/roles.ts`).

| User  | Role           | Sees / can do                                                                 |
| ----- | -------------- | ----------------------------------------------------------------------------- |
| Ana   | `ops_analyst`  | Business operations: refunds (request first) and the KYC queue, Reveal SSN/DOB (audited) |
| Luis  | `ops_lead`     | Approvals first; refunds, KYC team view (+ auditor CSV), plain-language flags; second KYC reviewer |
| Priya | `product_manager` | Flags in plain English, refund trends and KYC status (read-only, no PII)   |
| Eli   | `eng_admin`    | Full flags view, brand switcher, Customize page, New tool                     |
| Farah | `finance`      | Finance analyst: refunds dashboard (read-only), ledger adjustments, audit log |

A short script: as Ana, refund pay_1005 ($500, instant) and pay_1006 ($500.01, needs approval).
As Luis, approve it in Approvals. As Ana, claim the next case, reveal an SSN and reject a high-risk
case (goes to Luis). As Eli, request a prod flag change and switch the brand to "Ledgerline (alt)".
As Farah, open Refunds. Finish on the Audit Log as Luis.

## Sidebar: tools and settings

Every person sees Home, then **Tools** (the ones their job uses, in their order) and **Settings**.

- **"+" next to Tools** opens a builder: describe a new tool, or a change to one of your tools, in plain
  English. It shows what Devin will use (your role, permissions, tools, the systems behind them, the
  rules and controls that apply), suggests ideas for your role, and writes the plan and Devin prompt.
  Each tool page also has "Customize this tool". No API calls.
- **Settings** show what the app and Devin use on your behalf: *Compliance & controls* (each control
  with live evidence and the code that enforces it), *Data & connectors* (which of your tools read or
  write which systems, and what still needs access; "Request access" goes through approvals),
  *My access* (what you can do, approve, and what needs someone else) and, for Eli, *Customize*.

## Make it yours

Most changes are config, not code. The Customize page (Eli) shows each file and writes a Devin prompt for a change.

| File                     | Controls                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| `config/brand.ts`        | Company name, logo, colors, neutral palette, font, corner radius, table density; two presets |
| `config/terminology.ts`  | The client's words for things ("Refunds" or "Reversals", "Cases" or "Applications") |
| `config/workflows.ts`    | Refund limits and approver, KYC SLA and second reviewer, flag environments needing approval, reason codes, Power Apps role mapping |
| `config/roles.ts`        | Per role: job title, landing page, home KPIs, sidebar tools and settings, which view of each tool, builder ideas |
| `config/connectors.ts`   | Systems the tools read or write, scopes, data classes, and what needs access   |
| `config/compliance.ts`   | Controls the app enforces, frameworks, and where in the code                   |
| `config/views/`          | Each view's widgets (KPI tiles, charts, tables, queues, approvals, activity)  |
| `config/import-map.ts`   | Power Apps (Dataverse) column names -> app fields                             |

All imported data in `data/imports/powerapps/` is synthetic. It is only shaped like Power Apps
(Dataverse) table exports.

## Layout

```
config/     brand, terminology, workflows, roles, views, import map
core/       permissions, audit, approvals, pii, store, importer, session (shared by every tool)
adapters/   mock connectors: payments, KYC vendor
components/ widgets/ (KpiTile, LineChart, BarChart, WorkQueue, DataTable, ApprovalList, ActivityFeed, StatusSummary)
tools/      refunds/, kyc/, flags/, ledger/ + registry.ts + sources.tsx (data sources views can use)
app/        shell: home, /build (the "+"), /settings/[section], /approvals, /audit, /roadmap, /tools/[slug]
data/       imports/powerapps/*.csv, the ledger seed, roadmap.json
docs/       ADD_TOOL.md, the playbook Devin follows
tests/      Vitest: self-approval, $500 refund boundary and daily cap, prod flag approval
```

## Not replicated

- Non-engineers building apps without review: here every tool is a PR that an engineer reviews.
- Microsoft's connector catalog: each connector is a small adapter that someone writes.
- Microsoft's compliance certifications and support: this runs in your own environment, under
  your own controls.
- Teams / Outlook integration: approvals live in the in-app inbox.
