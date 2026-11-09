import { redirect } from "next/navigation";
import { ROLES } from "@/config/roles";
import { getCurrentUser } from "@/core/session";

export default async function Settings() {
  redirect(`/settings/${ROLES[(await getCurrentUser()).role].sidebar.settings[0]}`);
}
