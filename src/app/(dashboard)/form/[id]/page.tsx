"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical, Upload, RefreshCw, Check, LayoutList } from "lucide-react";
import Spinner from "@/components/spinner";
import { createClient } from "@/utils/supabase/client";

interface FormField { id: string; label: string; type: "text" | "email" | "textarea" | "tel" | "number" | "date" | "boolean" | "select"; required: boolean; placeholder: string; options?: string[]; }

import { useSettings } from "@/components/settings-context";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FormPage() {
    const params = useParams();
    const formId = params.id as string;
    const { username: contextUsername, isLoading: contextLoading } = useSettings();
    const [fields, setFields] = useState<FormField[]>([]);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [username, setUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formSlug, setFormSlug] = useState("");

    const formLink = typeof window !== "undefined" && username && formSlug ? `${window.location.origin}/f/${username}/${formSlug}` : "";

    const loadForm = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("forms").select("*").eq("id", formId).single();
        if (data) {
            setFields(data.form_fields || []);
            setCoverImage(data.form_cover_image_url || null);
            setFormSlug(data.slug);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!contextLoading && formId) {
            loadForm();
            setUsername(contextUsername || "");
        }
    }, [contextUsername, contextLoading, formId]);

    const save = async () => {
        setIsSaving(true);
        const supabase = createClient();
        await supabase
            .from("forms")
            .update({ form_fields: fields, form_cover_image_url: coverImage })
            .eq("id", formId);
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const supabase = createClient();
        const filePath = `${Math.random()}.${file.name.split(".").pop()}`;
        await supabase.storage.from("form-covers").upload(filePath, file);
        const { data } = supabase.storage.from("form-covers").getPublicUrl(filePath);
        setCoverImage(data.publicUrl);
    };

    const addField = () => setFields([...fields, { id: `f_${Date.now()}`, label: "Nova Pergunta", type: "text", required: false, placeholder: "Digite aqui..." }]);
    const remove = (id: string) => setFields(fields.filter(f => f.id !== id));
    const update = (id: string, u: Partial<FormField>) => setFields(fields.map(f => f.id === id ? { ...f, ...u } : f));

    return (
        <div className="max-w-6xl mx-auto px-8 py-10">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <Link href="/forms" className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] flex items-center gap-1.5 mb-4 w-fit transition-colors">
                        ← Voltar para formulários
                    </Link>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                            <LayoutList className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                        </div>
                        <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Editar Formulário</h1>
                    </div>
                    <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Configure as perguntas que seus clientes responderão ao preencher o formulário.</p>
                </div>
                <button onClick={save} disabled={isSaving}
                    className="px-5 py-2.5 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[14px] font-medium flex items-center gap-2 transition-all active:scale-95 outline-none disabled:opacity-50">
                    {saved ? <><Check className="w-4 h-4 text-[#34C759]" /> Salvo!</> : isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar</>}
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Builder */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Cover */}
                        <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F] mb-1">Capa</h3>
                            <p className="text-[13px] text-[#86868B] mb-4">Imagem de capa que aparece no topo do formulário público. (Recomendado: 1600×400px)</p>
                            <div className="relative group overflow-hidden rounded-[18px] border border-dashed border-[#C7C7CC] bg-[#F9F9F9] min-h-[140px] flex items-center justify-center cursor-pointer hover:border-[#15B392]/50 transition-colors">
                                {coverImage ? <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" /> : (
                                    <div className="flex flex-col items-center gap-2 text-center p-6">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-[#E5E5EA]">
                                            <Upload className="w-4 h-4 text-[#86868B]" />
                                        </div>
                                        <span className="text-[13px] font-medium text-[#86868B]">Clique para fazer upload</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={uploadCover} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            {coverImage && <button onClick={() => setCoverImage(null)} className="mt-3 text-[12px] text-red-500 hover:text-red-600 font-medium">Remover capa</button>}
                        </div>

                        {/* Fields */}
                        <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="font-semibold text-[15px] text-[#1D1D1F]">Perguntas</h3>
                                    <p className="text-[13px] text-[#86868B] mt-0.5">{fields.length} {fields.length === 1 ? "pergunta" : "perguntas"} configuradas</p>
                                </div>
                                <button onClick={addField} className="flex items-center gap-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] px-4 py-2 rounded-full text-[13px] font-medium transition-colors outline-none">
                                    <Plus className="w-4 h-4" /> Adicionar
                                </button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((f, i) => (
                                    <div key={f.id} className="group flex gap-3 p-4 border border-[#E5E5EA] rounded-[18px] bg-[#F9F9F9] hover:border-[#D1D1D6] transition-colors">
                                        <div className="cursor-grab text-[#C7C7CC] pt-2"><GripVertical className="w-4 h-4" /></div>
                                        <div className="flex-1">
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-1">Pergunta</label>
                                                    <input value={f.label} onChange={e => update(f.id, { label: e.target.value })} className="w-full bg-white border border-[#E5E5EA] rounded-[12px] px-3 py-2 text-[13px] outline-none focus:border-[#15B392] transition-colors" />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-1">Tipo</label>
                                                    <select value={f.type} onChange={e => update(f.id, { type: e.target.value as any })} className="w-full bg-white border border-[#E5E5EA] rounded-[12px] px-3 py-2 text-[13px] outline-none focus:border-[#15B392] cursor-pointer">
                                                        <option value="text">Texto curto</option>
                                                        <option value="email">E-mail</option>
                                                        <option value="textarea">Texto longo</option>
                                                        <option value="tel">Telefone / WhatsApp</option>
                                                        <option value="number">Número</option>
                                                        <option value="date">Data</option>
                                                        <option value="boolean">Sim / Não</option>
                                                        <option value="select">Múltipla escolha (Opções)</option>
                                                    </select>
                                                </div>
                                                {f.type === "select" && (
                                                     <div className="col-span-2 space-y-2 mt-2 pt-2 border-t border-black/[0.03]">
                                                         <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide">Opções de Resposta</label>
                                                         <div className="space-y-2">
                                                             {(f.options || []).map((opt, optIdx) => (
                                                                 <div key={optIdx} className="flex items-center gap-2">
                                                                     <input 
                                                                         value={opt} 
                                                                         onChange={e => {
                                                                             const newOpts = [...(f.options || [])];
                                                                             newOpts[optIdx] = e.target.value;
                                                                             update(f.id, { options: newOpts });
                                                                         }} 
                                                                         placeholder={`Opção ${optIdx + 1}`} 
                                                                         className="flex-1 bg-white border border-[#E5E5EA] rounded-[10px] px-3 py-1.5 text-[13px] outline-none focus:border-[#15B392] transition-colors" 
                                                                     />
                                                                     <button 
                                                                         type="button" 
                                                                         onClick={() => {
                                                                             update(f.id, { options: (f.options || []).filter((_, idx) => idx !== optIdx) });
                                                                         }}
                                                                         className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                                         title="Excluir Opção"
                                                                     >
                                                                         <Trash2 className="w-3.5 h-3.5" />
                                                                     </button>
                                                                 </div>
                                                             ))}
                                                         </div>
                                                         <button 
                                                             type="button" 
                                                             onClick={() => {
                                                                 const current = f.options || [];
                                                                 update(f.id, { options: [...current, `Opção ${current.length + 1}`] });
                                                             }}
                                                             className="mt-1 flex items-center gap-1.5 text-[12px] text-[#15B392] font-semibold hover:text-[#0f9477] transition-colors outline-none"
                                                         >
                                                             <Plus className="w-3.5 h-3.5" /> Adicionar Opção
                                                         </button>
                                                     </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-[#1D1D1F]">
                                                    <input type="checkbox" checked={f.required} onChange={e => update(f.id, { required: e.target.checked })} className="rounded accent-[#1D1D1F]" />
                                                    Obrigatório
                                                </label>
                                                <button onClick={() => remove(f.id)} className="text-[#FF3B30] opacity-0 group-hover:opacity-100 hover:bg-red-50 p-1.5 rounded-full transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && (
                                    <div className="text-center py-10 text-[#86868B] text-[13px] border-2 border-dashed border-[#E5E5EA] rounded-[18px]">
                                        Nenhuma pergunta ainda. Clique em "Adicionar" para começar.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-4">
                        <div className="bg-[#1D1D1F] rounded-[24px] p-6">
                            <h3 className="font-semibold text-[14px] text-white mb-1">Link do formulário</h3>
                            <p className="text-[12px] text-white/40 mb-3">Compartilhe com seus clientes</p>
                            <div className="bg-white/10 rounded-[12px] px-3 py-2 font-mono text-[12px] text-white/70 break-all">/f/{username}/{formSlug}</div>
                            <a href={formLink} target="_blank" rel="noreferrer"
                                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white text-[13px] font-medium rounded-full transition-colors">
                                Abrir formulário →
                            </a>
                        </div>

                        <div className="bg-white rounded-[24px] overflow-hidden border border-[#E5E5EA] shadow-sm">
                            <div className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider text-center py-2 bg-[#F5F5F7] border-b border-[#E5E5EA]">Prévia em Tempo Real</div>
                            <div className="w-full h-fit min-h-[320px] relative overflow-hidden pb-5">
                                {coverImage && <img src={coverImage} alt="" className="w-full h-[70px] object-cover" />}
                                <div className="p-4 space-y-3.5">
                                    {fields.slice(0, 5).map((f, i) => (
                                        <div key={i} className="text-left">
                                            <p className="text-[11px] font-semibold text-[#1D1D1F] mb-1 truncate">
                                                {f.label || "Nova Pergunta"}{f.required && <span className="text-red-500 ml-0.5">*</span>}
                                            </p>
                                            {f.type === "textarea" ? (
                                                <div className="w-full bg-[#F5F5F7] rounded-[8px] border border-[#E5E5EA] h-10 px-2 py-1 text-[10px] text-[#86868B] overflow-hidden select-none">
                                                    Resposta longa...
                                                </div>
                                            ) : f.type === "boolean" ? (
                                                <div className="flex gap-1.5">
                                                    <div className="flex-1 bg-[#F5F5F7] text-center rounded-[8px] border border-[#E5E5EA] py-1 text-[9px] font-medium text-[#86868B] select-none">Sim</div>
                                                    <div className="flex-1 bg-[#F5F5F7] text-center rounded-[8px] border border-[#E5E5EA] py-1 text-[9px] font-medium text-[#86868B] select-none">Não</div>
                                                </div>
                                            ) : f.type === "select" ? (
                                                <div className="w-full bg-[#F5F5F7] rounded-[8px] border border-[#E5E5EA] h-7 px-2 flex items-center justify-between text-[10px] text-[#86868B] select-none cursor-pointer">
                                                    <span className="truncate">Selecione uma opção...</span>
                                                    <span className="text-[8px] text-[#86868B]">▼</span>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-[#F5F5F7] rounded-[8px] border border-[#E5E5EA] h-7 px-2 flex items-center text-[10px] text-[#86868B] select-none">
                                                    {f.placeholder || "Digite aqui..."}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {fields.length > 5 && <p className="text-[10px] text-center text-[#86868B] pt-1">+{fields.length - 5} campos adicionais</p>}
                                    {fields.length === 0 && <p className="text-[11px] text-center text-[#C7C7CC] py-6">Adicione perguntas para ver a prévia</p>}
                                    <div className="w-full h-8 bg-[#1D1D1F] rounded-full opacity-10 mt-3 flex items-center justify-center text-[10px] font-medium text-[#1D1D1F] select-none">Enviar Formulário</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
