import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, CalendarDays } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isUUID, pageNumber, searchTerm, todayInBrazil, type Contact, type ClientTask } from "@/lib/crm";
import { ContactForm, TaskForm, SubmissionLink } from "@/components/crm/forms";
import { DataError, Pagination, StageBadge, TaskRow, panelClass } from "@/components/crm/ui";

type Submission = {
  id: string; name: string; email: string; status: string; created_at: string;
  documents: { id: string } | { id: string }[] | null;
};

export default async function ClientDetailPage({ params, searchParams }: {
  params: { id: string }; searchParams: { q?: string; page?: string; incomingPage?: string };
}) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  if (!isUUID(params.id)) notFound();
  const { data: contact, error } = await db.from("contacts").select("id, name, email, phone, stage, notes")
    .eq("id", params.id).eq("profile_id", user.id).maybeSingle();
  if (error) return <main className="p-8"><DataError /></main>;
  if (!contact) notFound();

  const q = searchTerm(searchParams.q);
  const page = pageNumber(searchParams.page);
  const incomingPage = pageNumber(searchParams.incomingPage);
  const today = todayInBrazil();
  let incomingQuery = db.from("clients").select("id, name, email, status, created_at", { count: "exact" })
    .eq("profile_id", user.id).is("contact_id", null);
  if (q) incomingQuery = incomingQuery.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  const [history, incoming, tasks, opportunities] = await Promise.all([
    db.from("clients").select("id, name, email, status, created_at, documents(id)", { count: "exact" })
      .eq("profile_id", user.id).eq("contact_id", params.id).order("created_at", { ascending: false }).order("id")
      .range((page - 1) * 30, page * 30 - 1),
    incomingQuery.order("created_at", { ascending: false }).order("id").range((incomingPage - 1) * 30, incomingPage * 30 - 1),
    db.from("client_tasks").select("id, contact_id, title, due_date, completed_at")
      .eq("profile_id", user.id).eq("contact_id", params.id).is("completed_at", null).order("due_date").order("id").limit(5),
    db.from("opportunities").select("id, title, stage").eq("profile_id", user.id).eq("contact_id", params.id).order("updated_at", { ascending: false }).limit(10),
  ]);
  const date = (value: string) => new Date(value).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
    <Link href="/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft size={16} />Clientes</Link>
    <header className="mb-7 flex flex-wrap items-center gap-3"><h1 className="break-words text-2xl font-semibold">{contact.name}</h1><StageBadge stage={contact.stage} /></header>
    <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <section className={panelClass}><h2 className="mb-5 text-base font-semibold">Cadastro e contexto</h2><ContactForm contact={contact as Contact} /></section>
        <section className={panelClass}>
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold"><FileText size={18} className="text-[#147D69]" />Histórico de atendimentos</h2>
          <p className="mb-4 text-xs leading-relaxed text-gray-500">Formulários vinculados a este cadastro. Cada resposta e documento mantém seu histórico original.</p>
          {history.error ? <DataError /> : <>
            {!history.data?.length && <p className="py-4 text-sm text-gray-500">Nenhum atendimento nesta página. Vincule as respostas do cliente abaixo.</p>}
            {(history.data as Submission[] | null)?.map(item => {
              const hasDocument = Array.isArray(item.documents) ? item.documents.length > 0 : Boolean(item.documents);
              return <article key={item.id} className="border-b border-gray-100 py-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">Resposta de {date(item.created_at)}</h3><span className="text-xs text-gray-500">{item.status}</span></div>
                <p className="mt-1 break-all text-xs text-gray-500">{item.name} · {item.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {hasDocument ? <Link href={`/review/${item.id}`} className="text-xs font-semibold text-[#147D69] hover:underline">Revisar documento e respostas</Link> : <Link href="/dashboard" className="text-xs font-semibold text-[#147D69] hover:underline">Ver respostas na Mesa de Trabalho</Link>}
                  <SubmissionLink contactId={contact.id} submissionId={item.id} unlink />
                </div>
              </article>;
            })}
            <Pagination page={page} count={history.count || 0} href={`/clients/${contact.id}?q=${encodeURIComponent(q)}&incomingPage=${incomingPage}`} />
          </>}
        </section>
        <section className={panelClass}>
          <h2 className="text-base font-semibold">Vincular respostas de formulário</h2>
          <p className="mb-4 mt-2 text-xs leading-relaxed text-gray-500">Confira a identidade antes de vincular. E-mails podem ser compartilhados; o Aliaddo não une pessoas automaticamente. Desvincular preserva a resposta.</p>
          <form className="mb-3 flex gap-2" action={`/clients/${contact.id}`}>
            <input aria-label="Buscar respostas sem vínculo por nome ou e-mail" name="q" type="search" defaultValue={q} placeholder="Buscar por nome ou e-mail" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <button className="rounded-xl border border-gray-200 px-3 text-sm">Buscar</button>
          </form>
          {incoming.error ? <DataError /> : <>
            {!incoming.data?.length && <p className="py-4 text-sm text-gray-500">Nenhuma resposta sem vínculo encontrada.</p>}
            {incoming.data?.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 py-4">
              <div className="min-w-0 flex-1 basis-48"><h3 className="break-words text-sm font-medium">{item.name}</h3><p className="mt-1 break-all text-xs text-gray-500">{item.email}</p><p className="mt-1 text-xs text-gray-500">{date(item.created_at)} · {item.status}</p></div>
              <SubmissionLink contactId={contact.id} submissionId={item.id} />
            </article>)}
            <Pagination page={incomingPage} count={incoming.count || 0} pageParam="incomingPage" href={`/clients/${contact.id}?q=${encodeURIComponent(q)}&page=${page}`} />
          </>}
        </section>
      </div>
      <div className="space-y-6"><section className={panelClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Oportunidades</h2><Link href={`/pipeline/new?contact=${contact.id}`} className="text-xs font-semibold text-[#147D69]">+ Nova oportunidade</Link></div>
        {opportunities.error ? <DataError /> : opportunities.data?.length ? opportunities.data.map(item => <Link key={item.id} href={`/pipeline/${item.id}`} className="block border-t border-gray-100 py-3 text-sm text-[#147D69]">{item.title} ↗</Link>) : <p className="text-sm text-gray-500">Registre um serviço ou interesse para acompanhar no funil.</p>}
        <p className="mt-3 text-xs text-gray-400">Até 10 oportunidades mais recentes.</p>
      </section><section className={panelClass}>
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold"><CalendarDays size={18} className="text-[#147D69]" />Próximos passos</h2>
        <p className="mb-5 text-xs leading-relaxed text-gray-500">Organize os retornos e marque o que já foi feito. As datas seguem o horário de Brasília. Não há envio de lembretes nesta etapa.</p>
        <TaskForm contactId={contact.id} today={today} />
        <div className="mt-6 border-t border-gray-100 pt-2">
          {tasks.error ? <DataError /> : tasks.data?.length ? (tasks.data as ClientTask[]).map(task => <TaskRow key={task.id} task={task} today={today} />) : <p className="py-4 text-sm text-gray-500">Nenhum retorno pendente para este cliente.</p>}
        </div>
        <Link href={`/follow-ups?contact=${contact.id}`} className="mt-3 inline-block text-xs font-semibold text-[#147D69] hover:underline">Ver todos os retornos deste cliente →</Link>
      </section></div>
    </div>
  </main>;
}
