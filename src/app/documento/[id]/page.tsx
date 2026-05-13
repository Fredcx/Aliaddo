import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PublicDocumentClient from "./PublicDocumentClient";

export default async function PublicDocumentPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    // Fetch Client (Public, no auth check)
    const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("name, profile_id")
        .eq("id", params.id)
        .single();

    if (clientError || !client) {
        notFound();
    }

    // Fetch Document Content
    const { data: document } = await supabase
        .from("documents")
        .select("content")
        .eq("client_id", params.id)
        .single();

    // Fetch Profile Settings (primary color, logo)
    const { data: settings } = await supabase
        .from("settings")
        .select("primary_color, logo_url")
        .eq("profile_id", client.profile_id)
        .single();

    const content = document?.content || `# Planejamento de ${client.name}`;
    const primaryColor = settings?.primary_color || "#0071E3";
    const logoUrl = settings?.logo_url || "";

    return (
        <PublicDocumentClient
            clientName={client.name}
            content={content}
            primaryColor={primaryColor}
            logoUrl={logoUrl}
        />
    );
}
