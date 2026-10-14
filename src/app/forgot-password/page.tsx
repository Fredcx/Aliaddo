import Link from "next/link";
import { RecoveryForm } from "@/components/auth/recovery-form";

export default function ForgotPasswordPage({ searchParams }: { searchParams: { message?: string } }) {
  return <main className="mx-auto mt-16 w-full max-w-md px-6 pb-10">
    <Link href="/login" className="text-sm text-[#147D69]">← Voltar para entrar</Link>
    <h1 className="mb-3 mt-6 text-2xl font-semibold">Recuperar acesso</h1>
    <p className="mb-6 text-sm leading-relaxed text-gray-600">Informe o e-mail da sua conta para receber um link e definir uma nova senha.</p>
    {searchParams.message && <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{searchParams.message}</p>}
    <RecoveryForm />
  </main>;
}
