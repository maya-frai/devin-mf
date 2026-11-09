# devin-internal-tools

Proof of concept: **Devin plus a small shared core in your own repo replaces an internal tool
platform like Microsoft Power Apps.** Each tool is a folder that Devin adds from a plain-English
request, following [docs/ADD_TOOL.md](docs/ADD_TOOL.md).

## Run it (one command)

```bash
npm install && npm run dev
```

Then open http://localhost:3000. Requires Node 20+.

## How the platform maps to this repo

| Power Platform           | This repo                                              | Where                            |
| ------------------------ | ------------------------------------------------------ | -------------------------------- |
| Power Apps builder       | Devin builds each tool from a plain-English request    | `docs/ADD_TOOL.md`               |
| Dataverse                | In-memory store seeded from `/data` JSON, Reset button | `core/store.ts`, `data/`         |
| Security roles / sign-in | Role switcher + `can(user, action)`                    | `core/permissions.ts`            |
| Dataverse auditing       | `logAudit()` + Audit Log page                          | `core/audit.ts`, `/audit`        |
| Power Automate approvals | `requestApproval()` / `approve()` + Approvals inbox    | `core/approvals.ts`, `/approvals`|
| Connectors               | Small mock adapters (payments, KYC vendor)             | `adapters/`                      |
| Governance / admin center| These conventions + the ADD_TOOL playbook              | `AGENTS.md`, `docs/ADD_TOOL.md`  |

## Demo users (header switcher)

| User | Role           | Can                                              |
| ---- | -------------- | ------------------------------------------------ |
| Ana  | `ops_analyst`  | Use tools, request approvals                     |
| Luis | `ops_lead`     | Approve requests, reveal PII, view audit log     |
| Kim  | `kyc_reviewer` | Reveal PII, view audit log                       |
| Eli  | `eng_admin`    | Approve requests, view audit log                 |

The full policy is one table in `core/permissions.ts`.

## Layout

```
core/        permissions, audit, approvals, masking, store, session (shared by every tool)
data/        seed JSON for the in-memory store
adapters/    mock connectors: payments, KYC vendor
tools/       one folder per tool + registry.ts
app/         shell: home, /approvals, /audit, /tools/[slug]
docs/        ADD_TOOL.md playbook Devin follows
```

## PoC limits (TODO, deliberately not built)

- Real sign-in (Entra ID / Okta) instead of the role switcher
- A real database instead of the in-memory store (data resets on restart)
- Real payments and KYC vendor clients behind the existing adapter signatures
- CI, deployment and an audit export
