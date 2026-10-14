import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { searchTerm, todayInBrazil, pageNumber } from "@/lib/crm";
import { SALES_STAGES, isSalesStage, type Opportunity } from "@/lib/pipeline";
import { PipelineBoard } from "@/components/crm/pipeline-board";
import { DataError, Pagination } from "@/components/crm/ui";
import { WorkspaceHeader, workspaceClass, primaryButton } from "@/components/crm/workspace-ui";

export default async function PipelinePage({ searchParams }: { searchParams: { q?: string; stage?: string; page?: string } }) {
  const db = createClient(); const { data: { user } } = await db.auth.getUser(); if (!user) redirect("/login");
  const q = searchTerm(searchParams.q), page = pageNumber(searchParams.page);
  const stage = isSalesStage(searchParams.stage) ? searchParams.stage : "";
  let query = db.from("opportunities").select("*, contacts(name)", { count: "exact" }).eq("profile_id", user.id);
  if (q) query = query.ilike("title", `%${q}%`);
  if (stage) query = query.eq("stage", stage);
  const { data, error, count } = await query.order("updated_at", { ascending: false }).order("id").range((page - 1) * 30, page * 30 - 1);
  return <main className={workspaceClass}>
    <WorkspaceHeader eyebrow="Relacionamentos que crescem" title="Seu próximo cliente começa aqui." description="Acompanhe cada conversa, registre o interesse e deixe claro o próximo passo."><Link href="/pipeline/new" className={primaryButton}><Plus size={17} />Nova oportunidade</Link></WorkspaceHeader>
    <form action="/pipeline" className="mb-6 flex flex-wrap items-end gap-3"><label className="min-w-48 flex-1 text-xs text-[#788774]">Buscar por serviço ou interesse<input name="q" type="search" defaultValue={q} placeholder="Qual oportunidade você procura?" className="mt-2 block w-full rounded-xl border border-[#dfe5db] bg-white px-4 py-3 text-sm" /></label><label className="text-xs text-[#788774]">Etapa<select name="stage" defaultValue={stage} className="mt-2 block rounded-xl border border-[#dfe5db] bg-white px-4 py-3 text-sm"><option value="">Todas as etapas</option>{Object.entries(SALES_STAGES).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><button className="flex items-center gap-2 rounded-xl border border-[#dfe5db] bg-white px-4 py-3 text-sm"><Search size={15} />Filtrar</button></form>
    {error ? <DataError /> : <><p className="mb-4 text-xs text-[#889482]">{count || 0} oportunidades encontradas · Até 30 por página, das mais recentes às mais antigas.</p><PipelineBoard items={(data || []) as Opportunity[]} today={todayInBrazil()} /><Pagination page={page} count={count || 0} href={`/pipeline?q=${encodeURIComponent(q)}&stage=${stage}`} /></>}
  </main>;
}
