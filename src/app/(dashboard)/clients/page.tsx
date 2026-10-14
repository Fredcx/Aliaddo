import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Plus, ArrowUpRight, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { STAGES, isStage, searchTerm, pageNumber, type Contact } from "@/lib/crm";
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

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-3"><Users className="text-[#147D69]" /><h1 className="text-2xl font-semibold tracking-tight">Clientes</h1></div>
        <p className="max-w-xl text-sm leading-relaxed text-gray-500">Uma relação que continua depois do formulário. Organize seus clientes, acompanhe o histórico e combine os próximos passos.</p></div>
      <Link href="/clients/new" className="inline-flex items-center gap-2 rounded-xl bg-[#147D69] px-4 py-3 text-sm font-semibold text-white"><Plus size={17} />Novo cliente</Link>
    </header>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#EBF9F6] px-5 py-4 text-sm text-[#146451]">
      <p>Quem precisa de você hoje? Consulte seus retornos pendentes.</p>
      <Link href="/follow-ups" className="inline-flex items-center gap-1 font-semibold">Ver retornos <ArrowUpRight size={16} /></Link>
    </div>
    <form action="/clients" className="mb-5 flex flex-wrap items-end gap-3">
      <label className="min-w-48 flex-1 text-xs font-medium text-gray-600">Buscar cliente
        <input name="q" type="search" defaultValue={q} placeholder="Nome ou e-mail" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm" />
      </label>
      <label className="text-xs font-medium text-gray-600">Etapa
        <select name="stage" defaultValue={stage} className="mt-1.5 block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"><option value="">Todas as etapas</option>{Object.entries(STAGES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </label>
      <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium"><Search size={16} />Buscar</button>
    </form>
    {error ? <DataError /> : <section className={panelClass} aria-label="Lista de clientes">
      {!data?.length ? <div className="py-10 text-center"><Users className="mx-auto mb-3 text-gray-300" size={32} /><h2 className="font-semibold">{q || stage || page > 1 ? "Nenhum cliente nesta busca" : "Comece pela sua carteira de clientes"}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">{q || stage || page > 1 ? "Ajuste os filtros para encontrar o cadastro." : "Cadastre um cliente e vincule os formulários que ele já respondeu. Você também pode cadastrar quem ainda não respondeu um formulário."}</p>
      </div> : <div className="divide-y divide-gray-100">{(data as Contact[]).map(contact => <Link key={contact.id} href={`/clients/${contact.id}`} className="flex flex-wrap items-center gap-4 rounded-xl px-2 py-5 hover:bg-gray-50">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF9F6] font-semibold text-[#147D69]">{contact.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1 basis-40"><h2 className="break-words text-sm font-semibold">{contact.name}</h2><p className="mt-1 break-all text-xs text-gray-500">{contact.email || contact.phone || "Contato ainda não informado"}</p></div>
        <StageBadge stage={contact.stage} /><ArrowUpRight size={16} className="text-gray-400" />
      </Link>)}</div>}
      <Pagination page={page} count={count || 0} href={`/clients?q=${encodeURIComponent(q)}&stage=${stage}`} />
    </section>}
  </main>;
}
