# Playbook: add an internal tool

Devin follows this playbook to turn a plain-English request (for example "Build a refunds
dashboard where analysts request refunds and leads approve them") into a working tool.
It replaces the Power Apps builder, and its conventions replace the admin center.

## 1. Read the request

- Find the users (which roles), the data (which table), and the sensitive actions (which ones
  move money, change KYC status, or flip production flags).
- Ask only if a role or approval rule is genuinely ambiguous. Otherwise pick the safe default:
  the action needs approval and the data is masked.

## 2. Create `tools/<slug>/`

| File          | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `manifest.ts` | `ToolManifest`: slug, name, description, what it replaces, `uses` (Platform view) |
| `seed.json`   | 15–30 synthetic rows, each with a unique `id`                        |
| `logic.ts`    | Plain functions taking a `user`: permission, mutation, audit (tested) |
| `page.tsx`    | Server component; reads data and calls `can()` to hide buttons       |
| `actions.ts`  | Thin `"use server"` wrappers: `getCurrentUser()` → logic → revalidate |
| `build.json`  | `{ "minutes": 0, "acus": 0, "pr_url": "" }`, filled in after the PR  |
| `index.ts`    | Puts together the `ToolDefinition` (manifest, build, Page, onApproved) |

Synthetic data only: SSNs start with `9` (never issued), emails use `example.com`.

## 3. Register it (three one-line edits)

1. `data/index.ts`: import `seed.json` and add it as a collection named `<slug>`.
2. `core/permissions.ts`: add `<slug>.view` plus one entry for each verb (e.g. `refunds.request`).
3. `tools/registry.ts`: add the tool's default export to `TOOLS`.

The header nav, home page card and `/tools/<slug>` route then pick it up automatically.

## 4. Rules every tool follows

- **Permissions**: every action calls `assertCan(user, "<slug>.<verb>")`, and the page hides
  buttons the user can't use (`can()`).
- **Audit**: every mutation calls `logAudit(user, "<slug>.<verb>", target, details)`.
- **Approvals**: money movement, KYC decisions and production changes call
  `requestApproval()`. The real effect runs in `onApproved` in `index.ts`, usually through an
  adapter. Core already blocks an approver from approving their own request.
- **PII**: never send raw `ssn` or `dob` to the browser. Render `<MaskedField>` instead (it
  passes only the last 4 digits). Reveal is permission-checked and audited by core.
- **Connectors**: external calls go through `adapters/`. Add a small mock if one is missing.
- Keep each file under about 150 lines. Use only the existing stack. Ask before adding any
  dependency. Write only the tests the request asks for (Vitest).

## Logic pattern (see `tools/refunds/logic.ts`)

```ts
export async function requestRefund(user: User, paymentId: string, reason: string) {
  assertCan(user, "refunds.request");
  const payment = getPayment(paymentId);                 // adapter
  logAudit(user, "refunds.requested", `payments/${paymentId}`, { reason });
  if (payment.amountCents <= AUTO_REFUND_LIMIT_CENTS) return completeRefund(user, paymentId, reason);
  return requestApproval(user, {
    tool: "refunds", action: "refunds.issue", target: `payments/${paymentId}`,
    summary: `Refund to ${payment.customer}`, permission: "refunds.approve", payload: { paymentId, reason },
  });
}
```

## 5. Finish

- `pnpm build` passes, then click through the tool as each of Ana, Luis, Kim and Eli.
- Open a PR, then put the minutes, ACUs and PR URL in `build.json`.

## Checklist

- [ ] `tools/<slug>/` has manifest, logic, page, actions, seed (15–30 rows), build.json and index
- [ ] Registered in `data/index.ts`, `core/permissions.ts` and `tools/registry.ts`
- [ ] Every mutation checks permission and writes an audit event
- [ ] Sensitive actions go through approvals; requester ≠ approver
- [ ] SSN/DOB masked; Reveal works for allowed roles only
- [ ] No new dependencies, database, auth or API layers
