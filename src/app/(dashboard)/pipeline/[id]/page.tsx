import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isUUID } from "@/lib/crm";
import { type Opportunity } from "@/lib/pipeline";
import { OpportunityForm } from "@/components/crm/opportunity-form";
import { WorkspaceHeader, workspaceClass } from "@/components/crm/workspace-ui";
import { DataError, panelClass } from "@/components/crm/ui";

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  if (!isUUID(params.id)) notFound();
  const db = createClient(); const { data: { user } } = await db.auth.getUser(); if (!user) redirect("/login");
  const { data, error } = await db.from("opportunities").select("*, contacts(name)").eq("profile_id", user.id).eq("id", params.id).maybeSingle();
  if (error) return <main className={workspaceClass}><DataError /></main>;
  if (!data) notFound(); const item = data as Opportunity;
  return <main className={`${workspaceClass} !max-w-3xl`}><Link href="/pipeline" className="mb-6 inline-block text-sm text-[#526071]">← Voltar ao funil</Link><WorkspaceHeader eyebrow="Cada conversa tem continuidade" title="Detalhes da oportunidade" description="Atualize o interesse, a etapa e o próximo passo deste relacionamento." />
    <div className="mb-5 flex flex-wrap gap-4 text-sm text-[#087F8C]"><Link href={`/clients/${item.contact_id}`}>Abrir ficha do cliente ↗</Link>{item.source_submission_id && <Link href="/dashboard">Abrir respostas e entregas ↗</Link>}</div>
    <section className={panelClass}><OpportunityForm item={item} contacts={[{ id: item.contact_id, name: item.contacts?.name || "Cliente" }]} /></section>
  </main>;
}
