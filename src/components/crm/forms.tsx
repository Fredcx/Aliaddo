"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, RotateCcw, Link2, Unlink } from "lucide-react";
import { saveContact, addTask, setTaskCompleted, linkSubmission } from "@/app/(dashboard)/clients/actions";
import { STAGES, type Contact, type ClientTask } from "@/lib/crm";

export const inputClass = "mt-1.5 w-full rounded-xl border border-[#E5E5EA] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0E9E82] focus:ring-2 focus:ring-[#0E9E82]/15";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#147D69] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#106653] disabled:opacity-50 disabled:cursor-wait";

// React 18 transitions do not stay pending across awaited server actions.
// Keep a synchronous lock as well as visible pending state to prevent duplicates.
function usePendingAction() {
  const [pending, setPending] = useState(false);
  const [networkError, setNetworkError] = useState("");
  const locked = useRef(false);
  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setNetworkError("");
    try { await action(); }
    catch { setNetworkError("Não foi possível confirmar a operação. Atualize a página antes de tentar novamente."); }
    finally { locked.current = false; setPending(false); }
  }
  return { pending, run, networkError };
}

export function ContactForm({ contact }: { contact?: Contact }) {
  const { pending, run, networkError } = usePendingAction();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  return (
    <form onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      setMessage("");
      void run(async () => {
        const result = await saveContact(contact?.id || null, data);
        setError(Boolean(result.error));
        setMessage(result.error || "Cadastro salvo.");
        if (result.id && !contact) router.push(`/clients/${result.id}`);
        else if (result.success) router.refresh();
      });
    }} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        <label className="block text-sm font-medium">Nome completo *
          <input name="name" required maxLength={160} autoComplete="name" defaultValue={contact?.name} className={inputClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">E-mail
            <input name="email" type="email" maxLength={254} autoComplete="email" defaultValue={contact?.email || ""} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Telefone / WhatsApp
            <input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+55 11 99999-9999" defaultValue={contact?.phone || ""} className={inputClass} />
          </label>
        </div>
        <label className="block text-sm font-medium">Etapa do relacionamento
          <select name="stage" defaultValue={contact?.stage || "lead"} className={inputClass}>
            {Object.entries(STAGES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Notas internas
          <textarea name="notes" rows={4} maxLength={10000} defaultValue={contact?.notes || ""} placeholder="Contexto, preferências e combinados para o próximo atendimento." className={inputClass} />
          <span className="mt-1 block text-xs font-normal text-gray-500">Visíveis apenas na sua conta. Não são enviadas ao cliente nem à IA.</span>
        </label>
      </fieldset>
      {(networkError || message) && <p role={networkError || error ? "alert" : "status"} className={`text-sm ${networkError || error ? "text-red-700" : "text-emerald-700"}`}>{networkError || message}</p>}
      <button disabled={pending} className={buttonClass}>{pending ? "Salvando…" : contact ? "Salvar cadastro" : "Criar cliente"}</button>
    </form>
  );
}

export function TaskForm({ contactId, today }: { contactId: string; today: string }) {
  const { pending, run, networkError } = usePendingAction();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  return <form ref={form} className="space-y-3" onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(""); setSaved(false);
    void run(async () => {
      const result = await addTask(contactId, data);
      if (result.error) setError(result.error);
      else { form.current?.reset(); setSaved(true); router.refresh(); }
    });
  }}>
    <fieldset disabled={pending} className="space-y-3">
      <label className="block text-sm font-medium">Próximo passo *
        <input name="title" required maxLength={200} placeholder="Ex.: combinar o próximo encontro" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">Data do retorno *
        <input name="due_date" type="date" required defaultValue={today} className={inputClass} />
      </label>
    </fieldset>
    {(networkError || error) && <p role="alert" className="text-sm text-red-700">{networkError || error}</p>}
    {saved && <p role="status" className="text-sm text-emerald-700">Retorno adicionado.</p>}
    <button disabled={pending} className={buttonClass}><Plus size={16} />{pending ? "Salvando…" : "Adicionar retorno"}</button>
  </form>;
}

export function TaskToggle({ task }: { task: ClientTask }) {
  const { pending, run, networkError } = usePendingAction();
  const [error, setError] = useState("");
  const router = useRouter();
  return <div>
    <button disabled={pending} onClick={() => {
      setError("");
      void run(async () => {
        const result = await setTaskCompleted(task.id, !task.completed_at);
        if (result.error) setError(result.error); else router.refresh();
      });
    }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
      aria-label={`${task.completed_at ? "Reabrir" : "Concluir"} retorno: ${task.title}`}>
      {task.completed_at ? <RotateCcw size={14} /> : <Check size={14} />}
      {pending ? "Salvando…" : task.completed_at ? "Reabrir" : "Concluir"}
    </button>
    {(networkError || error) && <p role="alert" className="mt-2 text-xs text-red-700">{networkError || error}</p>}
  </div>;
}

export function SubmissionLink({ contactId, submissionId, unlink = false }: { contactId: string; submissionId: string; unlink?: boolean }) {
  const { pending, run, networkError } = usePendingAction();
  const [error, setError] = useState("");
  const router = useRouter();
  return <div>
    <button disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-50" onClick={() => {
      setError("");
      void run(async () => {
        const result = await linkSubmission(contactId, submissionId, unlink);
        if (result.error) setError(result.error); else router.refresh();
      });
    }}>
      {unlink ? <Unlink size={14} /> : <Link2 size={14} />}
      {pending ? "Salvando…" : unlink ? "Desvincular" : "Vincular a este cliente"}
    </button>
    {(networkError || error) && <p role="alert" className="mt-2 text-xs text-red-700">{networkError || error}</p>}
  </div>;
}
