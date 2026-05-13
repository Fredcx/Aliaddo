"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, BrainCircuit } from "lucide-react";
import Spinner from "@/components/spinner";
import LogicBuilder, { Rule, LogicStep } from "@/components/logic-builder";

import { useSettings } from "@/components/settings-context";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LogicPage() {
    const params = useParams();
    const formId = params.id as string;
    const { isLoading: contextLoading } = useSettings();
    const [logicStep, setLogicStep] = useState<LogicStep>("write");
    const [logicSource, setLogicSource] = useState("");
    const [logicRules, setLogicRules] = useState<Rule[]>([]);
    const [structureText, setStructureText] = useState("");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadForm = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("forms").select("*").eq("id", formId).single();
        if (data) {
            setStructureText(data.structure_text || "");
            try {
                const p = JSON.parse(data.rules_text || "{}");
                if (p.rules?.length) {
                    setLogicSource(p.source || "");
                    setLogicRules(p.rules);
                    setLogicStep("saved");
                }
            } catch { /* keep write state */ }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!contextLoading && formId) {
            loadForm();
        }
    }, [contextLoading, formId]);

    const saveLogic = async (rules: Rule[], sourceText: string) => {
        setLogicRules(rules);
        setLogicSource(sourceText);
        const supabase = createClient();
        await supabase
            .from("forms")
            .update({ rules_text: JSON.stringify({ source: sourceText, rules }) })
            .eq("id", formId);
    };

    const saveTemplate = async () => {
        setIsSavingTemplate(true);
        const supabase = createClient();
        await supabase
            .from("forms")
            .update({ structure_text: structureText })
            .eq("id", formId);
        setIsSavingTemplate(false);
    };

    return (
        <div className="max-w-6xl mx-auto px-8 py-10">

            {/* Header */}
            <div className="mb-8">
                <Link href="/logic" className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] flex items-center gap-1.5 mb-4 w-fit transition-colors">
                    ← Voltar para seleção
                </Link>
                <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Motor IA</h1>
                </div>
                <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Ensine a IA como você trabalha. Ela aprenderá suas regras e gerará documentos precisos, sem inventar.</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Logic Builder — 3/5 */}
                    <div className="lg:col-span-3">
                        <LogicBuilder
                            initialStep={logicStep}
                            initialSourceText={logicSource}
                            initialRules={logicRules}
                            onSave={saveLogic}
                        />
                    </div>

                    {/* Template — 2/5 */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F] mb-1">Template de Entrega</h3>
                            <p className="text-[13px] text-[#86868B] mb-4 leading-relaxed">Defina a estrutura que o documento final deve seguir (tópicos, seções, tom de voz).</p>
                            <textarea
                                value={structureText}
                                onChange={e => setStructureText(e.target.value)}
                                rows={10}
                                className="w-full p-4 border border-[#E5E5EA] rounded-[16px] text-[13px] text-[#1D1D1F] leading-relaxed resize-none bg-[#F9F9F9] focus:ring-2 focus:ring-[#15B392]/20 focus:border-[#15B392] outline-none transition-all"
                                placeholder={"Exemplo:\n\n1. Avaliação do Perfil\n2. Protocolo Recomendado\n3. Orientações Detalhadas\n4. Próximos Passos\n\nTom: profissional e acolhedor.\nRespostas diretas e objetivas."}
                            />
                            <button
                                onClick={saveTemplate}
                                disabled={isSavingTemplate}
                                className="mt-4 w-full py-2.5 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[13px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95 outline-none disabled:opacity-50"
                            >
                                {isSavingTemplate ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : <><Save className="w-3.5 h-3.5" /> Salvar template</>}
                            </button>
                        </div>

                        <div className="bg-[#0C0F14] rounded-[20px] p-5 border border-white/[0.06]">
                            <p className="text-[13px] font-semibold text-white mb-2">🛡️ Anti-alucinação</p>
                            <p className="text-[12.5px] text-white/50 leading-relaxed">A IA não inventa — ela só preenche o template com valores das <strong className="text-white/70">regras que você salvou</strong>. Você revisa tudo antes de enviar.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

