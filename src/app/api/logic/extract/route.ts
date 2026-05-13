import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text, mode, existingRule, refinement } = body;

        let prompt: string;

        if (mode === 'refine' && existingRule && refinement) {
            // Refinamento de uma regra específica
            prompt = `Você é um sistema de extração de lógica profissional.
Uma regra foi criada anteriormente e o profissional deseja refiná-la.

REGRA EXISTENTE (JSON):
${JSON.stringify(existingRule, null, 2)}

INSTRUÇÃO DE REFINAMENTO DO PROFISSIONAL:
"${refinement}"

Retorne a regra refinada como JSON. Use EXATAMENTE este formato:
{
  "id": "${existingRule.id}",
  "label": "Descrição curta da regra",
  "conditions": [
    { "field": "nome_do_campo", "operator": "=", "value": "valor" }
  ],
  "then": {
    "chave": "valor"
  }
}

Operadores válidos: "=", "!=", ">", "<", ">=", "<=", "contém", "não contém"
Retorne APENAS o JSON da regra, sem texto adicional.`;

        } else if (text) {
            // Extração inicial de regras

            prompt = `Você é um sistema especializado em extrair lógica profissional de consultores.
O profissional escreveu abaixo como ele toma decisões no seu trabalho.
Sua tarefa é identificar e estruturar as regras de decisão presentes no texto.

TEXTO DO PROFISSIONAL:
"${text}"

Extraia TODAS as regras de decisão e retorne como JSON neste formato EXATO:
{
  "rules": [
    {
      "id": "rule_1",
      "label": "Descrição curta e direta da regra (máx 60 caracteres)",
      "conditions": [
        { "field": "nome_do_campo", "operator": "=", "value": "valor" }
      ],
      "then": {
        "chave_do_resultado": "valor_do_resultado"
      }
    }
  ]
}

REGRAS IMPORTANTES:
- Cada regra deve ter ao menos 1 condição e 1 resultado
- Use nomes de campo em snake_case e em português (ex: "peso_kg", "objetivo", "nivel_atividade")
- Use valores simplos de texto ou número
- Operadores válidos: "=", "!=", ">", "<", ">=", "<=", "contém", "não contém"
- Gere IDs sequenciais: rule_1, rule_2, etc.
- Labels devem ser descritivas e diretas
- Separe cada combinação de condições em regras distintas
- Se o texto não contiver regras claras, extraia o máximo de padrões possível

Retorne APENAS o JSON, sem texto adicional, sem markdown, sem cercas.`;
        } else {
            return NextResponse.json({ error: 'Missing text or mode' }, { status: 400 });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const rawText = (response.text || '').trim();

        // Parse the JSON from the response
        let parsed: any;
        try {
            // Try direct parse
            parsed = JSON.parse(rawText);
        } catch {
            // Try extracting JSON from the response
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No JSON found in response:', rawText);
                return NextResponse.json({ error: 'Could not extract rules from text. Try being more specific.' }, { status: 422 });
            }
            try {
                parsed = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error('JSON parse error:', e, rawText);
                return NextResponse.json({ error: 'Invalid JSON in AI response' }, { status: 500 });
            }
        }

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('Logic extract error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
