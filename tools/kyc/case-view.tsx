import Link from "next/link";
import { getCase } from "@/adapters/kycVendor";
import { MaskedField } from "@/components/masked-field";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportedTag } from "@/components/widgets/activity-feed";
import { auditFor } from "@/core/audit";
import { can, rolesFor } from "@/core/permissions";
import { mask } from "@/core/pii";
import { when } from "@/components/widgets/format";
import type { User } from "@/core/users";
import { DecisionPanel } from "./decision-panel";
import { isOpen, riskBand, SECOND_REVIEW_RISK, SECOND_REVIEWER_ROLE } from "./logic";

const DOC = { passed: "secondary", failed: "destructive", missing: "outline" } as const;

export function CaseView({ id, user }: { id: string; user: User }) {
  const c = getCase(id);
  const canReveal = can(user, "pii.reveal");
  const timeline = auditFor(`kyc_cases/${id}`);
  const pii = (field: "ssn" | "dob") => (
    <MaskedField tool="kyc" collection="kyc_cases" id={c.id} field={field} masked={mask(field, c[field])} canReveal={canReveal} />
  );

  return (
    <div className="space-y-4">
      <Link href="/tools/kyc" className="text-sm text-muted-foreground hover:underline">← Back to queue</Link>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{c.customer} <span className="font-mono text-xs text-muted-foreground">{c.id}</span></CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Country</span><span>{c.country}</span>
              <span className="text-muted-foreground">SSN</span>{pii("ssn")}
              <span className="text-muted-foreground">Date of birth</span>{pii("dob")}
              <span className="text-muted-foreground">Status</span><span><Badge variant="outline">{c.status.replaceAll("_", " ")}</Badge></span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {([["id", "ID document"], ["selfie", "Selfie match"], ["address", "Proof of address"]] as const).map(([k, label]) => (
                <div key={k} className="flex justify-between"><span>{label}</span><Badge variant={DOC[c.documents[k]]}>{c.documents[k]}</Badge></div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Risk score: {c.riskScore} <Badge variant="outline">{riskBand(c.riskScore)}</Badge></CardTitle></CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {c.riskFactors.map((f) => <div key={f.label} className="flex justify-between"><span>{f.label}</span><span className="tabular-nums">+{f.points}</span></div>)}
              <div className="pt-2 text-xs text-muted-foreground">Watchlist hits</div>
              {c.watchlistHits.length ? c.watchlistHits.map((h) => (
                <div key={h.list} className="flex justify-between"><span>{h.list}: {h.name}</span><span>{Math.round(h.score * 100)}% match</span></div>
              )) : <p className="text-muted-foreground">No watchlist hits.</p>}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <DecisionPanel caseId={c.id} open={isOpen(c)} needsSecond={c.riskScore > SECOND_REVIEW_RISK ? `Risk is above ${SECOND_REVIEW_RISK}: rejecting needs a second reviewer (${SECOND_REVIEWER_ROLE}) to approve.` : null} canDecide={can(user, "kyc.decide")} needs={rolesFor("kyc.decide")} />
          <Card>
            <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {timeline.length ? timeline.map((e) => (
                <div key={e.id} className="border-l-2 pl-3">
                  <div><span className="font-mono text-xs">{e.action}</span> · {e.actor}<ImportedTag source={e.source} /></div>
                  <div className="text-xs text-muted-foreground">{when(e.at)}{e.reason ? ` · “${e.reason}”` : ""}</div>
                </div>
              )) : <p className="text-muted-foreground">No activity yet. Decisions and reveals show up here.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
