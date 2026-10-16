import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { todayInBrazil, formatDueDate } from "@/lib/crm";
import { TodayView, workspaceClass, type TodayData } from "@/components/crm/workspace-ui";
import { DataError } from "@/components/crm/ui";

export default async function HomePage() {
  const db = createClient(); const { data: { user } } = await db.auth.getUser(); if (!user) redirect("/login");
  const today = todayInBrazil(), owner = user.id;
  const [contacts, opportunities, returns, overdue, review, tasks, steps, submissions, fresh, conversation, proposal, won] = await Promise.all([
    db.from("contacts").select("id", { count: "exact", head: true }).eq("profile_id", owner).neq("stage", "archived"),
    db.from("opportunities").select("id", { count: "exact", head: true }).eq("profile_id", owner).in("stage", ["new", "conversation", "proposal"]),
    db.from("client_tasks").select("id", { count: "exact", head: true }).eq("profile_id", owner).is("completed_at", null),
    db.from("client_tasks").select("id", { count: "exact", head: true }).eq("profile_id", owner).is("completed_at", null).lt("due_date", today),
    db.from("clients").select("id", { count: "exact", head: true }).eq("profile_id", owner).in("status", ["Pronto", "Revisão Pendente"]),
    db.from("client_tasks").select("id, title, due_date, contact_id, contacts(name)").eq("profile_id", owner).is("completed_at", null).lte("due_date", today).order("due_date").order("id").limit(5),
    db.from("opportunities").select("id, next_step, next_date, contacts(name)").eq("profile_id", owner).in("stage", ["new", "conversation", "proposal"]).lte("next_date", today).order("next_date").order("id").limit(5),
    db.from("clients").select("id, name, created_at, forms(title)", { count: "exact" }).eq("profile_id", owner).is("contact_id", null).order("created_at", { ascending: false }).order("id").limit(4),
    ...["new", "conversation", "proposal", "won"].map(stage => db.from("opportunities").select("id", { count: "exact", head: true }).eq("profile_id", owner).eq("stage", stage)),
  ]);
  if ([contacts, opportunities, returns, overdue, review, tasks, steps, submissions, fresh, conversation, proposal, won].some(result => result.error)) return <main className={workspaceClass}><DataError /></main>;
  const relatedName = (value: unknown) => { const relation = (Array.isArray(value) ? value[0] : value) as { name?: string } | null; return relation?.name || "Cliente"; };
  const priorities = [
    ...(tasks.data || []).map(task => ({ id: task.id, name: relatedName(task.contacts), title: task.title as string, date: task.due_date as string, href: `/follow-ups?contact=${task.contact_id}#task-${task.id}`, kind: "Tarefa" })),
    ...(steps.data || []).map(step => ({ id: step.id, name: relatedName(step.contacts), title: step.next_step as string, date: step.next_date as string, href: `/pipeline/${step.id}`, kind: "Oportunidade" })),
  ].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)).slice(0, 5);
  const data: TodayData = {
    dateLabel: new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" }).format(new Date()),
    contacts: contacts.count || 0, opportunities: opportunities.count || 0, returns: returns.count || 0, overdue: overdue.count || 0, review: review.count || 0, incoming: submissions.count || 0,
    priorities: priorities.map(item => ({ ...item, due: formatDueDate(item.date), late: item.date < today })),
    submissions: (submissions.data || []).map(item => ({ id: item.id, name: item.name, title: ((Array.isArray(item.forms) ? item.forms[0] : item.forms) as { title?: string } | null)?.title || "Formulário", date: new Date(item.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) })),
    pipeline: [{ label: "Novos interessados", count: fresh.count || 0, color: "#0A9DAA" }, { label: "Em conversa", count: conversation.count || 0, color: "#3979CB" }, { label: "Proposta", count: proposal.count || 0, color: "#8570C4" }, { label: "Conquistados", count: won.count || 0, color: "#13997D" }],
  };
  return <TodayView data={data} />;
}
