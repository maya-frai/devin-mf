import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TOOLS } from "@/tools/registry";

const MAPPING = [
  ["Power Apps builder", "Devin builds each tool from a plain-English request", "docs/ADD_TOOL.md"],
  ["Dataverse", "In-memory store seeded from JSON, with a Reset button", "core/store.ts, data/"],
  ["Security roles / sign-in", "Role switcher + can(user, action)", "core/permissions.ts"],
  ["Dataverse auditing", "logAudit() + Audit Log page", "core/audit.ts, /audit"],
  ["Power Automate approvals", "requestApproval() / approve() + Approvals inbox", "core/approvals.ts, /approvals"],
  ["Connectors", "Small mock adapters (payments, KYC vendor)", "adapters/"],
  ["Governance / admin center", "Repo conventions + the ADD_TOOL playbook", "AGENTS.md, docs/ADD_TOOL.md"],
];

export default function Home() {
  return (
    <div className="space-y-8">
      <PageTitle
        title="Internal tools, built by Devin"
        subtitle="A small shared core in your own repo. Devin adds each tool from a plain-English request."
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Tools</h2>
        {TOOLS.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tools yet</CardTitle>
              <CardDescription>
                Ask Devin for one, e.g. &ldquo;Build a refunds dashboard where analysts request refunds and
                leads approve them&rdquo;. Devin follows docs/ADD_TOOL.md.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ manifest, build }) => (
              <Card key={manifest.slug}>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/tools/${manifest.slug}`} className="hover:underline">
                      {manifest.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{manifest.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">Replaces: {manifest.replaces}</Badge>
                  <span>
                    Built in {build.minutes} min · {build.acus} ACUs ·{" "}
                    <a href={build.pr_url} className="underline" target="_blank" rel="noreferrer">
                      PR
                    </a>
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">How this replaces Power Apps</h2>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Power Platform</TableHead>
                <TableHead>This repo</TableHead>
                <TableHead>Where</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MAPPING.map(([platform, repo, where]) => (
                <TableRow key={platform}>
                  <TableCell className="pl-4 font-medium">{platform}</TableCell>
                  <TableCell>{repo}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{where}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
