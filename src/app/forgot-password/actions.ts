"use server";

import { createClient } from "@/utils/supabase/server";
import { recoveryEmail, recoveryRedirect } from "@/lib/auth-validation";

export async function requestPasswordReset(data: FormData): Promise<{ error?: string; success?: boolean }> {
  let email: string;
  let redirectTo: string;
  try {
    email = recoveryEmail(data.get("email"));
    redirectTo = recoveryRedirect(process.env.SITE_URL);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Confira o e-mail informado." };
  }
  try {
    const db = createClient();
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      // Do not disclose whether this address has an account or log email/token.
      return { error: "Não foi possível solicitar o link agora. Aguarde alguns minutos e tente novamente." };
    }
    return { success: true };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente em alguns instantes." };
  }
}
