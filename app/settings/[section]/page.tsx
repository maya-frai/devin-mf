import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { ROLES, type SettingsSection } from "@/config/roles";
import { getCurrentUser, getTerms } from "@/core/session";
import { cn } from "@/lib/utils";
import { AccessSection } from "../sections/access";
import { ComplianceSection } from "../sections/compliance";
import { CustomizeSection } from "../sections/customize";
import { DataSection } from "../sections/data";

const SECTIONS = { compliance: ComplianceSection, data: DataSection, access: AccessSection, customize: CustomizeSection };

// Settings show what Devin and the app use on this person's behalf. Which sections, and their order, come from config/roles.ts.
export default async function SettingsPage(props: PageProps<"/settings/[section]">) {
  const { section } = await props.params;
  const [user, terms] = await Promise.all([getCurrentUser(), getTerms()]);
  const sections = ROLES[user.role].sidebar.settings;
  if (!sections.includes(section as SettingsSection)) notFound();
  const Section = SECTIONS[section as SettingsSection];
  const tab = (active: boolean) => cn("border-b-2 px-1 pb-2", active ? "border-primary font-medium" : "border-transparent text-muted-foreground");

  return (
    <div>
      <PageTitle title={terms.settings} subtitle="What this app and Devin use on your behalf, and how it's controlled. Everything here is in your repo." user={user} />
      <nav className="mb-6 flex gap-6 border-b text-sm">
        {sections.map((s) => <Link key={s} href={`/settings/${s}`} className={tab(s === section)}>{terms[s]}</Link>)}
      </nav>
      <Section user={user} />
    </div>
  );
}
