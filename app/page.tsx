import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { codeUrl } from "@/lib/repo";
import { TOOLS } from "@/tools/registry";

const MAPPING = [
  ["Power Apps builder", "Devin builds each tool from a plain-English request", "docs/ADD_TOOL.md"],
  ["Dataverse", "In-memory store seeded from JSON, with a Reset button", "core/store.ts"],
  ["Security roles / sign-in", "Role switcher + can(user, action)", "core/permissions.ts"],
  ["Dataverse auditing", "logAudit() + Audit Log page", "core/audit.ts"],
  ["Power Automate approvals", "requestApproval() / approve() + Approvals inbox", "core/approvals.ts"],
  ["Connectors", "Small mock adapters (payments, KYC vendor)", "adapters/payments.ts"],
  ["Governance / admin center", "Repo conventions + the ADD_TOOL playbook", "AGENTS.md"],
];

export default function Home() {
  return (
    <div className="space-y-8">
      <PageTitle
        title="Your internal tool platform, replaced"
        subtitle="A small shared core in your own repo. Devin builds each tool from a plain-English request."
      />

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Power Apps capability</TableHead>
              <TableHead>Here</TableHead>
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MAPPING.map(([platform, here, file]) => (
              <TableRow key={platform}>
                <TableCell className="pl-4 font-medium">{platform}</TableCell>
                <TableCell>{here}</TableCell>
                <TableCell>
                  <a href={codeUrl(file)} target="_blank" rel="noreferrer" className="font-mono text-xs underline">
                    {file}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Tools built by Devin</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map(({ manifest, build }) => (
            <Link key={manifest.slug} href={`/tools/${manifest.slug}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{manifest.name}</CardTitle>
                  <CardDescription>{manifest.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between">
                  <Badge variant="secondary">Built in {build.minutes} min</Badge>
                  <span className="text-xs text-muted-foreground">{manifest.replaces}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
