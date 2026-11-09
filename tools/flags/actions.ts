"use server";

import { guarded } from "@/core/guard";
import { setFlag, setRollout, type Env } from "./logic";

export async function toggleFlagAction(flagId: string, env: Env, enabled: boolean, reason: string) {
  return guarded("flags.toggle", (user) => setFlag(user, flagId, env, enabled, reason));
}

export async function rolloutAction(flagId: string, rolloutPct: number, reason: string) {
  return guarded("flags.toggle", (user) => setRollout(user, flagId, rolloutPct, reason));
}
