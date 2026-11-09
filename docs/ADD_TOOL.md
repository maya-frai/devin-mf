# Playbook: add an internal tool

Devin follows this playbook to turn a plain-English request into a tool on the shared core.
The three existing tools are the reference: `tools/refunds` (approval above a threshold, adapter),
`tools/kyc` (PII masking, decisions with a reason) and `tools/flags` (approval per environment).

## Input

A short request naming the tool, who uses it, what they do and which actions are sensitive.
The New tool page (`/new-tool`) generates this request.

## 1. Folder layout: `tools/<slug>/`

| File          | What goes in it                                                         |
| ------------- | ----------------------------------------------------------------------- |
| `manifest.ts` | `ToolManifest` (below)                                                  |
| `seed.json`   | 15–30 synthetic rows with unique `id`s. SSNs start with `9`, emails `@example.com` |
| `logic.ts`    | Plain functions taking a `user`: permission check, mutation, audit, approval. Tests import this |
| `actions.ts`  | `"use server"` wrappers: `getCurrentUser()`, call logic, `revalidatePath("/", "layout")`, return a `FormState` |
| `page.tsx`    | Server component. Hides buttons with `can()`. Forms use `ActionForm`, `SelectField`, `ReasonField` |
| `build.json`  | `{ "minutes": 0, "acus": null, "pr_url": "" }`, filled in when done     |
| `index.ts`    | `ToolDefinition`: `{ manifest, build, Page, onApproved? }`              |

## 2. Manifest

```ts
export const manifest: ToolManifest = {
  slug: "refunds",
  name: "Refunds",
  description: "One sentence shown on the home card and page header.",
  replaces: "Refunds dashboard (Power Apps)",
  uses: [ // shown on the Platform view tab, each linking to the code
    { capability: "Roles", detail: "refunds.view, refunds.request, refunds.approve", file: "core/permissions.ts" },
    { capability: "Approvals", detail: "Refunds over $500", file: "core/approvals.ts" },
  ],
};
```

## 3. Core functions to use

| Need                  | Use                                                            |
| --------------------- | -------------------------------------------------------------- |
| Current user          | `getCurrentUser()`, from `core/session.ts`                     |
| Permission            | `assertCan(user, "<slug>.<verb>")` in logic, `can()` in pages  |
| Audit                 | `logAudit(user, "<slug>.<event>", "<collection>/<id>", details)` on every mutation |
| Approval              | `requestApproval(user, { tool, action, target, summary, permission, payload })` |
| Already pending?      | `pendingApprovalFor(target)`                                   |
| Data                  | `list()`, `getRow()`, `updateRow()`, from `core/store.ts`      |
| PII                   | `mask()` plus `<MaskedField>`. Never send a raw SSN or DOB to the browser |
| External system       | A small mock in `adapters/`, e.g. `adapters/payments.ts`       |

## 4. When approvals apply

Use an approval for money movement, irreversible customer decisions and production changes.
Name the rule in the request (e.g. "above $500", "prod only"). Below the rule, apply the change
immediately and audit it. Above it, call `requestApproval()` and apply the change in `onApproved`
in `index.ts`. Core blocks self-approval and checks `permission`, so give the approver role its
own `<slug>.approve` entry.

## 5. Register (three one-line edits)

1. `data/index.ts`: import `seed.json` as a collection.
2. `core/permissions.ts`: add `<slug>.view` plus one entry per verb (including `<slug>.approve`).
3. `tools/registry.ts`: add the tool to `TOOLS`. The sidebar, home card, Platform view and
   `/tools/<slug>` route then pick it up.

## 6. build.json

Record wall-clock minutes from the start of the request to the tool working, rounded up.
Set `acus` if known, otherwise `null`. Set `pr_url` once the PR exists.

## Done checklist

- [ ] All seven files exist in `tools/<slug>/`; each is under ~150 lines
- [ ] Registered in `data/index.ts`, `core/permissions.ts` and `tools/registry.ts`
- [ ] Every mutation calls `assertCan` and `logAudit`; reasons are required where asked
- [ ] Sensitive actions go through `requestApproval`; the requester cannot approve
- [ ] PII is masked; Reveal works only for allowed roles
- [ ] `pnpm lint && pnpm build` pass; only tests the request asked for (`pnpm test`)
- [ ] Clicked through as each demo user; the Audit Log shows the events
- [ ] `build.json` filled in; no new dependencies, database, auth or API layers
