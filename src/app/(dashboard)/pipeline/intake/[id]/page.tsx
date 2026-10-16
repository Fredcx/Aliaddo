import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isUUID, searchTerm } from "@/lib/crm";
import { IntakeConversion } from "@/components/crm/opportunity-form";
import { WorkspaceHeader, workspaceClass } from "@/components/crm/workspace-ui";
import { DataError, panelClass } from "@/components/crm/ui";

export default async function IntakePage({ params, searchParams }: { params: { id: string }; searchParams: { q?: string } }) {
  if (!isUUID(params.id)) notFound();
  const db = createClient(); const { data: { user } } = await db.auth.getUser(); if (!user) redirect("/login");
  const { data: item, error } = await db.from("clients").select("id, name, email, contact_id").eq("profile_id", user.id).eq("id", params.id).maybeSingle();
  if (error) return <main className={workspaceClass}><DataError /></main>; if (!item) notFound();
  const q = searchTerm(searchParams.q);
  let query = db.from("contacts").select("id, name").eq("profile_id", user.id);
  if (item.contact_id) query = query.eq("id", item.contact_id); else if (q) query = query.ilike("name", `%${q}%`);
  const contacts = await query.order("name").limit(100);
  return <main className={`${workspaceClass} !max-w-3xl`}><Link href="/home" className="mb-6 inline-block text-sm text-[#526071]">← Voltar à visão geral</Link><WorkspaceHeader eyebrow="Do formulário ao relacionamento" title="Uma nova oportunidade" description="Use esta opção quando a resposta indicar interesse em contratar. Ela associa o preenchimento a um cliente e cria uma negociação no funil." />
    <section className={panelClass}><h2 className="text-lg font-semibold">{item.name}</h2><p className="mb-6 mt-1 text-sm text-gray-500">{item.email}</p>
      {!item.contact_id && <form className="mb-5 flex gap-2" action={`/pipeline/intake/${item.id}`}><input aria-label="Buscar cadastro existente" name="q" type="search" defaultValue={q} placeholder="Buscar cadastro existente pelo nome" className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm" /><button className="rounded-xl border px-3 text-sm">Buscar</button></form>}
      {contacts.error ? <DataError /> : <IntakeConversion submissionId={item.id} contacts={contacts.data || []} linkedContactId={item.contact_id} />}
    </section>
  </main>;
}
