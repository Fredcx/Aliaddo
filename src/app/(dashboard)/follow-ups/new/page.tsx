import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isUUID, searchTerm, todayInBrazil } from "@/lib/crm";
import { TaskForm } from "@/components/crm/forms";
import { WorkspaceHeader, workspaceClass } from "@/components/crm/workspace-ui";
import { DataError, panelClass } from "@/components/crm/ui";

export default async function NewTaskPage({ searchParams }: { searchParams: { contact?: string; q?: string } }) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const q = searchTerm(searchParams.q), selected = isUUID(searchParams.contact) ? searchParams.contact : "";
  let query = db.from("contacts").select("id, name").eq("profile_id", user.id);
  if (selected) query = query.eq("id", selected); else if (q) query = query.ilike("name", `%${q}%`);
  const { data, error } = await query.order("name").limit(100);
  return <main className={`${workspaceClass} !max-w-3xl`}><Link href="/follow-ups" className="mb-6 inline-block text-sm text-[#526071]">← Voltar às tarefas</Link><WorkspaceHeader eyebrow="Gestão · Tarefas" title="Nova tarefa" description="Registre uma ação para você realizar. O prazo não é uma reserva de horário e não dispara mensagens." />
    {error ? <DataError /> : <section className={panelClass}>
      {!selected && <form action="/follow-ups/new" className="mb-6 flex flex-wrap gap-2 border-b border-gray-100 pb-5"><label className="flex-1 text-sm text-[#526071]">Encontrar cliente<input name="q" defaultValue={q} type="search" placeholder="Buscar pelo nome" className="mt-2 block w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" /></label><button className="self-end rounded-xl border px-4 py-2.5 text-sm">Buscar</button><p className="w-full text-xs text-[#64748B]">Até 100 resultados. <Link href="/clients/new" className="font-medium text-[#087F8C]">Cadastrar um cliente →</Link></p></form>}
      {!data?.length && <p className="mb-4 text-sm text-[#64748B]">Nenhum cliente encontrado. Cadastre alguém ou ajuste a busca.</p>}
      <TaskForm contacts={data || []} contactId={selected || undefined} today={todayInBrazil()} redirectOnSave />
    </section>}
  </main>;
}
