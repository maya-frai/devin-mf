import { Forbidden } from "@/components/forbidden";
import { PageTitle } from "@/components/page-title";
import { listAudit } from "@/core/audit";
import { can } from "@/core/permissions";
import { getCurrentUser, getTerms } from "@/core/session";
import { AuditTable } from "./audit-table";

export default async function AuditPage() {
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  if (!can(user, "audit.view")) return <Forbidden user={user} action="audit.view" />;
  const rows = listAudit().map((e) => ({
    ...e,
    change: [e.before, e.after].map((v) => (v === undefined ? "" : JSON.stringify(v))).filter(Boolean).join(" → "),
  }));
  return (
    <div>
      <PageTitle title={terms.audit} subtitle="Every write across all tools, including history imported from Power Apps." user={user} />
      <AuditTable rows={rows} />
    </div>
  );
}
