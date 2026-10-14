import Link from "next/link";
import { ArrowUpRight, ArrowRight, Plus, Users, GitBranch, CheckCheck, FileText, Sparkles, Clock3, Inbox } from "lucide-react";

export const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D69] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#106653] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:opacity-50";
export const secondaryButton = "inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-medium text-[#43524b] transition hover:bg-[#f4f7f5]";
export const workspaceClass = "mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-8 lg:px-10 lg:py-10";

export function WorkspaceHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-end justify-between gap-5"><div>
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-[#698174]">{eyebrow}</p>
    <h1 className="text-[30px] font-semibold leading-tight tracking-[-.04em] text-[#1b3329] sm:text-[36px]">{title}</h1>
    <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#78837d]">{description}</p>
  </div><div className="flex flex-wrap gap-2">{children}</div></header>;
}

export type TodayData = {
  dateLabel: string; contacts: number; opportunities: number; returns: number; review: number;
  overdue: number; incoming: number;
  priorities: { id: string; name: string; title: string; due: string; late: boolean; href: string; kind: string }[];
  submissions: { id: string; name: string; title: string; date: string }[];
  pipeline: { label: string; count: number; color: string }[];
};

export function TodayView({ data, href = (path: string) => path }: { data: TodayData; href?: (path: string) => string }) {
  const metrics = [
    { label: "Clientes na carteira", value: data.contacts, icon: Users, href: "/clients", caption: "Relacionamentos para cultivar" },
    { label: "Oportunidades abertas", value: data.opportunities, icon: GitBranch, href: "/pipeline", caption: "Do primeiro contato à conquista" },
    { label: "Retornos pendentes", value: data.returns, icon: CheckCheck, href: "/follow-ups", caption: data.overdue ? `${data.overdue} ${data.overdue === 1 ? "precisa" : "precisam"} de atenção` : "Cada combinado no seu tempo" },
    { label: "Entregas para revisar", value: data.review, icon: FileText, href: "/dashboard", caption: "Seu conhecimento, com sua aprovação" },
  ];
  return <main className={workspaceClass}>
    <WorkspaceHeader eyebrow={data.dateLabel} title="Seu dia, bem acompanhado." description="Clientes, oportunidades e próximos passos. Tudo o que merece sua atenção, em um só lugar.">
      <Link href={href("/clients/new")} className={secondaryButton}><Users size={16} />Novo cliente</Link>
      <Link href={href("/pipeline/new")} className={primaryButton}><Plus size={17} />Nova oportunidade</Link>
    </WorkspaceHeader>
    <section aria-label="Resumo da operação" className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(metric => <Link key={metric.label} href={href(metric.href)} className="group rounded-2xl border border-[#e5e9e5] bg-white px-5 py-5 transition hover:border-[#bed0c5] hover:shadow-sm">
        <div className="flex items-center justify-between text-[#718078]"><span className="text-xs font-medium">{metric.label}</span><metric.icon size={17} strokeWidth={1.5} /></div>
        <div className="my-3 flex items-end justify-between"><strong className="text-[32px] font-semibold leading-none tracking-tight text-[#213d30]">{metric.value.toLocaleString("pt-BR")}</strong><ArrowUpRight size={16} className="text-[#a3b2a9] group-hover:text-[#147D69]" /></div>
        <p className="text-[11px] text-[#8a948e]">{metric.caption}</p>
      </Link>)}
    </section>
    <div className="grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[22px] border border-[#e5e9e5] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1ed] px-6 py-5"><div><h2 className="font-semibold text-[#263c30]">Sua próxima atenção</h2><p className="mt-1 text-xs text-[#859087]">Ações vencidas e combinados para hoje</p></div><span className="rounded-full bg-[#eff4ed] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#64805b]">Prioridades</span></div>
          {data.priorities.length ? <div className="px-6">{data.priorities.map(item => <Link key={item.id} href={href(item.href)} className="group flex items-start gap-4 border-b border-[#eef1ed] py-5 last:border-0">
            <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.late ? "bg-[#fff3e7] text-[#af7541]" : "bg-[#edf5f0] text-[#4c8769]"}`}><Clock3 size={16} /></span>
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium text-[#2b4033]">{item.title}</p><p className="mt-1 text-xs text-[#8a938d]">{item.name} · {item.kind}</p><p className={`mt-2 text-[11px] ${item.late ? "text-[#ad7241]" : "text-[#718078]"}`}>{item.late ? "Atrasado" : "Hoje"} · {item.due}</p></div><ArrowUpRight size={16} className="mt-2 shrink-0 text-[#a8b5ac] group-hover:text-[#147D69]" />
          </Link>)}</div> : <div className="px-6 py-10"><CheckCheck size={26} className="mb-3 text-[#609477]" /><h3 className="text-sm font-medium">Tudo em dia por aqui.</h3><p className="mt-2 text-xs leading-relaxed text-[#859087]">Defina próximos passos nas oportunidades e retornos na ficha de cada cliente.</p></div>}
          <Link href={href("/follow-ups")} className="flex items-center justify-between border-t border-[#eef1ed] px-6 py-4 text-xs font-medium text-[#147D69]">Organizar meus retornos<ArrowRight size={15} /></Link>
        </section>
        <section className="rounded-[22px] border border-[#e5e9e5] bg-white p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold text-[#263c30]">Novas conexões</h2><span className="text-xs text-[#859087]">{data.incoming} sem vínculo</span></div>
          {data.submissions.length ? data.submissions.map(item => <div key={item.id} className="flex flex-wrap items-center gap-3 border-t border-[#eef1ed] py-4 first:border-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f0e8] text-xs font-medium text-[#8c846c]">{item.name.slice(0, 2).toUpperCase()}</span>
            <div className="min-w-0 flex-1 basis-40"><p className="truncate text-sm font-medium text-[#344839]">{item.name}</p><p className="mt-1 truncate text-xs text-[#92998f]">{item.title} · {item.date}</p></div>
            <Link href={href(`/pipeline/intake/${item.id}`)} className="text-xs font-semibold text-[#147D69]">Levar ao funil <span aria-hidden="true">↗</span></Link>
          </div>) : <div className="flex items-center gap-3 py-4 text-sm text-[#859087]"><Inbox size={20} /><p>As novas respostas dos seus formulários aparecem aqui.</p></div>}
          <Link href={href("/forms")} className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-[#147D69]">Meus formulários <ArrowRight size={14} /></Link>
        </section>
      </div>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[22px] bg-[#173e30] p-6 text-white">
          <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[28px] border-white/[.035]" />
          <div className="relative"><div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#c3d6c6]"><Sparkles size={16} />Um aliado na sua rotina</div><h2 className="max-w-xs text-[23px] font-medium leading-snug tracking-tight">Boas relações começam<br />com um próximo passo.</h2><p className="mt-3 max-w-xs text-xs leading-relaxed text-[#b7ccbd]">Registre o combinado, acompanhe cada oportunidade e mantenha seu cliente por perto.</p><Link href={href("/pipeline")} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#def0c8] px-4 py-2.5 text-xs font-semibold text-[#244d36]">Acompanhar meu funil <ArrowRight size={14} /></Link></div>
        </section>
        <section className="rounded-[22px] border border-[#e5e9e5] bg-white p-6"><div className="mb-6 flex justify-between"><h2 className="font-semibold text-[#263c30]">Seu funil em movimento</h2><GitBranch size={17} className="text-[#8da195]" /></div>
          <div className="space-y-5">{data.pipeline.map(item => <div key={item.label}><div className="mb-2 flex justify-between text-xs"><span className="text-[#7b887f]">{item.label}</span><strong className="font-medium text-[#425647]">{item.count}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-[#f2f4f0]"><div className="h-full rounded-full" style={{ background: item.color, width: `${Math.min(100, item.count / Math.max(1, ...data.pipeline.map(p => p.count)) * 100)}%` }} /></div></div>)}</div>
          <Link href={href("/pipeline")} className="mt-7 flex justify-between border-t border-[#eef1ed] pt-4 text-xs font-medium text-[#147D69]">Ver todas as oportunidades<ArrowUpRight size={15} /></Link>
        </section>
        <div className="flex items-start gap-3 px-1 text-xs leading-relaxed text-[#8b958c]"><FileText className="mt-0.5 shrink-0" size={17} /><p>Seus formulários continuam aqui. Transforme respostas em contexto, entregas e novos relacionamentos.</p></div>
      </div>
    </div>
  </main>;
}
