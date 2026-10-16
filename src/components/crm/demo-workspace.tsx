"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, X, ArrowUpRight, Search, Check, RotateCcw, FileText, Users } from "lucide-react";
import AppSidebar from "@/components/app-sidebar";
import { TodayView, WorkspaceHeader, workspaceClass, primaryButton, secondaryButton, type TodayData } from "./workspace-ui";
import { PipelineBoard, stageColors } from "./pipeline-board";
import { OpportunityForm } from "./opportunity-form";
import { SALES_STAGES, nextSalesStage, isOpenStage, parseOpportunity, type Opportunity, type SalesStage } from "@/lib/pipeline";
import { STAGES, formatDueDate, parseContact, parseTask, type Contact } from "@/lib/crm";
import { inputClass, TaskForm } from "./forms";
import { WorkspaceGuide } from "./guide";

const initialContacts: Contact[] = [
  { id: "c1", name: "Marina Oliveira", email: "marina@example.com", phone: "", stage: "active", notes: "Prefere encontros pela manhã. Busca acompanhamento contínuo." },
  { id: "c2", name: "Rafael Mendes", email: "rafael@example.com", phone: "", stage: "lead", notes: "Interesse em organizar a rotina do negócio." },
  { id: "c3", name: "Beatriz Costa", email: "beatriz@example.com", phone: "", stage: "active", notes: "Combinar os objetivos do próximo ciclo." },
  { id: "c4", name: "Lucas Almeida", email: "lucas@example.com", phone: "", stage: "lead", notes: "Chegou por indicação de um cliente." },
  { id: "c5", name: "Camila Santos", email: "camila@example.com", phone: "", stage: "active", notes: "Acompanhamento mensal contratado." },
];
function initialOpportunities(today: string): Opportunity[] {
  return [
    { id: "o1", contact_id: "c2", title: "Consultoria para o negócio", stage: "new", origin: "form", amount_cents: null, next_step: "Entender o momento do negócio", next_date: today },
    { id: "o2", contact_id: "c4", title: "Primeiro atendimento", stage: "new", origin: "referral", amount_cents: 35000, next_step: "Apresentar como funciona", next_date: today },
    { id: "o3", contact_id: "c1", title: "Acompanhamento trimestral", stage: "conversation", origin: "whatsapp", amount_cents: 180000, next_step: "Conversar sobre os objetivos", next_date: today },
    { id: "o4", contact_id: "c3", title: "Novo ciclo de acompanhamento", stage: "proposal", origin: "manual", amount_cents: 240000, next_step: "Retomar a proposta enviada", next_date: today },
    { id: "o5", contact_id: "c5", title: "Plano de acompanhamento", stage: "won", origin: "form", amount_cents: 120000, next_step: "", next_date: null },
  ].map(item => ({ ...item, stage: item.stage as SalesStage, origin: item.origin as Opportunity["origin"], notes: "", lost_reason: "", version: 1, source_submission_id: null }));
}

export function DemoWorkspace({ view, today }: { view: string; today: string }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [opportunities, setOpportunities] = useState(() => initialOpportunities(today));
  const yesterday = new Date(Date.parse(`${today}T12:00:00Z`) - 86400000).toISOString().slice(0, 10);
  const [tasks, setTasks] = useState([{ id: "t1", contact_id: "c1", title: "Retomar os objetivos do acompanhamento", date: yesterday, completed: false }, { id: "t2", contact_id: "c3", title: "Preparar o próximo encontro", date: today, completed: false }, { id: "t3", contact_id: "c5", title: "Conferir o retorno da última entrega", date: today, completed: false }]);
  const [editor, setEditor] = useState<Opportunity | "new" | "contact" | "task" | null>(null);
  const [contactDetail, setContactDetail] = useState<Contact | null>(null);
  const [contactTab, setContactTab] = useState("overview");
  const [message, setMessage] = useState(""), [q, setQ] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogOpen = Boolean(editor || contactDetail);
  useEffect(() => { if (dialogOpen) dialog.current?.showModal(); else dialog.current?.close(); }, [dialogOpen]);
  const active = ["home", "pipeline", "clients", "follow-ups", "forms", "guide"].includes(view) ? view : "home";
  const items = opportunities.map(item => ({ ...item, contacts: contacts.find(contact => contact.id === item.contact_id) || null }));
  function href(path: string) {
    if (path.startsWith("/pipeline")) return "/demo?view=pipeline";
    if (path.startsWith("/clients")) return "/demo?view=clients";
    if (path.startsWith("/follow-ups")) return `/demo?view=follow-ups${path.includes("#") ? "#" + path.split("#")[1] : ""}`;
    if (path === "/guide") return "/demo?view=guide";
    if (path === "/forms") return "/demo?view=forms";
    return "/login";
  }
  const pending = tasks.filter(task => !task.completed);
  const stages = ["new", "conversation", "proposal", "won"] as SalesStage[];
  const data: TodayData = {
    dateLabel: "Um novo jeito de cuidar do seu negócio", contacts: contacts.length,
    opportunities: items.filter(item => isOpenStage(item.stage)).length, returns: pending.length, overdue: pending.filter(task => task.date < today).length, review: 2, incoming: 2,
    priorities: pending.filter(task => task.date <= today).sort((a, b) => a.date.localeCompare(b.date)).map(task => ({ id: task.id, name: contacts.find(contact => contact.id === task.contact_id)?.name || "Cliente", title: task.title, due: formatDueDate(task.date), late: task.date < today, href: `/follow-ups#task-${task.id}`, kind: "Tarefa" })),
    submissions: [{ id: "sample1", name: "Juliana Ferreira", title: "Formulário de interesse", date: formatDueDate(today) }, { id: "sample2", name: "Pedro Lima", title: "Primeiro atendimento", date: formatDueDate(today) }],
    pipeline: stages.map(stage => ({ label: SALES_STAGES[stage], count: items.filter(item => item.stage === stage).length, color: stageColors[stage] })),
  };
  function closeDialog() { setEditor(null); setContactDetail(null); setContactTab("overview"); }
  return <div className="workspace-shell flex flex-col md:flex-row">
    <AppSidebar demo demoView={active} />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E7EC] bg-[#F4F6F8] px-5 py-2.5 text-[11px] text-[#526071]"><p><strong className="font-semibold">Demonstração interativa</strong><span className="mx-2 opacity-40">/</span>Dados fictícios. As alterações reiniciam ao recarregar.</p><Link href="/login" className="flex items-center gap-1 font-semibold">Abrir meu Aliaddo<ArrowUpRight size={13} /></Link></div>
      {message && <div role="status" className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#F4F6F8] px-4 py-3 text-xs text-[#526071]">{message}<button onClick={() => setMessage("")} aria-label="Fechar mensagem"><X size={15} /></button></div>}
      {active === "home" && <TodayView data={data} href={href} onNewTask={() => setEditor("task")} />}
      {active === "guide" && <WorkspaceGuide href={href} />}
      {active === "pipeline" && <main className={workspaceClass}><WorkspaceHeader eyebrow="Gestão · Funil comercial" title="Oportunidades" description="Acompanhe o interesse em contratar um serviço. Cada cartão representa uma negociação, não um formulário nem uma tarefa."><button className={primaryButton} onClick={() => setEditor("new")}><Plus size={17} />Nova oportunidade</button></WorkspaceHeader>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#526071]">{items.length} oportunidades · Experimente avançar uma etapa ou editar um cartão.</p><label className="flex items-center gap-2 rounded-xl border border-[#E3E7EC] bg-white px-3 py-2.5"><Search size={15} className="text-[#526071]" /><input aria-label="Buscar oportunidade na demonstração" value={q} onChange={event => setQ(event.target.value)} placeholder="Buscar oportunidade" className="min-w-0 bg-transparent text-xs outline-none" /></label></div>
        <PipelineBoard items={items.filter(item => `${item.title} ${item.contacts?.name}`.toLowerCase().includes(q.toLowerCase()))} today={today} onSelect={setEditor} onAdvance={id => { setOpportunities(current => current.map(item => item.id === id ? { ...item, stage: nextSalesStage(item.stage) || item.stage, version: item.version + 1 } : item)); setMessage("Etapa atualizada nesta demonstração."); }} />
      </main>}
      {active === "clients" && <main className={workspaceClass}><WorkspaceHeader eyebrow="Gestão" title="Clientes" description="Uma ficha para cada pessoa, com dados, notas e histórico. Você pode cadastrar clientes mesmo sem um formulário."><button className={primaryButton} onClick={() => setEditor("contact")}><Plus size={17} />Novo cliente</button></WorkspaceHeader><section className="rounded-[22px] border border-[#E3E7EC] bg-white p-3 sm:p-6">{contacts.map(contact => <button key={contact.id} onClick={() => setContactDetail(contact)} className="flex w-full flex-wrap items-center gap-4 rounded-xl border-b border-[#E3E7EC] px-3 py-5 text-left last:border-0 hover:bg-[#F4F6F8]"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F6F8] text-sm font-medium text-[#526071]">{contact.name.split(" ").map(name => name[0]).slice(0, 2).join("")}</span><span className="min-w-0 flex-1 basis-40"><strong className="block text-sm font-medium text-[#303846]">{contact.name}</strong><span className="mt-1 block truncate text-xs text-[#526071]">{contact.email || "E-mail não informado"}</span></span><span className="rounded-full bg-[#F4F6F8] px-3 py-1.5 text-[10px] text-[#526071]">{STAGES[contact.stage]}</span><ArrowUpRight size={16} className="text-[#526071]" /></button>)}</section></main>}
      {active === "follow-ups" && <main className={workspaceClass}><WorkspaceHeader eyebrow="Gestão" title="Tarefas" description="Ações para você realizar: ligar, revisar uma proposta ou combinar o próximo contato."><button className={primaryButton} onClick={() => setEditor("task")}><Plus size={17} />Nova tarefa</button></WorkspaceHeader><p className="mb-6 rounded-2xl border border-[#BCE5E8] bg-[#E8F8FA] px-5 py-4 text-sm leading-relaxed text-[#526071]">Escolha uma ação e um prazo. Depois de realizá-la, marque como concluída. Tarefas não reservam horários nem enviam mensagens automaticamente.</p><section className="rounded-[22px] border border-[#E3E7EC] bg-white p-6">{tasks.map(task => <div key={task.id} id={`task-${task.id}`} className="workspace-task scroll-mt-28 flex flex-wrap items-center justify-between gap-4 border-b border-[#E3E7EC] py-5 last:border-0"><div><p className={`text-sm font-medium text-[#303846] ${task.completed ? "line-through opacity-50" : ""}`}>{task.title}</p><p className="mt-1.5 text-xs text-[#526071]">{contacts.find(contact => contact.id === task.contact_id)?.name} · {formatDueDate(task.date)}</p></div><button className={secondaryButton} onClick={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item))}>{task.completed ? <RotateCcw size={14} /> : <Check size={14} />}{task.completed ? "Reabrir" : "Concluir"}</button></div>)}</section></main>}
      {active === "forms" && <main className={workspaceClass}><WorkspaceHeader eyebrow="Atendimento" title="Formulários" description="Crie as perguntas e compartilhe o link. Os preenchimentos chegam em Respostas e entregas."><Link className={primaryButton} href="/forms">Gerenciar meus formulários<ArrowUpRight size={16} /></Link></WorkspaceHeader><div className="grid gap-5 sm:grid-cols-2">{[{ title: "Primeiro atendimento", fields: "Objetivos, rotina e expectativas", icon: Users }, { title: "Briefing de consultoria", fields: "Contexto, desafios e prioridades", icon: FileText }].map(form => <article key={form.title} className="rounded-[22px] border border-[#E3E7EC] bg-white p-6"><form.icon size={22} className="mb-6 text-[#526071]" /><p className="mb-2 text-[10px] uppercase tracking-wider text-[#526071]">Exemplo de formulário</p><h2 className="text-lg font-medium text-[#303846]">{form.title}</h2><p className="mt-3 text-sm text-[#526071]">{form.fields}</p><div className="mt-6 border-t border-[#E3E7EC] pt-4 text-xs text-[#526071]">Formulário → resposta → revisão → entrega</div></article>)}</div></main>}
    </div>
    <dialog aria-labelledby="demo-dialog-title" ref={dialog} onCancel={closeDialog} onClose={closeDialog} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[#E3E7EC] bg-white p-6 text-[#303846] shadow-xl backdrop:bg-[#17191F]/40">
      <div className="mb-6 flex items-center justify-between gap-3"><h2 id="demo-dialog-title" className="text-xl font-semibold">{contactDetail ? contactDetail.name : editor === "task" ? "Nova tarefa" : editor === "contact" ? "Novo cliente" : editor === "new" ? "Nova oportunidade" : "Editar oportunidade"}</h2><button onClick={closeDialog} aria-label="Fechar detalhes" className="rounded-lg p-2 hover:bg-gray-50"><X size={20} /></button></div>
      <p className="mb-5 text-xs text-[#526071]">Você está explorando uma demonstração com dados fictícios.</p>
      {contactDetail ? <>
        <nav aria-label="Áreas da ficha de exemplo" className="mb-5 flex flex-wrap gap-1 rounded-2xl bg-[#E9EDF1] p-1">{Object.entries({ overview: "Resumo", tasks: "Tarefas", responses: "Respostas de formulários" }).map(([value,label]) => <button key={value} className="workspace-tab" aria-current={contactTab === value ? "page" : undefined} onClick={() => setContactTab(value)}>{label}</button>)}</nav>
        {contactTab === "overview" && <><p className="text-sm text-[#526071]">{contactDetail.email}</p><div className="my-5 rounded-xl bg-[#F4F6F8] p-4 text-sm leading-relaxed">{contactDetail.notes || "Sem notas registradas."}</div><h3 className="mb-3 text-sm font-semibold">Oportunidades deste cliente</h3>{items.filter(item => item.contact_id === contactDetail.id).map(item => <button key={item.id} className="block w-full border-t py-3 text-left text-sm text-[#087F8C]" onClick={() => { setContactDetail(null); setEditor(item); }}>{item.title} ↗</button>)}</>}
        {contactTab === "tasks" && <><p className="mb-4 text-sm text-[#526071]">Ações para realizar por este cliente. Não são agendamentos.</p>{tasks.filter(task => task.contact_id === contactDetail.id).map(task => <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 border-t py-4"><div><p className="text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-[#64748B]">{task.completed ? "Concluída" : "Prazo"} · {formatDueDate(task.date)}</p></div><button className={secondaryButton} onClick={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item))}>{task.completed ? "Reabrir" : "Concluir"}</button></div>)}{!tasks.some(task => task.contact_id === contactDetail.id) && <p className="text-sm text-[#64748B]">Nenhuma tarefa para este cliente de exemplo.</p>}</>}
        {contactTab === "responses" && <><p className="mb-5 text-sm leading-relaxed text-[#526071]">Aqui ficam os preenchimentos recebidos que você escolheu associar a esta pessoa. A associação é opcional e não envia um formulário.</p><p className="rounded-xl bg-[#F4F6F8] p-4 text-sm text-[#64748B]">Nenhum preenchimento associado a esta ficha de demonstração.</p><Link href="/clients" className="mt-4 block text-sm font-medium text-[#087F8C]">Ver respostas na minha conta →</Link></>}
      </> : editor === "task" ? <TaskForm today={today} contacts={contacts} onSave={async (contactId, form) => { try { const values = parseTask(form); if (!contacts.some(contact => contact.id === contactId)) return { error: "Selecione um cliente." }; setTasks(current => [...current, { id: crypto.randomUUID(), contact_id: contactId, title: values.title, date: values.due_date, completed: false }]); closeDialog(); setMessage("Tarefa criada nesta demonstração."); return { success: true }; } catch (error) { return { error: error instanceof Error ? error.message : "Confira os campos." }; } }} /> : editor === "contact" ? <form className="space-y-4" onSubmit={event => { event.preventDefault(); try { const contact = parseContact(new FormData(event.currentTarget)); setContacts(current => [...current, { ...contact, id: crypto.randomUUID() }]); setMessage("Cliente adicionado à demonstração."); closeDialog(); } catch (error) { setMessage(error instanceof Error ? error.message : "Confira os campos."); } }}><label className="block text-sm">Nome *<input name="name" required maxLength={160} className={inputClass} /></label><label className="block text-sm">E-mail<input name="email" type="email" maxLength={254} className={inputClass} /></label><label className="block text-sm">Notas<textarea name="notes" maxLength={5000} className={inputClass} /></label><button className={primaryButton}>Criar cliente de exemplo</button></form> : editor && <OpportunityForm key={typeof editor === "object" ? editor.id : "new"} contacts={contacts} item={typeof editor === "object" ? editor : undefined} onSave={async form => { try { const values = parseOpportunity(form); const id = typeof editor === "object" ? editor.id : crypto.randomUUID(); const contact_id = form.get("contact_id") as string; if (!contacts.some(contact => contact.id === contact_id)) return { error: "Selecione um cliente." }; setOpportunities(current => typeof editor === "object" ? current.map(item => item.id === id ? { ...item, ...values, version: item.version + 1 } : item) : [...current, { ...values, id, contact_id, version: 1, source_submission_id: null }]); closeDialog(); setMessage("Oportunidade salva nesta demonstração."); return { success: true }; } catch (error) { return { error: error instanceof Error ? error.message : "Confira os campos." }; } }} />}
    </dialog>
  </div>;
}
