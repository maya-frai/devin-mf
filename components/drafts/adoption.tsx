import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKFLOWS } from "@/config/workflows";
import { usage, usesDraft, type DraftTool } from "@/core/drafts";
import { USERS, type User } from "@/core/users";
import { AdoptButton, PublishButton } from "./adopt-buttons";

const name = (id: string) => USERS.find((u) => u.id === id)?.name ?? id;

// Where a draft tool is on its way to becoming a permanent tool, decided by real usage.
export function Adoption({ draft, user }: { draft: DraftTool; user: User }) {
  const u = usage(draft);
  const { minAdopters, minActions } = WORKFLOWS.adoption;
  const steps = [
    { title: "Built", detail: `by ${name(draft.createdBy)} from a plain-English request`, done: true },
    { title: "Used", detail: `${u.actions} of ${minActions} actions · ${u.opens} opens by ${u.viewers} people`, done: u.actions >= minActions },
    { title: "Adopted", detail: `${u.users} of ${minAdopters} people: ${[draft.createdBy, ...draft.adoptedBy].map(name).join(", ")}`, done: u.users >= minAdopters },
    { title: "Reviewed & published", detail: draft.status === "published" ? `Permanent tool for every ${draft.role}` : draft.status === "in_review" ? `Waiting on ${WORKFLOWS.adoption.publishApproverRole} review` : `${WORKFLOWS.adoption.publishApproverRole} reviews the PR`, done: draft.status === "published" },
  ];
  const mine = usesDraft(user, draft);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Adoption</CardTitle>
        {!mine && draft.role === user.role ? <AdoptButton slug={draft.id} /> : null}
        {mine && u.ready && (draft.status === "draft" || draft.status === "pilot") ? <PublishButton slug={draft.id} /> : null}
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className={`rounded-lg border p-3 ${s.done ? "border-success/40 bg-success/5" : ""}`}>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <span className={`flex size-5 items-center justify-center rounded-full text-[11px] ${s.done ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>{s.done ? <Check className="size-3" /> : i + 1}</span>
                {s.title}
              </div>
              <div className="text-xs text-muted-foreground">{s.detail}</div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
