"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { newPassword } from "@/lib/auth-validation";

export async function changePassword(data: FormData): Promise<{ error?: string; success?: boolean }> {
  let password: string;
  try { password = newPassword(data.get("password"), data.get("confirmPassword")); }
  catch (error) { return { error: error instanceof Error ? error.message : "Confira a nova senha." }; }
  try {
    const db = createClient();
    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return { error: "Sua sessão expirou. Solicite um novo link de recuperação." };
    const { error } = await db.auth.updateUser({ password });
    if (error) return { error: "Não foi possível alterar a senha. Escolha outra senha ou solicite um novo link." };
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { error: "Não foi possível confirmar a alteração. Tente entrar com a nova senha antes de repetir." };
  }
}
