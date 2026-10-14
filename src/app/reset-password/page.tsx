import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RecoveryForm } from "@/components/auth/recovery-form";

export default async function ResetPasswordPage() {
  const db = createClient();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) redirect("/forgot-password?message=Solicite%20um%20novo%20link%20para%20definir%20sua%20senha.");
  return <main className="mx-auto mt-16 w-full max-w-md px-6 pb-10">
    <h1 className="mb-3 text-2xl font-semibold">Definir nova senha</h1>
    <p className="mb-6 text-sm text-gray-600">Use pelo menos 8 caracteres e confirme a nova senha.</p>
    <RecoveryForm reset />
    <Link href="/forgot-password" className="mt-6 inline-block text-sm text-[#147D69]">Solicitar outro link</Link>
  </main>;
}
