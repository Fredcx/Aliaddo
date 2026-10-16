import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { todayInBrazil, pageNumber, isUUID, type ClientTask } from "@/lib/crm";
import { DataError, Pagination, TaskRow, panelClass } from "@/components/crm/ui";
import { WorkspaceHeader, workspaceClass, primaryButton } from "@/components/crm/workspace-ui";

const FILTERS = { pending: "Pendentes", overdue: "Atrasadas", today: "Hoje", completed: "Concluídas" };
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

  return <main className={workspaceClass}>
    <WorkspaceHeader eyebrow="Gestão" title="Tarefas" description="Ações que você precisa realizar para seus clientes: ligar, revisar uma proposta ou combinar o próximo contato."><Link href={`/follow-ups/new${contact ? `?contact=${contact}` : ""}`} className={primaryButton}><Plus size={17} />Nova tarefa</Link></WorkspaceHeader>
    <p className="mb-6 rounded-2xl border border-[#BCE5E8] bg-[#E8F8FA] px-5 py-4 text-sm leading-relaxed text-[#526071]">Escolha uma ação e um prazo. Depois de realizá-la, marque como concluída. Tarefas não reservam horários nem enviam mensagens automaticamente.</p>
    {contact && <div className="mb-5 flex flex-wrap gap-4 text-sm"><Link href={`/clients/${contact}`} className="font-medium text-[#087F8C]">← Voltar ao cliente</Link><Link href={`/follow-ups?filter=${filter}`} className="text-gray-500 underline">Mostrar todos os clientes</Link></div>}
    <nav aria-label="Filtrar tarefas" className="mb-5 flex w-fit flex-wrap gap-1 rounded-2xl bg-[#E9EDF1] p-1">{Object.entries(FILTERS).map(([value, label]) => <Link key={value} href={`/follow-ups?filter=${value}&contact=${contact}`} aria-current={value === filter ? "page" : undefined} className="workspace-tab">{label}</Link>)}</nav>
    {error ? <DataError /> : <section className={panelClass} aria-label="Lista de tarefas">
      {!data?.length ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto mb-3 text-[#087F8C]" size={32} /><h2 className="font-semibold">Nenhuma tarefa nesta lista</h2><p className="mt-2 text-sm text-gray-500">Use Nova tarefa para registrar o que precisa ser feito.</p></div> :
        (data as TaskWithContact[]).map(task => <TaskRow key={task.id} task={task} today={today} name={(Array.isArray(task.contacts) ? task.contacts[0]?.name : task.contacts?.name) || "Cliente"} />)}
      <Pagination page={page} count={count || 0} href={`/follow-ups?filter=${filter}&contact=${contact}`} />
    </section>}
  </main>;
}
