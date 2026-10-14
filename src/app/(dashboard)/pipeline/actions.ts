"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isUUID, type ActionResult } from "@/lib/crm";
import { isSalesStage, nextSalesStage, parseOpportunity } from "@/lib/pipeline";

async function session() {
  const db = createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw new Error("Entre novamente para continuar.");
  return { db, user };
}
function refresh() {
  for (const path of ["/home", "/pipeline", "/clients", "/dashboard"]) revalidatePath(path, "layout");
}
function failure(error: unknown): ActionResult { return { error: error instanceof Error ? error.message : "Não foi possível salvar." }; }

export async function saveOpportunity(id: string | null, data: FormData): Promise<ActionResult> {
  try {
    const { db, user } = await session();
    const values = parseOpportunity(data);
    const contactId = data.get("contact_id");
    if (!isUUID(contactId) || (id !== null && !isUUID(id))) throw new Error("Escolha um cliente válido.");
    const version = Number(data.get("version"));
    if (id && (!Number.isSafeInteger(version) || version < 1)) throw new Error("Atualize a página antes de salvar.");
    // Contact and source identity are immutable when editing an existing opportunity.
    const query = id
      ? db.from("opportunities").update(values).eq("id", id).eq("profile_id", user.id).eq("version", version)
      : db.from("opportunities").insert({ ...values, contact_id: contactId, profile_id: user.id });
    const { data: saved, error } = await query.select("id").single();
    if (error || !saved) throw new Error("Não foi possível salvar. A oportunidade pode ter sido alterada; atualize a página e tente novamente.");
    refresh(); return { id: saved.id, success: true };
  } catch (error) { return failure(error); }
}

export async function advanceOpportunity(id: string, stage: string, version: number): Promise<ActionResult> {
  try {
    const { db, user } = await session();
    if (!isUUID(id) || !isSalesStage(stage) || !Number.isSafeInteger(version) || version < 1) throw new Error("Oportunidade inválida.");
    const next = nextSalesStage(stage);
    if (!next) throw new Error("Edite a oportunidade para reabri-la.");
    const { data, error } = await db.from("opportunities").update({ stage: next }).eq("id", id).eq("profile_id", user.id).eq("stage", stage).eq("version", version).select("id").single();
    if (error || !data) throw new Error("A oportunidade mudou. Atualize a página antes de continuar.");
    refresh(); return { success: true };
  } catch (error) { return failure(error); }
}

export async function convertSubmission(id: string, contactId: string | null): Promise<ActionResult> {
  try {
    const { db } = await session();
    if (!isUUID(id) || (contactId !== null && !isUUID(contactId))) throw new Error("Cadastro inválido.");
    const { data, error } = await db.rpc("opportunity_from_submission", { submission_id: id, existing_contact_id: contactId });
    if (error || !data) throw new Error("Não foi possível adicionar ao funil. Confira o vínculo do cliente e tente novamente.");
    refresh(); return { id: data as string, success: true };
  } catch (error) { return failure(error); }
}
