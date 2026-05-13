import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Buscar Cliente
    const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("name, status")
        .eq("id", params.id)
        .eq("profile_id", user.id)
        .single();

    if (clientError || !client) {
        redirect("/dashboard");
    }

    // Buscar Respostas do Cliente
    const { data: responses } = await supabase
        .from("responses")
        .select("question, answer")
        .eq("client_id", params.id);

    // Buscar Documento
    const { data: document } = await supabase
        .from("documents")
        .select("content")
        .eq("client_id", params.id)
        .single();

    // Buscar Settings para obter a cor primária e a logo da empresa logada
    const { data: settings } = await supabase
        .from("settings")
        .select("primary_color, logo_url")
        .eq("profile_id", user.id)
        .single();

    const initialContent = document?.content || `# Plano Estratégico para ${client?.name || "Cliente Exemplo"}

## 1. Visão Geral
Este documento apresenta uma análise detalhada...

---

## 2. Objetivos
- Acelerar a automação
- Reduzir custos em 30%`;

    const clientName = client?.name || "Cliente Exemplo";
    const primaryColor = settings?.primary_color || "#0071E3";
    const logoUrl = settings?.logo_url || "";

    return (
        <ReviewClient
            id={params.id}
            initialContent={initialContent}
            clientName={clientName}
            primaryColor={primaryColor}
            logoUrl={logoUrl}
            responses={responses || []}
            clientStatus={client?.status || "Aguardando"}
        />
    );
}
