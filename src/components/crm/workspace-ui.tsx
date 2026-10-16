import Link from "next/link";
import { ArrowUpRight, ArrowRight, Plus, Users, GitBranch, ListTodo, FileText, Clock3, Inbox, CheckCheck } from "lucide-react";

export const primaryButton = "inline-flex items-center justify-center gap-2 rounded-full bg-[#17191F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#087F8C] disabled:cursor-wait disabled:opacity-50";
export const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-full border border-[#DCE2E8] bg-white px-5 py-3 text-sm font-medium text-[#303846] transition hover:border-[#087F8C] hover:bg-[#F0FAFB]";
export const workspaceClass = "mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10 lg:py-10";

export function WorkspaceHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-end justify-between gap-5"><div className="min-w-0">
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#087F8C]">{eyebrow}</p>
    <h1 className="text-[30px] font-semibold leading-tight tracking-[-.04em] text-[#17191F] sm:text-[38px]">{title}</h1>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#526071]">{description}</p>
  </div>{children && <div className="flex flex-wrap gap-2">{children}</div>}</header>;
}

export type TodayData = {
  dateLabel: string; contacts: number; opportunities: number; returns: number; review: number;
  overdue: number; incoming: number;
  priorities: { id: string; name: string; title: string; due: string; late: boolean; href: string; kind: string }[];
  submissions: { id: string; name: string; title: string; date: string }[];
  pipeline: { label: string; count: number; color: string }[];
};

export function TodayView({ data, href = (path: string) => path, onNewTask }: { data: TodayData; href?: (path: string) => string; onNewTask?: () => void }) {
  const metrics = [
    { label: "Documentos para revisar", value: data.review, icon: FileText, href: "/dashboard", caption: "Confira o rascunho antes da entrega" },
    { label: "Tarefas pendentes", value: data.returns, icon: ListTodo, href: "/follow-ups", caption: data.overdue ? `${data.overdue} com prazo vencido` : "Ações que você precisa realizar" },
    { label: "Oportunidades abertas", value: data.opportunities, icon: GitBranch, href: "/pipeline", caption: "Interesses e propostas em andamento" },
    { label: "Clientes", value: data.contacts, icon: Users, href: "/clients", caption: "Cadastros e histórico de relacionamento" },
  ];
  return <main className={workspaceClass}>
    <WorkspaceHeader eyebrow={data.dateLabel} title="Visão geral" description="Acompanhe seus formulários, cuide dos clientes e saiba o que fazer a seguir.">
      {onNewTask ? <button onClick={onNewTask} className={secondaryButton}><Plus size={17} />Nova tarefa</button> : <Link href={href("/follow-ups/new")} className={secondaryButton}><Plus size={17} />Nova tarefa</Link>}
      <Link href={href("/forms")} className={primaryButton}><FileText size={17} />Meus formulários</Link>
    </WorkspaceHeader>
    <section aria-label="Resumo da operação" className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {metrics.map(metric => <Link key={metric.label} href={href(metric.href)} className="workspace-card group p-4 transition hover:border-[#087F8C]/40 sm:p-5">
        <div className="mb-4 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F8FA] text-[#087F8C]"><metric.icon size={18} /></span><ArrowUpRight size={16} className="text-[#64748B] group-hover:text-[#087F8C]" /></div>
        <strong className="text-[32px] font-semibold leading-none tracking-tight text-[#17191F]">{metric.value.toLocaleString("pt-BR")}</strong>
        <p className="mt-3 text-sm font-medium text-[#303846]">{metric.label}</p><p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">{metric.caption}</p>
      </Link>)}
    </section>
    <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <section className="workspace-card overflow-hidden">
          <div className="border-b border-[#EDF0F3] px-6 py-5"><h2 className="text-lg font-semibold">O que fazer hoje</h2><p className="mt-1 text-sm text-[#64748B]">Tarefas e ações de oportunidades com prazo até hoje.</p></div>
          {data.priorities.length ? <div className="px-6">{data.priorities.map(item => <Link key={item.id} href={href(item.href)} className="group flex items-start gap-4 border-b border-[#EDF0F3] py-5 last:border-0">
            <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.late ? "bg-amber-50 text-amber-700" : "bg-[#E8F8FA] text-[#087F8C]"}`}><Clock3 size={17} /></span>
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-[#303846]">{item.title}</p><p className="mt-1 text-xs text-[#64748B]">{item.name} · {item.kind}</p><p className={`mt-2 text-xs ${item.late ? "text-amber-700" : "text-[#526071]"}`}>{item.late ? "Prazo vencido" : "Para hoje"} · {item.due}</p><p className="mt-2 text-xs font-medium text-[#087F8C]">{item.kind === "Tarefa" ? "Ver tarefa" : "Ver oportunidade"} →</p></div>
          </Link>)}</div> : <div className="px-6 py-10"><CheckCheck size={26} className="mb-3 text-[#087F8C]" /><h3 className="font-medium">Nenhuma ação pendente para hoje.</h3><p className="mt-2 text-sm text-[#64748B]">Crie uma tarefa quando combinar algo com um cliente.</p></div>}
          <Link href={href("/follow-ups")} className="flex items-center justify-between border-t border-[#EDF0F3] px-6 py-4 text-sm font-medium text-[#087F8C]">Ver todas as tarefas<ArrowRight size={16} /></Link>
        </section>
        <section className="workspace-card p-6">
          <h2 className="text-lg font-semibold">Respostas de formulários</h2><p className="mb-4 mt-1 text-sm leading-relaxed text-[#64748B]">{data.incoming} sem cliente associado. A associação é opcional e organiza o histórico da pessoa.</p>
          {data.submissions.length ? data.submissions.map(item => <div key={item.id} className="border-t border-[#EDF0F3] py-4">
            <p className="break-words text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#64748B]">{item.title} · {item.date}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2"><Link href={href("/dashboard")} className="text-xs font-medium text-[#087F8C]">Ver respostas →</Link><Link href={href(`/pipeline/intake/${item.id}`)} className="text-xs font-medium text-[#526071]">Criar oportunidade →</Link></div>
          </div>) : <div className="flex items-center gap-3 py-4 text-sm text-[#64748B]"><Inbox size={20} /><p>Nenhuma resposta sem cliente associado.</p></div>}
          <Link href={href("/dashboard")} className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#087F8C]">Abrir respostas e entregas<ArrowRight size={15} /></Link>
        </section>
      </div>
      <div className="space-y-6">
        <section className="rounded-3xl bg-[#17191F] p-6 text-white shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#53D6CD]">Comece por aqui</p><h2 className="text-2xl font-semibold tracking-tight">Do formulário à entrega.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#C9D2DD]">Seu fluxo de atendimento continua o mesmo. A gestão ajuda você a acompanhar cada pessoa.</p>
          <ol className="mt-5 space-y-4">{[{ title: "Crie e compartilhe", text: "Escolha as perguntas do formulário.", path: "/forms" }, { title: "Revise a resposta", text: "Confira e edite o documento preparado pela IA.", path: "/dashboard" }, { title: "Acompanhe o cliente", text: "Guarde o histórico e crie uma tarefa, se precisar.", path: "/clients" }].map((step, i) => <li key={step.path}><Link href={href(step.path)} className="flex gap-3 rounded-xl py-1"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#53D6CD]/15 text-xs font-semibold text-[#53D6CD]">{i + 1}</span><div><p className="text-sm font-medium">{step.title} →</p><p className="mt-1 text-xs leading-relaxed text-[#C9D2DD]">{step.text}</p></div></Link></li>)}</ol>
          <Link href={href("/guide")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#53D6CD] px-4 py-2.5 text-sm font-semibold text-[#17191F]">Entender cada área<ArrowRight size={16} /></Link>
        </section>
        <section className="workspace-card p-6"><h2 className="text-lg font-semibold">Suas oportunidades</h2><p className="mb-5 mt-1 text-sm text-[#64748B]">Acompanhe quem tem interesse em contratar.</p>
          <div className="space-y-4">{data.pipeline.map(item => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span className="text-[#526071]">{item.label}</span><strong className="font-semibold">{item.count}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-[#EDF0F3]"><div className="h-full rounded-full" style={{ background: item.color, width: `${Math.min(100, item.count / Math.max(1, ...data.pipeline.map(p => p.count)) * 100)}%` }} /></div></div>)}</div>
          <Link href={href("/pipeline")} className="mt-6 flex justify-between border-t border-[#EDF0F3] pt-4 text-sm font-medium text-[#087F8C]">Abrir funil de oportunidades<ArrowUpRight size={16} /></Link>
        </section>
      </div>
    </div>
  </main>;
}
