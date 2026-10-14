"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { isUUID, parseContact, parseTask, type ActionResult } from "@/lib/crm";

async function session() {
  const db = createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  return { db, user };
}

function refresh(contactId: string) {
  revalidatePath("/clients");
  revalidatePath(`/clients/${contactId}`);
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath("/pipeline", "layout");
}

function failure(error: unknown): ActionResult {
  return { error: error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente." };
}

export async function saveContact(id: string | null, data: FormData): Promise<ActionResult> {
  try {
    const { db, user } = await session();
    const values = parseContact(data);
    if (id !== null && !isUUID(id)) throw new Error("Cliente inválido.");
    const query = id
      ? db.from("contacts").update(values).eq("id", id).eq("profile_id", user.id)
      : db.from("contacts").insert({ ...values, profile_id: user.id });
    const { data: saved, error } = await query.select("id").single();
    if (error || !saved) throw new Error("Não foi possível salvar o cadastro. Verifique sua conexão e tente novamente.");
    refresh(saved.id);
    return { id: saved.id, success: true };
  } catch (error) { return failure(error); }
}

export async function addTask(contactId: string, data: FormData): Promise<ActionResult> {
  try {
    const { db, user } = await session();
    if (!isUUID(contactId)) throw new Error("Cliente inválido.");
    const values = parseTask(data);
    // The composite foreign key also enforces ownership at database level.
    const { error } = await db.from("client_tasks").insert({ ...values, contact_id: contactId, profile_id: user.id });
    if (error) throw new Error("Não foi possível criar o retorno. Tente novamente.");
    refresh(contactId);
    return { success: true };
  } catch (error) { return failure(error); }
}

export async function setTaskCompleted(taskId: string, completed: boolean): Promise<ActionResult> {
  try {
    const { db, user } = await session();
    if (!isUUID(taskId) || typeof completed !== "boolean") throw new Error("Retorno inválido.");
    const { data, error } = await db.from("client_tasks")
      .update({ completed_at: completed ? new Date().toISOString() : null })
      .eq("id", taskId).eq("profile_id", user.id).select("contact_id").single();
    if (error || !data) throw new Error("Não foi possível atualizar o retorno. Tente novamente.");
    refresh(data.contact_id);
    return { success: true };
  } catch (error) { return failure(error); }
}

export async function linkSubmission(contactId: string, submissionId: string, unlink = false): Promise<ActionResult> {
  try {
    const { db, user } = await session();
    if (!isUUID(contactId) || !isUUID(submissionId) || typeof unlink !== "boolean") throw new Error("Atendimento inválido.");
    // Only attach an unlinked submission; never silently steal another client's history.
    let query = db.from("clients").update({ contact_id: unlink ? null : contactId })
      .eq("id", submissionId).eq("profile_id", user.id);
    query = unlink ? query.eq("contact_id", contactId) : query.is("contact_id", null);
    const { data, error } = await query.select("id").single();
    if (error || !data) throw new Error("O atendimento não está mais disponível para essa alteração. Atualize a página.");
    refresh(contactId);
    return { success: true };
  } catch (error) { return failure(error); }
}
