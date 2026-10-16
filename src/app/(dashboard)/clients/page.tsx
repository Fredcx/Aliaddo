import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Plus, ArrowUpRight, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { STAGES, isStage, searchTerm, pageNumber, type Contact } from "@/lib/crm";
import { WorkspaceHeader, workspaceClass, primaryButton } from "@/components/crm/workspace-ui";
import { DataError, Pagination, StageBadge, panelClass } from "@/components/crm/ui";

export default async function ClientsPage({ searchParams }: { searchParams: { q?: string; stage?: string; page?: string } }) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const q = searchTerm(searchParams.q);
  const stage = searchParams.stage && isStage(searchParams.stage) ? searchParams.stage : "";
  const page = pageNumber(searchParams.page);
  let query = db.from("contacts").select("id, name, email, phone, stage", { count: "exact" }).eq("profile_id", user.id);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  if (stage) query = query.eq("stage", stage);
  const { data, error, count } = await query.order("name").order("id").range((page - 1) * 30, page * 30 - 1);

  return <main className={workspaceClass}>
    <WorkspaceHeader eyebrow="Gestão" title="Clientes" description="Uma ficha para cada pessoa, com dados, notas e histórico. Você pode cadastrar clientes mesmo sem um formulário."><Link href="/clients/new" className={primaryButton}><Plus size={17} />Novo cliente</Link></WorkspaceHeader>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F4F6F8] px-5 py-4 text-sm text-[#087F8C]">
      <p>Precisa ligar, revisar algo ou acompanhar um cliente? Registre uma tarefa.</p>
      <Link href="/follow-ups" className="inline-flex items-center gap-1 font-semibold">Ver tarefas <ArrowUpRight size={16} /></Link>
    </div>
    <form action="/clients" className="mb-5 flex flex-wrap items-end gap-3">
      <label className="min-w-48 flex-1 text-xs font-medium text-gray-600">Buscar cliente
        <input name="q" type="search" defaultValue={q} placeholder="Nome ou e-mail" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm" />
      </label>
      <label className="text-xs font-medium text-gray-600">Situação do cliente
        <select name="stage" defaultValue={stage} className="mt-1.5 block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"><option value="">Todas as situações</option>{Object.entries(STAGES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </label>
      <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium"><Search size={16} />Buscar</button>
    </form>
    {error ? <DataError /> : <section className={panelClass} aria-label="Lista de clientes">
      {!data?.length ? <div className="py-10 text-center"><Users className="mx-auto mb-3 text-gray-300" size={32} /><h2 className="font-semibold">{q || stage || page > 1 ? "Nenhum cliente nesta busca" : "Comece pela sua carteira de clientes"}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">{q || stage || page > 1 ? "Ajuste os filtros para encontrar o cadastro." : "Comece com o nome. Associar respostas de formulários ao histórico é opcional e pode ser feito depois."}</p>
      </div> : <div className="divide-y divide-gray-100">{(data as Contact[]).map(contact => <Link key={contact.id} href={`/clients/${contact.id}`} className="flex flex-wrap items-center gap-4 rounded-xl px-2 py-5 hover:bg-gray-50">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F6F8] font-semibold text-[#087F8C]">{contact.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1 basis-40"><h2 className="break-words text-sm font-semibold">{contact.name}</h2><p className="mt-1 break-all text-xs text-gray-500">{contact.email || contact.phone || "Contato ainda não informado"}</p></div>
        <StageBadge stage={contact.stage} /><ArrowUpRight size={16} className="text-gray-400" />
      </Link>)}</div>}
      <Pagination page={page} count={count || 0} href={`/clients?q=${encodeURIComponent(q)}&stage=${stage}`} />
    </section>}
  </main>;
}
