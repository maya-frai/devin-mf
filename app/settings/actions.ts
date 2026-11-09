"use server";

import { requestAccess } from "@/core/access";
import { guarded } from "@/core/guard";

export async function requestAccessAction(connectorId: string, reason: string) {
  return guarded("access.request", (user) => requestAccess(user, connectorId, reason));
}
