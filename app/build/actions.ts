"use server";

import { revalidatePath } from "next/cache";
import { addCustomization, createDraft, draftAct, removeCustomization } from "@/core/drafts";
import { guarded } from "@/core/guard";
import { can } from "@/core/permissions";
import { getCurrentUser } from "@/core/session";
import type { BuildRequest } from "@/lib/build-prompt";
import { interpretCustomize, interpretNew } from "@/lib/interpret";

export type BuildResult = { ok: true; href: string; summary: string } | { ok: false; error: string };

// Applies what the builder understood: a view customization or a working draft tool.
export async function applyBuildAction(req: BuildRequest): Promise<BuildResult> {
  const user = await getCurrentUser();
  if (!can(user, "tools.create")) return { ok: false, error: "Not allowed" };
  try {
    if (req.mode === "customize" && req.tool) {
      const c = interpretCustomize(req.tool, req.request);
      addCustomization(user, c, req.request);
      revalidatePath("/", "layout");
      return { ok: true, href: `/tools/${req.tool}`, summary: `${c.label}${c.matched ? "" : " (closest match)"}` };
    }
    const spec = interpretNew(req.name ?? "", req.request);
    const slug = createDraft(user, spec);
    revalidatePath("/", "layout");
    return { ok: true, href: `/tools/${slug}`, summary: `Draft tool "${spec.name}" with ${spec.actions.join(", ")}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function undoCustomizationAction(id: string) {
  return guarded("tools.create", (user) => removeCustomization(user, id));
}

export async function draftActAction(slug: string, rowId: string, verb: string, reason: string) {
  return guarded("tools.create", (user) => draftAct(user, slug, rowId, verb, reason));
}
