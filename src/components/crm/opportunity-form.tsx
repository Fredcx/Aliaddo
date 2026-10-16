"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOpportunity, convertSubmission } from "@/app/(dashboard)/pipeline/actions";
import { ORIGINS, SALES_STAGES, type Opportunity } from "@/lib/pipeline";
import { type ActionResult } from "@/lib/crm";
import { inputClass } from "./forms";
import { primaryButton } from "./workspace-ui";

export type ContactOption = { id: string; name: string };
export function OpportunityForm({ contacts, item, selectedContact, onSave }: { contacts: ContactOption[]; item?: Opportunity; selectedContact?: string; onSave?: (data: FormData) => Promise<ActionResult> }) {
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const [stage, setStage] = useState(item?.stage || "new");
  const locked = useRef(false), router = useRouter();
  return <form className="space-y-5" onSubmit={async event => {
    event.preventDefault(); if (locked.current) return;
    const data = new FormData(event.currentTarget); locked.current = true; setPending(true); setError("");
    try {
      const result = onSave ? await onSave(data) : await saveOpportunity(item?.id || null, data);
      if (result.error) setError(result.error);
      else if (!onSave) { router.push("/pipeline"); router.refresh(); }
    } catch { setError("Não foi possível confirmar. Atualize a página antes de tentar novamente."); }
    finally { locked.current = false; setPending(false); }
  }}>
    <input type="hidden" name="version" value={item?.version || 1} />
    <fieldset disabled={pending} className="space-y-5">
      <label className="block text-sm font-medium">Cliente *
        {item ? <><input type="hidden" name="contact_id" value={item.contact_id} /><span className={`${inputClass} block bg-gray-50`}>{item.contacts?.name || contacts.find(c => c.id === item.contact_id)?.name}</span></> : <select name="contact_id" required defaultValue={selectedContact || ""} className={inputClass}><option value="">Selecione um cliente</option>{contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select>}
      </label>
      <label className="block text-sm font-medium">Serviço ou interesse *<input name="title" required maxLength={160} defaultValue={item?.title} placeholder="Ex.: acompanhamento mensal ou consultoria inicial" className={inputClass} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Etapa<select name="stage" value={stage} onChange={event => setStage(event.target.value as Opportunity["stage"])} className={inputClass}>{Object.entries(SALES_STAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="block text-sm font-medium">Origem<select name="origin" defaultValue={item?.origin || "manual"} className={inputClass}>{Object.entries(ORIGINS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      {stage === "lost" && <label className="block text-sm font-medium">Motivo do encerramento *<textarea name="lost_reason" required maxLength={500} defaultValue={item?.lost_reason} placeholder="Ex.: não é o momento, mudou de prioridade…" className={inputClass} /></label>}
      <label className="block text-sm font-medium">Valor estimado (R$)<input name="amount" inputMode="decimal" maxLength={16} defaultValue={item?.amount_cents === null || item?.amount_cents === undefined ? "" : (item.amount_cents / 100).toFixed(2).replace(".", ",")} placeholder="Ex.: 1500,00" className={inputClass} /><span className="mt-1 block text-xs font-normal text-gray-500">Opcional. Valor previsto para a oportunidade, sem registro de cobrança.</span></label>
      <div className="rounded-xl bg-[#F4F6F8] p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#526071]">O que acontece depois?</p>
        <label className="block text-sm font-medium">Próximo passo<input name="next_step" maxLength={200} defaultValue={item?.next_step} placeholder="Ex.: apresentar a proposta de acompanhamento" className={inputClass} /></label>
        <label className="mt-3 block text-sm font-medium">Data combinada<input name="next_date" type="date" defaultValue={item?.next_date || ""} className={inputClass} /></label>
        <p className="mt-2 text-xs text-[#526071]">Preencha os dois campos ou deixe ambos em branco. Datas no horário de Brasília.</p>
      </div>
      <label className="block text-sm font-medium">Notas da oportunidade<textarea name="notes" rows={3} maxLength={5000} defaultValue={item?.notes} placeholder="Necessidades, preferências e o que ficou combinado." className={inputClass} /></label>
    </fieldset>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={pending || !contacts.length} className={primaryButton}>{pending ? "Salvando…" : item ? "Salvar oportunidade" : "Criar oportunidade"}</button>
  </form>;
}

export function IntakeConversion({ submissionId, contacts, linkedContactId }: { submissionId: string; contacts: ContactOption[]; linkedContactId: string | null }) {
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const locked = useRef(false), router = useRouter();
  return <form className="space-y-5" onSubmit={async event => {
    event.preventDefault(); if (locked.current) return;
    const selected = new FormData(event.currentTarget).get("contact_id") as string;
    locked.current = true; setPending(true); setError("");
    try { const result = await convertSubmission(submissionId, selected || null); if (result.error) setError(result.error); else { router.push(`/pipeline/${result.id}`); router.refresh(); } }
    catch { setError("Não foi possível confirmar. Atualize a página antes de tentar novamente."); }
    finally { locked.current = false; setPending(false); }
  }}>
    <label className="block text-sm font-medium">A quem pertence esta resposta?
      <select disabled={pending} name="contact_id" defaultValue={linkedContactId || ""} className={inputClass}>
        {!linkedContactId && <option value="">Criar novo cliente com os dados desta resposta</option>}
        {contacts.filter(contact => !linkedContactId || contact.id === linkedContactId).map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
      </select>
    </label>
    <p className="text-sm leading-relaxed text-gray-500">Confira a identidade antes de confirmar. Vamos vincular a resposta ao cadastro escolhido e criar uma oportunidade. O documento e as respostas permanecem preservados.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={pending} className={primaryButton}>{pending ? "Adicionando…" : "Confirmar e adicionar ao funil"}</button>
  </form>;
}
