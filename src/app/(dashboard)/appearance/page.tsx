"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Check, FileImage } from "lucide-react";
import Spinner from "@/components/spinner";
import { useSettings } from "@/components/settings-context";
import { createClient } from "@/utils/supabase/client";

export default function AppearancePage() {
    const { settings, refreshSettings, isLoading: contextLoading } = useSettings();
    const [color, setColor] = useState("#15B392");
    const [template, setTemplate] = useState("Moderno");
    const [intro, setIntro] = useState("");
    const [outro, setOutro] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!contextLoading) {
            if (settings) {
                setColor(settings.primary_color || "#15B392");
                setTemplate(settings.template || "Moderno");
                setIntro(settings.intro_text || "");
                setOutro(settings.outro_text || "");
                setLogoUrl(settings.logo_url || "");
            }
            setIsLoading(false);
        }
    }, [settings, contextLoading]);

    const save = async () => {
        setIsSaving(true);
        await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ primary_color: color, template, intro_text: intro, outro_text: outro, logo_url: logoUrl }),
        });
        await refreshSettings();
        setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Não autenticado");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('logos')
                .upload(fileName, file, { upsert: true });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
            setLogoUrl(publicUrl);
        } catch (error: any) {
            console.error("Erro no upload:", error);
            alert("Erro ao fazer upload da logo: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-8 py-10">

            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                            <FileImage className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                        </div>
                        <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Aparência do PDF</h1>
                    </div>
                    <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Personalize como os documentos gerados serão apresentados para seus clientes.</p>
                </div>
                <button onClick={save} disabled={isSaving}
                    className="px-5 py-2.5 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[14px] font-medium flex items-center gap-2 transition-all active:scale-95 outline-none disabled:opacity-50">
                    {saved ? <><Check className="w-4 h-4 text-[#34C759]" /> Salvo!</> : isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar</>}
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Settings */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F] mb-5">Identidade Visual</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Cor Primária</label>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 border border-[#E5E5EA] rounded-[12px] bg-white">
                                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-9 h-9 rounded-[8px] cursor-pointer border-0 p-0" />
                                        </div>
                                        <input type="text" value={color} onChange={e => setColor(e.target.value)}
                                            className="flex-1 py-2.5 px-3 border border-[#E5E5EA] rounded-[12px] text-[13px] font-mono bg-[#F9F9F9] outline-none uppercase focus:border-[#15B392] transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Template</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {["Clean", "Moderno", "Clássico"].map(t => (
                                            <label key={t} className={`text-center py-2.5 rounded-[12px] cursor-pointer text-[12px] font-medium transition-all border ${template === t ? "border-[#1D1D1F] bg-[#1D1D1F] text-white" : "border-[#E5E5EA] text-[#86868B] hover:border-[#1D1D1F]/40"}`}>
                                                <input type="radio" name="tpl" value={t} checked={template === t} onChange={() => setTemplate(t)} className="hidden" />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F] mb-1">Textos do Documento</h3>
                            <p className="text-[13px] text-[#86868B] mb-5">Texto fixo que aparece no início e no final de todos os documentos gerados.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Introdução</label>
                                    <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={4}
                                        className="w-full p-4 border border-[#E5E5EA] rounded-[14px] text-[13px] text-[#1D1D1F] resize-none bg-[#F9F9F9] outline-none focus:border-[#15B392] transition-colors"
                                        placeholder="Ex: Olá, este é o seu plano personalizado..." />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Conclusão / Disclaimer</label>
                                    <textarea value={outro} onChange={e => setOutro(e.target.value)} rows={4}
                                        className="w-full p-4 border border-[#E5E5EA] rounded-[14px] text-[13px] text-[#1D1D1F] resize-none bg-[#F9F9F9] outline-none focus:border-[#15B392] transition-colors"
                                        placeholder="Ex: Este plano é personalizado. Em caso de dúvidas, entre em contato." />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F] mb-1">Logo da Marca</h3>
                            <p className="text-[13px] text-[#86868B] mb-5">Faça upload da logo ou insira o link direto de uma imagem (ex: do Imgur, do seu site ou WhatsApp).</p>
                            
                            <div className="flex flex-col gap-4 w-full">
                                {logoUrl && (
                                    <div className="relative group">
                                        <div className="h-16 w-auto border border-[#E5E5EA] rounded-lg p-2 bg-[#F9F9F9] flex items-center justify-center">
                                            <img src={logoUrl} alt="Logo" className="max-h-full max-w-[200px] object-contain" />
                                        </div>
                                        <button onClick={() => setLogoUrl("")} className="text-[12px] text-red-500 hover:underline mt-2">Remover logo</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Opção 1: Fazer Upload</label>
                                        <label className="flex flex-col items-center justify-center w-full h-12 border border-[#E5E5EA] border-dashed rounded-xl cursor-pointer bg-[#F9F9F9] hover:bg-gray-50 transition-colors">
                                            {isUploading ? <Spinner size="sm" /> : <p className="text-[12px] text-[#86868B] font-medium">Selecionar arquivo</p>}
                                            <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" disabled={isUploading} />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Opção 2: Colar Link Direto</label>
                                        <input 
                                            type="text" 
                                            value={logoUrl} 
                                            onChange={e => setLogoUrl(e.target.value)}
                                            placeholder="https://exemplo.com/sua-logo.png"
                                            className="w-full py-3 px-4 border border-[#E5E5EA] rounded-xl text-[12px] bg-[#F9F9F9] outline-none focus:border-[#15B392] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PDF Preview */}
                    <div>
                        <div className="bg-[#E5E5EA] rounded-[24px] p-8 flex items-center justify-center min-h-[600px]">
                            <div className="w-full max-w-[320px] aspect-[1/1.414] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-sm relative overflow-hidden flex flex-col">
                                <div className="h-[10px] w-full transition-colors" style={{ backgroundColor: color }} />
                                <div className="p-7 flex-1 flex flex-col relative">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="max-w-[80px] max-h-[30px] object-contain mb-5" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-[8px] bg-[#F5F5F7] mb-5 flex items-center justify-center text-[8px] text-[#86868B] font-bold border border-[#E5E5EA]">LOGO</div>
                                    )}
                                    {intro && (
                                        <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
                                            <p className="text-[8px] text-[#1D1D1F] leading-relaxed line-clamp-2">{intro}</p>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2.5">
                                        <div className="h-2.5 w-1/2 rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
                                        {[1, 0.9, 1, 0.8, 0.95].map((w, i) => (
                                            <div key={i} className="h-1.5 bg-[#E5E5EA] rounded-full" style={{ width: `${w * 100}%` }} />
                                        ))}
                                        <div className="h-2.5 w-2/5 rounded-full mt-4" style={{ backgroundColor: color, opacity: 0.7 }} />
                                        {[1, 0.85, 0.9].map((w, i) => (
                                            <div key={i} className="h-1.5 bg-[#E5E5EA] rounded-full" style={{ width: `${w * 100}%` }} />
                                        ))}
                                    </div>
                                    {outro && (
                                        <div className="mt-4 pt-4 border-t border-[#E5E5EA]">
                                            <p className="text-[7px] text-[#86868B] leading-relaxed line-clamp-2">{outro}</p>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-0 w-full flex justify-center">
                                        <div className="text-[#86868B] font-bold text-[6px] tracking-widest flex items-center gap-1 opacity-50">
                                            ALIADDO
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[12px] text-[#86868B] mt-3">Prévia do documento em PDF gerado pela IA</p>
                    </div>
                </div>
            )}
        </div>
    );
}


