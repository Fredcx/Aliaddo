import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ContactForm } from "@/components/crm/forms";
import { panelClass } from "@/components/crm/ui";

export default async function NewClientPage() {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
    <Link href="/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft size={16} />Clientes</Link>
    <h1 className="mb-2 text-2xl font-semibold">Novo cliente</h1>
    <p className="mb-6 text-sm text-gray-500">Comece com o nome. Você pode completar o cadastro e vincular atendimentos depois.</p>
    <section className={panelClass}><ContactForm /></section>
  </main>;
}
