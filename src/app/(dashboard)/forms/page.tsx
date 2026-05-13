"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Settings, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import Spinner from "@/components/spinner";
import { createClient } from "@/utils/supabase/client";
import { useSettings } from "@/components/settings-context";

export default function FormsPortalPage() {
    const { username: contextUsername } = useSettings();
    const [forms, setForms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newFormTitle, setNewFormTitle] = useState("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

    const handleCreateForm = async () => {
        if (!newFormTitle.trim()) {
            alert("Por favor, digite um nome para o formulário antes de criar!");
            return;
        }
        setIsCreating(true);
        // ... rest of the code is unchanged up to the button
        try {
            const supabase = createClient();
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                alert("Erro de autenticação: " + (userError?.message || "Usuário não encontrado."));
                setIsCreating(false);
                return;
            }

            // Generate a simple slug
            const slug = newFormTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

            const { data, error } = await supabase
                .from("forms")
                .insert({
                    profile_id: user.id,
                    title: newFormTitle,
                    slug: slug,
                })
                .select()
                .single();

            if (data) {
                setForms([data, ...forms]);
                setNewFormTitle("");
                alert("Formulário criado com sucesso!");
            } else {
                console.error("Erro ao criar formulário", error);
                alert("Erro ao criar o formulário: " + (error?.message || error?.details || JSON.stringify(error)));
            }
        } catch (err: any) {
            console.error("Exceção:", err);
            alert("Erro inesperado: " + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteForm = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este formulário? \n\n⚠️ IMPORTANTE: Isso excluirá o formulário, o Motor IA e TODOS os clientes que entraram por ele da sua mesa de trabalho!")) return;
        
        setIsLoading(true);
        const supabase = createClient();
        const { error } = await supabase.from("forms").delete().eq("id", id);
        if (!error) {
            setForms(forms.filter(f => f.id !== id));
            alert("Formulário excluído com sucesso.");
        } else {
            console.error(error);
            alert("Erro ao excluir o formulário: " + error.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto px-8 py-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-white" strokeWidth={1.8} />
                        </div>
                        <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Meus Formulários</h1>
                    </div>
                    <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Crie e gerencie diferentes formulários para cada tipo de serviço.</p>
                </div>
            </div>

            {/* Create New Form Section */}
            <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-8 flex gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Digite o nome do novo formulário (ex: Consultoria Premium)" 
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateForm()}
                    className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1D1D1F] transition-colors text-[#1D1D1F]"
                />
                <button 
                    onClick={handleCreateForm}
                    disabled={isCreating}
                    className="px-6 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isCreating ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />} Criar Formulário
                </button>
            </div>

            {/* List of Forms */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : forms.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-[24px] border border-[#E5E5EA] border-dashed">
                    <p className="text-[#86868B]">Nenhum formulário encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div key={form.id} className="bg-white rounded-[20px] p-6 border border-[#E5E5EA] shadow-sm flex flex-col relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-[#1D1D1F] text-[16px] pr-6">{form.title}</h3>
                                <button 
                                    onClick={() => setActiveMenu(activeMenu === form.id ? null : form.id)} 
                                    className="text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1 absolute top-5 right-5"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {activeMenu === form.id && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                                        <div className="absolute top-12 right-5 bg-white border border-[#E5E5EA] shadow-lg rounded-xl overflow-hidden w-48 z-20 animate-in fade-in zoom-in-95 duration-100">
                                            <button 
                                                onClick={() => { setActiveMenu(null); handleDeleteForm(form.id); }}
                                                className="w-full text-left px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> Excluir Formulário
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="mt-auto space-y-2 pt-4 border-t border-[#E5E5EA]/50">
                                <Link href={`/form/${form.id}`} className="w-full py-2.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors">
                                    <Settings className="w-4 h-4" /> Editar Formulário
                                </Link>
                                <a 
                                    href={contextUsername ? `/f/${contextUsername}/${form.slug}` : '#'} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full py-2.5 text-[#86868B] hover:text-[#1D1D1F] border border-transparent hover:bg-[#F5F5F7] rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" /> Ver Link Público
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
