import { PageTitle } from "@/components/page-title";
import { ApprovalList } from "@/components/widgets/approval-list";
import { approvalRows } from "@/components/widgets/approval-rows";
import { getCurrentUser, getTerms } from "@/core/session";

export default async function ApprovalsPage() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const rows = approvalRows(user, undefined, false);
  return (
    <div className="space-y-6">
      <PageTitle title={terms.approvals} subtitle="Two-person rule: the approver needs the right role and can't be the requester. Every decision is audited." user={user} />
      <ApprovalList title="Pending" rows={rows.filter((r) => r.status === "pending")} empty="Nothing waiting. Requests over a limit, prod changes and high-risk rejections land here." />
      <ApprovalList title="Recently decided" rows={rows.filter((r) => r.status !== "pending")} empty="No decisions yet." />
    </div>
  );
}
