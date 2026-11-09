<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (devin-internal-tools PoC)

- To add a tool, follow `docs/ADD_TOOL.md` exactly.
- Every tool uses `/core` for permissions (`can`/`assertCan`), audit (`logAudit`) and approvals
  (`requestApproval`/`approve`). The approver must differ from the requester.
- SSN and DOB are masked by default (`<MaskedField>`). Revealing one writes an audit event.
- Synthetic seed data only, 15–30 rows per tool.
- Stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui. No database.
- Do not add: a database, Docker, real auth, CI, custom lint rules, Storybook, dark mode, extra
  API layers or state libraries. Leave a TODO instead. Ask before adding any dependency.
- Keep files under about 150 lines. Write only the tests a task asks for (Vitest).
