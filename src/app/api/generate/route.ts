import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const supabase = createClient();

        // Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { clientId } = body;

        if (!clientId) {
            return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
        }

        // 1. Fetch Client info
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .eq("profile_id", user.id)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // 2. Fetch Client Responses
        const { data: responses, error: responsesError } = await supabase
            .from("responses")
            .select("question, answer")
            .eq("client_id", clientId);

        if (responsesError) {
            return NextResponse.json({ error: "Could not fetch responses" }, { status: 500 });
        }

        // 3. Fetch Professional's Settings / Rules based on the form the client used
        let formSettings = null;
        if (client.form_id) {
            const { data } = await supabase
                .from("forms")
                .select("intro_text, rules_text, structure_text, outro_text")
                .eq("id", client.form_id)
                .single();
            formSettings = data;
        } else {
            // Fallback to global settings for old clients without form_id
            const { data } = await supabase
                .from("settings")
                .select("intro_text, rules_text, structure_text, outro_text")
                .eq("profile_id", user.id)
                .single();
            formSettings = data;
        }

        const rulesRaw = formSettings?.rules_text || "Aja como um consultor especialista.";
        const structure = formSettings?.structure_text || "Escreva em Markdown, usando cabeçalhos, listas e negritos. Seja claro e objetivo.";
        const intro = formSettings?.intro_text || "Aqui está a análise detalhada do seu cenário.";
        const outro = formSettings?.outro_text || "Qualquer dúvida, estou à disposição.";

        // 4. Build rules block — structured JSON or plain text
        let rulesBlock: string;
        try {
            const parsed = JSON.parse(rulesRaw);
            if (parsed.rules && Array.isArray(parsed.rules)) {
                // Use structured rules for precision (anti-hallucination)
                rulesBlock = `REGRAS ESTRUTURADAS (aplique EXATAMENTE a regra que se encaixa no perfil do cliente, não invente):

${parsed.rules.map((r: any, i: number) => {
    const conditions = r.conditions?.map((c: any) => `  - ${c.field} ${c.operator} "${c.value}"`).join("\n") || "";
    const outputs = Object.entries(r.then || {}).map(([k, v]) => `  - ${k} = "${v}"`).join("\n");
    return `REGRA ${i + 1}: "${r.label}"\nCONDIÇÕES (TODAS devem ser verdadeiras):\n${conditions}\nRESULTADO A APLICAR:\n${outputs}`;
}).join("\n\n")}

INSTRUÇÃO CRÍTICA: Identifique qual regra se aplica ao cliente com base nas respostas. Use APENAS os valores da regra identificada. NÃO adicione informações extras.`;
            } else {
                rulesBlock = rulesRaw;
            }
        } catch {
            rulesBlock = rulesRaw;
        }

        // 5. Construct Prompt
        const responsesText = responses
            .map((r) => `Pergunta: ${r.question}\nResposta: ${r.answer}`)
            .join("\n\n");

        const prompt = `
Você é um consultor especializado preparando um documento/plano de ação personalizado.

${rulesBlock}

ESTRUTURA DE ENTREGA (Siga EXATAMENTE):
${structure}

INFORMAÇÕES EXTRAS:
- Comece com: "${intro}"
- Termine com: "${outro}"

DADOS DO CLIENTE:
Nome: ${client.name}
Email: ${client.email}

RESPOSTAS DO FORMULÁRIO:
${responsesText}

Escreva o documento completo em Markdown. NÃO inclua cercas de código (\`\`\`). Retorne apenas o texto bruto.
        `;

        // 5. Call Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiDraft = response.text || "Erro ao gerar o conteúdo.";

        // 6. Save Document to Supabase
        const { error: insertError } = await supabase
            .from("documents")
            .upsert({
                client_id: clientId,
                content: aiDraft,
                updated_at: new Date().toISOString()
            }, { onConflict: 'client_id' });

        if (insertError) {
            return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
        }

        // Update Client Status
        await supabase.from("clients").update({ status: "Pronto" }).eq("id", clientId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
