# devin-internal-tools

A small shared core in your own repo, plus Devin building each tool from a plain-English request,
can replace an internal tool platform like Microsoft Power Apps. This proof of concept runs three
of a fintech's internal tools (refunds, KYC review, feature flags) on that core.

## Run it

```bash
pnpm install && pnpm dev
```

Open http://localhost:3000. Requires Node 20+ and pnpm (`corepack enable`). Tests: `pnpm test`.

## How the platform maps to this repo

| Power Apps capability     | Here                                                   | Code                                |
| ------------------------- | ------------------------------------------------------ | ----------------------------------- |
| Power Apps builder        | Devin builds each tool from a plain-English request    | `docs/ADD_TOOL.md`                  |
| Dataverse                 | In-memory store seeded from JSON, with a Reset button  | `core/store.ts`, `data/`            |
| Security roles / sign-in  | Role switcher + `can(user, action)`                    | `core/permissions.ts`               |
| Dataverse auditing        | `logAudit()` + Audit Log page                          | `core/audit.ts`, `/audit`           |
| Power Automate approvals  | `requestApproval()` / `approve()` + Approvals inbox    | `core/approvals.ts`, `/approvals`   |
| Connectors                | Small mock adapters (payments, KYC vendor)             | `adapters/`                         |
| Governance / admin center | Repo conventions + the ADD_TOOL playbook               | `AGENTS.md`, `docs/ADD_TOOL.md`     |

## Demo roles

Switch user in the header. The sidebar only shows the tools a role can use.

| User | Role           | Sees / can do                                                        |
| ---- | -------------- | -------------------------------------------------------------------- |
| Ana  | `ops_analyst`  | Refunds: request refunds (over $500 goes to approval)                |
| Luis | `ops_lead`     | All tools; approves refunds over $500 and prod flag changes          |
| Kim  | `kyc_reviewer` | KYC queue: approve / reject / escalate, reveal SSN and DOB (audited) |
| Eli  | `eng_admin`    | Feature flags: toggle dev/staging, request prod changes              |

A 60-second script: as Ana, refund $500.00 (instant) and $500.01 (needs approval). Switch to
Luis and approve it in Approvals. As Kim, reveal an SSN. As Eli, request a prod flag change.
Finish on the Audit Log as Luis, which shows all of it.

## Layout

```
core/       permissions, audit, approvals, masking, store, session (shared by every tool)
adapters/   mock connectors: payments, KYC vendor
tools/      refunds/, kyc/, flags/ + registry.ts
app/        shell: home, /approvals, /audit, /tools/[slug] (with a Platform view tab)
data/       wires each tool's seed.json into the store
docs/       ADD_TOOL.md, the playbook Devin follows
tests/      Vitest: self-approval, $500 refund boundary, prod flag approval
```

## Not replicated

- Non-engineers building apps without review: here every tool is a PR that an engineer reviews.
- Microsoft's connector catalog: each connector is a small adapter that someone writes.
- Microsoft's compliance certifications and support: this runs in your own environment, under
  your own controls.
- Teams / Outlook integration: approvals live in the in-app inbox.
