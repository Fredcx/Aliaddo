import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isUUID, searchTerm } from "@/lib/crm";
import { OpportunityForm } from "@/components/crm/opportunity-form";
import { WorkspaceHeader, workspaceClass } from "@/components/crm/workspace-ui";
import { DataError, panelClass } from "@/components/crm/ui";

export default async function NewOpportunityPage({ searchParams }: { searchParams: { contact?: string; q?: string } }) {
  const db = createClient(); const { data: { user } } = await db.auth.getUser(); if (!user) redirect("/login");
  const q = searchTerm(searchParams.q), selected = isUUID(searchParams.contact) ? searchParams.contact : "";
  let query = db.from("contacts").select("id, name").eq("profile_id", user.id);
  if (selected) query = query.eq("id", selected); else if (q) query = query.ilike("name", `%${q}%`);
  const { data: contacts, error } = await query.order("name").limit(100);
  return <main className={`${workspaceClass} !max-w-3xl`}><Link href="/pipeline" className="mb-6 inline-block text-sm text-[#71816e]">← Voltar ao funil</Link><WorkspaceHeader eyebrow="Uma nova conexão" title="Criar oportunidade" description="Um cliente pode ter diferentes interesses. Cada oportunidade acompanha uma contratação." />
    {error ? <DataError /> : <section className={panelClass}>
      {!selected && <form action="/pipeline/new" className="mb-6 flex flex-wrap gap-2 border-b border-gray-100 pb-5"><label className="flex-1 text-xs text-gray-500">Encontrar cadastro<input name="q" defaultValue={q} type="search" placeholder="Buscar cliente pelo nome" className="mt-2 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" /></label><button className="self-end rounded-xl border px-3 py-2.5 text-sm">Buscar</button><p className="w-full text-xs text-gray-500">Lista limitada a 100 resultados. <Link href="/clients/new" className="font-semibold text-[#147D69]">Cadastrar novo cliente →</Link></p></form>}
      {!contacts?.length && <p className="mb-4 text-sm text-gray-500">Nenhum cadastro encontrado. Cadastre o cliente ou ajuste a busca.</p>}
      <OpportunityForm contacts={contacts || []} selectedContact={selected} />
    </section>}
  </main>;
}
