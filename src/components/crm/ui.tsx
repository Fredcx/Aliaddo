import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { STAGES, formatDueDate, type ClientTask, type ContactStage } from "@/lib/crm";
import { TaskToggle } from "./forms";

export const panelClass = "rounded-2xl border border-[#E5E5EA] bg-white p-5 sm:p-6";

export function StageBadge({ stage }: { stage: ContactStage }) {
  const colors = { lead: "bg-blue-50 text-blue-700", active: "bg-emerald-50 text-emerald-800", paused: "bg-amber-50 text-amber-800", archived: "bg-gray-100 text-gray-600" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors[stage]}`}>{STAGES[stage]}</span>;
}

export function DataError() {
  return <div role="alert" className={`${panelClass} flex items-start gap-3 text-amber-900`}>
    <AlertCircle size={20} className="shrink-0" />
    <div><h2 className="font-semibold">Não foi possível carregar a gestão de clientes</h2>
      <p className="mt-1 text-sm">Tente atualizar a página. Se for o primeiro acesso à nova versão, a configuração da gestão de clientes precisa ser concluída pelo administrador.</p>
    </div>
  </div>;
}

export function Pagination({ page, count, href, pageParam = "page" }: { page: number; count: number; href: string; pageParam?: string }) {
  const pages = Math.max(1, Math.ceil(count / 30));
  return <nav aria-label="Paginação" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
    <span>{count} registro{count !== 1 ? "s" : ""} · Página {page} de {pages}</span>
    <div className="flex gap-4">
      {page > 1 && <Link className="inline-flex items-center gap-1" href={`${href}&${pageParam}=${page - 1}`}><ArrowLeft size={15} />Anterior</Link>}
      {page < pages && <Link className="inline-flex items-center gap-1" href={`${href}&${pageParam}=${page + 1}`}>Próxima<ArrowRight size={15} /></Link>}
    </div>
  </nav>;
}

export function TaskRow({ task, today, name }: { task: ClientTask; today: string; name?: string }) {
  const late = !task.completed_at && task.due_date < today;
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 py-4 last:border-0">
    <div className="min-w-0 flex-1 basis-48">
      {name && <Link href={`/clients/${task.contact_id}`} className="text-xs font-medium text-[#147D69] hover:underline">{name}</Link>}
      <p className={`break-words text-sm font-medium ${task.completed_at ? "text-gray-500 line-through" : "text-gray-900"}`}>{task.title}</p>
      <p className={`mt-1 text-xs ${late ? "text-red-700" : "text-gray-500"}`}>
        {task.completed_at ? "Concluído" : late ? "Atrasado" : task.due_date === today ? "Hoje" : "Agendado"} · {formatDueDate(task.due_date)}
      </p>
    </div>
    <TaskToggle task={task} />
  </div>;
}
