import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { todayInBrazil, pageNumber, isUUID, type ClientTask } from "@/lib/crm";
import { DataError, Pagination, TaskRow, panelClass } from "@/components/crm/ui";

const FILTERS = { pending: "Pendentes", overdue: "Atrasados", today: "Hoje", completed: "Concluídos" };
type TaskWithContact = ClientTask & { contacts: { name: string } | { name: string }[] | null };

export default async function FollowUpsPage({ searchParams }: { searchParams: { filter?: string; page?: string; contact?: string } }) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login");
  const today = todayInBrazil();
  const filter = searchParams.filter && Object.hasOwn(FILTERS, searchParams.filter) ? searchParams.filter as keyof typeof FILTERS : "pending";
  const contact = isUUID(searchParams.contact) ? searchParams.contact : "";
  const page = pageNumber(searchParams.page);
  let query = db.from("client_tasks").select("id, contact_id, title, due_date, completed_at, contacts(name)", { count: "exact" }).eq("profile_id", user.id);
  if (contact) query = query.eq("contact_id", contact);
  if (filter === "completed") query = query.not("completed_at", "is", null);
  else query = query.is("completed_at", null);
  if (filter === "overdue") query = query.lt("due_date", today);
  if (filter === "today") query = query.eq("due_date", today);
  const { data, count, error } = await query.order("due_date", { ascending: filter !== "completed" }).order("id").range((page - 1) * 30, page * 30 - 1);

  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
    <header className="mb-7"><h1 className="mb-2 flex items-center gap-3 text-2xl font-semibold"><CalendarDays className="text-[#147D69]" />Retornos</h1>
      <p className="text-sm text-gray-500">Veja quem precisa de acompanhamento e o que ficou combinado. Datas no horário de Brasília.</p>
    </header>
    {contact && <div className="mb-5 flex flex-wrap gap-4 text-sm"><Link href={`/clients/${contact}`} className="font-medium text-[#147D69]">← Voltar ao cliente</Link><Link href={`/follow-ups?filter=${filter}`} className="text-gray-500 underline">Mostrar todos os clientes</Link></div>}
    <nav aria-label="Filtrar retornos" className="mb-5 flex flex-wrap gap-2">{Object.entries(FILTERS).map(([value, label]) => <Link key={value} href={`/follow-ups?filter=${value}&contact=${contact}`} aria-current={value === filter ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-medium ${value === filter ? "bg-[#147D69] text-white" : "border border-gray-200 bg-white text-gray-600"}`}>{label}</Link>)}</nav>
    {error ? <DataError /> : <section className={panelClass} aria-label="Lista de retornos">
      {!data?.length ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto mb-3 text-[#147D69]" size={32} /><h2 className="font-semibold">Nenhum retorno nesta lista</h2><p className="mt-2 text-sm text-gray-500">Crie os próximos passos no cadastro de cada cliente.</p><Link href={contact ? `/clients/${contact}` : "/clients"} className="mt-4 inline-block text-sm font-semibold text-[#147D69]">{contact ? "Abrir cliente" : "Ver clientes"} →</Link></div> :
        (data as TaskWithContact[]).map(task => <TaskRow key={task.id} task={task} today={today} name={(Array.isArray(task.contacts) ? task.contacts[0]?.name : task.contacts?.name) || "Cliente"} />)}
      <Pagination page={page} count={count || 0} href={`/follow-ups?filter=${filter}&contact=${contact}`} />
    </section>}
  </main>;
}
