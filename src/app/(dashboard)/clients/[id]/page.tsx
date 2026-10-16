import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isUUID, pageNumber, searchTerm, todayInBrazil, type Contact, type ClientTask } from "@/lib/crm";
import { SALES_STAGES, type SalesStage } from "@/lib/pipeline";
import { ContactForm, SubmissionLink } from "@/components/crm/forms";
import { DataError, Pagination, StageBadge, TaskRow, panelClass } from "@/components/crm/ui";
import { workspaceClass, primaryButton, secondaryButton } from "@/components/crm/workspace-ui";

type Submission = { id: string; name: string; email: string; status: string; created_at: string; documents: { id: string } | { id: string }[] | null };
const TABS = { overview: "Resumo", tasks: "Tarefas", responses: "Respostas de formulários", edit: "Editar cadastro" };

export default async function ClientDetailPage({ params, searchParams }: {
  params: { id: string }; searchParams: { tab?: string; q?: string; page?: string; incomingPage?: string };
}) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  if (!isUUID(params.id)) notFound();
  const { data: contact, error } = await db.from("contacts").select("id, name, email, phone, stage, notes").eq("id", params.id).eq("profile_id", user.id).maybeSingle();
  if (error) return <main className={workspaceClass}><DataError /></main>;
  if (!contact) notFound();
  const tab = searchParams.tab && Object.hasOwn(TABS, searchParams.tab) ? searchParams.tab as keyof typeof TABS : "overview";
  const q = searchTerm(searchParams.q), page = pageNumber(searchParams.page), incomingPage = pageNumber(searchParams.incomingPage);
  const today = todayInBrazil();
  let incomingQuery = db.from("clients").select("id, name, email, status, created_at", { count: "exact" }).eq("profile_id", user.id).is("contact_id", null);
  if (q) incomingQuery = incomingQuery.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  const [history, incoming, tasks, opportunities] = await Promise.all([
    tab === "responses" ? db.from("clients").select("id, name, email, status, created_at, documents(id)", { count: "exact" }).eq("profile_id", user.id).eq("contact_id", params.id).order("created_at", { ascending: false }).order("id").range((page - 1) * 30, page * 30 - 1) : Promise.resolve({ data: [], error: null, count: 0 }),
    tab === "responses" ? incomingQuery.order("created_at", { ascending: false }).order("id").range((incomingPage - 1) * 30, incomingPage * 30 - 1) : Promise.resolve({ data: [], error: null, count: 0 }),
    tab === "tasks" ? db.from("client_tasks").select("id, contact_id, title, due_date, completed_at").eq("profile_id", user.id).eq("contact_id", params.id).is("completed_at", null).order("due_date").order("id").limit(5) : Promise.resolve({ data: [], error: null }),
    tab === "overview" ? db.from("opportunities").select("id, title, stage").eq("profile_id", user.id).eq("contact_id", params.id).order("updated_at", { ascending: false }).limit(10) : Promise.resolve({ data: [], error: null }),
  ]);
  const date = (value: string) => new Date(value).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  return <main className={workspaceClass}>
    <Link href="/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-[#526071]"><ArrowLeft size={16} />Todos os clientes</Link>
    <header className="mb-7 flex flex-wrap items-center justify-between gap-5"><div><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#087F8C]">Ficha do cliente</p><h1 className="mb-3 break-words text-3xl font-semibold tracking-tight">{contact.name}</h1><StageBadge stage={contact.stage} /></div><div className="flex flex-wrap gap-2"><Link href={`/follow-ups/new?contact=${contact.id}`} className={secondaryButton}><Plus size={16} />Nova tarefa</Link><Link href={`/pipeline/new?contact=${contact.id}`} className={primaryButton}><Plus size={16} />Nova oportunidade</Link></div></header>
    <nav aria-label="Áreas da ficha do cliente" className="mb-7 flex flex-wrap gap-1 rounded-2xl bg-[#E9EDF1] p-1.5">{Object.entries(TABS).map(([value, label]) => <Link key={value} href={`/clients/${contact.id}?tab=${value}`} aria-current={tab === value ? "page" : undefined} className="workspace-tab">{label}</Link>)}</nav>
    {tab === "overview" && <div className="grid items-start gap-6 xl:grid-cols-2"><section className={panelClass}><h2 className="mb-5 text-lg font-semibold">Dados e contexto</h2><dl className="space-y-4 text-sm"><div><dt className="text-[#64748B]">E-mail</dt><dd className="mt-1 break-all">{contact.email || "Não informado"}</dd></div><div><dt className="text-[#64748B]">Telefone</dt><dd className="mt-1">{contact.phone || "Não informado"}</dd></div><div><dt className="text-[#64748B]">Notas internas</dt><dd className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{contact.notes || "Nenhuma nota registrada."}</dd></div></dl><Link href={`/clients/${contact.id}?tab=edit`} className="mt-6 inline-block text-sm font-medium text-[#087F8C]">Editar dados e notas →</Link></section>
      <section className={panelClass}><h2 className="text-lg font-semibold">Oportunidades deste cliente</h2><p className="mb-5 mt-2 text-sm text-[#64748B]">Serviços em negociação ou já contratados.</p>{opportunities.error ? <DataError /> : opportunities.data?.length ? opportunities.data.map(item => <Link key={item.id} href={`/pipeline/${item.id}`} className="flex items-center justify-between gap-3 border-t border-[#EDF0F3] py-4 text-sm"><span className="font-medium text-[#087F8C]">{item.title} ↗</span><span className="text-xs text-[#64748B]">{SALES_STAGES[item.stage as SalesStage]}</span></Link>) : <p className="text-sm text-[#64748B]">Nenhuma oportunidade. Crie uma quando houver interesse em contratar um serviço.</p>}<p className="mt-4 text-xs text-[#64748B]">Até 10 oportunidades mais recentes.</p></section></div>}
    {tab === "edit" && <section className={`${panelClass} max-w-3xl`}><h2 className="mb-2 text-lg font-semibold">Editar cadastro</h2><p className="mb-6 text-sm text-[#64748B]">Esses dados são da ficha do cliente. Alterá-los não modifica respostas antigas.</p><ContactForm contact={contact as Contact} /></section>}
    {tab === "tasks" && <section className={panelClass}><h2 className="text-lg font-semibold">Tarefas pendentes</h2><p className="mb-5 mt-2 text-sm leading-relaxed text-[#64748B]">Ações para você realizar por este cliente. Crie uma tarefa, defina o prazo e conclua depois de fazer a ação.</p>{tasks.error ? <DataError /> : tasks.data?.length ? (tasks.data as ClientTask[]).map(task => <TaskRow key={task.id} task={task} today={today} />) : <p className="py-5 text-sm text-[#64748B]">Nenhuma tarefa pendente para este cliente.</p>}<Link href={`/follow-ups?contact=${contact.id}`} className="mt-5 inline-block text-sm font-medium text-[#087F8C]">Ver todas as tarefas e concluídas →</Link></section>}
    {tab === "responses" && <div className="space-y-6"><section className={panelClass}><h2 className="text-lg font-semibold">Respostas deste cliente</h2><p className="mb-5 mt-2 max-w-3xl text-sm leading-relaxed text-[#64748B]">Preenchimentos já recebidos e associados a esta pessoa. Esta área não envia formulários. Para compartilhar um novo, abra <Link href="/forms" className="font-medium text-[#087F8C]">Formulários</Link>.</p>
      {history.error ? <DataError /> : <>{!history.data?.length && <p className="py-4 text-sm text-[#64748B]">Nenhuma resposta associada nesta página. Você pode usar a ficha normalmente sem associar formulários.</p>}{(history.data as Submission[] | null)?.map(item => {
        const hasDocument = Array.isArray(item.documents) ? item.documents.length > 0 : Boolean(item.documents);
        return <article key={item.id} className="border-t border-[#EDF0F3] py-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">Preenchido em {date(item.created_at)}</h3><span className="text-xs text-[#64748B]">{item.status}</span></div><p className="mt-1 break-all text-xs text-[#64748B]">{item.name} · {item.email}</p><div className="mt-4 flex flex-wrap items-center gap-4">{hasDocument ? <Link href={`/review/${item.id}`} className="text-sm font-medium text-[#087F8C]">Revisar documento e respostas →</Link> : <Link href="/dashboard" className="text-sm font-medium text-[#087F8C]">Abrir respostas e entregas →</Link>}<SubmissionLink contactId={contact.id} submissionId={item.id} unlink /></div></article>;
      })}<Pagination page={page} count={history.count || 0} href={`/clients/${contact.id}?tab=responses&q=${encodeURIComponent(q)}&incomingPage=${incomingPage}`} /></>}
    </section>
    <details className={panelClass} open={Boolean(q || searchParams.incomingPage) || undefined}><summary className="cursor-pointer text-base font-semibold">Associar uma resposta existente · opcional</summary><p className="mb-5 mt-3 max-w-3xl text-sm leading-relaxed text-[#64748B]">Use apenas se esta pessoa já preencheu um formulário. Escolha a resposta correta para reuni-la no histórico. Isso não altera as respostas nem cria uma oportunidade. Você pode remover a associação depois.</p>
      <form className="mb-4 flex gap-2" action={`/clients/${contact.id}`}><input type="hidden" name="tab" value="responses" /><input aria-label="Buscar respostas sem cliente por nome ou e-mail" name="q" type="search" defaultValue={q} placeholder="Nome ou e-mail de quem respondeu" className="min-w-0 flex-1 rounded-xl border border-[#DCE2E8] px-3 py-3 text-sm" /><button className="rounded-xl border border-[#DCE2E8] px-4 text-sm">Buscar</button></form>
      {incoming.error ? <DataError /> : <>{!incoming.data?.length && <p className="py-4 text-sm text-[#64748B]">Nenhuma resposta sem cliente encontrada.</p>}{incoming.data?.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF0F3] py-5"><div className="min-w-0 flex-1 basis-48"><h3 className="break-words text-sm font-semibold">{item.name}</h3><p className="mt-1 break-all text-xs text-[#64748B]">{item.email} · {date(item.created_at)}</p></div><SubmissionLink contactId={contact.id} submissionId={item.id} /></article>)}<Pagination page={incomingPage} count={incoming.count || 0} pageParam="incomingPage" href={`/clients/${contact.id}?tab=responses&q=${encodeURIComponent(q)}&page=${page}`} /></>}
    </details></div>}
  </main>;
}
