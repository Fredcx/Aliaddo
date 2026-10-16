"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, RotateCcw, Link2, Unlink } from "lucide-react";
import { saveContact, addTask, setTaskCompleted, linkSubmission } from "@/app/(dashboard)/clients/actions";
import { STAGES, type Contact, type ClientTask, type ActionResult } from "@/lib/crm";
import { primaryButton } from "./workspace-ui";

export const inputClass = "mt-1.5 w-full rounded-xl border border-[#E5E5EA] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087F8C] focus:ring-2 focus:ring-[#087F8C]/15";
const buttonClass = primaryButton;

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
        <label className="block text-sm font-medium">Situação do cliente
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

export function TaskForm({ contactId, today, contacts, redirectOnSave = false, onSave }: { contactId?: string; today: string; contacts?: { id: string; name: string }[]; redirectOnSave?: boolean; onSave?: (contactId: string, data: FormData) => Promise<ActionResult> }) {
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
      const selectedContact = contactId || String(data.get("contact_id") || "");
      const result = onSave ? await onSave(selectedContact, data) : await addTask(selectedContact, data);
      if (result.error) setError(result.error);
      else { form.current?.reset(); setSaved(true); if (!onSave) { if (redirectOnSave) router.push(`/follow-ups?contact=${selectedContact}`); router.refresh(); } }
    });
  }}>
    <fieldset disabled={pending} className="space-y-3">
      {contacts && <label className="block text-sm font-medium">Cliente *<select name="contact_id" required defaultValue={contactId || ""} className={inputClass}><option value="">Selecione o cliente desta tarefa</option>{contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></label>}
      <label className="block text-sm font-medium">O que você precisa fazer? *
        <input name="title" required maxLength={200} placeholder="Ex.: ligar para combinar o próximo encontro" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">Prazo *
        <input name="due_date" type="date" required defaultValue={today} className={inputClass} />
      </label>
    </fieldset>
    {(networkError || error) && <p role="alert" className="text-sm text-red-700">{networkError || error}</p>}
    {saved && <p role="status" className="text-sm text-emerald-700">Tarefa criada.</p>}
    <button disabled={pending || Boolean(contacts && !contacts.length)} className={buttonClass}><Plus size={16} />{pending ? "Salvando…" : "Criar tarefa"}</button>
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
      aria-label={`${task.completed_at ? "Reabrir" : "Concluir"} tarefa: ${task.title}`}>
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
      {pending ? "Salvando…" : unlink ? "Remover associação" : "Associar resposta a este cliente"}
    </button>
    {(networkError || error) && <p role="alert" className="mt-2 text-xs text-red-700">{networkError || error}</p>}
  </div>;
}
