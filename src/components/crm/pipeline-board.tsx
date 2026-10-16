"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, CalendarDays, Circle } from "lucide-react";
import { SALES_STAGES, ORIGINS, currency, nextSalesStage, isOpenStage, type Opportunity, type SalesStage } from "@/lib/pipeline";
import { advanceOpportunity } from "@/app/(dashboard)/pipeline/actions";
import { formatDueDate } from "@/lib/crm";

export const stageColors: Record<SalesStage, string> = { new: "#0A9DAA", conversation: "#3979CB", proposal: "#8570C4", won: "#13997D", lost: "#7B8493" };
export function PipelineBoard({ items, today, onAdvance, onSelect }: { items: Opportunity[]; today: string; onAdvance?: (id: string) => void; onSelect?: (item: Opportunity) => void }) {
  return <div className="grid items-start gap-4 lg:grid-cols-3 xl:grid-cols-5" aria-label="Funil de oportunidades">{(Object.keys(SALES_STAGES) as SalesStage[]).map(stage => {
    const cards = items.filter(item => item.stage === stage);
    return <section key={stage} className="min-w-0 rounded-[18px] bg-[#F4F6F8]/80 p-3">
      <header className="mb-3 flex items-center gap-2.5 px-1 py-2"><span className="h-2 w-2 rounded-full" style={{ background: stageColors[stage] }} /><h2 className="text-xs font-semibold text-[#303846]">{SALES_STAGES[stage]}</h2><span className="ml-auto rounded-md bg-white/80 px-2 py-0.5 text-xs text-[#526071]">{cards.length}</span></header>
      <div className="space-y-3">{cards.length ? cards.map(item => <OpportunityCard key={item.id} item={item} today={today} onAdvance={onAdvance} onSelect={onSelect} />) : <div className="rounded-xl border border-dashed border-[#E3E7EC] px-4 py-8 text-center text-xs leading-relaxed text-[#526071]">Nenhuma oportunidade<br />nesta etapa.</div>}</div>
    </section>;
  })}</div>;
}
function OpportunityCard({ item, today, onAdvance, onSelect }: { item: Opportunity; today: string; onAdvance?: (id: string) => void; onSelect?: (item: Opportunity) => void }) {
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const locked = useRef(false), router = useRouter();
  const late = isOpenStage(item.stage) && item.next_date && item.next_date < today;
  const title = <><span className="break-words">{item.title}</span><ArrowUpRight size={14} className="mt-1 shrink-0 text-[#526071]" /></>;
  async function advance() {
    if (locked.current) return;
    if (onAdvance) { onAdvance(item.id); return; }
    locked.current = true; setPending(true); setError("");
    try { const result = await advanceOpportunity(item.id, item.stage, item.version); if (result.error) setError(result.error); else router.refresh(); }
    catch { setError("Não foi possível confirmar. Atualize a página antes de tentar novamente."); }
    finally { locked.current = false; setPending(false); }
  }
  return <article className="rounded-xl border border-[#E3E7EC] bg-white p-4 shadow-[0_2px_3px_rgba(26,52,35,0.02)]">
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#526071]">{ORIGINS[item.origin]}</p>
    {onSelect ? <button onClick={() => onSelect(item)} className="flex w-full justify-between gap-2 text-left text-sm font-semibold leading-relaxed text-[#303846]">{title}</button> : <Link href={`/pipeline/${item.id}`} className="flex justify-between gap-2 text-sm font-semibold leading-relaxed text-[#303846]">{title}</Link>}
    <p className="mt-1.5 truncate text-xs text-[#526071]">{item.contacts?.name || "Cliente"}</p>
    <p className="mt-5 text-sm font-medium text-[#303846]">{currency(item.amount_cents)}</p>
    {isOpenStage(item.stage) && <div className={`mt-4 rounded-lg px-2.5 py-2.5 ${late ? "bg-[#fff5eb] text-[#ae7747]" : "bg-[#F4F6F8] text-[#526071]"}`}><p className="break-words text-xs leading-relaxed">{item.next_step || "Definir próximo passo"}</p><div className="mt-1.5 flex items-center gap-1 text-xs"><CalendarDays size={11} />{item.next_date ? `${late ? "Atrasado · " : ""}${formatDueDate(item.next_date)}` : "Sem data definida"}</div></div>}
    {item.stage === "lost" && <p className="mt-3 break-words text-[11px] text-[#526071]">{item.lost_reason}</p>}
    <div className="mt-4 flex items-center justify-between border-t border-[#E3E7EC] pt-3"><span className="flex items-center gap-1.5 text-xs text-[#526071]"><Circle size={7} fill={stageColors[item.stage]} stroke="none" />{SALES_STAGES[item.stage]}</span>{nextSalesStage(item.stage) && <button disabled={pending} onClick={advance} aria-label={`Avançar ${item.title} para ${SALES_STAGES[nextSalesStage(item.stage)!]}`} className="flex items-center gap-1 text-xs font-semibold text-[#087F8C] disabled:opacity-40">{pending ? "Salvando…" : "Avançar"}<ArrowRight size={12} /></button>}</div>
    {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
  </article>;
}
