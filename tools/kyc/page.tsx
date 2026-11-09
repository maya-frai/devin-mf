import { listCases } from "@/adapters/kyc-vendor";
import { ActionForm } from "@/components/action-form";
import { ReasonField, SelectField } from "@/components/fields";
import { MaskedField } from "@/components/masked-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mask } from "@/core/mask";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import { decideCaseAction } from "./actions";
import { byRisk } from "./logic";

const STATUS = { open: "outline", escalated: "default", approved: "secondary", rejected: "destructive" } as const;

export default async function KycPage() {
  const user = await getCurrentUser();
  const canReveal = can(user, "pii.reveal");
  const cases = byRisk(listCases());
  const open = cases.filter((c) => c.status === "open" || c.status === "escalated");

  return (
    <div className="space-y-6">
      {can(user, "kyc.decide") ? (
        <Card>
          <CardHeader>
            <CardTitle>Decide a case</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionForm action={decideCaseAction}>
              <SelectField
                name="caseId"
                label="Case (highest risk first)"
                options={open.map((c) => ({ value: c.id, label: `${c.id} · ${c.customer} · risk ${c.riskScore}` }))}
              />
              <ReasonField />
              <Button type="submit" name="decision" value="approve">Approve</Button>
              <Button type="submit" name="decision" value="reject" variant="destructive">Reject</Button>
              <Button type="submit" name="decision" value="escalate" variant="outline">Escalate</Button>
            </ActionForm>
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Case</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>SSN</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Factors</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-4 font-mono text-xs">{c.id}</TableCell>
                <TableCell>
                  {c.customer} <span className="text-xs text-muted-foreground">{c.country}</span>
                </TableCell>
                <TableCell>
                  <MaskedField collection="kyc_cases" id={c.id} field="ssn" masked={mask("ssn", c.ssn)} canReveal={canReveal} />
                </TableCell>
                <TableCell>
                  <MaskedField collection="kyc_cases" id={c.id} field="dob" masked={mask("dob", c.dob)} canReveal={canReveal} />
                </TableCell>
                <TableCell>
                  <Badge variant={c.riskScore >= 70 ? "destructive" : "outline"}>{c.riskScore}</Badge>
                </TableCell>
                <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                  {c.riskFactors.join(", ") || "None"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS[c.status]} title={c.decisionReason}>{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
