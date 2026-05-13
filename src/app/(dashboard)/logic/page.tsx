"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrainCircuit, Settings2 } from "lucide-react";
import Spinner from "@/components/spinner";
import { createClient } from "@/utils/supabase/client";

export default function LogicPortalPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadForms = async () => {
        setIsLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await supabase
            .from("forms")
            .select("*")
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false });
        
        if (data) setForms(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadForms();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-8 py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                        </div>
                        <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Motor IA dos Formulários</h1>
                    </div>
                    <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Escolha um formulário para configurar as regras e o template de geração de documentos.</p>
                </div>
            </div>

            {/* List of Forms */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : forms.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-[24px] border border-[#E5E5EA] border-dashed">
                    <p className="text-[#86868B]">Você ainda não tem formulários. Crie um na aba Formulários primeiro.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div key={form.id} className="bg-white rounded-[20px] p-6 border border-[#E5E5EA] shadow-sm flex flex-col">
                            <div className="mb-4">
                                <h3 className="font-semibold text-[#1D1D1F] text-[16px] mb-1">{form.title}</h3>
                                <p className="text-[12px] text-[#86868B]">Configurações da IA exclusivas para este serviço.</p>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-[#E5E5EA]/50">
                                <Link href={`/logic/${form.id}`} className="w-full py-2.5 bg-[#1D1D1F] hover:bg-black text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors">
                                    <Settings2 className="w-4 h-4" /> Configurar Motor IA
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
